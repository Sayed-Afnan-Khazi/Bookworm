import os
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai


def answer_question(question_text):
	'''
	Answers a question using the Gemini API
	question_text: str'''
	genai.configure(api_key=os.environ['API_KEY'])
	model = genai.GenerativeModel("gemini-1.5-flash")
	sample_pdf = genai.upload_file("./pdfs/Introduction.pdf")
	response = model.generate_content([question_text, sample_pdf], stream=True)

	return response

if __name__ == '__main__':
	print(answer_question("What is this?"))