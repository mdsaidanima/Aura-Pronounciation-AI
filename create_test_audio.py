import wave
import math
import struct
import os

def create_audio_file(path, duration_seconds, description=""):
    """Create a test audio file with specific duration"""
    sample_rate = 16000
    frames = int(sample_rate * duration_seconds)
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(path), exist_ok=True)

    with wave.open(path, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        for i in range(frames):
            t = i / sample_rate
            # Create a simple tone that sounds like speech-like audio
            value = int(8000 * math.sin(2 * math.pi * 220 * t) * (0.6 + 0.4 * math.sin(2 * math.pi * 1.5 * t)))
            wav.writeframesraw(struct.pack('<h', value))

    size = os.path.getsize(path)
    print(f"✅ Created: {path}")
    print(f"   Duration: {duration_seconds}s, Size: {size} bytes, {description}")
    return path

# Test Cases for Audio Duration Validation
print("=== CREATING TEST AUDIO FILES FOR DURATION VALIDATION ===\n")

# Test Case 1: Too short (should be rejected)
create_audio_file('server/scratch/test-short-25s.wav', 25, "TOO SHORT - Should be REJECTED")

# Test Case 2: Just at lower limit (should be accepted)  
create_audio_file('server/scratch/test-valid-30s.wav', 30, "VALID - Should be ACCEPTED")

# Test Case 3: Perfect middle (should be accepted)
create_audio_file('server/scratch/test-valid-35s.wav', 35, "VALID - Should be ACCEPTED")  

# Test Case 4: Just at upper limit (should be accepted)
create_audio_file('server/scratch/test-valid-45s.wav', 45, "VALID - Should be ACCEPTED")

# Test Case 5: Too long (should be rejected)
create_audio_file('server/scratch/test-long-50s.wav', 50, "TOO LONG - Should be REJECTED")

print(f"\n=== TEST FILES CREATED SUCCESSFULLY ===")
print("Use these files to test audio duration validation in the upload endpoint.")
