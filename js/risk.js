window.onload = function() {
    new Risk()
};

function Risk() {
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
Risk.prototype.startGame = function(player, button) {
    this.startButton = button;
    this.playerHandler.init(this, player);
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
    context.font = '32px helvetica-bold';
    context.fillText('RISK - A V&L Game', hW, hH - 105);
    context.font = '18px helvetica-light';
    context.fillText('Choose Army Color', hW, hH - 20);
    context.fillText('AI will control remaining players.', hW, hH+12);
    context.font = '18px helvetica-bold';
    // Changes here require changing mouse click at ControllerHandler:14
    context.fillStyle = '#801515';
    context.fillText('crimson', hW - 120, hH + 60);
    context.fillStyle = '#0C700C';
    context.fillText('forest', hW - 30, hH + 60);
    context.fillStyle = '#4F1B85';
    context.fillText('royal', hW + 45, hH + 60);
    context.fillStyle = '#2B6BA0';
    context.fillText('steel', hW + 115, hH + 60);

}
