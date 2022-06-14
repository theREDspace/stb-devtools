function getStringifyReplacer() {
  var seen = new WeakSet();
  return function replacer(key, val) {
    if (typeof val === "object" && val !== null) {
      if (seen.has(val)) {
        return;
      }
      seen.add(val);
    }

    if (val instanceof ErrorEvent) {
      return {
        message: val.message,
        lineno: val.lineno,
        colno: val.colno,
        filename: val.filename,
        stack: val.error.stack,
      }
    }
  
    return val
  }
}

/**
 * @param err {ErrorEvent}
 */
function handleError(err) {
  stbSocket.send(JSON.stringify({
    command: 'remote-logger',
    data: err,
  }, getStringifyReplacer(), 2))
}

/**
 * @param err {PromiseRejectionEvent}
 */
function handleRejection(err) {
  stbSocket.send(JSON.stringify({
    command: 'remote-logger',
    data: err,
  }, getStringifyReplacer(), 2))
}

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
      var str = JSON.stringify({
        command: 'remote-logger',
        data: [].slice.call(arguments),
      }, getStringifyReplacer(), 2);
      stbSocket.send(str);
    }
  }

  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleRejection)
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
  window.removeEventListener('error', handleError)
  window.removeEventListener('unhandledrejection', handleRejection)
}

var stbSocket;
function createSocket(target, cb) {
  stbSocket = new WebSocket(target);

  // Connection opened
  stbSocket.addEventListener('open', function (event) {
    cb()
  });

  // Listen for messages
  stbSocket.addEventListener('message', function (event) {
    var data = JSON.parse(event.data);
    switch(data.command) {
      case "evaluate":
        var f = new Function(data.data)
        var evalResp = f();
        stbSocket.send(JSON.stringify({
          command: 'evaluate-response',
          data: evalResp,
        }, getStringifyReplacer(), 2));
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
