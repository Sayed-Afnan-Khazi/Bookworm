import os
from dotenv import load_dotenv
load_dotenv()
import base64
import google.generativeai as genai


def answer_question(question_text,history):
	'''
	Answers a question using the Gemini API
	question_text: str'''
	genai.configure(api_key=os.environ['API_KEY'])
	model = genai.GenerativeModel("gemini-1.5-flash")
	doc_file = open('/Users/afnan/Developer/Book-keeper/backend/pdfs/image-based-pdf-sample.pdf','rb')
	sample_pdf = base64.standard_b64encode(doc_file.read()).decode("utf-8")
	chat_session = model.start_chat(
    history=[{
    "role": "user",
    "parts": [
      {'mime_type': 'application/pdf', 'data': sample_pdf},
      "PDF is given",
    ],
    }] + history
    )
	response = chat_session.send_message(question_text, stream=True)

	return response

if __name__ == '__main__':
	print(answer_question("What is this?"))