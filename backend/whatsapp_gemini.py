import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file

# Create the model
generation_config = {
  "temperature": 0.5,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-2.0-flash",
  generation_config=generation_config,
  system_instruction="""You are a friendly AI healthcare assistant. Keep your responses brief and clear, suitable for WhatsApp messages. Your role is to:

1. Ask short, focused questions about symptoms and medical history
2. Provide concise analysis of symptoms
3. Give brief, clear suggestions about possible conditions
4. Recommend next steps in simple terms
5. Always include a disclaimer that this is AI guidance and not a replacement for professional medical advice

Keep messages under 3-4 sentences when possible. Use simple language and break complex information into multiple messages if needed.

Note: This is AI assistance only. Please consult a healthcare professional for proper medical diagnosis and treatment.""",
)

chat_session = model.start_chat(
  history=[
  ]
)

def chat_with_gemini(message, media_file_path=None):
  global chat_session
  files = []
  if media_file_path:
    for media_file in media_file_path:
      if media_file.endswith(".jpg"):
        files.append(upload_to_gemini(media_file, mime_type="image/jpeg"))
      elif media_file.endswith(".wav") or media_file.endswith(".mp3"):
        files.append(upload_to_gemini(media_file, mime_type="audio/mpeg"))
  
    response = chat_session.send_message(message, media_files=files)
    return response.text # test it (prev - return only response)
  else:
    response = chat_session.send_message(message)
    return response.text


if __name__ == "__main__":
  query = "I am planning to invest in mutual funds. Can you suggest some good mutual funds?"
  response = chat_with_gemini(query)
  print("Response:", response)
