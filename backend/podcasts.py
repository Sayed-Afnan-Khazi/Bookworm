# Core Imports
import asyncio
import contextlib
import os
import json
import wave
import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai
import base64
from merge_audio import merge_audio_files
genai.configure(api_key=os.environ['API_KEY'])
speaker1_files = [
        "./backend/podcasts/audio1.wav",
        "./backend/podcasts/audio2.wav",
        "./backend/podcasts/audio3.wav"
    ]
    
speaker2_files = [
        "./backend/podcasts/audio4.wav",
        "./backend/podcasts/audio5.wav",
        "./backend/podcasts/audio6.wav"
    ]
output_path = "./backend/podcasts/podcast.wav"
# temporary for testing vvvvv
api_key=os.environ['API_KEY']
os.environ['GOOGLE_API_KEY'] = api_key
# temporary for testing ^^^^^

from google import genai
client = genai.Client(http_options= {'api_version': 'v1alpha'})
MODEL = "gemini-2.0-flash-exp"
from google import genai
from google.genai import types

# Something I found in gemini cookbook colab that I think is needed
async def async_enumerate(it):
  n = 0
  async for item in it:
    yield n, item
    n +=1

# needed for the wave file
@contextlib.contextmanager
def wave_file(filename, channels=1, rate=24000, sample_width=2):
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        yield wf
def get_next_audio_filename(base_dir, base_name="audio"):
    """Generates the next available filename in the sequence.

    Args:
        base_dir (str): the directory where the audio files are stored
        base_name (str, optional): the base name of the file. Defaults to "audio".

    Returns:
        str: next available file path with the number incremented.
    """
    i = 1
    while True:
        file_name = os.path.join(base_dir, f"{base_name}{i}.wav")
        if not os.path.exists(file_name):
            return file_name
        i += 1

async def say(prompt: str, voice: str):
  '''Responds to a question using the Gemini API with an audio response'''
  config = {"generation_config": {"response_modalities": ["AUDIO"], "speech_config": voice}}
  async with client.aio.live.connect(model=MODEL, config=config) as session:
    #file_name = os.path.join('backend', 'podcasts', 'audio.wav')
    file_name = get_next_audio_filename('backend/podcasts')
    with wave_file(file_name) as wav:
      message = "Say the following expressively, with no Okay or anything, just say it, no affirmations or \"okay, i can do that\" Also add some emotion, and say acronyms by sounding them out properly.You must do good voice acting.Here is the text:" + prompt
      await session.send(message, end_of_turn=True)

      turn = session.receive()
      async for n, response in async_enumerate(turn):
        if response.data is not None:
          wav.writeframes(response.data)


def transcript(doc_path):
  """
  Install an additional SDK for JSON schema support Google AI Python SDK

  $ pip install google.ai.generativelanguage
  """
  import os
  import google.generativeai as genai
  from google.ai.generativelanguage_v1beta.types import content
  genai.configure(api_key=os.environ['API_KEY'])

  # Create the model
  generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_schema": content.Schema(
    type = content.Type.OBJECT,
    enum = [],
    required = ["speaker1", "speaker2"],
    properties = {
      "speaker1": content.Schema(
      type = content.Type.ARRAY,
      items = content.Schema(
        type = content.Type.STRING,
      ),
      ),
      "speaker2": content.Schema(
      type = content.Type.ARRAY,
      items = content.Schema(
        type = content.Type.STRING,
      ),
      ),
    },
    ),
    "response_mime_type": "application/json",
  }

  model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
    system_instruction="<intro>\nYou create podcats transcripts based on a pdf given to you. The podcasts are engaging and expressive, but talk ABOUT the pdf, not embodying it. You return nothing but the transcripts. Make the podcasts very human, sometimes speakers may only say \'Yeah exactly!\' or \'Mhmm\' \n</intro>\n<formatinfo>\nspeaker1 contains strings which are his transcript lines, every transcript line responds to the other's lines. same for speaker2, and they are seperated. Do not output ANYTHING else, NO CODEBLOCKS. speaker 1 and 2 SHOULD CONVERSE.\n</formatinfo>\n<additional>\n Speaker 1 should speak first, speaker 2 responds (in the speaker 2 transcript lines obviously) and so on. Also make only 3 lines for each speaker please. JUST 3 lines per speaker, not big lines as well\n</additional>",
  )
  
  # Read and encode the local file
  with open(doc_path, "rb") as doc_file:
    doc_data = base64.standard_b64encode(doc_file.read()).decode("utf-8")

    chat_session = model.start_chat(
    history=[{
    "role": "user",
    "parts": [
      {'mime_type': 'application/pdf', 'data': doc_data},
      "here is my pdf",
    ],
    }]
    )

    response = chat_session.send_message('make the transcript for the pdf i gave you previously')
    return(response.text)
#asyncio.run(say(transcript("make the transcript for the pdf i gave you previously"),"Charon"))

async def speak_transcript(transcript_json):
    """
    Takes a transcript JSON object, loops through speakers, and calls the say function.
    """
    transcript = json.loads(transcript_json) # convert from string to dict
    
    if "speaker1" in transcript:
        for line in transcript["speaker1"]:
            await say(line, "Puck")
    if "speaker2" in transcript:
        for line in transcript["speaker2"]:
             await say(line, "Aoede")
async def podcast(pdf):
  await speak_transcript(transcript(pdf))
  merge_audio_files(speaker1_files, speaker2_files, output_path)

if __name__ == "__main__":
  asyncio.run(podcast("/Users/afnan/Developer/Book-keeper/backend/pdfs/Introduction.pdf"))