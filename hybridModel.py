import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from surprise import Dataset, Reader, SVD, accuracy, KNNBasic
from surprise.model_selection import train_test_split, cross_validate
import sys

# Load the data
coursera_df = pd.read_csv('training_data.csv')
employee_df = coursera_df[['employeeID', 'userSkills', 'points', 'department', 'designation']].drop_duplicates(subset='employeeID')

# --- EDA and Visualizations ---
# (Keep your existing EDA code here) 

# --- Feature Engineering ---
# One-Hot Encoding (applied to coursera_df only)
coursera_df = pd.get_dummies(coursera_df, columns=['department', 'designation', 'level', 'certificateType'])

# TF-IDF for Course Embeddings
coursera_df['all_skills'] = coursera_df['expected_skills'].apply(lambda x: ' '.join(eval(x)))
vectorizer = TfidfVectorizer()
course_embeddings = vectorizer.fit_transform(coursera_df['all_skills'])

# --- Content-Based Filtering ---
def content_based_recommendations(employee_skills, course_embeddings, top_n=5):
    """Recommends courses based on skill similarity."""
    employee_skill_vector = [0] * len(vectorizer.vocabulary_)
    for skill in employee_skills:
        if skill in vectorizer.vocabulary_:
            employee_skill_vector[vectorizer.vocabulary_[skill]] = 1

    similarities = cosine_similarity([employee_skill_vector], course_embeddings)
    recommended_course_indices = similarities.argsort()[0][::-1][:top_n]
    return coursera_df.iloc[recommended_course_indices]

# --- Collaborative Filtering ---
# Prepare data for Surprise
reader = Reader(rating_scale=(1, 5))
data = Dataset.load_from_df(coursera_df[['employeeID', 'courseId', 'rating']], reader=reader)

# Use KNNBasic with cosine similarity
sim_options = {
    "name": "cosine",
    "user_based": False,  # Item-based collaborative filtering (course similarity)
}
algo = KNNBasic(sim_options=sim_options)

# Cross-validation 
cv_results = cross_validate(algo, data, measures=['RMSE', 'MAE'], cv=5, verbose=True)
print(f"Average RMSE: {cv_results['test_rmse'].mean()}")
print(f"Average MAE: {cv_results['test_mae'].mean()}")

# Train on the entire dataset
trainset = data.build_full_trainset()
algo.fit(trainset)

# --- Hybrid Recommendations ---
def hybrid_recommendations(employee_id, top_n=5, content_weight=0.8): # Change top_n to 5
    """Combines content-based and collaborative filtering with weighting."""
    employee_data = employee_df[employee_df['employeeID'] == employee_id]
    if employee_data.empty:
        print(f"Warning: No employee data found for ID: {employee_id}")
        return pd.DataFrame()

    employee_skills = eval(employee_data['userSkills'].iloc[0])
    # ... (Print employee information - keep this part)

    content_recs = content_based_recommendations(employee_skills, course_embeddings, top_n=top_n * 5)  # Get more content-based recs 
    content_indices = content_recs.index.tolist()

    collab_recs = []
    for course_id in coursera_df['courseId'].unique():
        prediction = algo.predict(employee_id, course_id)
        collab_recs.append((course_id, prediction.est))
    collab_recs.sort(key=lambda x: x[1], reverse=True)
    collab_recs = collab_recs[:top_n]
    collab_indices = [coursera_df[coursera_df['courseId'] == rec[0]].index[0] for rec in collab_recs]

    # --- Weighted Hybrid Recommendation Logic --- 
    final_recs = []
    for i in range(top_n):
        if i < int(top_n * content_weight) and content_indices:
            final_recs.append(coursera_df.iloc[content_indices.pop(0)])  
        elif collab_indices:
            final_recs.append(coursera_df.iloc[collab_indices.pop(0)]) 

    final_recs_df = pd.DataFrame(final_recs) # Create dataframe from final recommendations
    print("Recommended Courses:\n", final_recs_df[['course', 'expected_skills', 'rating', 'level_Intermediate', 'level_Mixed']])
    return final_recs_df

if __name__ == '__main__':
    employee_id = sys.argv[1]
    recommendations = hybrid_recommendations(employee_id)

    # Convert DataFrame to a list of dictionaries (suitable for JSON)
    recommendations_list = recommendations.to_dict(orient='records')  

    # Print recommendations as JSON (to be captured by Node.js)
    import json
    print(json.dumps(recommendations_list))