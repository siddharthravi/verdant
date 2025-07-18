from flask import Flask, request, jsonify

app = Flask(__name__)

def predict_climate(params):
    return {
        "temperature": 1.2 + params.get("co2", 0) * 0.01,
        "sea_level_rise": 0.3 + params.get("deforestation", 0) * 0.005,
        "biodiversity_loss": 5.6 - params.get("renewable_adoption", 0) * 0.02
    }

@app.route('/predict', methods=['POST'])
def predict():
    params = request.json or {}
    result = predict_climate(params)
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000)