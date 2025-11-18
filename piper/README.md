# Piper TTS Server

Server Text-to-Speech sử dụng Piper để chuyển đổi văn bản tiếng Anh thành giọng nói.

## Cài đặt

Môi trường ảo và dependencies đã được cài đặt sẵn trong thư mục `piper_env/`.

## Khởi động Server

### Windows
```bash
start_server.bat
```

Hoặc thủ công:
```bash
piper_env\Scripts\activate
python piper_server.py
```

### Linux/Mac
```bash
source piper_env/bin/activate
python piper_server.py
```

## API Endpoints

### Health Check
```
GET http://localhost:5001/health
```

### Text-to-Speech
```
POST http://localhost:5001/synthesize
Content-Type: application/json

{
  "text": "Hello world, this is a test."
}
```

Response: Audio file WAV

## Test

```bash
# Activate environment
piper_env\Scripts\activate

# Test API
python test_piper.py

# Test với nhiều câu
python test_advanced.py
```

## Model

Model hiện tại: `en_US-lessac-medium.onnx`
- Ngôn ngữ: Tiếng Anh (US)
- Giọng: Lessac
- Chất lượng: Medium
- Sample rate: 22050 Hz

## Tích hợp với Backend

Backend đã có endpoint proxy tại:
```
POST http://localhost:3000/api/tts/synthesize
```

Frontend React Native sẽ gọi endpoint này thay vì gọi trực tiếp Piper server.
