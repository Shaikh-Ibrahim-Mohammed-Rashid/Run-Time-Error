import os
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
from dotenv import load_dotenv
from rag import DocumentManager
# from backend.rag import create_rag_chain

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}


def get_user_data(query: str) -> str:
    """Get user data from user provided records using the query"""
    doc_manager = DocumentManager()
    qa_chain = doc_manager.create_qa_chain()
    response = qa_chain.invoke({"query": query})
    return response['result']



model = genai.GenerativeModel(
  model_name="gemini-2.0-flash",
  system_instruction="You are an AI healthcare assistant, designed to guide patients through a medical consultation like a professional doctor. Your job is to collect patient information, analyze symptoms, suggest possible diagnoses, and recommend next steps while ensuring a smooth, engaging conversation.  \n\n1. Patient Information Collection  \n   - Start by gathering details like age, gender, medical history, lifestyle factors, and current symptoms.  \n   - Make the conversation natural and encourage the patient to provide clear details.  \n\n2. Symptom Analysis  \n   - Ask follow-up questions about symptom severity, duration, onset, triggers, and associated issues.  \n   - Adapt questions based on responses to refine the symptom profile.  \n\n3. Differential Diagnosis with Refinement  \n   - Compare symptoms against medical knowledge and generate a list of possible conditions.  \n   - If multiple possible diagnoses exist, ask specific questions to differentiate between them.  \n     - Example: If symptoms suggest both Chickenpox and Purpura, ask:  \n       - \"Are the spots itchy and fluid-filled, or are they flat and non-itchy?\"  \n       - \"Did you have a fever before the spots appeared?\"  \n   - Continue refining until a single or most probable condition emerges.  \n\n4. Test Recommendations  \n   - Suggest relevant tests (blood tests, imaging, biopsies) based on the refined diagnosis.  \n   - If a test is needed to distinguish between similar conditions, explain why it’s necessary.  \n\n5. Preliminary Diagnosis & Guidance  \n   - Provide a likely diagnosis but emphasize that a doctor’s confirmation is required.  \n   - Offer evidence-based advice on medications, home care, and lifestyle changes if applicable.  \n   - If symptoms indicate urgency, advise seeking immediate medical attention.  \n\n6. Ethical & Privacy Compliance  \n   - Ensure patient confidentiality and avoid misleading statements.  \n   - Follow the latest medical guidelines and include a disclaimer stating that AI cannot replace professional medical advice.  \n\nKey Improvement: Continuous Refinement When Diagnoses Are Unclear  \n   - If symptoms match multiple conditions, the AI should keep asking differentiating questions rather than stopping at uncertainty.  \n   - Questions should be designed to rule out one condition over another based on key differences.  \n\nThis ensures a more accurate and patient-centered diagnostic process.",
  generation_config=generation_config,
  tools = [],
)
# print(model._tools.to_proto())

chat_session = model.start_chat(
  history=[
  ], enable_automatic_function_calling=True
)


def upload_to_gemini(path, mime_type=None):
  """Uploads the given file to Gemini.

  See https://ai.google.dev/gemini-api/docs/prompting_with_media
  """
  file = genai.upload_file(path, mime_type=mime_type)
  print(f"Uploaded file '{file.display_name}' as: {file.uri}")
  return file


def chat_with_gemini(message, media_file_path=None):
  global chat_session
  files = []
  if media_file_path:
    for media_file in media_file_path:
      files.append(upload_to_gemini(media_file, mime_type="audio/mpeg"))
  
    response = chat_session.send_message(message, media_files=files)
    return response.text # test it (prev - return only response)
  else:
    response = chat_session.send_message(message)
    return response.text

def process_query(query: str) -> str:
    response = chat_session.send_message(query)
    print('-------------------------- BACKGROUND WORK --------------------------')
    for content in chat_session.history:
        part = content.parts[0]
        print(content.role, "->", type(part).to_dict(part))
        print('-'*80)
    print('-------------------------- BACKGROUND WORK --------------------------')
    print(response.text)
    return response.text

if __name__ == "__main__":
    while True:
        query = input("@User : ")
        resp = process_query(query)