"""
Real-time Video Analysis with OpenCV (Python 3.13 compatible)
Replaces the problematic TensorFlow.js browser implementation
"""
import cv2
import numpy as np
import asyncio
import base64
import json
from typing import Dict, Tuple, Optional, List
import time
from dataclasses import dataclass
import math
import os
from PIL import Image
import io

@dataclass
class GazeMetrics:
    eye_contact_ratio: float  # 0-1
    yaw_deg: float
    pitch_deg: float
    confidence: float

@dataclass  
class PostureMetrics:
    is_upright: bool
    upright_score: float  # 0-1
    head_tilt_deg: float
    shoulder_tilt_deg: float
    face_visible_ratio: float
    confidence: float

@dataclass
class EmotionMetrics:
    dominant_emotion: str
    confidence: float
    all_emotions: Dict[str, float]

class VideoAnalyzer:
    def __init__(self):
        print(">>> VideoAnalyzer baslatiyor (OpenCV)...")
        
        # Load emotion model directly
        try:
            import tensorflow as tf
            from tensorflow.keras import layers, regularizers
            
            # Model path
            model_path = os.path.join(os.path.dirname(__file__), "models", "fernet_bestweight.h5")
            
            # Emotion classes
            self.emotion_classes = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
            
            # Build and load model
            self.emotion_model = self._build_emotion_model()
            self.emotion_model.load_weights(model_path)
            print(">>> Emotion model yuklendi")
        except Exception as e:
            print(f">>> Emotion model yuklenemedi: {e}")
            self.emotion_model = None
            self.emotion_classes = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]
        
        # OpenCV face detector initialization
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
        
        # DNN face detection (more accurate)
        try:
            # Load pre-trained face detection model
            model_path = "opencv_face_detector_uint8.pb"
            config_path = "opencv_face_detector.pbtxt"
            self.face_net = cv2.dnn.readNetFromTensorflow(model_path, config_path)
            self.use_dnn = True
            print(">>> DNN face detector yuklendi")
        except:
            self.use_dnn = False
            print(">>> DNN face detector yuklenemedi, Haar Cascade kullanilacak")
        
        # Body pose key points (simplified)
        self.body_keypoints = {
            'head': (0.5, 0.15),  # Relative position in frame
            'left_shoulder': (0.3, 0.4),
            'right_shoulder': (0.7, 0.4),
            'center': (0.5, 0.5)
        }
        
        # Metrics tracking
        self.gaze_history = []
        self.posture_history = []
        self.last_analysis_time = 0
        self.analysis_interval = 0.1  # 10 FPS (daha performanslı)
        
        print(">>> VideoAnalyzer hazir (OpenCV)!")
    
    def _build_emotion_model(self):
        """Build emotion recognition model architecture"""
        import tensorflow as tf
        from tensorflow.keras import layers, regularizers
        
        model = tf.keras.models.Sequential()
        model.add(layers.Conv2D(32, kernel_size=(3, 3), padding='same', activation='relu', input_shape=(48, 48, 1)))
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

        model.add(layers.Dense(7, activation='softmax'))  # 7 emotions
        
        return model
    
    def decode_frame(self, base64_frame: str) -> np.ndarray:
        """Base64 encoded frame'i OpenCV format'a çevir"""
        try:
            # Remove data URL prefix if present
            if base64_frame.startswith('data:'):
                base64_frame = base64_frame.split(',')[1]
            
            # Decode base64 to bytes
            frame_bytes = base64.b64decode(base64_frame)
            
            # Convert to numpy array
            nparr = np.frombuffer(frame_bytes, np.uint8)
            
            # Decode as image
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                raise ValueError("Frame decode edilemedi")
            
            return frame
            
        except Exception as e:
            print(f">>> Frame decode error: {e}")
            return None
    
    def analyze_gaze(self, frame: np.ndarray) -> Optional[GazeMetrics]:
        """OpenCV ile göz teması ve bakış yönü analizi"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            h, w = frame.shape[:2]
            
            # Face detection
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                return None
            
            # Use the largest face
            face = max(faces, key=lambda x: x[2] * x[3])
            x, y, face_w, face_h = face
            
            # Extract face region
            face_roi = gray[y:y+face_h, x:x+face_w]
            
            # Eye detection within face
            eyes = self.eye_cascade.detectMultiScale(face_roi, 1.1, 10)
            
            if len(eyes) < 2:
                # Simple face center estimation
                face_center_x = x + face_w // 2
                face_center_y = y + face_h // 2
                
                # Estimate gaze based on face position
                frame_center_x = w // 2
                frame_center_y = h // 2
                
                # Calculate offsets
                x_offset = (face_center_x - frame_center_x) / (w // 2)
                y_offset = (face_center_y - frame_center_y) / (h // 2)
                
                yaw_deg = np.clip(x_offset * 30, -30, 30)
                pitch_deg = np.clip(y_offset * 20, -20, 20)
                
                eye_contact_ratio = max(0, 1 - abs(yaw_deg) / 30 - abs(pitch_deg) / 20)
                
            else:
                # More accurate analysis with detected eyes
                # Sort eyes by x position
                eyes = sorted(eyes, key=lambda e: e[0])
                left_eye, right_eye = eyes[0], eyes[1] if len(eyes) > 1 else eyes[0]
                
                # Eye centers (relative to face)
                left_eye_center = (left_eye[0] + left_eye[2]//2, left_eye[1] + left_eye[3]//2)
                right_eye_center = (right_eye[0] + right_eye[2]//2, right_eye[1] + right_eye[3]//2)
                
                # Calculate eye symmetry and position
                eye_distance = abs(right_eye_center[0] - left_eye_center[0])
                eye_y_avg = (left_eye_center[1] + right_eye_center[1]) / 2
                
                # Face orientation based on eye positions
                face_tilt = math.atan2(right_eye_center[1] - left_eye_center[1], 
                                     right_eye_center[0] - left_eye_center[0]) * 180 / math.pi
                
                # Gaze direction estimation
                yaw_deg = np.clip(face_tilt, -30, 30)
                pitch_deg = np.clip((eye_y_avg - face_h/2) / face_h * 40, -20, 20)
                
                eye_contact_ratio = max(0, 1 - abs(yaw_deg) / 30 - abs(pitch_deg) / 20)
            
            return GazeMetrics(
                eye_contact_ratio=eye_contact_ratio,
                yaw_deg=float(yaw_deg),
                pitch_deg=float(pitch_deg),
                confidence=0.7
            )
            
        except Exception as e:
            print(f">>> Gaze analysis error: {e}")
            return None
    
    def analyze_posture(self, frame: np.ndarray) -> Optional[PostureMetrics]:
        """OpenCV ile basit postür analizi"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            h, w = frame.shape[:2]
            
            # Face detection için postür değerlendirmesi
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                return None
            
            # En büyük yüzü al
            face = max(faces, key=lambda x: x[2] * x[3])
            x, y, face_w, face_h = face
            
            # Yüz pozisyonu analizi
            face_center_x = x + face_w // 2
            face_center_y = y + face_h // 2
            
            # Frame içindeki konum
            frame_center_x = w // 2
            frame_center_y = h // 2
            
            # Yüz boyutu (mesafe tahmini için)
            face_area_ratio = (face_w * face_h) / (w * h)
            
            # Horizontal tilt estimation (yüzün x pozisyonuna göre)
            horizontal_offset = (face_center_x - frame_center_x) / (w // 2)
            shoulder_tilt_deg = abs(horizontal_offset * 15)  # Max 15 derece
            
            # Head tilt estimation (yüzün şekline göre)
            face_aspect_ratio = face_w / face_h if face_h > 0 else 1
            head_tilt_deg = abs((face_aspect_ratio - 0.8) * 20)  # Normal oran ~0.8
            
            # Vertical position analysis
            vertical_offset = (face_center_y - frame_center_y) / (h // 2)
            if vertical_offset < -0.2:  # Yüz çok yukarıda
                head_tilt_deg += 10
            elif vertical_offset > 0.2:  # Yüz çok aşağıda  
                head_tilt_deg += 5
            
            # Upright score calculation
            posture_penalty = (shoulder_tilt_deg + head_tilt_deg) / 30
            upright_score = max(0, 1 - posture_penalty)
            is_upright = upright_score > 0.6
            
            # Face visibility based on size and position
            visibility_score = min(1.0, face_area_ratio * 20)  # Normalize
            face_visible_ratio = max(0.3, min(1.0, visibility_score))
            
            return PostureMetrics(
                is_upright=is_upright,
                upright_score=upright_score,
                head_tilt_deg=float(head_tilt_deg),
                shoulder_tilt_deg=float(shoulder_tilt_deg),
                face_visible_ratio=face_visible_ratio,
                confidence=0.6
            )
            
        except Exception as e:
            print(f">>> Posture analysis error: {e}")
            return None
    
    def analyze_emotion(self, frame: np.ndarray) -> Optional[EmotionMetrics]:
        """Face'den emotion analysis"""
        try:
            if not self.emotion_model:
                return None
                
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Face detection
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
            
            if len(faces) == 0:
                return None
            
            # Use the largest face
            face = max(faces, key=lambda x: x[2] * x[3])
            x, y, w, h = face
            
            # Extract and preprocess face
            face_roi = gray[y:y+h, x:x+w]
            
            # Resize to 48x48 for emotion model
            face_resized = cv2.resize(face_roi, (48, 48))
            
            # Normalize to [0,1] and add batch dimension
            face_normalized = face_resized.astype('float32') / 255.0
            face_input = np.expand_dims(face_normalized, axis=-1)  # (48,48,1)
            face_batch = np.expand_dims(face_input, axis=0)       # (1,48,48,1)
            
            # Predict emotions
            predictions = self.emotion_model.predict(face_batch, verbose=0)
            emotion_probs = predictions[0]
            
            # Get dominant emotion
            dominant_idx = np.argmax(emotion_probs)
            dominant_emotion = self.emotion_classes[dominant_idx]
            confidence = float(emotion_probs[dominant_idx])
            
            # All emotions dict
            all_emotions = {
                cls: float(emotion_probs[i]) 
                for i, cls in enumerate(self.emotion_classes)
            }
            
            return EmotionMetrics(
                dominant_emotion=dominant_emotion,
                confidence=confidence,
                all_emotions=all_emotions
            )
            
        except Exception as e:
            print(f">>> Emotion analysis error: {e}")
            return None
    
    async def process_frame(self, base64_frame: str) -> Dict:
        """Tek frame'i analiz et ve sonuçları döndür"""
        current_time = time.time()
        
        # Throttle analysis to prevent overload
        if current_time - self.last_analysis_time < self.analysis_interval:
            return {"status": "throttled"}
        
        self.last_analysis_time = current_time
        
        # Decode frame
        frame = self.decode_frame(base64_frame)
        if frame is None:
            return {"status": "error", "message": "Frame decode failed"}
        
        print(f">>> Frame analiz ediliyor: {frame.shape}")
        
        # Run all analyses
        gaze_metrics = self.analyze_gaze(frame)
        posture_metrics = self.analyze_posture(frame)
        emotion_metrics = self.analyze_emotion(frame)
        
        # Build response
        result = {
            "timestamp": float(current_time),
            "status": "success",
            "gaze": None,
            "posture": None,
            "emotion": None
        }
        
        if gaze_metrics:
            result["gaze"] = {
                "eyeContactRatio": float(gaze_metrics.eye_contact_ratio),
                "yawDeg": float(gaze_metrics.yaw_deg),
                "pitchDeg": float(gaze_metrics.pitch_deg),
                "confidence": float(gaze_metrics.confidence)
            }
            print(f">>> Goz temasi: {gaze_metrics.eye_contact_ratio:.2f}")
        
        if posture_metrics:
            result["posture"] = {
                "isUpright": bool(posture_metrics.is_upright),
                "uprightScore": float(posture_metrics.upright_score),
                "headTiltDeg": float(posture_metrics.head_tilt_deg),
                "shoulderTiltDeg": float(posture_metrics.shoulder_tilt_deg),
                "faceVisibleRatio": float(posture_metrics.face_visible_ratio),
                "confidence": float(posture_metrics.confidence)
            }
            print(f">>> Postur skoru: {posture_metrics.upright_score:.2f}")
        
        if emotion_metrics:
            result["emotion"] = {
                "dominantEmotion": emotion_metrics.dominant_emotion,
                "confidence": float(emotion_metrics.confidence),
                "allEmotions": emotion_metrics.all_emotions
            }
            print(f">>> Duygu: {emotion_metrics.dominant_emotion} ({emotion_metrics.confidence:.2f})")
        
        return result
    
    def cleanup(self):
        """Resources'ları temizle"""
        # OpenCV cleanup (otomatik olarak yapılır ama explicit)
        cv2.destroyAllWindows()
        print(">>> VideoAnalyzer temizlendi (OpenCV)")

# Global instance
analyzer = VideoAnalyzer()


