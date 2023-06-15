from flask import Flask, render_template, jsonify
import requests
from bs4 import BeautifulSoup
import openai
import os
from flask import Flask, jsonify, request
import logging
logging.basicConfig(level=logging.DEBUG)

openai.api_key = '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'

app = Flask(__name__)

@app.route("/")
@app.route("/", methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        product_names = request.get_json()
    else:
        products = request.args.get('products', '')
        product_names = products.split(',') if products else []
    return render_template("index.html", product_names=product_names)


@app.route("/get_image_url/<product_name>")
def get_image_url(product_name):
    query = product_name
    url = f"https://www.google.com/search?q={query}&tbm=isch"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")
    img_tag = soup.find("img", {"class": "rg_i Q4LuWd"})

    if img_tag is not None:
        img_link = img_tag.get("src")
        return jsonify({"image_url": img_link})
    else:
        return jsonify({"image_url": None})

def ask_gpt(prompt):
    response = openai.Completion.create(
        engine="davinci",
        prompt=f"Act as a Product Information Generator. Can you provide a detailed description of at least 3 sentences on the following product : {prompt}?",
        max_tokens=200,
        temperature=0.5,  # Conserver la température réduite pour obtenir des réponses plus cohérentes
        n=1,
        stop=None,  # Retirer le stop pour permettre des réponses plus longues
    )

    return response.choices[0].text.strip()








@app.route('/ask_gpt', methods=['GET'])
def handle_ask_gpt():
    product_name = request.args.get('product_name', '')
    
    gpt_response = ask_gpt(product_name)

    return jsonify({'response': gpt_response})




if __name__ == "__main__":
    app.run(debug=True)
