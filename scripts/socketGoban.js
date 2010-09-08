/*
INITIALIZE
1. Tell server want to join
2. Server says:
    a. You are first, must wait for player
    b. You are second, game should begin
    c. No slots
3. Begin game
    a. Set black and white players 
    b. Begin black's turn

TURN

ENDGAME
*/
var SG = SG || {};
(function($) {

// Define constants
var ALPHALABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function log(msg) {
    $('#log').append($('<p />', {
        text: msg
    }));
}

SG.Server = function() {
    this.socket = new WebSocket('ws://nateeagle.com:8080/goban');
    this.socket.readyState = 1;
    SG.socket = this.socket;
    this.socket.onmessage = this.onmessage;
}


SG.Server.prototype = {
    register: function() {
        this.send('register', {});
    },
    send: function(eventName, data) {
        o = {
            event: eventName,
            data: data
        }
        o = $.toJSON(o);
        this.socket.send(o);
    },
    onmessage: function(event) {
        event = $.evalJSON(event.data);
        $(this).trigger(event.event, [event.data]);
    }
}

SG.Goban = function(config) { this.init.call(this, config); };
SG.Goban.prototype = {
    init: function(config) {
        console.log('Goban init');
        this.server = new SG.Server();
        this.config = $.extend({}, this.defaults, config);
        this.intersections = [];

        this.render();


        /*
        var players = this.config.players;
        this.players = $([players.black, players.white]);

        this.players.trigger('join', this);
        for (player in this.config.players) {
           console.log('Player:', players[player]);
            if (players[player].config.playsFirst) {
               $(players[player]).trigger('onTurnBegin')
               break;
            }
        }
        */

        this.server.register();
        
        $(this).bind('joinedgame', log);

        this.addListeners();
    },
    defaults: {
        rows: 9,
        cols: 9,
        players: {
            black: null,
            white: null
        }
    },
    addListeners: function() {
        $(this).bind('turn', this.onTurn); 
    },
    onTurn: function(e, player) {
        // server call
        player = $(player);
        player.trigger('turncomplete');
        otherPlayer = this.players.not(player);
        console.log(otherPlayer);
        otherPlayer.trigger('turnbegin');

        /*
        this.config.players[othercolor]
        othercolor = player.config.color=='black':'white':'black';
        otherPlayer = (player.config.color == 'black') ? '
        */
    },
    getState: function() {
    },
    applyState: function() {
    },
    render: function() {
        // Create a table
        this.goban = $('<table />', {
            id: 'goban'
        }).prependTo('body');

        // Fill the table with rows/cols
        this.rows = [];
        for(var i=0;i<this.config.rows + 2;i++) {
            var row = $('<tr />', {
                'class': 'goban-row row-' + (i+1)
            }).appendTo(this.goban);

            // Add a class for the last row of playable area
            if (i == this.config.rows) {
                row.addClass('last');
            }

            // Add a class for the middle row of playable area
            if (i == (this.config.rows + 1) / 2) {
                row.addClass('starpoint');
            }

            for(var j=0;j<this.config.cols + 2;j++) {
                if (i == 0 || i == this.config.rows + 1) { 
                    $('<th />', {
                        text: (j==0||j==this.config.cols+1) ? '' : ALPHALABELS.substring(j-1, j)
                    }).appendTo(row);;
                } else if (j == 0 || j == this.config.cols + 1) { 
                    $('<th />', {
                        text: (i==0||i==this.config.rows+1) ? '' : i 
                    }).appendTo(row);;
                } else {
                    var intersection = $('<td />', {
                        'class': 'goban-intersection col-' + (j+1)
                    }).appendTo(row);

                    // Add coordinates as data
                    intersection.data({
                        x: j,
                        y: i
                    }); 

                    // Add a class for the starpoint intersection 
                    if ((i == (this.config.rows + 1) / 2) && (j == (this.config.cols + 1) / 2)) {
                        intersection.addClass('starpoint');
                    }

                    this.intersections.push(intersection);
                }
            } 

            this.rows.push(row);
        }

        // Set computed height / width of tds explicitly so that stones can be set to 100% height/width
        this.goban.find('td').each(function(i, item) {
            var $item = $(item);
            $item.css({
                height: $item.height(),
                width: $item.width()
            }); 
        });
    },
    getAt: function(coordinates) {
        var row = this.rows[coordinates.y];
        var intersection = row.children('td').eq(coordinates.x-1);
        return intersection;
    },
    placeStone: function(config) {
        var intersection = this.getAt(config.coordinates),
            existing = intersection.children('span'),
            stone;
        //var stone = existing.length ? existing : stone.appendTo(intersection);
        if (existing.length) {
            stone = $(existing[0]);
            stone.removeClass('black white').addClass(config.color);
        } else {
            stone = $('<span />', {
                'class': 'stone ' + config.color,
            });
            stone.appendTo(intersection);
        }
        // stone.removeClass('black white').addClass(config.color);
        //stone.addClass(config.color);
        return stone;
    },
    removeStone: function(config) {
        var intersection = this.getAt(config.coordinates);
        intersection.empty();
    }
}

SG.Player = function(config) { this.init.call(this, config); };
SG.Player.prototype = {
    init: function(config) {
        this.config = $.extend(this.config || {}, 
                               this.defaults, 
                               config);
        $(this).bind('join', $.proxy(this.onJoin, this));
        //console.log($(this));
    },
    defaults: {
        color: 'black',
        playsFirst: false 
    },
    onJoin: function(e, goban) {
        console.log(goban);
        this.goban = goban;
        console.log('join');
        this.clickHandlers();
    },
    clickHandlers: function() {
        console.log(this.goban);
        var gb = this.goban.goban;
        // console.log(gb);
        $(this).bind('turnbegin', $.proxy(this.onTurnBegin, this));
        $(this).bind('turncomplete', $.proxy(this.onTurnComplete, this));
    },
    onClick: function(e) {
        console.log(this.config.color, this.config.playsFirst);
        if (!this.config.playsFirst) { return; }
        var intersection = $(e.target).closest('td'),
            coordinates = intersection.data();

        this.goban.placeStone({
            coordinates: coordinates,
            color: this.config.color
        });

        $(this.goban).trigger('turn', this);
    },
    onTurnBegin: function(e) {
        console.log(this.config.color, 'beginning turn');
        this.goban.goban.bind('click', $.proxy(this.onClick, this));
        this.config.playsFirst = true;
    },
    onTurnComplete: function(e) {
        console.log(this.config.color, 'ending turn');
        this.goban.goban.unbind('click', $.proxy(this.onClick, this));
        this.config.playsFirst = false;
    }
}


})(jQuery);
