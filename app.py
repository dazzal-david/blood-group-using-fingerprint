from flask import Flask, render_template, request, jsonify
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)

# Custom loader function to handle the compatibility issue
def load_model_with_custom_objects():
    try:
        # Option 1: Try loading with custom objects
        custom_objects = {
            'DepthwiseConv2D': tf.keras.layers.DepthwiseConv2D
        }
        model = tf.keras.models.load_model(MODEL_PATH, custom_objects=custom_objects)
        return model
    except Exception as e:
        print(f"Error loading model: {str(e)}")
        try:
            # Option 2: Try loading with compile=False
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            return model
        except Exception as e:
            print(f"Second attempt failed: {str(e)}")
            raise Exception("Could not load the model. Please ensure the model is compatible with TensorFlow 2.16.0")

# Load the model
MODEL_PATH = 'model.h5'
try:
    print("Loading model...")
    model = load_model_with_custom_objects()
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load model: {str(e)}")
    raise

# Define the blood groups (update these based on your model's classes)
BLOOD_GROUPS = ['A-', 'A+', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

def preprocess_image(image):
    try:
        # Resize the image to match your model's input size
        # Update the size (224, 224) according to your model's requirements
        img = image.resize((224, 224))
        
        # Convert to array and normalize
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0)
        img_array = img_array / 255.0
        
        return img_array
    except Exception as e:
        print(f"Error in preprocessing: {str(e)}")
        raise

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the image from the POST request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded'
            })
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            })
            
        # Validate file type
        if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Please upload an image file.'
            })
            
        # Open and preprocess the image
        image = Image.open(io.BytesIO(file.read())).convert('RGB')
        processed_image = preprocess_image(image)
        
        # Make prediction
        predictions = model.predict(processed_image)
        
        # Get the predicted class
        predicted_class = BLOOD_GROUPS[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        return jsonify({
            'success': True,
            'blood_group': predicted_class,
            'confidence': f'{confidence:.2%}'
        })
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error processing image: {str(e)}'
        })

if __name__ == '__main__':
    app.run(debug=True)