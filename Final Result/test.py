import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

df = pd.read_csv('final.csv')
df = df.dropna()
x, y = df['p_Text'], df['Class']
tfidf_vectorizer = TfidfVectorizer(max_features=10000)
x_tfidf = tfidf_vectorizer.fit_transform(x)

model = joblib.load('SVC_Model/SVC_model.pkl')
text = 'I hate you'
test = tfidf_vectorizer.transform([text])
out = model.predict(test)
print(out)