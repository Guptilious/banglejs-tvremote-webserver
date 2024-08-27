# Overview
This project contains all the required scripts to set up the https webserver and devicesearcher for my BangleJS tvremote watch app. These are required in order for the app to work correctly with your TV. For now functionality is limited to panasonic TV's but other brands may be added in the future.

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
## npm install dependancies
Provided`package.json` is present in your folder, you can run the below for dependancies:

    npm install


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

## TV `app_id` and `encryption_key`
1. Update `key.py` with your tv's local IP address (found in TV Settings step 2).

2. Ensuring that your TV is turned on, run the below commands:

        python3 -m venv venv
        ./venv/bin/pip install git+https://github.com/florianholzapfel/panasonic-viera.git
        ./venv/bin/pip install aiohttp
        ./venv/bin/python3 key.py

3. Enter in the pin shown on the TV into the terminal prompt.

## Logins 
Update the contents of `config.json` to your desired username and password. These will need to match the username and password that you will assign for the Bangle JS app. You can add more than one user if you so wish.


# Usage
    node webserver.js        // will activate the webserver and if the watch sends a request correctly, will be picked up and processed as required. It will also run `deviceSearch.js` in the background, which will continually search for new devices and create/update `ssdp-devices.json` with all discovered devices.
