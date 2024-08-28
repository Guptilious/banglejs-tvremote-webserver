# Overview
This project contains all the required scripts to set up a https webserver and devicesearcher for the BangleJS tvremote watch app. These are required in order for that app to work correctly with your TV. 

If you do not have a [BangleJS](https://shop.espruino.com/banglejs2) watch, then this project is probably not for you.

This project also assumes that you have, at the very least, registered your own domain name with a company like [this](https://www.mythic-beasts.com/) and configured a [DNS](https://www.mythic-beasts.com/support/domains) for it. Creating these is outside of the scope of this project and will need to be completed first before proceeding.

For now functionality is limited to panasonic TV's but other brands may be added in the future.

Below outlines some of the tasks that are covered by this project:
* Authenticate users attempting to send either POST or GET requests to the server.
* if approved GET will provide the latest file created by the deviceSearcher.
* if approved POST will look to send the tv command to the device listed in the POST request.


## Related Links

* [viera connection project](https://github.com/jens-maus/node-panasonic-viera)
* [viera key creation project](https://github.com/florianholzapfel/panasonic-viera)
* [Gadget Bridge](https://www.espruino.com/Gadgetbridge)
* [Bangle JS](https://www.espruino.com/Reference#software)
* [DNS Overview](https://www.mythic-beasts.com/support/domains)


# Preflight
## TV Settings
1. On your TV go to Menu -> Network -> TV Remote App Settings and make sure that the following settings are all turned ON:
* TV Remote
* Powered On by Apps
* Networked Standby
2. Then, go to Menu -> Network -> Network Status -> Status Details and take note of your TV ip address.

## TV `app_id` and `encryption_key`
1. Update `tvIp = ""` in `key.py` with your tv's local IP address (found in TV Settings step 2).

2. Ensuring that your TV is turned on, run the below commands:

        sudo apt install python3.10-venv
        python3 -m venv venv
        ./venv/bin/pip install git+https://github.com/florianholzapfel/panasonic-viera.git
        ./venv/bin/pip install aiohttp
        ./venv/bin/python3 key.py

4. Enter in the pin shown on the TV into the terminal prompt. You should now have a file (`tv_credentials.json`) with your tv creds included, which will be used by the wider project.

## npm install dependancies
Provided`package.json` is present in your folder, you can run the below for dependancies:

    npm install
    git clone https://github.com/jens-maus/node-panasonic-viera.git
    cd node-panasonic-viera
    npm install
    cd ..
    mv node-panasonic-viera node_modules

## Logins 
1. Update the contents of `config.json` with your desired username and password. These will need to match the username and password that you will assign for the Bangle JS app. You can add more than one user if you so wish.

## Webserver Port and credential assignment
1. Update `const PORT = '';` in `webserver.js` with the port you would like your web server to run on. Ensure that all firewall settings are configured to allow access to this port and your DNS (assuming you have created it) correctly points to your webserver.
2. Assuming that you have registered your domain and created your DNS entry, you will need to create SSL certs with the below command, to authenticate your domain:

        sudo apt install certbot
        sudo certbot certonly -d <YOUR-DNS-NAME> --standalone -m <YOUR-EMAIL-ADDRESS> --staging # used as a test to make sure certbot will succeed before an official push
        sudo certbot certonly -d <YOUR-DNS-NAME> --standalone -m <YOUR-EMAIL-ADDRESS>
   
4.   If the certbot succeeds, you can then copy the `privkey.pem`, `cert.pem` and `chain.pem` files from `/etc/letsencrypt/live/<YOUR-DNS-NAME>` to the folder this project will run from.

# Usage
    node webserver.js        // will activate the webserver and if the watch sends a request correctly, will be picked up and processed as required. It will also run `deviceSearch.js` in the background, which will continually search for new devices and create/update `ssdp-devices.json` with all discovered devices.
