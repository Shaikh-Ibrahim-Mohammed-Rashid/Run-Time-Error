from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from send_whatsapp import send_whatpsapp_message
import uvicorn
from dotenv import load_dotenv
import os
import json
import base64
import asyncio
from z_biogpt import generate_text
import websockets
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse
from fastapi.websockets import WebSocketDisconnect
from fastapi.responses import JSONResponse
import requests
from pydantic import BaseModel
from cloudinary_upload import cloudinary_upload_file
from whatsapp_gemini import chat_with_gemini
from speech import speech_to_text, text_to_speech
import pymongo
from urllib.parse import quote_plus
from make_call import make_call
from dotenv import load_dotenv
from agent import process_query
from rag import DocumentManager

DEBUG = True
DEBUG = False

load_dotenv()

MONGO_USERNAME = os.getenv('MONGO_USERNAME')
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')
MONGO_APPNAME = os.getenv('MONGO_APPNAME')

MONGO_URI = f"mongodb+srv://{quote_plus(MONGO_USERNAME)}:{quote_plus(MONGO_PASSWORD)}@hackathondb.s4jkr.mongodb.net/?retryWrites=true&w=majority&appName={MONGO_APPNAME}"

# MongoDB connection
client = pymongo.MongoClient(MONGO_URI)
db = client["dev"]
coll = db["users"]


app = FastAPI()


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --------------------------------- General ---------------------------------

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

# --------------------------------- WhatsApp ---------------------------------

@app.post("/send_whatsapp")
async def send_whatsapp(request: Request):
    try:
        form_data = await request.form()
        number = form_data.get("number", "")
        message = form_data.get("message", "")
        media_url = form_data.get("media_url", "")

        if not number or not message or not media_url:
            return {"error": "Number, message and media_url are required"}

        print(number, message, media_url)
        resp = send_whatpsapp_message(number, message, media_url)
        return resp
    except Exception as e:
        return {"error": str(e)}

class WhatsAppMessage(BaseModel):
    Body: str = ''
    MediaUrl0: str = ''
    MessageType: str = ''


class WhatsAppMessage(BaseModel):
    Body: str = ''
    MediaUrl0: str = ''
    MessageType: str = ''


@app.post("/listen-whatsapp")
async def listen_whatsapp(request: Request):
    if request.headers.get("content-type") == "application/json":
        post_data = await request.json()
    else:
        form = await request.form()
        post_data = {
            "Body": form.get("Body", ""),
            "MediaUrl0": form.get("MediaUrl0", ""),
            "MessageType": form.get("MessageType", "")
        }
    
    message_body = post_data.get("Body", "")
    media_url = post_data.get("MediaUrl0", "")
    msg_type = post_data.get("MessageType", "")
    
    got_audio, got_image, text_msg, audio_txt = False, False, "", ""
    
    if msg_type in ["audio", "image", "text"]:
        send_whatpsapp_message(os.getenv("MY_NUMBER"), "Thinking...🤔💭")
    
    if msg_type == "audio":
        got_audio = True
        audio_filename = "whatsapp-data/audio.wav"
        response = requests.get(media_url, auth=(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN')))
        
        if response.status_code == 200:
            # create folder if not exists
            if not os.path.exists("whatsapp-data"):
                os.makedirs("whatsapp-data")
            with open(audio_filename, 'wb') as f:
                f.write(response.content)
            
        audio_txt = speech_to_text.convert_to_text(audio_filename)
        os.remove(audio_filename)
    
    elif msg_type == "image":
        got_image = True
        image_filename = "whatsapp-data/image.jpg"
        response = requests.get(media_url, auth=(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN')))
        
        if response.status_code == 200:
            with open(image_filename, 'wb') as f:
                f.write(response.content)
    
    elif msg_type not in ["audio", "image", "text"]:
        return JSONResponse(content={"message": "Invalid message type. I can understand audio, image, and text messages only."})
    
    if got_audio:
        text_msg += audio_txt
    
    text_msg += f'\n\n{message_body}'
    
    response = chat_with_gemini(text_msg, image_filename) if got_image else chat_with_gemini(text_msg)
    
    if got_audio:
        text_to_speech.speak(response, 'whatsapp-data/send_audio.mp3')
        cloudinary_url = cloudinary_upload_file("whatsapp-data/send_audio.mp3")
        send_whatpsapp_message(os.getenv("MY_NUMBER"), '', media_url=cloudinary_url)
    else:
        send_whatpsapp_message(os.getenv("MY_NUMBER"), response)
    
    return JSONResponse(content={"message": "Message received"})


# ------------------------------------ Other APIs ------------------------------------

@app.post("/api/save_data")
async def save_data(request: Request):
    # Get data from request
    form_data = await request.form()
    usr_id = form_data.get("id", "")
    data = form_data.get("data", '{}')

    data = json.loads(data)

    if DEBUG:
        print("User ID:", usr_id)
        print("Data:", data)
        return {"message": "Data saved successfully"}
    
    # Insert data into MongoDB
    r = coll.update_one({"_id": usr_id}, {"$set": data}, upsert=True)
    if r.acknowledged:
        return {"message": "Data saved successfully"}
    
    return {"message": "Failed to save data"}, 400

@app.post("/api/make_call")
async def do_call(request: Request):
    form_data = await request.form()
    number = form_data.get("number", "")
    if not number:
        return {"error": "Number is required"}
    
    if DEBUG:
        print("Making call to", number)
        return {"message": "Call initiated"}
    
    make_call(number)
    return {"message": "Call initiated"}

@app.post("/api/rag_upload")
async def upload_file(request: Request):
    try:
        form_data = await request.form()
        file = form_data.get("file")
        if not file:
            return {"error": "No file provided"}
            
        contents = await file.read()
        
        # create folder if not exists
        if not os.path.exists("rag"):
            os.makedirs("rag")
        with open(f'rag/{file.filename}', "wb") as f:
            f.write(contents)

        doc_manager = DocumentManager()
        doc_manager.add_document(f'rag/{file.filename}')
            
        return {"message": "File uploaded successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.post("/api/chat_agent")
async def chat_agent(request: Request):
    if request.headers.get("content-type") == "application/json":
        form_data = await request.json()
    else:
        form_data = await request.form()
        
    query = form_data.get("query", "")
    if not query:
        return {"error": "Query is required"}
    
    if DEBUG:
        print("Query:", query)
        return JSONResponse(content={"response": "# This is a test response"})
    
    response = process_query(query)
    return {"response": response}



if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
    