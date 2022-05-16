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
      case "remote-logger":
        console.log("received: %s", data.data);
        break;
      case "remote-control":
        handleRemoteControl(ws, data.data)
        break;
    }
  }); 
  
  ws.on("close", () => {
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

console.log("wss up");