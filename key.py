import panasonic_viera
import json

tvIp = ""
rc = panasonic_viera.RemoteControl(tvIp)

# Make the TV display a pairing pin code
rc.request_pin_code()

# Interactively ask the user for the pin code
pin = input("Enter the displayed pin code: ")

# Authorize the pin code with the TV
rc.authorize_pin_code(pincode=pin)

# Display credentials (application ID and encryption key)
print("app_id: " + rc.app_id)
print("encryption_key: " + rc.enc_key)

# Save the credentials to a JSON file
credentials = {
    "app_id": rc.app_id,
    "encryption_key": rc.enc_key
}

with open("tv_credentials.json", "w") as json_file:
    json.dump(credentials, json_file)

print("Credentials saved to tv_credentials.json")
