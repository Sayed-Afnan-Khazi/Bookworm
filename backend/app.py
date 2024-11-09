import os

from dotenv import load_dotenv # type: ignore
load_dotenv()

import google.generativeai as genai # type: ignore

genai.configure(api_key=os.environ['API_KEY'])

myfile1 = genai.upload_file("./images/dog.jpeg")
print(f"{myfile1=}")

myfile2 = genai.upload_file("./images/dog2.jpeg")
print(f"{myfile2=}")

model = genai.GenerativeModel("gemini-1.5-flash")
result = model.generate_content(
    [myfile1, myfile2,"\n\n", "Can you tell me about the animals in these photos?"]
)
print(f"{result.text=}")