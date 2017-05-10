function RenderHandler(main) {
	this.playerColors = {
		'crimson': {
			'tile': 'rgba(128, 21, 21, 0.7)',
			'text': '#801515',
			'hover': 'rgba(85, 0, 0, 0.5)'
		},
		'forest': {
			'tile': 'rgba(12, 112, 12, 0.7)',
			'text': '#0C700C',
			'hover': 'rgba(0, 77, 0, 0.5)'
		},
		'royal': {
			'tile': 'rgba(79, 27, 133, 0.7)',
			'text': '#4F1B85',
			'hover': 'rgba(59, 13, 106, 0.5)'
		},
		'steel': {
			'tile': 'rgba(43, 107, 160, 0.7)',
			'text': '#2B6BA0',
			'hover': 'rgba(18, 84, 138, 0.5)'
		},
		'neutral': {
			'tile': 'rgba(211, 211, 211, 0.6)'
		}
	};
	this.canvas = main.canvas;
	this.context = main.context;
	this.tileSize = main.tileSize;
	this.tileHeight = main.tileHeight;
	this.levelWidth = main.levelWidth;
	this.levelHeight = main.levelHeight;
	this.offsetX = main.offsetX;
	this.offsetY = main.offsetY;
}
RenderHandler.prototype.init = function(main) {
	this.main = main;
	this.playerHandler = main.playerHandler;
	this.controlHandler = main.controlHandler;
	this.gridHandler = main.gridHandler;
};
RenderHandler.prototype.draw = function() {
	var activeColor = this.playerHandler.activePlayerObj.color;
	var context = this.context;
	var x, y, tile, X, Y;
	context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	context.lineWidth = 3;
	context.strokeStyle = this.playerColors[this.playerHandler.activePlayerObj.color].hover;
	context.font = '18px helvetica-bold';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	for (x = 0; x < this.levelWidth; x++) {
		for (y = 0; y < this.levelHeight; y++) {
			tile = this.gridHandler.list[x][y];
			if (tile.owner == 'empty') {
				continue;
			}
			Y = y * this.tileHeight + this.tileHeight * 0.5 + this.offsetY;
			X = (y % 2 == 0 ? 0 : this.tileSize * 0.5) + x * this.tileSize + this.tileSize * 0.5 + this.offsetX;
			context.fillStyle = this.playerColors[tile.owner].tile;
			this.lineToHexagon(context, X, Y, this.tileSize - 2);
			context.fill();
			if (this.main.state == 'main') {	
				if (GridMath.moveActionable(this.gridHandler.list, x, y, lastX, lastY, this.playerHandler.activePlayerObj, this.main.state)) { //@TODO
					if (this.playerHandler.activePlayerObj.ai == false) {
						if (this.main.state != 'start') {
							context.stroke();
						}
						if (this.controlHandler.mouseGridX == x && this.controlHandler.mouseGridY == y ) {
							context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].hover;
							context.fill();
						}
					}
				}
			} else if (GridMath.isActionable(this.gridHandler.list, x, y, this.playerHandler.activePlayerObj, this.main.state)) { //@TODO
				if (this.playerHandler.activePlayerObj.ai == false) {
					if (this.main.state != 'start') {
						context.stroke();
					}
					if (this.controlHandler.mouseGridX == x && this.controlHandler.mouseGridY == y ) {
						context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].hover;
						context.fill();
					}
				}
			}
			if (tile.owner != 'neutral') {
				context.fillStyle = 'rgba(255,255,255,1)';
				context.fillText(tile.power, X, Y);
			}
		}
	}
	if (this.main.state == 'win') {
		context.fillStyle = 'rgba(0,0,0,0.7)';
		context.fillRect(0, this.canvas.height * 0.5 - 25, this.canvas.width, 50);
		context.font = '32px helvetica-bold';
		context.fillStyle = this.playerColors[activeColor].text;
		context.fillText('Player ' + activeColor + ' wins! Click to play again.', this.canvas.width * 0.5, this.canvas.height * 0.5);
	} else if (this.playerHandler.activePlayerObj.ai == true) {
		context.font = '18px helvetica-light';
		context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].text;
		context.fillText('Player ' + activeColor.toUpperCase() + ' AI move.', this.canvas.width * 0.5, this.canvas.height - 35);
	} else {
		var text1 = {
			'start': 'Player ' + activeColor.toUpperCase() + ' claim your starting tile.',
			'reinforcements': 'Player ' + activeColor.toUpperCase() + ' place reinforcements. ' + this.playerHandler.reinforcements + ' left.',
			'select': activeColor.toUpperCase() + ' select a territory from which to operate',
			'move': 'Player ' + activeColor.toUpperCase() + ' make your move.'
		};
		var text2 = {
			'start': 'Any neutral(gray) starting tile can be claimed as your starting tile.',
			'reinforcements': 'Reinforcements can be placed on any tile you own.',
			'select': 'You may select any tile where your troops are stationed to begin',
			'move': 'Claim a neutral tile,attack an opponent,or reinforce a tile you own.'
		};
		context.font = '18px helvetica-bold';
		context.fillStyle = this.playerColors[this.playerHandler.activePlayerObj.color].text;
		context.fillText(text1[this.main.state], this.canvas.width * 0.5, this.canvas.height - 30);
		context.font = '16px helvetica-light';
		context.fillStyle = '#888888';
		context.fillText(text2[this.main.state], this.canvas.width * 0.5, this.canvas.height - 10);
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
	context.closePath();
};
