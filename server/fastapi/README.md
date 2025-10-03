# Emotion FastAPI Service

Setup
```
cd server/fastapi
python -m venv .venv
# Windows PowerShell:
# .venv\Scripts\Activate.ps1
# Bash:
# source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Model
- Put your Keras model here:
```
server/fastapi/models/fernet_bestweight.h5
```
- Or set env var EMOTION_MODEL_PATH

Run
```
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

API
- POST /emotion
```
{ "image": "<base64_png_or_jpg>" }
```
Response
```
{ "probs": {"angry": 0.01, "disgust": 0.02, "fear": 0.03, "happy": 0.7, "neutral": 0.1, "sad": 0.1, "surprise": 0.04}, "top": "happy", "version": "v1" }
```

