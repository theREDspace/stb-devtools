// Inject and take over the console object to turn it
// into forwarding calls to the backend.
function injectConsole() {
  var method;
  var methods = [
    'log', 
    'info', 
    'warn', 
    'error', 
    'debug',
  ];
  window.consoleBackup = {};
  for (let i = 0; i < methods.length; i++) {
    method = methods[i];
    window.consoleBackup[method] = console[method]
    console[method] = function() {
      stbSocket.send(JSON.stringify({
        command: 'remote-logger',
        data: [].slice.call(arguments),
      }))
    }
  }
}

function restoreConsole() {
  var method;
  var methods = [
    'log', 
    'info', 
    'warn', 
    'error', 
    'debug',
  ];
  for (let i = 0; i < methods.length; i++) {
    method = methods[i];
    console[method] = window.consoleBackup[method]
  }
  window.consoleBackup = void 0;
}

var stbSocket;
function createSocket(target) {
  stbSocket = new WebSocket(target);

  // Connection opened
  stbSocket.addEventListener('open', function (event) {
    console.log("Connection open")
  });

  // Listen for messages
  stbSocket.addEventListener('message', function (event) {
    var data = JSON.parse(event.data);
    console.log('Message from server ', data);
    switch(data.command) {
      case "remote-control":
        window.dispatchEvent(new KeyboardEvent(data.data.type, {
          altKey: data.data.altKey,
          code: data.data.code,
          isComposing: data.data.isComposing,
          ctrlKey: data.data.ctrlKey,
          key: data.data.key,
          location: data.data.location,
          metaKey: data.data.metaKey,
          repeat: data.data.repeat,
          shiftKey: data.data.shiftKey,
        }))
        break;
    }
  });
}

function closeSocket() {
  stbSocket.close()
}

var keyboardListener;
function remoteControlOn() {
  document.addEventListener('keydown', function keyup(e) {
    stbSocket.send(JSON.stringify({
      command: 'remote-control',
      data: {
        type: e.type,
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        charCode: e.charCode,
        keyCode: e.keyCode,
        which: e.which,
        metaKey: e.metaKey,
        location: e.location,
        repeat: e.repeat,
        isComposing: e.isComposing,
      }
    }));
  });
}
