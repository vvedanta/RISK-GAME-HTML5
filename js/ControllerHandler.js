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
    main.canvas.addEventListener('contextmenu', this.contextMenuEvent.bind(this));
}
ControlHandler.prototype.init = function(main) {};
ControlHandler.prototype.mouseDownEvent = function(e) {
    if (this.main.state == 'menuScreen') {
        var hW = this.main.canvas.width * 0.5;
        var hH = this.main.canvas.height * 0.5;
        if (this.mouseY > hH + 50 && this.mouseY < hH + 70) {
            if (this.mouseX > hW - 130 && this.mouseX < hW - 110) {
                this.main.startGame(0, e.button);
            } else if (this.mouseX > hW - 40 && this.mouseX < hW - 20) {
                this.main.startGame(1, e.button);
            } else if (this.mouseX > hW + 35 && this.mouseX < hW + 55) {
                this.main.startGame(2, e.button);
            } else if (this.mouseX > hW + 105 && this.mouseX < hW + 125) {
                this.main.startGame(3, e.button);
            }
        }
    } else if (this.main.state == 'win') {
        new MenuScreen(this.main);
    } else if (this.main.playerHandler.activePlayerObj.ai == false) {
        this.main.playerHandler.mouseDownEvent(this.mouseGridX, this.mouseGridY, e.button);
    }
};
ControlHandler.prototype.mouseMoveEvent = function(e) {
    var rect = this.main.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    this.mouseGridY = Math.floor((this.mouseY - this.main.offsetY) / this.main.tileHeight);
    this.mouseGridX = Math.floor(((this.mouseGridY % 2 == 0 ? this.mouseX : this.mouseX - this.main.tileSize * 0.5) - this.main.offsetX) / this.main.tileSize);
    if (this.main.state == 'menuScreen') {
        return;
    }
    if (this.mouseGridX != this.mouseLastGridX || this.mouseGridY != this.mouseLastGridY) {
        this.main.renderHandler.draw();
        this.mouseLastGridX = this.mouseGridX;
        this.mouseLastGridY = this.mouseGridY;
    }
};
ControlHandler.prototype.contextMenuEvent = function(e) {
    e.preventDefault();
};
