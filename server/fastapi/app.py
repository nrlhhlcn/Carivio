import base64
import io
import os
from typing import Dict
import json

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, regularizers

# Import our video analyzer
from video_analyzer import analyzer

MODEL_PATH = os.environ.get("EMOTION_MODEL_PATH", os.path.join(os.path.dirname(__file__), "models", "fernet_bestweight.h5"))

CLASS_ORDER = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

app = FastAPI(title="Emotion Service", version="1.0.0")

# CORS for frontend (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,allow_headers=["*"]
)


class EmotionRequest(BaseModel):
    image: str  # base64 data URL or raw base64 PNG/JPEG


def build_fernet(input_size, classes=7):
    # Kullanıcının sağladığı mimariyle aynı olacak şekilde kur
    model = tf.keras.models.Sequential()
    model.add(layers.Conv2D(32, kernel_size=(3, 3), padding='same', activation='relu', input_shape=input_size))
    model.add(layers.Conv2D(64, kernel_size=(3, 3), activation='relu', padding='same'))
    model.add(layers.BatchNormalization())
    model.add(layers.MaxPooling2D(2, 2))
    model.add(layers.Dropout(0.25))

    model.add(layers.Conv2D(128, kernel_size=(3, 3), activation='relu', padding='same', kernel_regularizer=regularizers.l2(0.01)))
    model.add(layers.Conv2D(256, kernel_size=(3, 3), activation='relu', kernel_regularizer=regularizers.l2(0.01)))
    model.add(layers.BatchNormalization())
    model.add(layers.MaxPooling2D(pool_size=(2, 2)))
    model.add(layers.Dropout(0.25))

    model.add(layers.Flatten())
    model.add(layers.Dense(1024, activation='relu'))
    model.add(layers.Dropout(0.5))

    model.add(layers.Dense(classes, activation='softmax'))

    # Inference için derleme opsiyonel ama sorun çıkarmasın diye eklenebilir
    try:
        model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4, decay=1e-6),
                      loss='categorical_crossentropy', metrics=['accuracy'])
    except Exception:
        pass
    return model


def load_model():
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        return model
    except Exception as e:
        # H5 dosyası yalnızca ağırlık olabilir; mimariyi yeniden kurmayı dene
        try:
            model = build_fernet((48, 48, 1), classes=len(CLASS_ORDER))
            model.load_weights(MODEL_PATH)
            return model
        except Exception as e2:
            raise RuntimeError(f"Model yüklenemedi: {e}; Weights yükleme denemesi de başarısız: {e2}")


model = load_model()


def decode_image_to_gray_48x48(b64: str) -> np.ndarray:
    # Support data URL
    if b64.startswith("data:"):
        b64 = b64.split(",", 1)[1]
    try:
        img_bytes = base64.b64decode(b64)
        img = Image.open(io.BytesIO(img_bytes)).convert("L")  # grayscale
        img = img.resize((48, 48))
        arr = np.asarray(img).astype("float32") / 255.0  # [0,1]
        arr = np.expand_dims(arr, axis=-1)  # (48,48,1)
        arr = np.expand_dims(arr, axis=0)   # (1,48,48,1)
        return arr
    except Exception as e:
        raise ValueError(f"Görsel decode edilemedi: {e}")


@app.post("/emotion")
def emotion(req: EmotionRequest) -> Dict:
    try:
        x = decode_image_to_gray_48x48(req.image)
        preds = model.predict(x)
        probs = preds[0].tolist()
        out = {cls: float(probs[i]) for i, cls in enumerate(CLASS_ORDER)}
        top_idx = int(np.argmax(probs))
        return {"probs": out, "top": CLASS_ORDER[top_idx], "version": "v1"}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Real-time Video Analysis WebSocket Endpoint
@app.websocket("/ws/video-analysis")
async def websocket_video_analysis(websocket: WebSocket):
    await websocket.accept()
    print(">>> WebSocket baglantisi kuruldu - Video analizi basliyor!")
    
    try:
        while True:
            # Frontend'den video frame al (base64 format)
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                if message.get("type") == "video_frame":
                    base64_frame = message.get("frame")
                    
                    if base64_frame:
                        print(">>> Video frame alindi, analiz ediliyor...")
                        
                        # Video frame'i analiz et
                        analysis_result = await analyzer.process_frame(base64_frame)
                        
                        # Sonuçları frontend'e gönder
                        await websocket.send_text(json.dumps({
                            "type": "analysis_result",
                            "data": analysis_result
                        }))
                        
                elif message.get("type") == "ping":
                    # Health check
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }))
                    
            except json.JSONDecodeError as e:
                print(f">>> JSON parse error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error", 
                    "message": "Invalid JSON format"
                }))
                
            except Exception as e:
                print(f">>> Analysis error: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": str(e)
                }))
                
    except WebSocketDisconnect:
        print(">>> WebSocket baglantisi kesildi")
    except Exception as e:
        print(f">>> WebSocket error: {e}")
    finally:
        print(">>> WebSocket temizligi yapiliyor")

# Health check for video analyzer
@app.get("/health/video-analyzer")
def video_analyzer_health():
    return {
        "status": "healthy",
        "analyzer_ready": True,
        "mediapipe_version": "0.10.8",
        "opencv_available": True
    }

# (moved build_fernet above)

if __name__ == "__main__":
    import uvicorn
    print(">>> FastAPI Video Analysis Server baslatiliyor...")
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


