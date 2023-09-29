from flask import Flask
import json
from flask import request, jsonify
from judgeAPI import evaluate_text_for_keywords

app = Flask(__name__)

@app.route('/evaluate_text_for_keywords', methods=['POST'])
def evaluate_text_for_keywords_api():
  """Evaluates the contextual/semantic relationship between a text content and a given set of words.

  Args:
    text_to_evaluate: The text content to evaluate.
    keyword_list: A list of words to evaluate the relationship against.

  Returns:
    A number string representing the score between 0 and 1, where 0 indicates no relationship and 1 indicates a perfect relationship.
  """

  # Get the text content and keyword list from the request.
  text_to_evaluate = request.json['text_to_evaluate']
  keyword_list = request.json['keyword_list']

  # Evaluate the contextual/semantic relationship between the text content and the keyword list.
  score = evaluate_text_for_keywords(text_to_evaluate, keyword_list)

  # Return the score as a JSON response.
  return jsonify({'score': score})

if __name__ == '__main__':
  app.run(debug=True)
