function objLog(obj) {
    for (key in obj) {
        if (obj[key] instanceof Object) {
            objLog(obj[key]); 
        } else {
            sys.log(key + ": " + obj[key]);
        }
    }
}

var sys = require('sys'),
    ws = require('/home/nateeagle/downloads/git/node-websocket-server/lib/ws');


var server = ws.createServer();

server.addListener('listening', function() {
    sys.log('Listening for connections.');
    server.gameManager = server.gameManager || new GameManager();
    server.connections = {};
});

server.addListener('connection', function(conn) {
    conn.ip = conn._req.socket.remoteAddress;
    sys.log(conn.ip + ' has connected');
    server.connections[conn.ip] = conn;
    conn.addListener('message', function(data) {
        var data = JSON.parse(data);
        if (server.gameManager[data.event]) {
            server.gameManager[data.event].call(server.gameManager, data.data, conn);
        } else {
            sys.log(data.event + ' does not exist');
        }
    });
    conn.write(getPacket('ready', ''));
});

function getPacket(eventName, message) {
    o = {
        event: eventName,
        data: message 
    }

    o = JSON.stringify(o);
    return o;
};

function broadcast(eventName, message) {
    var o = getPacket(eventName, message);
    server.broadcast(o);
}

var Player = function(options) {
    for (opt in options) {
        this[opt] = options[opt]; 
    }      
};

Player.prototype = {
    color: null,
    ip: null,
    ready: false,
    toJSON: function() {
        return {
            color: this.color,
            ip: this.ip,
            ready: this.ready
        }
    }
}

var GameManager = function() {};

GameManager.prototype = {
    register: function(data, connection) {
        var msg, player;
        this.players = this.players || { black: new Player({ color: 'black' }), white: new Player({ color: 'white' }) };
        if (this.players.black.ip === null) {
            this.players.black.ip = connection.ip;
            msg = this.players.black.ip + ' is now black.';
            player = this.players.black;
        } else if (this.players.white.ip === null) {
            this.players.white.ip = connection.ip;
            msg = this.players.white.ip + ' is now white.';
            player = this.players.white;
        } else {
            msg = connection.ip + " is now watching.";
        }
        sys.log(msg);
        broadcast('joinedgame', { player: player, message: msg });
        if (this.players.black.ip && this.players.white.ip) {
            // objLog(this.players);
            // sys.log(JSON.stringify(this.players));
            //sys.log(this.players.black.someOtherProp);
            broadcast('startgame', { players: this.players, message: 'Starting game!' });
        }
    },
    _getPlayer: function(ip) {
        for (player in this.players) {
            if (this.players[player].ip === ip) {
                return this.players[player];
            }
        }
    },
    _getOtherPlayer: function(ip) {
        var player = this._getPlayer(ip),
            color = (player.color === 'black') ? 'white' : 'black';
        return this.players[color]; 
    },
    playerready: function(data, connection) {
        sys.log(data);
        sys.log(JSON.stringify(data));
        objLog(data);        
        var player = this._getPlayer(connection.ip);
        player.ready = true;

        if (this.players.black.ready && this.players.white.ready) {
            broadcast('turnbegin', { player: this.players.black, message: 'Black\'s turn' });
        }
    },
    playerturn: function(data, connection) {
        var isLegal = true,
            player = this._getPlayer(connection.ip),
            otherPlayer = this._getOtherPlayer(connection.ip);

        sys.log('Player', player, 'Other Player', otherPlayer);

        if (isLegal) {
            broadcast('turnend', { player: player });  
            broadcast('turnbegin', { player: otherPlayer, message: otherPlayer.color + '\'s turn' });
        } else {
        }
    }
}

server.listen(8080);
