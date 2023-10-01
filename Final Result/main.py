import pandas as pd
import spacy
from sklearn.svm import LinearSVC
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import GridSearchCV
import joblib

df = pd.read_csv('hamro.csv')

nlp = spacy.load("en_core_web_sm")


def preprocess_text(text):
    doc = nlp(text)
    tokens = [token.lemma_.lower() for token in doc if
              token.lemma_.isalnum() and not token.lemma_.isnumeric() and not token.is_punct and not token.is_space and not token.is_stop]
    return " ".join(tokens)


df['p_Text'] = df['Text'].apply(preprocess_text)

x, y = df['p_Text'], df['Class']
tfidf_vectorizer = TfidfVectorizer(max_features=10000)
x_tfidf = tfidf_vectorizer.fit_transform(x)

X_train, X_test, y_train, y_test = train_test_split(x_tfidf, y, test_size=0.2, random_state=42)
param_grid = {'C': [0.1, 1, 10, 100]}
grid_search = GridSearchCV(LinearSVC(), param_grid, cv=5)
grid_search.fit(X_train, y_train)
best_classifier = grid_search.best_estimator_
joblib.dump(best_classifier, 'SVC_model.pkl')
y_pred = best_classifier.predict(X_test)
report = classification_report(y_test, y_pred)
print("Classification Report:\n", report)
print(confusion_matrix(y_pred, y_test))


