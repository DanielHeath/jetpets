var userInterface   = require('../user-interface');

function GraphicsEngine(world, gameView, debugView) {
  this.renderer     = PIXI.autoDetectRenderer(gameView.width, gameView.height, gameView);
  this.stage        = new PIXI.Stage();
  this.view         = this.renderer.view;
  this.debugView    = debugView;
  
  var ratio = world.width / world.height;
  var width = Math.floor(gameView.height * ratio);
  
  gameView.width  = width;
  debugView.width  = width;
  userInterface.resize(width, gameView.height);
  this.renderer.resize(width, gameView.height);
}

GraphicsEngine.prototype.render = function() {
  this.renderer.render(this.stage);
};

GraphicsEngine.prototype.add = function(sprite) {
  this.stage.addChild(sprite);
};

GraphicsEngine.prototype.remove = function(sprite) {
  this.stage.removeChild(sprite);
};

module.exports = GraphicsEngine;
