# STB Devtools

Tools written in plain Javascript to setup some tools to help work on devices without Webdriver support.

Due to usage of WeakSet for circular JSON detection the browser support is defined fully here: https://caniuse.com/?search=Weakset

Native Browser Support:
- Chrome 36
- Firefox 34
- Safari 9

## Setup

Put a `<script>` tag into your application's HTML that loads `client/index.js`. This will put the following APIs into the global scope.

## Socket Connection (required)

- `createSocket('ws://localhost:3031')` Creates a websocket connection to the remote server provided, other features work over this network connection.
- `closeSocket()` Closes the websocket connection on the client.

## Remote Logger

API:
- `injectConsole()` Replaces the console API with sending logs to the socket server.
- `restoreConsole()` Restores the console API back to it's original methods.

## Remote Control

API:
- `remoteControlOn()` Starts broadcasting keyboard events from this browser to all other connected clients, who will dispatch the events as synthetic keyboard events locally automatically.

## Temporary File

#### Client usage

From the client send a command like the below

```
stbSocket.send(JSON.stringify({command: 'temp-file', data: data }));
```

#### Socket Payload:
```
{
  command: 'spectre-capture',
  data: 'string'
}
```

Will be saved to a temporary file using the module `tempy`.