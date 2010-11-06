var Module = this.Module = function(data, connection){
      // do something 
        // connection is the instance of websocket::Connection
    this.server = null;
    this.addConnection = function(myname, c) {
        this.server.connections = this.server.connections || {};
        this.server.connections[myname] = c;
    }
    this.broadcast = function (myname, message) {
        for (name in this.server.connections) {
            this.server.connections[name].send(myname + ' said: ' + message);
        }
        /*
        for (var i=this.sever.connections.length-1; i>0; i--) {
            this.server.connections[i].send(message);
        }
        */
    }
};

Module.prototype.onData = function(data, connection) {
    this.server = connection.server;
    var data = data.split('|');
    var myname = data[0];
    var msg = data[1];
    this.addConnection(myname, connection);
    this.broadcast(myname, msg);
};

Module.prototype.onDisconnect = function(connection) {
}
