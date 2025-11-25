from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import io
from piper import PiperVoice

app = Flask(__name__)
CORS(app)

# Load Piper models
model_path_en = "models/en_US-lessac-medium.onnx"
print("🔄 Đang tải Piper model tiếng Anh...")
voice_en = PiperVoice.load(model_path_en)
print("✅ Piper model tiếng Anh loaded!")

# Load model tiếng Việt (nếu có)
voice_vi = None
model_path_vi = "models/vi_VN-vivos-x_low.onnx"
if os.path.exists(model_path_vi):
    print("🔄 Đang tải Piper model tiếng Việt...")
    voice_vi = PiperVoice.load(model_path_vi)
    print("✅ Piper model tiếng Việt loaded!")
else:
    print("⚠️ Không tìm thấy model tiếng Việt, sẽ dùng tiếng Anh thay thế")

def create_wav_header(data_size, sample_rate=22050, channels=1, bits_per_sample=16):
    """Tạo WAV header cho raw PCM data"""
    import struct
    
    byte_rate = sample_rate * channels * bits_per_sample // 8
    block_align = channels * bits_per_sample // 8
    
    header = b'RIFF'
    header += struct.pack('<I', data_size + 36)
    header += b'WAVE'
    header += b'fmt '
    header += struct.pack('<I', 16)
    header += struct.pack('<H', 1) 
    header += struct.pack('<H', channels)
    header += struct.pack('<I', sample_rate)
    header += struct.pack('<I', byte_rate)
    header += struct.pack('<H', block_align)
    header += struct.pack('<H', bits_per_sample)
    header += b'data'
    header += struct.pack('<I', data_size)
    
    return header

@app.route("/synthesize", methods=["POST"])
def synthesize():
    import time
    start_time = time.time()
    
    try:
        data = request.json
        text = data.get("text", "")
        language = data.get("language", "en")  # "en" hoặc "vi"
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        text_length = len(text)
        print(f"🎯 Đang tạo audio ({language}) cho: {text[:50]}... (độ dài: {text_length} ký tự)")

        # Chọn voice phù hợp
        if language == "vi" and voice_vi is not None:
            voice = voice_vi
        else:
            voice = voice_en
            if language == "vi":
                print("⚠️ Dùng voice tiếng Anh thay thế cho tiếng Việt")

        audio_chunks = []
        chunk_count = 0
        for audio_chunk in voice.synthesize(text):
            audio_chunks.append(audio_chunk.audio_int16_bytes)
            chunk_count += 1
        
        audio_bytes = b"".join(audio_chunks)
        
        # Giảm sample rate xuống 19000 để làm chậm tốc độ đọc (từ 22050)
        wav_header = create_wav_header(len(audio_bytes), sample_rate=19000)
        wav_file = wav_header + audio_bytes
        
        elapsed_time = time.time() - start_time
        print(f"✅ Đã tạo audio ({language}): {len(wav_file)} bytes ({chunk_count} chunks) trong {elapsed_time:.2f}s")
        
        return send_file(
            io.BytesIO(wav_file),
            mimetype="audio/wav",
            as_attachment=False,
            download_name=f"speech_{uuid.uuid4().hex[:8]}.wav"
        )
        
    except Exception as e:
        elapsed_time = time.time() - start_time
        print(f"❌ Lỗi Piper TTS sau {elapsed_time:.2f}s: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "piper-tts"})

if __name__ == "__main__":
    print("🚀 Piper TTS Server starting on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)