window.onload = function() {
    new Main()
};
function AIHandler(main) {}
AIHandler.prototype.init = function(main) {
    this.tilesAdjacentEnemies = [];
    this.tilesAdjacentNeutral = [];
    this.reinforceDelay = main.startButton == 0 ? 50 : 1;
    this.moveDelay = main.startButton == 0 ? 250 : 1;
    this.main = main
};
AIHandler.prototype.run = function() {
    if (this.main.state == 'start') {
        setTimeout(this.start.bind(this), this.moveDelay)
    } else if (this.main.state == 'reinforcements') {
        setTimeout(this.reinforcements.bind(this), this.reinforceDelay)
    } else if (this.main.state == 'move') {
        setTimeout(this.move.bind(this), this.moveDelay)
    }
};
AIHandler.prototype.start = function() {
    var x,
        y;
    while (1) {
        x = Math.floor(Math.random() * (this.main.levelWidth - 2) + 1);
        y = Math.floor(Math.random() * (this.main.levelHeight - 2) + 1);
        if (this.main.gridHandler.list[x][y].owner == 'neutral') {
            if (GridMath.hasNeighbor(this.main.gridHandler.list, x, y, 'isEnemy', this.main.playerHandler.activePlayerObj.color) == false) {
                this.main.playerHandler.mouseDownEvent(x, y, 0);
                break
            }
        }
    }
    console.log(x, y)
};
AIHandler.prototype.reinforcements = function() {
    var playerHandler = this.main.playerHandler;
    var activePlayerObj = playerHandler.activePlayerObj;
    var gridList = this.main.gridHandler.list;
    var tile;
    if (this.tilesAdjacentEnemies.length == 0 && this.tilesAdjacentNeutral.length == 0) {
        for (i = activePlayerObj.tiles.length - 1; i >= 0; i--) {
            tile = activePlayerObj.tiles[i];
            if (GridMath.hasNeighbor(gridList, tile.x, tile.y, 'isEnemy', activePlayerObj.color) == true) {
                this.tilesAdjacentEnemies.push({
                    'x': tile.x,
                    'y': tile.y
                })
            }
        }
        for (i = activePlayerObj.tiles.length - 1; i >= 0; i--) {
            tile = activePlayerObj.tiles[i];
            if (GridMath.hasNeighbor(gridList, tile.x, tile.y, 'isNeutral', activePlayerObj.color) == true) {
                this.tilesAdjacentNeutral.push({
                    'x': tile.x,
                    'y': tile.y
                })
            }
        }
    }
    if (this.tilesAdjacentEnemies.length > 0 && Math.random() < 0.5 || this.tilesAdjacentNeutral.length == 0) {
        tile = this.tilesAdjacentEnemies[Math.floor(Math.random() * this.tilesAdjacentEnemies.length)];
        playerHandler.mouseDownEvent(tile.x, tile.y)
    } else {
        tile = this.tilesAdjacentNeutral[Math.floor(Math.random() * this.tilesAdjacentNeutral.length)];
        playerHandler.mouseDownEvent(tile.x, tile.y)
    }
    this.run()
};
AIHandler.prototype.select = function() {
    // @TODO
}

AIHandler.prototype.move = function() {
    var playerHandler = this.main.playerHandler;
    var activePlayerObj = playerHandler.activePlayerObj;
    var gridList = this.main.gridHandler.list;
    var actionableNeutralTiles = [];
    var actionableEnemyTiles = [];
    var x,
        y;
    for (x = this.main.levelWidth - 1; x >= 0; x--) {
        for (y = this.main.levelHeight - 1; y >= 0; y--) {
            if (GridMath.isActionable(gridList, x, y, activePlayerObj, this.main.state)) {
                if (gridList[x][y].owner == 'neutral') {
                    actionableNeutralTiles.push({
                        'x': x,
                        'y': y
                    })
                } else if (gridList[x][y].owner != activePlayerObj.color) {
                    actionableEnemyTiles.push({
                        'x': x,
                        'y': y,
                        'power': gridList[x][y].power
                    })
                }
            }
        }
    }
    if (Math.random() < 0.75 || actionableEnemyTiles.length == 0) {
        if (actionableEnemyTiles.length > 0 && Math.random() < 0.35 || actionableNeutralTiles.length == 0) {
            actionableEnemyTiles.sort(function(a, b) {
                if (a.power < b.power) {
                    return -1
                } else if (a.power > b.power) {
                    return 1
                }
                return 0
            });
            if (Math.random() < 0.5) {
                tile = actionableEnemyTiles[0]
            } else {
                tile = actionableEnemyTiles[Math.floor(Math.random() * actionableEnemyTiles.length)]
            }
        } else {
            tile = actionableNeutralTiles[Math.floor(Math.random() * actionableNeutralTiles.length)]
        }
        playerHandler.mouseDownEvent(tile.x, tile.y)
    } else {
        if (this.tilesAdjacentEnemies.length > 0) {
            tile = this.tilesAdjacentEnemies[Math.floor(Math.random() * this.tilesAdjacentEnemies.length)]
        } else {
            tile = this.tilesAdjacentNeutral[Math.floor(Math.random() * this.tilesAdjacentNeutral.length)]
        }
        playerHandler.mouseDownEvent(tile.x, tile.y)
    }
    this.tilesAdjacentEnemies.length = 0;
    this.tilesAdjacentNeutral.length = 0
};
function ControlHandler(main) {
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseGridX = 0;
    this.mouseGridY = 0;
    this.mouseLastGridX = 0;
    this.mouseLastGridY = 0;
    this.main = main;
    main.canvas.addEventListener('mousedown', this.mouseDownEvent.bind(this));
    main.canvas.addEventListener('mousemove', this.mouseMoveEvent.bind(this));
    main.canvas.addEventListener('contextmenu', this.contextMenuEvent.bind(this))
}
ControlHandler.prototype.init = function(main) {};
ControlHandler.prototype.mouseDownEvent = function(e) {
    if (this.main.state == 'menuScreen') {
        var hW = this.main.canvas.width * 0.5;
        var hH = this.main.canvas.height * 0.5;
        if (this.mouseY > hH + 110 && this.mouseY < hH + 130) {
            if (this.mouseX > hW - 130 && this.mouseX < hW - 110) {
                this.main.startGame(0, e.button)
            } else if (this.mouseX > hW - 70 && this.mouseX < hW - 50) {
                this.main.startGame(1, e.button)
            } else if (this.mouseX > hW - 10 && this.mouseX < hW + 10) {
                this.main.startGame(2, e.button)
            } else if (this.mouseX > hW + 50 && this.mouseX < hW + 70) {
                this.main.startGame(3, e.button)
            } else if (this.mouseX > hW + 110 && this.mouseX < hW + 130) {
                this.main.startGame(4, e.button)
            }
        }
    } else if (this.main.state == 'win') {
        new MenuScreen(this.main)
    } else if (this.main.playerHandler.activePlayerObj.ai == false) {
        this.main.playerHandler.mouseDownEvent(this.mouseGridX, this.mouseGridY, e.button)
    }
};
ControlHandler.prototype.mouseMoveEvent = function(e) {
    var rect = this.main.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseGridY = Math.floor((this.mouseY - this.main.offsetY) / this.main.tileHeight);
    this.mouseGridX = Math.floor(((this.mouseGridY % 2 == 0 ? this.mouseX : this.mouseX - this.main.tileSize * 0.5) - this.main.offsetX) / this.main.tileSize);
    if (this.main.state == 'menuScreen') {
        return
    }
    if (this.mouseGridX != this.mouseLastGridX || this.mouseGridY != this.mouseLastGridY) {
        this.main.renderHandler.draw();
        this.mouseLastGridX = this.mouseGridX;
        this.mouseLastGridY = this.mouseGridY
    }
};
ControlHandler.prototype.contextMenuEvent = function(e) {
    e.preventDefault()
};
function GridHandler(main) {
    this.levels = ['01010111010-11111111111-01111101110-01010010111-11100001111-11110001010-11100001111-01111110110-11110111110-01111110111', '01010101010-11111011111-11110001111-11111111111-10101110101-10001110001-11111111111-11111011111-11110001111-11111111111', '00000001110-00011111110-01100101111-01111111111-11111010011-11111000111-11111101110-11101111111-00110011111-00001111110', '00011111000-01111111010-01101111110-11010111110-11001100101-11001100011-11111011111-01111111111-00111111000-00001010000', '00010110000-01111011110-10111101110-11110011100-01110001100-11011101110-10011111101-10011000111-11111101111-01101111100', '00010011110-01111111110-01111111110-11101111111-11001100011-01100111110-11111111100-11101011000-01110111000-00111110000', '00010001000-01111011110-11111011111-11111111111-00111011100-00110001100-01111111110-11111011111-11111011111-00111011100', '11111100000-11111111000-11110011010-11110011111-01111111111-00111110000-00011110000-01110110000-01110111000-11111111100', '00000000010-00000001111-00000111111-00011111100-01111011000-11110011000-00111111000-00001111110-00000011111-00000000111', '00000000000-00000001110-00000101111-00011111101-01111011011-11110001111-10011111100-11111110000-11110000000-00100000000'];
    this.list = [];
    this.levelInt = 0;
    this.level = this.levels[this.levelInt]
}
GridHandler.prototype.init = function(main) {
    this.list.length = 0;
    this.levelInt = Math.floor(Math.random() * this.levels.length);
    this.level = this.levels[this.levelInt];
    var columns = this.level.split('-');
    var x,
        y,
        rows;
    for (x = 0; x < columns.length; x++) {
        this.list[x] = [];
        rows = columns[x].split('');
        for (y = 0; y < rows.length; y++) {
            if (rows[y] == 0) {
                this.list[x][y] = {
                    'owner': 'empty',
                    'power': 0
                }
            } else {
                this.list[x][y] = {
                    'owner': 'neutral',
                    'power': 0
                }
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
            return true
        }
    }
    return false
};
GridMath.isActionable = function(gridList, x, y, player, state) {
    if (x in gridList && y in gridList[x] && gridList[x][y].owner != 'empty') {
        if (state == 'start') {
            if (gridList[x][y].owner == 'neutral') {
                return true
            }
        }
        if (state == 'reinforcements' || state == 'move') {
            if (gridList[x][y].owner == player.color) {
                return true
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
    return false
};
GridMath.hasNeighbor = function(gridList, x, y, flag, color) {
    var neighbors = y % 2 == 0 ? GridMath.neighbors.even : GridMath.neighbors.odd;
    for (var i = 0; i < neighbors.length; i++) {
        var X = x + neighbors[i][0];
        var Y = y + neighbors[i][1];
        if (X in gridList && Y in gridList[X] && gridList[X][Y].owner != 'empty') {
            if (flag == 'isEnemy') {
                if (gridList[X][Y].owner != 'neutral' && gridList[X][Y].owner != color) {
                    return true
                }
            } else if (flag == 'isNeutral') {
                if (gridList[X][Y].owner == 'neutral') {
                    return true
                }
            } else if (flag == 'notMe') {
                if (gridList[X][Y].owner != color) {
                    return true
                }
            }
        }
    }
    return false
};
function Main() {
    this.levelWidth = 10;
    this.levelHeight = Math.round(this.levelWidth * 1.1);
    this.state = 'loading';
    this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');
    this.tileSize = this.canvas.width / (this.levelWidth + 0.5);
    this.tileHeight = this.tileSize * 0.75;
    this.offsetX = (this.canvas.width - this.levelWidth * this.tileSize - this.tileSize * 0.5) * 0.5;
    this.offsetY = this.tileSize * 0.125;
    this.playerHandler = new PlayerHandler(this);
    this.controlHandler = new ControlHandler(this);
    this.renderHandler = new RenderHandler(this);
    this.gridHandler = new GridHandler(this);
    this.aiHandler = new AIHandler(this);
    new MenuScreen(this)
}
Main.prototype.startGame = function(players, button) {
    this.startButton = button;
    this.playerHandler.init(this, players);
    this.controlHandler.init(this);
    this.renderHandler.init(this);
    this.gridHandler.init(this);
    this.aiHandler.init(this);
    this.state = 'start';
    this.playerHandler.nextTurn();
    this.renderHandler.draw()
};
function MenuScreen(main) {
    var context = main.context;
    var hW = main.canvas.width * 0.5;
    var hH = main.canvas.height * 0.5;
    main.state = 'menuScreen';
    context.clearRect(0, 0, main.canvas.width, main.canvas.height);
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#888888';
    context.font = 'bold 25px/1 Verdana';
    context.fillText('HEXone', hW, hH - 105);
    context.font = 'normal 14px/1 Verdana';
    context.fillText('Game is similar to Risk. Take over neutral and enemy tiles', hW, hH - 60);
    context.fillText('to increase your power. When taking a neutral tile, it\'s', hW, hH - 40);
    context.fillText('starting power is equal to half of the friendly tiles', hW, hH - 20);
    context.fillText('adjacent to it. When attacking, you take into battle', hW, hH);
    context.fillText('half the power of any friendly adjacent tiles.', hW, hH + 20);
    context.font = 'normal 15px/1 "Segoe UI",Arial';
    context.fillText('Click number of human players to start.', hW, hH + 60);
    context.fillText('AI will control remaining players.', hW, hH + 80);
    context.font = 'normal 17px/1 "Segoe UI",Arial';
    context.fillText('0', hW - 120, hH + 120);
    context.fillText('1', hW - 60, hH + 120);
    context.fillText('2', hW, hH + 120);
    context.fillText('3', hW + 60, hH + 120);
    context.fillText('4', hW + 120, hH + 120)
}
function PlayerHandler(main) {}
PlayerHandler.prototype.init = function(main, players) {
    this.main = main;
    this.gridList = main.gridHandler.list;
    this.colorToInt = {
        'red': 0,
        'green': 1,
        'purple': 2,
        'blue': 3
    };
    this.players = [{
        'color': 'red',
        'tiles': [],
        'lost': false,
        'ai': players > 0 ? false : true
    }, {
        'color': 'green',
        'tiles': [],
        'lost': false,
        'ai': players > 1 ? false : true
    }, {
        'color': 'purple',
        'tiles': [],
        'lost': false,
        'ai': players > 2 ? false : true
    }, {
        'color': 'blue',
        'tiles': [],
        'lost': false,
        'ai': players > 3 ? false : true
    }];
    this.activePlayer = Math.floor(Math.random() * this.players.length);
    this.activePlayerObj = this.players[this.activePlayer];
    this.reinforcements = 0
};
PlayerHandler.prototype.mouseDownEvent = function(x, y, button) {
    if (GridMath.isActionable(this.gridList, x, y, this.activePlayerObj, this.main.state) == false) {
        return false
    }
    if (this.main.state == 'start') {
        this.gridList[x][y].owner = this.activePlayerObj.color;
        this.gridList[x][y].power = 3;
        this.activePlayerObj.tiles.push({
            'x': x,
            'y': y
        });
        this.nextTurn()
    } else if (this.main.state == 'reinforcements') {
        if (button == 2) {
            this.gridList[x][y].power += this.reinforcements;
            this.reinforcements = 0
        } else {
            this.gridList[x][y].power++;
            this.reinforcements--
        }
        if (this.reinforcements <= 0) {
            this.main.state = 'move'
        }
    } else if (this.main.state == 'move') {
        if (this.gridList[x][y].owner == this.activePlayerObj.color) {
            this.gridList[x][y].power += 2;
            this.nextTurn()
        } else if (this.gridList[x][y].owner == 'neutral') {
            this.gridList[x][y].owner = this.activePlayerObj.color;
            for (var i = this.activePlayerObj.tiles.length - 1; i >= 0; i--) {
                var tile = this.activePlayerObj.tiles[i];
                if (GridMath.isNeighbor(x, y, tile.x, tile.y)) {
                    this.gridList[x][y].power += this.gridList[tile.x][tile.y].power
                }
            }
            this.gridList[x][y].power = Math.max(Math.floor(this.gridList[x][y].power * 0.5), 1);
            this.activePlayerObj.tiles.push({
                'x': x,
                'y': y
            });
            this.nextTurn()
        } else if (this.gridList[x][y].owner != this.activePlayerObj.color) {
            var attackPower = 0;
            for (var i = this.activePlayerObj.tiles.length - 1; i >= 0; i--) {
                var tile = this.activePlayerObj.tiles[i];
                if (GridMath.isNeighbor(x, y, tile.x, tile.y)) {
                    attackPower += Math.floor(this.gridList[tile.x][tile.y].power * 0.5);
                    this.gridList[tile.x][tile.y].power = Math.ceil(this.gridList[tile.x][tile.y].power * 0.5)
                }
            }
            var defensePower = this.gridList[x][y].power;
            var attackDiceCount;
            var defenseDiceCount;
            var attackRolls = [];
            var defenseRolls = [];
            while (attackPower > 0 && defensePower > 0) {
                attackDiceCount = Math.min(attackPower, 3);
                defenseDiceCount = Math.min(defensePower, 2);
                attackRolls.length = 0;
                defenseRolls.length = 0;
                for (i = 0; i < attackDiceCount; i++) {
                    attackRolls.push(Math.ceil(Math.random() * 6))
                }
                for (i = 0; i < defenseDiceCount; i++) {
                    defenseRolls.push(Math.ceil(Math.random() * 6))
                }
                attackRolls.sort();
                attackRolls.reverse();
                defenseRolls.sort();
                defenseRolls.reverse();
                for (i = 0; i < Math.min(attackRolls.length, defenseRolls.length); i++) {
                    if (attackRolls[i] > defenseRolls[i]) {
                        defensePower--
                    } else {
                        attackPower--
                    }
                }
            }
            if (defensePower <= 0) {
                var opponent = this.players[this.colorToInt[this.gridList[x][y].owner]];
                for (i = 0; i < opponent.tiles.length; i++) {
                    if (x == opponent.tiles[i].x && y == opponent.tiles[i].y) {
                        opponent.tiles.splice(i, 1);
                        break
                    }
                }
                this.gridList[x][y].owner = this.activePlayerObj.color;
                this.gridList[x][y].power = attackPower;
                this.activePlayerObj.tiles.push({
                    'x': x,
                    'y': y
                });
                if (opponent.tiles.length <= 0) {
                    opponent.lost = true;
                    var won = true;
                    for (i = 0; i < this.players.length; i++) {
                        if (this.players[i].lost == false && i != this.activePlayer) {
                            won = false
                        }
                    }
                    if (won == true) {
                        this.main.state = 'win';
                        this.main.renderHandler.draw();
                        return
                    }
                }
            } else {
                this.gridList[x][y].power = defensePower
            }
            this.nextTurn()
        }
    }
    this.main.renderHandler.draw()
};
PlayerHandler.prototype.nextTurn = function() {
    while (1) {
        this.activePlayer = this.activePlayer >= this.players.length - 1 ? 0 : this.activePlayer + 1;
        this.activePlayerObj = this.players[this.activePlayer];
        if (this.activePlayerObj.lost == false) {
            break
        }
    }
    if (this.main.state == 'start' && this.activePlayerObj.tiles.length > 0 || this.main.state == 'move' || this.main.state == 'battleResults') {
        this.main.state = 'reinforcements'
    }
    if (this.main.state == 'reinforcements') {
        this.reinforcements = Math.max(Math.floor(this.activePlayerObj.tiles.length / 3), 2)
    }
    if (this.activePlayerObj.ai == true) {
        this.main.aiHandler.run()
    }
};
function RenderHandler(main) {
    this.playerColors = {
        'red': {
            'tile': 'rgba(150,50,50,0.7)',
            'text': '#DD2222',
            'hover': 'rgba(255,126,126,0.5)'
        },
        'green': {
            'tile': 'rgba(50,150,50,0.7)',
            'text': '#22AA22',
            'hover': 'rgba(126,255,126,0.5)'
        },
        'purple': {
            'tile': 'rgba(150,50,150,0.7)',
            'text': '#DD22DD',
            'hover': 'rgba(255,126,255,0.5)'
        },
        'blue': {
            'tile': 'rgba(60,60,170,0.7)',
            'text': '#5555FF',
            'hover': 'rgba(126,126,255,0.5)'
        },
        'neutral': {
            'tile': 'rgba(127,127,127,0.6)'
        }
    };
    this.canvas = main.canvas;
    this.context = main.context;
    this.tileSize = main.tileSize;
    this.tileHeight = main.tileHeight;
    this.levelWidth = main.levelWidth;
    this.levelHeight = main.levelHeight;
    this.offsetX = main.offsetX;
    this.offsetY = main.offsetY
}
RenderHandler.prototype.init = function(main) {
    this.main = main;
    this.playerHandler = main.playerHandler;
    this.controlHandler = main.controlHandler;
    this.gridHandler = main.gridHandler
};
RenderHandler.prototype.draw = function() {
    var activeColor = this.playerHandler.activePlayerObj.color;
    var context = this.context;
    var x,
        y,
        tile,
        X,
        Y;
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.lineWidth = 3;
    context.strokeStyle = this.playerColors[this.playerHandler.activePlayerObj.color].hover;
    context.font = 'bold 14px/1 "Segoe UI","Arial Black",Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    for (x = 0; x < this.levelWidth; x++) {
        for (y = 0; y < this.levelHeight; y++) {
            tile = this.gridHandler.list[x][y];
            if (tile.owner == 'empty') {
                continue
            }
            Y = y * this.tileHeight + this.tileHeight * 0.5 + this.offsetY;
            X = (y % 2 == 0 ? 0 : this.tileSize * 0.5) + x * this.tileSize + this.tileSize * 0.5 + this.offsetX;
            context.fillStyle = this.playerColors[tile.owner].tile;
            this.lineToHexagon(context, X, Y, this.tileSize - 2);
            context.fill();
            if (GridMath.isActionable(this.gridHandler.list, x, y, this.playerHandler.activePlayerObj, this.main.state)) {
                if (this.playerHandler.activePlayerObj.ai == false) {
                    if (this.main.state != 'start') {
                        context.stroke()
                    }
                    if (this.controlHandler.mouseGridX == x && this.controlHandler.mouseGridY == y) {
                        context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].hover;
                        context.fill()
                    }
                }
            }
            if (tile.owner != 'neutral') {
                context.fillStyle = 'rgba(255,255,255,0.6)';
                context.fillText(tile.power, X, Y)
            }
        }
    }
    if (this.main.state == 'win') {
        context.fillStyle = 'rgba(0,0,0,0.7)';
        context.fillRect(0, this.canvas.height * 0.5 - 25, this.canvas.width, 50);
        context.font = 'bold 18px/1 "Segoe UI","Arial Black",Arial';
        context.fillStyle = this.playerColors[activeColor].text;
        context.fillText('Player ' + activeColor + ' wins! Click to play again.', this.canvas.width * 0.5, this.canvas.height * 0.5)
    } else if (this.playerHandler.activePlayerObj.ai == true) {
        context.font = 'bold 16px/1 "Segoe UI","Arial Black",Arial';
        context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].text;
        context.fillText('Player ' + activeColor.toUpperCase() + ' AI move.', this.canvas.width * 0.5, this.canvas.height - 35)
    } else {
        var text1 = {
            'start': 'Player ' + activeColor.toUpperCase() + ' claim your starting tile.',
            'reinforcements': 'Player ' + activeColor.toUpperCase() + ' place reinforcements. ' + this.playerHandler.reinforcements + ' left.',
            'move': 'Player ' + activeColor.toUpperCase() + ' make your move.'
        };
        var text2 = {
            'start': 'Any neutral(gray) starting tile can be claimed as your starting tile.',
            'reinforcements': 'Reinforcements can be placed on any tile you own.',
            'move': 'Claim a neutral tile,attack an opponent,or reinforce a tile you own.'
        };
        context.font = 'bold 16px/1 "Segoe UI","Arial Black",Arial';
        context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].text;
        context.fillText(text1[this.main.state], this.canvas.width * 0.5, this.canvas.height - 35);
        context.font = 'normal 16px/1 "Segoe UI",Arial';
        context.fillStyle = '#888888';
        context.fillText(text2[this.main.state], this.canvas.width * 0.5, this.canvas.height - 15)
    }
};
RenderHandler.prototype.lineToHexagon = function(context, x, y, size) {
    context.beginPath();
    context.moveTo(x - size * 0.5, y + size * 0.25);
    context.lineTo(x - size * 0.5, y - size * 0.25);
    context.lineTo(x, y - size * 0.5);
    context.lineTo(x + size * 0.5, y - size * 0.25);
    context.lineTo(x + size * 0.5, y + size * 0.25);
    context.lineTo(x, y + size * 0.5);
    context.closePath()
};
