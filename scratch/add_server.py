import urllib.request
import json

try:
    private_key = open(r'C:\Users\ASUS\.ssh\sreai_rsa').read()
    payload = {
        "name": "Localhost Windows Node",
        "ip_address": "127.0.0.1",
        "connection_type": "ssh",
        "port": 22,
        "username": "ASUS",
        "password": "",
        "private_key": private_key
    }

    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/servers/',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except Exception as e:
    error_msg = e.read().decode() if hasattr(e, 'read') else str(e)
    print("Error:", error_msg)
