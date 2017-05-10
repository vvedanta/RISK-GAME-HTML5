function PlayerHandler(main) {}
PlayerHandler.prototype.init = function(main, player) {
    this.main = main;
    this.gridList = main.gridHandler.list;
    this.colorToInt = {
        'crimson': 0,
        'forest': 1,
        'royal': 2,
        'steel': 3
    };
    this.players = [{
        'color': 'crimson',
        'id': 0,
        'tiles': [],
        'lost': false,
        'ai': player == 0 ? false : true
    }, {
        'color': 'forest',
        'id': 1,
        'tiles': [],
        'lost': false,
        'ai': player == 1 ? false : true
    }, {
        'color': 'royal',
        'id': 2,
        'tiles': [],
        'lost': false,
        'ai': player == 2 ? false : true
    }, {
        'color': 'steel',
        'id': 3,
        'tiles': [],
        'lost': false,
        'ai': player == 3 ? false : true
    }];
    this.activePlayer = Math.floor(Math.random() * this.players.length);
    this.activePlayerObj = this.players[this.activePlayer];
    this.reinforcements = 0;
};
PlayerHandler.prototype.mouseDownEvent = function(x, y, button) {
	if (this.main.state == 'move') {
		console.log("checking if legal move");
		if (GridMath.moveActionable(this.gridList, x, y, lastX, lastY, this.activePlayerObj, this.main.state) == false) {
			console.log("move is not permissable");
			if (this.activePlayerObj.ai == true) {
				this.main.state = 'select'
				console.log("cancelling move");
        		this.main.aiHandler.run();
			}
			return false;
		}
	} else if (GridMath.isActionable(this.gridList, x, y, this.activePlayerObj, this.main.state) == false) {
		return false;
	}
	// if (GridMath.isActionable(this.gridList, x, y, this.activePlayerObj, this.main.state) == false) {
	// 	return false;
	// }
	if (this.main.state == 'start') {
		this.gridList[x][y].owner = this.activePlayerObj.color;
		this.gridList[x][y].power = 5;
		this.activePlayerObj.tiles.push({
			'x': x,
			'y': y
		});
		this.nextTurn();
	} else if (this.main.state == 'reinforcements') {
			if (button == 2) { // right click
				var selected = prompt("How Many Units Shall We Deploy? (Between 1-" + this.reinforcements + ")", this.reinforcements);
				if (isInteger(parseInt(selected)) && parseInt(selected) > 0 && parseInt(selected) < this.reinforcements + 1) {
					this.gridList[x][y].power += parseInt(selected);
					this.reinforcements -= parseInt(selected);
				} else {
					console.log("NO UNITS FOR YOU!");
				}
				
			} else { // left click
				this.gridList[x][y].power++;
				this.reinforcements--;
			}
			if (this.reinforcements <= 0) {
				this.main.state = 'select';
			}
		} else if (this.main.state == 'select') {
			if (this.gridList[x][y].owner == this.activePlayerObj.color) {
				// highlight and allow movement of troops to another square
				maxUnits = this.gridList[x][y].power; // set to number of units chosen @TODO
				lastX = x;
				lastY = y;
				this.main.state = 'move';
			}
		} else if (this.main.state == 'move') {
			if (x == lastX && y == lastY || this.gridList[x][y].owner == 'empty') {
				this.main.state = 'select'
				console.log("cancelling move");
				if (this.activePlayerObj.ai == true) {
        			this.main.aiHandler.run();
   				}
			} else if (this.gridList[x][y].owner == this.activePlayerObj.color && GridMath.isNeighbor(x, y, lastX, lastY)) {
				if (this.activePlayerObj.ai == false) {	
					var selected = prompt("How Many Units Shall We Transfer? (Between 1-" + maxUnits + ")", maxUnits);
					if (isInteger(parseInt(selected)) && parseInt(selected) > 0 && parseInt(selected) < maxUnits + 1) {
						selectedUnits = parseInt(selected);
					} else {
						console.log("ENTER A REAL NUMBER OF UNITS! THIS IS A WAR!");
						this.main.state = 'select'
					}
				} else {
					selectedUnits = Math.ceil(Math.random() * maxUnits);
				}
				this.gridList[lastX][lastY].power -= selectedUnits;
				this.gridList[x][y].power += selectedUnits;
				console.log(this.activePlayerObj.color + " transferring troops");
				this.nextTurn();
				
			} else if (this.gridList[x][y].owner == 'neutral') {
				if (this.activePlayerObj.ai == false) {	
					var selected = prompt("How Many Units Shall We Engage? (Between 1-" + maxUnits + ")", maxUnits);
					if (isInteger(parseInt(selected)) && parseInt(selected) > 0 && parseInt(selected) < maxUnits + 1) {
						selectedUnits = parseInt(selected);
					} else {
						console.log("ENTER A REAL NUMBER OF UNITS! THIS IS A WAR!");
						this.main.state = 'select'
					}
				} else {
					selectedUnits = Math.ceil(Math.random() * maxUnits);
				}
				this.gridList[x][y].owner = this.activePlayerObj.color;
				this.gridList[lastX][lastY].power -= selectedUnits;
				this.gridList[x][y].power += selectedUnits;
				this.activePlayerObj.tiles.push({
					'x': x,
					'y': y
				});
				console.log(this.activePlayerObj.color + " occupying neutral territory");
				this.nextTurn();

			} else if (this.gridList[x][y].owner != this.activePlayerObj.color) {
				console.log(this.activePlayerObj.color + " attacking " + this.gridList[x][y].owner);
				if (this.activePlayerObj.ai == false) {	
					var selected = prompt("How Many Units Shall We Engage? (Between 2-" + maxUnits + ")", maxUnits);
					if (isInteger(parseInt(selected)) && parseInt(selected) > 1 && parseInt(selected) < maxUnits + 1) {
						selectedUnits = parseInt(selected);
					} else {
						console.log("ENTER A REAL NUMBER OF UNITS! THIS IS A WAR!");
						this.main.state = 'select'
					}
				} else {
					selectedUnits = Math.ceil(Math.random() * (maxUnits - 1) + 1);
				}
				var offensiveUnits = selectedUnits;
				var defensiveUnits = this.gridList[x][y].power;
				var offensiveDice = selectedUnits - 1;
				var defensiveDice = defensiveUnits;
				var offensiveRolls = [];
				var defensiveRolls = [];
				if (offensiveUnits > 0 && defensiveUnits > 0) {
					offensiveRolls.length = 0;
					defensiveRolls.length = 0;
					for (i = 0; i < offensiveDice; i++) {
						offensiveRolls.push(Math.ceil(Math.random() * 6));
					}
					for (i = 0; i < defensiveDice; i++) {
						defensiveRolls.push(Math.ceil(Math.random() * 6));
					}
					offensiveRolls.sort();
					offensiveRolls.reverse();
					defensiveRolls.sort();
					defensiveRolls.reverse();
					for (i = 0; i < Math.min(offensiveRolls.length, defensiveRolls.length); i++) {
						if (offensiveRolls[i] > defensiveRolls[i]) {
							defensiveUnits--;
						} else {
							offensiveUnits--;
						}
					}
				}
				if (defensiveUnits <= 0) {
					var enemy = this.players[this.colorToInt[this.gridList[x][y].owner]];
					for (i = 0; i < enemy.tiles.length; i++) {
						if (x == enemy.tiles[i].x && y == enemy.tiles[i].y) {
							enemy.tiles.splice(i, 1);
							break;
						}
					}
					this.gridList[x][y].owner = this.activePlayerObj.color;
					this.gridList[x][y].power = offensiveUnits;
					this.gridList[lastX][lastY].power -= selectedUnits;
					this.activePlayerObj.tiles.push({
						'x': x,
						'y': y
					});
					if (enemy.tiles.length <= 0) {
						enemy.lost = true;
						var won = true;
						for (var i = 0; i < this.players.length; i++) {
							if (this.players[i].lost == false && i != this.activePlayer) {
								won = false;
							}
						}
						if (won == true) {
							this.main.state = 'win';
							this.main.renderHandler.draw();
							return;
						}
					}
				} else {
					this.gridList[lastX][lastY].power = offensiveUnits;
					this.gridList[x][y].power = defensiveUnits;
				}
				console.log(this.activePlayerObj.color + " finished attacking " + this.gridList[x][y].owner);
				this.nextTurn();
			} else {
				console.log("Please select a square adjacent to the selected square");
				this.main.state = 'select';
				if (this.activePlayerObj.ai == true) {
        			this.main.aiHandler.run();
   				}
			}
		} else {
			console.log("should not have made it this far (line 164)");
		}
		this.main.renderHandler.draw();
	};

PlayerHandler.prototype.nextTurn = function() {
    while (1) {
        this.activePlayer = this.activePlayer >= this.players.length - 1 ? 0 : this.activePlayer + 1;
        this.activePlayerObj = this.players[this.activePlayer];
        if (this.activePlayerObj.lost == false) {
            break;
        }
    }
    if (this.main.state == 'start' && this.activePlayerObj.tiles.length > 0 || this.main.state == 'move' || this.main.state == 'battleResults') {
        this.main.state = 'reinforcements';
    }
    if (this.main.state == 'reinforcements') {
        this.reinforcements = Math.max(Math.floor(this.activePlayerObj.tiles.length / 2), 2);
    }
    if (this.activePlayerObj.ai == true) {
        this.main.aiHandler.run();
    }
};

function isInteger(x) {
    return x % 1 === 0;
}
