import requests
import os
from dotenv import load_dotenv

load_dotenv()

# Create Call (POST /call)


def make_call(number):
    if not number.startswith("+91"):
        number = f"+91{number}"

    print(number)

    response = requests.post(
      "https://api.vapi.ai/call",
      headers={
        "Authorization": f"Bearer {os.environ['VAPI_API_KEY']}",
        "Content-Type": "application/json"
      },
      json={
        "assistantId": "9983438e-10bf-452a-81dc-a8695fc5a3f8",
        "name": "Py-Caller",
        "customer": {
          "number": number,
        },
        "phoneNumberId": "ef0d9fbb-eefd-4bc5-a8ac-818fdf96e258"
      },
    )

    # print(response.json())

    return {"message": "Call initiated"}
    

if __name__ == "__main__":
    make_call("8879109025")