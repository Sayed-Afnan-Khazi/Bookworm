import os
from dotenv import load_dotenv
load_dotenv()
import base64
from google import genai
from google.genai import types


def answer_question(question_text, history, global_files_location, chat_files_location):
	'''
	Answers a question using the Gemini API
	question_text: str'''
	client = genai.Client(api_key=os.environ.get('API_KEY'))
	
	# System instruction for the model
	system_instruction = '''You are Bookworm. A helpful assistant designed to help curious learners by answering questions.
	You will reply to each question based on your knowledge and facts. You will refuse to respond with anything that isn't true. You appreciate having learners achieve that "a ha" moment and drive them to the correct solution or intuition. You help the user which is your student build a good foundation about the topics being discussed and help build their intuition to solve real world problems. Feel free to use markdown blocks to explain your answer better if required.'''

	uploaded_files = []

	# Upload all the notebook global files
	for file_name in os.listdir(global_files_location):
		file_path = os.path.join(global_files_location, file_name)
		uploaded_file = client.files.upload(file=file_path)
		uploaded_files.append(uploaded_file)

	# Upload all the chat files
	for file_name in os.listdir(chat_files_location):
		file_path = os.path.join(chat_files_location, file_name)
		uploaded_file = client.files.upload(file=file_path)
		uploaded_files.append(uploaded_file)
	
	# Prepare history in the new format
	formatted_history = []
	
	# Add initial greeting if there's no history
	if not history:
		formatted_history.append(
			types.Content(
				role="model",
				parts=[types.Part.from_text(text="Hello there! I am Bookworm, your AI assistant. How can I help you today?")]
			)
		)
	else:
		# Format existing history if provided
		for message in history:
			role = message.get("role", "user")
			parts = [types.Part.from_text(text=part) for part in message.get("parts", [])]
			formatted_history.append(types.Content(role=role, parts=parts))
	
	# Add file parts to the user's query
	content_parts = []
	
	# Add all uploaded files to content parts
	for file in uploaded_files:
		content_parts.append(
			types.Part.from_uri(
				file_uri=file.uri,
				mime_type=file.mime_type
			)
		)
	
	# Add the user's question
	content_parts.append(types.Part.from_text(text=question_text))
	
	# Add user query to history
	formatted_history.append(
		types.Content(
			role="user",
			parts=content_parts
		)
	)
	
	# Generate content
	model = os.environ.get('GEMINI_MODEL_NAME') or "gemini-2.5-flash-preview-04-17"  # Using the latest model
	
	# Create config with system instruction
	generate_content_config = types.GenerateContentConfig(
		system_instruction=system_instruction,
		response_mime_type="text/plain"
	)
	
	# Stream the response
	response = client.models.generate_content_stream(
		model=model,
		contents=formatted_history,
		config=generate_content_config
	)
	
	return response

if __name__ == '__main__':
	for chunk in answer_question("What are these pdf about?",
						  global_files_location='/Users/afnan/Developer/Bookworm/backend/data/user_67d19026a544db9681baaddd/notebook_67d19026a544db9681baadde/notebook_global_files',
						  chat_files_location='/Users/afnan/Developer/Bookworm/backend/data/user_67d19026a544db9681baaddd/notebook_67d19026a544db9681baadde/chat_67d19230a544db9681baaddf_files',
						  history=[]):
		print(chunk.text, end="")