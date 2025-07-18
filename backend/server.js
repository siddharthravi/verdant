const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const apiRouter = require('./routes/api');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use('/api', apiRouter);

wss.on('connection', ws => {
  ws.on('message', message => {
    ws.send(`Echo: ${message}`);
  });
});

server.listen(4000, () => {
  console.log('Backend running on port 4000');
});