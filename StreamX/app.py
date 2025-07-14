from flask import Flask, render_template, send_from_directory, jsonify,request
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route("/")
def landing():
    return render_template("landing.html")

@app.route("/player")
def index():
    return render_template("index.html")

@app.route("/api/songs/<folder>")
def list_songs(folder):
    try:
        folder_path = os.path.join(app.static_folder, "songs", folder)
        if not os.path.exists(folder_path):
            return jsonify({"error": "Folder not found"}), 404

        files = [f for f in os.listdir(folder_path) if f.endswith(".mp3")]
        return jsonify(files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/songs/<folder>/<filename>")
def serve_song(folder, filename):
    return send_from_directory(os.path.join(app.static_folder, "songs", folder), filename)
@app.route("/subscribe", methods=["GET", "POST"])
def subscribe():
    if request.method == "POST":
        name = request.form.get("name")
        email = request.form.get("email")
        plan = request.form.get("plan")
        password = request.form.get("password")

        # You can add code here to save to database or send confirmation email
        print(f"New subscription: {name}, {email}, {plan}")

        return render_template("thankyou.html", name=name, plan=plan)

    return render_template("subscribe.html")


if __name__ == "__main__":
    app.run(debug=True)
