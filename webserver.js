#!/usr/bin/env node

# Created by (https://github.com/Guptilious)
	      
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const tvCommand = require('./commands');

const deviceSearch = require('./deviceSearcher.js');

const PORT = '';

const privateKey = fs.readFileSync('privkey.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const ca = fs.readFileSync('chain.pem', 'utf8');
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Load SSL certificate and private key
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const authenticate = (req, res, next) => {

	let authHeader = req.headers['authorization'];
	if (!authHeader) return res.status(401).send('Authorization header missing');

	const base64Credentials = authHeader.split(' ')[1];
	const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
	const [username, password] = credentials.split(':');

	let userCheck = username in config.users;

	if (!userCheck && !config.users[username]) return res.status(401).send('Invalid credentials');

	next();
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticate);

app.post('/', (req, res) => {

	let bodyString = Object.keys(req.body)[0]
        let jsonData =  JSON.parse(bodyString);

	console.log('Received full POST body:', jsonData);
	res.send('Received POST request');
	tvCommand.watchPost(jsonData);
});

app.get('/ssdp-devices.json', (req, res) => {

	const filePath = './ssdp-devices.json';
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			console.error('Error reading the file:', err);
			return res.status(500).send('Error reading the file');
		}
		res.setHeader('Content-Type', 'application/json');
		res.send(data);
	});
	console.log("found the get data");
});


// Handle all other methods
app.all('*', (req, res) => {
	res.status(405).send('Method Not Allowed');
});

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app)
httpsServer.keepAliveTimeout = 0;

deviceSearch.startSSDPSearch();

httpsServer.listen(PORT, () => {
	console.log(`HTTPS server running on ${PORT}`);
});

