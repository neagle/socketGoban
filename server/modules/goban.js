/* Fires every time a connection is made */
/* Per-browser */
var Module = this.Module = function(data, connection){
    // Server is the actual server
    // Global
    this.server = connection.server;
    this.id = connection.socket.remoteAddress;
    this.server.connections[this.id] = connection;
    this.server.gameManager = this.server.gameManager || new GameManager();
    /*
    this.addConnection = function(myname, c) {
        this.server.connections = this.server.connections || {};
        this.server.connections[myname] = c;
        this.server.gameManager = this.server.gameManager || new GameManager();
    }
    */
    this.broadcast = function (eventName, message) {
        o = {
            event: eventName,
            data: data
        }

        o = JSON.stringify(o);

        for (name in this.server.connections) {
            this.server.connections[name].send(o);
        }

        /*
        for (var i=this.sever.connections.length-1; i>0; i--) {
            this.server.connections[i].send(message);
        }
        */
    }
};

/* Fires every time a message comes from any client */
/* Per-message */
Module.prototype.onData = function(data, connection) {
    // this.addConnection(myname, connection);
    /*
    this.server = connection.server;
    var data = data.split('|');
    var myname = data[0];
    var msg = data[1];
    this.broadcast(myname, msg);
    */
    var data = JSON.parse(data);
    this.gameManager[data.event].call(this.gameManager, data.data, this);
};

Module.prototype.onDisconnect = function(connection) {
}

var GameManager = function() {};

GameManager.prototype = {
    register: function(data, connection) {
        var msg;
        this.players = this.players || { black: null, white: null };
        if (this.players.black === null) {
            this.players.black = connection.id;
            msg = this.players.black + ' is now black.';
        } else if (this.players.white === null) {
            this.players.white = connection.id;
            msg = this.players.white + ' is now white.';
        } else {
            msg = connection.id + " is now watching.";
        }
        connection.broadcast('joinedgame', msg);
    } 
}
