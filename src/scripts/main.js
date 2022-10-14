/*
Main entrypoint of the software
@author Greg Card
*/
var canvas;
var gameData = new Object(); //contain stuff in here and pass to entities.
gameData.ctx;
gameData.gc;
gameData.now = new Date();
gameData.state = "main-menu";
gameData.options = new Object();
gameData.options.scale = 1.0;
gameData.options.mapSize = [17,17];
gameData.options.tileDimensions = [32,32];
gameData.options.deadzone =  0.15;
gameData.options.startingCoins = 100;
gameData.playerData = new Object();
gameData.playerData.baseHealth = 500;
gameData.playerData.maxBaseHealth = 500;
gameData.playerData.coins = 0;
gameData.playerData.players = 0;
gameData.playerData.score = 0;
gameData.entities = [];
//Manager handles current screen
gameData.currentManager = null;

//Update all game entities if game is in play
var tick = function(){
	gameData.now = new Date();
	if(gameData.state=="playing"){
		for(var i=0;i<gameData.entities.length;i++){
			gameData.entities[i].tick(gameData);
		}
	}
	if(gameData.currentManager) gameData.currentManager.tick(gameData);
};

//draw all entities to the screen
var render = function(){
	gameData.ctx.fillStyle = "#dddddd";
	gameData.ctx.fillRect(0,0,canvas.width,canvas.height);
	for(var i=0;i<gameData.entities.length;i++){
		gameData.entities[i].draw(gameData);
	}
	if(gameData.currentManager) gameData.currentManager.render(gameData);
};

//Main loop
var loop = function(){
	tick();
	render();
};

var initialise = function(){
	canvas = document.getElementById("target-canvas");
	gameData.ctx = canvas.getContext("2d");
	gameData.ctx.imageSmoothingEnabled = false; //disable filtering
	gameData.gc = new GamepadController(false,true);
	mainLoop = setInterval(loop,33); //30fps
	//instantiate the main menu
	gameData.currentManager = new MainMenu();
};

var interval = setInterval(function(){
	if(document.readyState=="complete"){
		clearInterval(interval);
		initialise();
	}
},200);
