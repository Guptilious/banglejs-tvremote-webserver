#!/usr/bin/env node

const {VieraKeys, Viera} = require('./viera_connection/viera');
const viera = new Viera();

const validApps = ['netflix', 'youtube', 'disney', 'prime'];
const appId = '';
const encryptionKey = '';

function watchPost(body) {

	const tvCommand = body.command;
	const tvIp = body.tvip;

	if (tvCommand in VieraKeys) {

		const isAppCommand = validApps.includes(tvCommand);
		const commandType = isAppCommand ? 'sendAppCommand' : 'sendKey';

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

