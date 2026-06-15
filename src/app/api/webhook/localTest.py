import requests

url = 'http://localhost:3000/api/webhook'
payload = {
    "aspect_type": "update",
    "event_time": 1516126040, #Idk
    "object_id": 18919873193,   
    "object_type": "activity",
    "owner_id": 134815, #Does not matter
    "subscription_id": 120475, #Does not matter 
    "updates": {
        "title": "Uppdatert" #Idk hva som er her egt. 
    }
}

response = requests.post(url, json=payload)
print(response.json())
