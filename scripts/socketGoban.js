var SG = SG || {};
(function($) {

// Define constants
var ALPHALABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// vars
var defaultConfig = {
    rows: 9,
    cols: 9
}

SG.Goban = function(config) { this.init(config); };
SG.Goban.prototype = {
    init: function(config) {
        this.config = config || defaultConfig;
        this.render();
    },
    getState: function() {
    },
    applyState: function() {
    },
    render: function() {
        // Create a table
        this.goban = $('<table />', {
            id: 'goban'
        }).appendTo('body');

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
                    var cell = $('<td />', {
                        'class': 'goban-intersection col-' + (j+1)
                    }).appendTo(row);

                    // Add a class for the starpoint cell
                    if ((i == (this.config.rows + 1) / 2) && (j == (this.config.cols + 1) / 2)) {
                        cell.addClass('starpoint');
                    }
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
        var intersection = row.children('td:eq(' + (coordinates.x-1) + ')');
        return intersection;
    },
    placeStone: function(config) {
        var stone = $('<span />', {
            'class': 'stone'
        });
        var intersection = this.getAt(config.coordinates),
            existing = intersection.children('span');
        var stone = existing.length ? existing : stone.appendTo(intersection);
        stone.removeClass('black white').addClass(config.color);
        return true;
    },
    removeStone: function(config) {
        var intersection = this.getAt(config.coordinates);
        intersection.empty();
    }
}


// Config variables

// Build the board



// Communication functions

})(jQuery);
