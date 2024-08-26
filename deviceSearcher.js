#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const xml2js = require('xml2js');
const { Client, Server } = require('node-ssdp');
const deviceList = 'ssdp-devices.json';

async function startSSDPSearch() {
    const client = new Client();
    let watchPackage = null;

    client.search('ssdp:all');

    // Server for advertising a service
    const server = new Server({
        location: 'http:tv-webserver.com/device-desc.xml',
        udn: 'uuid:tv-webserver'
    });

    server.addUSN('upnp:rootdevice');

    server.start(() => {
        console.log('SSDP server started');
    });

    server.on('advertise-alive', async (headers) => {
        if (headers["NT"].includes("panasonic-com:device")) {
            const xmlUrl = headers["LOCATION"];
            console.log('Panasonic Device Located:', xmlUrl);

            try {
                const friendlyName = await deviceName(xmlUrl);
                console.log('Friendly Name:', friendlyName);

                const deviceUrl = xmlUrl.replace(/:[0-9].+.xml/, "");

                // Prepare the device object in the required format
                const deviceObject = {
                    "name": friendlyName,
                    "ip": deviceUrl
                };

                await appendJsonToFile(deviceObject);
                console.log(deviceObject);

            } catch (err) {
                console.error('Failed to get friendly name:', err);
            }
        }
    });

    // Search for SSDP devices every second
    const searchInterval = setInterval(() => {
        client.search('ssdp:all');
    }, 1000);

    function shutdown() {
        clearInterval(searchInterval);
        client.stop();
        server.stop();
        console.log("\nSSDP client and server stopped.");
        process.exit();
    }

    process.on('SIGINT', shutdown);     // ctrl+c
    process.on('SIGTERM', shutdown);    // termination signal

    process.on('exit', () => {
        clearInterval(searchInterval);
        client.stop();
        server.stop();
        console.log('Process exiting. SSDP client and server stopped.');
    });
}

function deviceName(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';

            // Collect the data chunks
            res.on('data', (chunk) => {
                data += chunk;
            });

            // Once the response is complete
            res.on('end', () => {
                // Parse the XML data
                xml2js.parseString(data, { explicitArray: false }, (err, result) => {
                    if (err) {
                        console.error('Error parsing XML:', err);
                        reject(err);
                    } else {
                        const friendlyName = result.root.device.friendlyName;
                        resolve(friendlyName);
                    }
                });
            });
        }).on('error', (err) => {
            console.error('Error fetching URL:', err);
            reject(err);
        });
    });
}

// Ensure you have the updated appendJsonToFile function
async function appendJsonToFile(newData) {
    try {
        // Step 1: Read the existing data from the file
        let fileData = '[]'; // Default to empty array if file does not exist
        if (fs.existsSync(deviceList)) {
            fileData = fs.readFileSync(deviceList, 'utf8');
        }

        // Step 2: Parse the existing data
        let existingData = [];
        if (fileData) {
            existingData = JSON.parse(fileData);
        }

        // Step 3: Check if the IP already exists
        const existingIndex = existingData.findIndex(entry => entry.ip === newData.ip);

        if (existingIndex > -1) {
            // IP exists, update the existing entry
            existingData[existingIndex] = newData;
        } else {
            // IP does not exist, add new data
            existingData.push(newData);
        }

        // Step 4: Convert the updated array to JSON
        const updatedJsonString = JSON.stringify(existingData, null, 2);

        // Step 5: Write the updated JSON string back to the file
        fs.writeFileSync(deviceList, updatedJsonString, 'utf8');

        console.log('Data successfully updated in file.');
    } catch (err) {
        console.error('Error updating data in file:', err);
    }
}

// Start the SSDP search
startSSDPSearch();

