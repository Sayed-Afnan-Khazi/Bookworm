import os
from dotenv import load_dotenv
load_dotenv()
from google import genai
from google.genai import types


def generate_mcqs(filepaths=None):
    client = genai.Client(
        api_key=os.environ.get("API_KEY"),
    )
    if filepaths:
        files = [
            client.files.upload(file=filepath)
            for filepath in filepaths
        ]

    model = "gemini-2.0-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_uri(
                    file_uri=files[i].uri,
                    mime_type=files[i].mime_type,
                )
                for i in range(len(files))] + [
                types.Part.from_text(text="""This is a PDF file. Please read it and generate MCQs based on the content of the PDF. The MCQs should test the reader's understanding of the material. Each MCQ should have 4 options and a question. Make the MCQs each option also have an explanation as to why it is right or wrong. Each MCQ has only one correct answer."""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        # thinking_config = types.ThinkingConfig(
        #     thinking_budget=0,
        # ),
        response_mime_type="application/json",
        response_schema=genai.types.Schema(
                        type = genai.types.Type.OBJECT,
                        required = ["mcqs"],
                        properties = {
                            "mcqs": genai.types.Schema(
                                type = genai.types.Type.OBJECT,
                                required = ["questions"],
                                properties = {
                                    "questions": genai.types.Schema(
                                        type = genai.types.Type.ARRAY,
                                        items = genai.types.Schema(
                                            type = genai.types.Type.OBJECT,
                                            required = ["question", "options", "correct answer"],
                                            properties = {
                                                "question": genai.types.Schema(
                                                    type = genai.types.Type.STRING,
                                                ),
                                                "options": genai.types.Schema(
                                                    type = genai.types.Type.OBJECT,
                                                    required = ["a", "b", "c", "d"],
                                                    properties = {
                                                        "a": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "b": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "c": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "d": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "a_explanation": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "b_explanation": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "c_explanation": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                        "d_explanation": genai.types.Schema(
                                                            type = genai.types.Type.STRING,
                                                        ),
                                                    },
                                                ),
                                                "correct answer": genai.types.Schema(
                                                    type = genai.types.Type.STRING,
                                                    enum = ["a", "b", "c", "d"],
                                                ),
                                            },
                                        ),
                                    ),
                                },
                            ),
                        },
                    ),
        system_instruction=[
            types.Part.from_text(text="""You make MCQs based on PDFs given. These MCQs have 4 options and a question. Make the MCQs each option also have an explanation as to why it is right or wrong. Each MCQ has only one correct answer."""),
        ],
    )

    return client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    ).text

if __name__ == "__main__":
    print(generate_mcqs(filepaths=['./pdfs/hello.pdf','./pdfs/dog.jpeg']))
