import wave
import math
import struct
import os

path = 'client/public/test-sample.wav'
sample_rate = 16000
duration = 35
frames = int(sample_rate * duration)

with wave.open(path, 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(sample_rate)
    for i in range(frames):
        t = i / sample_rate
        value = int(12000 * math.sin(2 * math.pi * 220 * t) * (0.6 + 0.4 * math.sin(2 * math.pi * 1.5 * t)))
        wav.writeframesraw(struct.pack('<h', value))

print(path)
print(os.path.getsize(path))
