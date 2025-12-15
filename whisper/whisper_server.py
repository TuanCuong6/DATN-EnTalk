from flask import Flask, request, jsonify
import whisper
import os
import uuid

app = Flask(__name__)
# Dùng 'base' cho ổn định (medium cần tải ~1.5GB)
# Nếu muốn chính xác hơn, tải thủ công: whisper --model medium --download-root .
model = whisper.load_model("small")  # Hoặc 'medium' nếu đã tải

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    os.makedirs("temp", exist_ok=True)
    filename = str(uuid.uuid4()) + ".wav"
    file_path = os.path.join("temp", filename)

    print("📥 Đang lưu file vào:", file_path)
    file.save(file_path)

    try:
        print("🧪 Kiểm tra tồn tại:", os.path.exists(file_path))

        file_path = file_path.replace("\\", "/")
        print("🛠 Đường dẫn sau khi sửa:", file_path)

        result = model.transcribe(file_path, language="en")
        transcript = result["text"].strip()
        
        print("✅ Whisper transcript:", transcript)
        
        # Kiểm tra no_speech_probability từ segments
        segments = result.get("segments", [])
        if segments:
            # Tính trung bình no_speech_prob của tất cả segments
            avg_no_speech_prob = sum(seg.get("no_speech_prob", 0) for seg in segments) / len(segments)
            print(f"📊 No speech probability: {avg_no_speech_prob:.2f}")
            
            # Nếu >60% là không có lời nói rõ ràng
            if avg_no_speech_prob > 0.6:
                print("⚠️ Phát hiện im lặng hoặc không có giọng nói rõ ràng")
                return jsonify({
                    "transcript": "",
                    "warning": "Không phát hiện giọng nói rõ ràng. Vui lòng thử lại."
                })
        
        return jsonify({"transcript": transcript})
    except Exception as e:
        print("❌ Lỗi khi xử lý Whisper:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
