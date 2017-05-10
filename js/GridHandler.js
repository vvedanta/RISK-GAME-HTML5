function GridHandler(main) {
    this.levels = ['01010111010-11111111111-01111101110-01010010111-11100001111-11110001010-11100001111-01111110110-11110111110-01111110111', '01010101010-11111011111-11110001111-11111111111-10101110101-10001110001-11111111111-11111011111-11110001111-11111111111', '00000001110-00011111110-01100101111-01111111111-11111010011-11111000111-11111101110-11101111111-00110011111-00001111110', '00011111000-01111111010-01101111110-11010111110-11001100101-11001100011-11111011111-01111111111-00111111000-00001010000', '00010110000-01111011110-10111101110-11110011100-01110001100-11011101110-10011111101-10011000111-11111101111-01101111100', '00010011110-01111111110-01111111110-11101111111-11001100011-01100111110-11111111100-11101011000-01110111000-00111110000', '00010001000-01111011110-11111011111-11111111111-00111011100-00110001100-01111111110-11111011111-11111011111-00111011100', '11111100000-11111111000-11110011010-11110011111-01111111111-00111110000-00011110000-01110110000-01110111000-11111111100', '00000000010-00000001111-00000111111-00011111100-01111011000-11110011000-00111111000-00001111110-00000011111-00000000111', '00000000000-00000001110-00000101111-00011111101-01111011011-11110001111-10011111100-11111110000-11110000000-00100000000'];
    this.list = [];
    this.levelInt = 0;
    this.level = this.levels[this.levelInt];
}
GridHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.levelInt = Math.floor(Math.random() * this.levels.length);
    this.level = this.levels[this.levelInt];
    var columns = this.level.split('-');
    var x, y, rows;
    for (x = 0; x < columns.length; x++) {
        this.list[x] = [];
        rows = columns[x].split('');
        for (y = 0; y < rows.length; y++) {
            if (rows[y] == 0) {
                this.list[x][y] = {
                    'owner': 'empty',
                    'power': 0
                };
            } else {
                this.list[x][y] = {
                    'owner': 'neutral',
                    'power': 0
                };
            }
        }
    }
};
function GridMath() {}
GridMath.neighbors = {
    'even': [[-1, 0], [+1, 0], [0, -1], [0, +1], [-1, +1], [-1, -1]],
    'odd': [[-1, 0], [+1, 0], [0, -1], [0, +1], [+1, +1], [+1, -1]]
};
GridMath.isNeighbor = function(x, y, x2, y2) {
    var neighbors = y % 2 == 0 ? GridMath.neighbors.even : GridMath.neighbors.odd;
    for (var i = 0; i < neighbors.length; i++) {
        if (x + neighbors[i][0] == x2 && y + neighbors[i][1] == y2) {
            return true;
        }
    }
    return false;
};
GridMath.isActionable = function(gridList, x, y, player, state) {
    if (x in gridList && y in gridList[x] && gridList[x][y].owner != 'empty') {
        if (state == 'start') {
            if (gridList[x][y].owner == 'neutral') {
                return true;
            }
        }
        if (state == 'reinforcements') {
            if (gridList[x][y].owner == player.color) {
                return true;
            }
        }
        if (state == 'select') {
            if (gridList[x][y].owner == player.color && gridList[x][y].power > 0) {
                return true;
            }
        }
        if (state == 'move') {
            for (var i = player.tiles.length - 1; i >= 0; i--) {
                if (GridMath.isNeighbor(x, y, player.tiles[i].x, player.tiles[i].y)) {
                    return true
                }
            }
        }
    }
    return false;
};

GridMath.moveActionable = function(gridList, x, y, lastX, lastY, player, state) {
    if (x in gridList && y in gridList[x] && gridList[x][y].owner != 'empty') {
        if (player.tiles[player.tiles.length-1].x == x && player.tiles[player.tiles.length-1].y == y) {
            return true;
        }
        if (GridMath.isNeighbor(x, y, lastX, lastY)) {
            return true;
        }
        if (x == lastX && y == lastY) {
            return true;
        }
    }
    return false;
};

GridMath.hasNeighbor = function(gridList, x, y, flag, color) {
    var neighbors = y % 2 == 0 ? GridMath.neighbors.even : GridMath.neighbors.odd;
    for (var i = 0; i < neighbors.length; i++) {
        var X = x + neighbors[i][0];
        var Y = y + neighbors[i][1];
        if (X in gridList && Y in gridList[X] && gridList[X][Y].owner != 'empty') {
            if (flag == 'isEnemy') {
                if (gridList[X][Y].owner != 'neutral' && gridList[X][Y].owner != color) {
                    return true;
                }
            } else if (flag == 'isNeutral') {
                if (gridList[X][Y].owner == 'neutral') {
                    return true;
                }
            } else if (flag == 'notMe') {
                if (gridList[X][Y].owner != color) {
                    return true;
                }
            }
        }
    }
    return false;
};
