# Overview
This project contains all the required scripts to set up the https webserver and devicesearcher for my BangleJS tvremote watch app. These are required in order for the app to work correctly with your TV. 
In addition you will need:
* A [viera connection project](https://github.com/jens-maus/node-panasonic-viera) which will connect and send the correct commands to your TV from the app.
* A [viera key creation project](https://github.com/florianholzapfel/panasonic-viera) which will collect the app_id and encryption_key for your tv.

For now functionality is limited to panasonic TV's but other brands may be added in the future. Additionally I'd like to combine the above 2 projects into a node script that will run commands and grab keys. At this time I was only able to find a python script to ge the keys. 

Below outlines some of the tasks that are covered by this project:
* Authenticate users attempting to send either POST or GET requests to the server.
* if approved GET will provide the latest file created by the deviceSearcher.
* if approved POST will look to send the tv command to the device listed in the POST request.


## Related Links

* [viera connection project](https://github.com/jens-maus/node-panasonic-viera)
* [viera key creation project](https://github.com/florianholzapfel/panasonic-viera)
* [Gadget Bridge](https://www.espruino.com/Gadgetbridge)
* [Bangle JS](https://www.espruino.com/Reference#software)


# Preflight
# npm install dependancies
* http
* https
* fs
* express
* xml2js
* node-ssdp

## Webserver Port and credential assignment
1. Open `webserver.js` and update `const PORT = '';` with the port you would like your web server to run on.
. Ensure that all firewall settings are configured to allow access to this port and your DNS correctly points to your webserver.
2. Create copies of your domains `privkey.pem`, `cert.pem` and `chain.pem` files and ensure they are located in the same folder as the main scripts.

## TV Settings
1. On your TV go to Menu -> Network -> TV Remote App Settings and make sure that the following settings are all turned ON:
* TV Remote
* Powered On by Apps
* Networked Standby
2. Then, go to Menu -> Network -> Network Status -> Status Details and take note of your TV ip address.

## TV `app_id` and `encryption_key`.
1. Copy the below into a script called `key.py` making sure to put your TV's local IP address in. It's location does not matter as we are only need the keys it creates.

## key.py
    import panasonic_viera

    tvIp = ""  # Replace with your TV's local IP Address.
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

2. Run the following commands:
   
        python3 -m venv venv
        ./venv/bin/pip install git+https://github.com/florianholzapfel/panasonic-viera.git
        ./venv/bin/pip install aiohttp
        ./venv/bin/python3 key.py

4. enter in the pin shown on the TV.
5. Copy the `app_id` and `encryption_key` that are output, into the `commands.js` variables.

## TV connection Project
The below project should be downloaded to the folder where this projects scripts are located (excluding the app/encryption_key project):

    git clone https://github.com/jens-maus/node-panasonic-viera.git
    mv node-panasonic-viera viera_connection
    cd viera_connection
    npm install
    cd ..

## Logins 
Update the contents of config.json to your desired username and password. These will need to match the username and password that you will assign for the Bangle JS app. You can add more than one user if you so wish.


# Usage
    node deviceSearcher.js    // should run as a background process that will continually search for new devices and create/update `ssdp-devices.json` with all discovered devices.
    node webserver.js        // will activate the webserver and if the watch sends a request correctly, will be picked up and processed as required.
