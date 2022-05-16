# STB Devtools

Tools written in plain Javascript to setup some tools to help work on devices without Webdriver support.

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
- `remoteControlOff()` Stops broadcasting keyboard events.