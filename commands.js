#!/usr/bin/env node

# Created by (https://github.com/Guptilious)
              
const {Viera} = require('node-panasonic-viera');
const {VieraKeys} = require('./viera-keys');

const viera = new Viera();

const fs = require('fs');

const rawData = fs.readFileSync('tv_credentials.json');
const credentials = JSON.parse(rawData);

const appId = credentials.app_id;
const encryptionKey = credentials.encryption_key;

const validApps = ['netflix', 'youtube', 'disney', 'prime'];
let tvIp;

function watchPost(body) {

        const tvCommand = body.command;
        const tvIp = body.tvip;
        const isAppCommand = validApps.includes(tvCommand);
        const isKeyCommand = tvCommand in VieraKeys;

        if (isAppCommand || isKeyCommand) {

                const commandType = isAppCommand ? 'sendAppCommand' : 'sendKey';
                const commandValue = isAppCommand ? tvCommand : VieraKeys[tvCommand];
                console.log(commandType + "\n" + commandValue);
                viera.connect(tvIp, appId, encryptionKey)
                .then(() => {
                        return viera[commandType](VieraKeys[tvCommand]);
                })
                .catch((error) => {
                        console.log(error);
                });

        } else console.log("Command: " + tvCommand + " not found");
}

module.exports = {
        watchPost,
};
