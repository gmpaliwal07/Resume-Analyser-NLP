from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import PyPDF2
import re
from collections import Counter

app = Flask(__name__)
app.config['PROPAGATE_EXCEPTIONS'] = True
CORS(app)

# Load model
model_path = os.path.join('model', 'resume_category.joblib')

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")

try:
    model = joblib.load(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    raise

# Define keywords
CATEGORY_KEYWORDS = {
    'engineering': ['python', 'java', 'react', 'flask', 'sql', 'machine learning', 'javascript', 
                    'typescript', 'c++', 'ruby', 'swift', 'go', 'kotlin', 'data structures', 
                    'algorithms', 'problem solving', 'software development', 'android', 'web design', 'ui/ux'],
    
    'information-technology' :  ['python', 'java', 'react', 'flask', 'sql', 'machine learning', 'javascript', 
                    'typescript', 'c++', 'ruby', 'swift', 'go', 'kotlin', 'data structures', 
                    'algorithms', 'problem solving', 'software development', 'android', 'web design', 'ui/ux'],
    'management': ['leadership', 'teamwork', 'communication', 'project management'],
    'data science': ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'tensorflow', 'keras']
}

ROLE_KEYWORDS = {
    'software_developer': ['python', 'java', 'react', 'javascript', 'typescript', 'c++', 'ruby', 'swift', 'go', 'kotlin'],
    'data_scientist': ['python', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'tensorflow', 'keras', 'machine learning', 'deep learning'],
    'project_manager': ['leadership', 'project management', 'agile', 'scrum', 'jira', 'trello']
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

        if len(prediction) == 1:
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
    text = re.sub(r'\W+', ' ', text)  # Replace non-word characters with space
    return text.lower().strip()

def calculate_ats_score(resume_text, predicted_category):
    relevant_keywords = CATEGORY_KEYWORDS.get(predicted_category.lower(), [])

    if not relevant_keywords:
        print(f"No keywords found for category: {predicted_category}")
        return 0, [], [], "None"

    resume_words = resume_text.split()
    resume_word_count = Counter(resume_words)

    # Count keyword matches
    keyword_match_counts = {keyword: resume_word_count[keyword] for keyword in relevant_keywords}
    highlighted_skills = [keyword for keyword, count in keyword_match_counts.items() if count > 0]
    all_skills = highlighted_skills.copy()

    total_matches = len(highlighted_skills)
    num_keywords = len(relevant_keywords)

    # Calculate ATS score
    ats_score = (total_matches / num_keywords)  if num_keywords > 0 else 0

    # Determine suggested role
    role_match_counts = {
        role: sum(resume_word_count.get(keyword, 0) for keyword in keywords)
        for role, keywords in ROLE_KEYWORDS.items()
    }
    suggested_role = max(role_match_counts, key=role_match_counts.get, default="None")

    print(f"Resume Words: {resume_words}")
    print(f"Relevant Keywords: {relevant_keywords}")
    print(f"Keyword Match Counts: {keyword_match_counts}")
    print(f"Highlighted Skills: {highlighted_skills}")
    print(f"Total Matches: {total_matches}")
    print(f"Suggested Role: {suggested_role}")

    return round(ats_score, 2), highlighted_skills, all_skills, suggested_role

if __name__ == '__main__':
    app.run(debug=True, port=3000)
