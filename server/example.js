var websocket = require('/home/nateeagle/downloads/git/node.websocket.js/websocket');

var x = new websocket.Server({port:8080, host:'0.0.0.0'});

x.onData = function(event) {
    x.send(event.data);
}
