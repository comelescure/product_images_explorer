from flask import Flask, render_template, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_image_url/<product_name>")
def get_image_url(product_name):
    query = product_name
    url = f"https://www.google.com/search?q={query}&tbm=isch"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    img_tag = soup.find("img", {"class": "yWs4tf"})

    if img_tag is not None:
        img_link = img_tag.get("src")
        return jsonify({"image_url": img_link})
    else:
        return jsonify({"image_url": None})

if __name__ == "__main__":
    app.run(debug=True)
