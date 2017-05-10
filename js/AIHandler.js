function AIHandler(main) {}
AIHandler.prototype.init = function(main) {
    this.tilesAdjacentEnemies = [];
    this.tilesAdjacentNeutral = [];
    this.reinforceDelay = main.startButton == 0 ? 50 : 1;
    this.selectDelay = main.startButton == 0 ? 50 : 1;
    this.moveDelay = main.startButton == 0 ? 250 : 1;
    this.main = main;
};
AIHandler.prototype.run = function() {
    if (this.main.state == 'start') {
        setTimeout(this.start.bind(this), this.moveDelay);
    } else if (this.main.state == 'reinforcements') {
        setTimeout(this.reinforcements.bind(this), this.reinforceDelay);
    } else if (this.main.state == 'select') {
        setTimeout(this.select.bind(this), this.selectDelay);
    } else if (this.main.state == 'move') {
        setTimeout(this.move.bind(this), this.moveDelay);
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
                break;
            }
        }
    }
    //console.log(x, y)
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
                });
            }
        }
        for (i = activePlayerObj.tiles.length - 1; i >= 0; i--) {
            tile = activePlayerObj.tiles[i];
            if (GridMath.hasNeighbor(gridList, tile.x, tile.y, 'isNeutral', activePlayerObj.color) == true) {
                this.tilesAdjacentNeutral.push({
                    'x': tile.x,
                    'y': tile.y
                });
            }
        }
    }
    if (this.tilesAdjacentEnemies.length > 0 && Math.random() < 0.5 || this.tilesAdjacentNeutral.length == 0) {
        tile = this.tilesAdjacentEnemies[Math.floor(Math.random() * this.tilesAdjacentEnemies.length)];
        playerHandler.mouseDownEvent(tile.x, tile.y);
    } else {
        tile = this.tilesAdjacentNeutral[Math.floor(Math.random() * this.tilesAdjacentNeutral.length)];
        playerHandler.mouseDownEvent(tile.x, tile.y);
    }
    this.run();
};
AIHandler.prototype.select = function() {
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
                });
            }
        }
        for (i = activePlayerObj.tiles.length - 1; i >= 0; i--) {
            tile = activePlayerObj.tiles[i];
            if (GridMath.hasNeighbor(gridList, tile.x, tile.y, 'isNeutral', activePlayerObj.color) == true) {
                this.tilesAdjacentNeutral.push({
                    'x': tile.x,
                    'y': tile.y
                });
            }
        }
    }
    if (this.tilesAdjacentEnemies.length > 0 && Math.random() < 0.5 || this.tilesAdjacentNeutral.length == 0) {
        tile = this.tilesAdjacentEnemies[Math.floor(Math.random() * this.tilesAdjacentEnemies.length)];
        lastX = tile.x;
        lastY = tile.y;
        playerHandler.mouseDownEvent(tile.x, tile.y);
    } else {
        tile = this.tilesAdjacentNeutral[Math.floor(Math.random() * this.tilesAdjacentNeutral.length)];
        lastX = tile.x;
        lastY = tile.y;
        playerHandler.mouseDownEvent(tile.x, tile.y);
    }
    this.run();
};
AIHandler.prototype.move = function() {
    var playerHandler = this.main.playerHandler;
    var activePlayerObj = playerHandler.activePlayerObj;
    var gridList = this.main.gridHandler.list;
    var actionableNeutralTiles = [];
    var actionableEnemyTiles = [];
    var x, y;
    for (x = this.main.levelWidth - 1; x >= 0; x--) {
        for (y = this.main.levelHeight - 1; y >= 0; y--) {
            if (GridMath.moveActionable(gridList, x, y, lastX, lastY, activePlayerObj, this.main.state)) {
                if (gridList[x][y].owner == 'neutral') {
                    actionableNeutralTiles.push({
                        'x': x,
                        'y': y
                    });
                } else if (gridList[x][y].owner != activePlayerObj.color) {
                    actionableEnemyTiles.push({
                        'x': x,
                        'y': y,
                        'power': gridList[x][y].power
                    });
                }
            }
        }
    }
    if (Math.random() < 0.75 || actionableEnemyTiles.length == 0) {
        if (actionableEnemyTiles.length > 0 && Math.random() < 0.35 || actionableNeutralTiles.length == 0) {
            actionableEnemyTiles.sort(function(a, b) {
                if (a.power < b.power) {
                    return -1;
                } else if (a.power > b.power) {
                    return 1;
                }
                return 0;
            });
            if (Math.random() < 0.5) {
                tile = actionableEnemyTiles[0];
            } else {
                tile = actionableEnemyTiles[Math.floor(Math.random() * actionableEnemyTiles.length)];
            }
        } else {
            tile = actionableNeutralTiles[Math.floor(Math.random() * actionableNeutralTiles.length)];
        }
        playerHandler.mouseDownEvent(tile.x, tile.y);
    } else {
        if (this.tilesAdjacentEnemies.length > 0) {
            tile = this.tilesAdjacentEnemies[Math.floor(Math.random() * this.tilesAdjacentEnemies.length)];
        } else {
            tile = this.tilesAdjacentNeutral[Math.floor(Math.random() * this.tilesAdjacentNeutral.length)];
        }
        playerHandler.mouseDownEvent(tile.x, tile.y);
    }
    this.tilesAdjacentEnemies.length = 0;
    this.tilesAdjacentNeutral.length = 0;
};
