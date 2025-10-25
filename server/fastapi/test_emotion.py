#!/usr/bin/env python3
"""
Test emotion model gerçek mi
"""
import numpy as np
from video_analyzer import analyzer

def test_emotion_model():
    print("=== EMOTION MODEL TEST ===")
    
    # Test 1: Model var mı?
    if analyzer.emotion_model is None:
        print("❌ Emotion model YOK!")
        return False
    
    print("✅ Emotion model VAR")
    
    # Test 2: Farklı inputlar farklı sonuçlar veriyor mu?
    
    # Fake face 1: Siyah (üzgün gibi)
    fake_face_1 = np.zeros((48, 48, 1), dtype=np.float32)
    fake_batch_1 = np.expand_dims(fake_face_1, axis=0)
    
    # Fake face 2: Beyaz (mutlu gibi)  
    fake_face_2 = np.ones((48, 48, 1), dtype=np.float32)
    fake_batch_2 = np.expand_dims(fake_face_2, axis=0)
    
    # Predict
    pred_1 = analyzer.emotion_model.predict(fake_batch_1, verbose=0)[0]
    pred_2 = analyzer.emotion_model.predict(fake_batch_2, verbose=0)[0]
    
    # Results
    emotion_1 = analyzer.emotion_classes[np.argmax(pred_1)]
    confidence_1 = float(np.max(pred_1))
    
    emotion_2 = analyzer.emotion_classes[np.argmax(pred_2)]  
    confidence_2 = float(np.max(pred_2))
    
    print(f"🖤 Siyah yüz: {emotion_1} ({confidence_1:.2f})")
    print(f"🤍 Beyaz yüz: {emotion_2} ({confidence_2:.2f})")
    
    # Test 3: Sonuçlar farklı mı?
    if emotion_1 != emotion_2 or abs(confidence_1 - confidence_2) > 0.1:
        print("✅ Model GERÇEK - Farklı inputlara farklı yanıtlar veriyor")
        return True
    else:
        print("❌ Model ŞÜPHELI - Aynı sonuçlar döndürüyor")
        return False

if __name__ == "__main__":
    test_emotion_model()
