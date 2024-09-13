from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import PyPDF2
import re

app = Flask(__name__)
app.config['PROPAGATE_EXCEPTIONS'] = True
CORS(app)


model_path = os.path.join('model', 'resume_category.joblib')


if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")


try:
    model = joblib.load(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    raise

CATEGORY_KEYWORDS = {
    'engineering': ['python', 'java', 'react', 'flask', 'sql', 'machine learning','python', 'java', 'react', 'javascript', 'typescript', 'c++', 'ruby', 'swift', 'go', 'kotlin',
                    'data structures', 'algorithms', 'problem solving', 'software development','c++', 'c language', 'andorid', 'web design','ui/ux' ],
    'management': ['leadership', 'teamwork', 'communication', 'project management'],
    'data science': ['python', 'pandas', 'numpy', 'matplotlib'],
 
}

ROLE_KEYWORDS = {
    'software_developer': ['python', 'java', 'react', 'javascript', 'typescript', 'c++', 'ruby', 'swift', 'go', 'kotlin'],
    'data_scientist': ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'tensorflow', 'keras', 'machine learning', 'deep learning'],
    'project_manager': ['leadership', 'project management', 'agile', 'scrum', 'jira', 'trello'],
  
}

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Unsupported file type. Please upload a PDF.'}), 400

        content = extract_text_from_pdf(file)
        if not content:
            return jsonify({'error': 'No text extracted from file'}), 400

        preprocessed_text = preprocess_text(content)
        prediction = model.predict([preprocessed_text])  
        print(f"Prediction: {prediction}")

        if prediction.size == 1:
            category = prediction[0]
        else:
            return jsonify({'error': 'Prediction failed'}), 500

        ats_score, highlighted_skills, all_skills, suggested_role = calculate_ats_score(preprocessed_text, category)
        
        return jsonify({
            'category': category,
            'ats_score': ats_score,
            'highlighted_skills': highlighted_skills,
            'suggested_role': suggested_role,
            'all_skills': all_skills
        })
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': f'Internal Server Error: {str(e)}'}), 500

def extract_text_from_pdf(file):
   
    try:
        reader = PyPDF2.PdfReader(file)
        text = ''
        for page in reader.pages:
            page_text = page.extract_text() or ''
            text += page_text + ' '
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

def preprocess_text(text):
 
    text = re.sub(r'\W+', ' ', text)  
    return text.lower().strip()
from collections import Counter

def calculate_ats_score(resume_text, predicted_category):
   
    relevant_keywords = CATEGORY_KEYWORDS.get(predicted_category.lower(), [])
 
    resume_words = resume_text.split()
    resume_word_count = Counter(resume_words) 
    
    keyword_match_counts = {keyword: resume_word_count[keyword] for keyword in relevant_keywords}
    
    highlighted_skills = [keyword for keyword in relevant_keywords if resume_word_count[keyword] > 0]
    
    all_skills = [keyword for keyword in relevant_keywords if resume_word_count[keyword] > 0]
    
    total_matches = len(all_skills)
    num_keywords = len(relevant_keywords)
 
    average_matches = total_matches / num_keywords if num_keywords > 0 else 0
    percent_value = average_matches * 100

    role_match_counts = {role: sum(resume_word_count[keyword] for keyword in keywords) for role, keywords in ROLE_KEYWORDS.items()}
    suggested_role = max(role_match_counts, key=role_match_counts.get, default="None")
    
    print(f"Resume Words: {resume_words}")
    print(f"Relevant Keywords: {relevant_keywords}")
    print(f"Keyword Match Counts: {keyword_match_counts}")
    print(f"Highlighted Skills: {highlighted_skills}")
    print(f"Total Matches: {total_matches}")
    print(f"Suggested Role: {suggested_role}")
    
    return round(average_matches, 2), highlighted_skills, all_skills, suggested_role

if __name__ == '__main__':
    app.run(debug=True, port=3000)
