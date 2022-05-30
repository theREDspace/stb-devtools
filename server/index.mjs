#!/usr/bin/env node

import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const wss = new WebSocketServer({ port: 3031 });

// track dead connections
const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

function heartbeat() {
  this.isAlive = true;
}

const clients = new Map();

wss.on('connection', (ws) => {
  const id = uuidv4();
  const metadata = { id };
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  clients.set(ws, metadata);

  ws.on('message', (data) => {
    data = JSON.parse(data);
    switch (data.command) {
      case "evaluate":
        wss.clients.forEach(function each(client) {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({command: 'evaluate', data: data.data}));
          }
        });
        break;
      case "remote-logger":
        console.log("log %s", clients.get(ws).id);
        console.dir(data.data, {
          depth: 5,
        })
        break;
      case "evaluate-response":
        console.log("evaluate-response %s", clients.get(ws).id);
        console.dir(data.data)
        break;
      case "remote-control":
        handleRemoteControl(ws, data.data)
        break;
    }
  }); 
  
  ws.on("close", () => {
    console.log('client %s quit', clients.get(ws).id)
    clients.delete(ws);
  });
});

wss.on('close', function close() {
  clearInterval(interval);
});

function handleRemoteControl(ws, data) {
  wss.clients.forEach(function each(client) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({command: 'remote-control', data: data}));
    }
  });
}

console.log("server up");