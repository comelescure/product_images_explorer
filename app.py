from flask import Flask, render_template, jsonify
import requests
from bs4 import BeautifulSoup
import openai
import os
from flask import Flask, jsonify, request

openai.api_key = os.environ[f'ma_cle_secret_openia']

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
    
def ask_gpt(prompt):
    response = openai.Completion.create(
        engine="davinci-codex",
        prompt=prompt,
        max_tokens=50,
        n=1,
        stop=None,
        temperature=0.5,
    )

    return response.choices[0].text.strip()

@app.route('/ask_gpt', methods=['GET'])
def handle_ask_gpt():
    question = request.args.get('question', '')
    product_name = request.args.get('product_name', '')
    
    prompt = f"{question} {product_name}"
    gpt_response = ask_gpt(prompt)

    return jsonify({'response': gpt_response})
