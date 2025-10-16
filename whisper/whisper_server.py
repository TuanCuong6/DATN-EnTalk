from flask import Flask, request, jsonify
import whisper
import os
import uuid

app = Flask(__name__)
model = whisper.load_model("base")  # hoặc 'small', 'medium', 'large'

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
        print("✅ Whisper transcript:", result["text"])
        return jsonify({"transcript": result["text"]})
    except Exception as e:
        print("❌ Lỗi khi xử lý Whisper:", str(e))
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
