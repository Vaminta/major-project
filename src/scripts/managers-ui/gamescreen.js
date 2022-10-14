class Game{
	constructor(){
		//score , wait time, chance of striker spawning 0.0-1.0
		this.difficultyStages = [[0,7000,0.0],[1000,6000,0.0],[3000,5000,0.1],[5000,5000,0.3],[7000,4500,0.5],[8000,4000,0.5],[9000,3500,0.2],[15000,3500,0.5],[25000,4000,0.8],[35000,3500,0.8],[45000,3200,0.8],[60000,3000,0.8]];
		this.lastEnemySpawn = new Date();
		let retryButton = new Button(148,340,120,40,"Retry","retry",false);
		let quitButton = new Button(288,340,120,40,"Exit","quit",true);
		this.gameOverButtons = [retryButton, quitButton];
		this.controllerIndex = 0;
	}
	
	/*
	Reset variables to default and create base, also spawn correct number of players
	*/
	initialiseGame(gameData,playerCount){
		gameData.entities = [];
		this.lastEnemySpawn = gameData.now;
		gameData.playerData.score = 0;
		gameData.playerData.coins = gameData.options.startingCoins;
		gameData.playerData.players = playerCount;
		gameData.playerData.baseHealth = gameData.playerData.maxBaseHealth;
		
		//make base
		const tileSize = gameData.options.tileDimensions[0];
		const basePos = [8,8];
		let base = new Base(basePos[0]*tileSize, basePos[1]*tileSize);
		gameData.entities.push(base);
		
		//Spawn positions for both players
		const spawnPositions = [[8,7],[8,9]];
		for(let i=0; i<playerCount; i++){
			let player = new Player(spawnPositions[i][0]*tileSize,spawnPositions[i][1]*tileSize,i+1);
			gameData.entities.push(player);
		}
		
		gameData.state = "playing";
	}
	
	/**
	Given the score, return the correct difficulty stage index in the array
	*/
	calculateDifficultyStage(score){
		let difficultyStage;
		for(let i=0;i<this.difficultyStages.length; i++){
			let ds = this.difficultyStages[i];
			if(score >= ds[0]) difficultyStage = i;
		}
		return difficultyStage;
	}
	
	/*
	Check to see if it is time to spawn enemy. If it is, do so in accordance with the current difficulty stage
	*/
	processEnemySpawning(gameData){
		let ds = this.calculateDifficultyStage(gameData.playerData.score);
		let dsData = this.difficultyStages[ds];
		//console.log(ds);
		let squareMapSize = gameData.options.mapSize[0]-1;
		if(gameData.now - this.lastEnemySpawn > dsData[1]){ //true = time to spawn new enemy
			for(let i=0; i<gameData.playerData.players; i++){ //spawn same number of enemies as players for balance
				let randomChance = Math.random();
				let spawnPosition = Math.round(Math.random()*squareMapSize);
				let otherBoundaryEdge = Math.random()>0.5 ? 0:squareMapSize;
				let xPos, yPos;
				if(Math.random()>0.5){
					xPos = otherBoundaryEdge;
					yPos = spawnPosition;
				}
				else{
					xPos = spawnPosition;
					yPos = otherBoundaryEdge;
				}
				let enemy;
				let tileSize = gameData.options.tileDimensions[0];
				if(randomChance < dsData[2]){
					enemy = new Striker(xPos*tileSize, yPos*tileSize);
				}
				else{
					enemy = new Streaker(xPos*tileSize, yPos*tileSize);
				}
				gameData.entities.push(enemy);
			}
			this.lastEnemySpawn = gameData.now;
		}
	}
	
	/*
	Change back to main menu
	*/
	exit(gameData){
		gameData.entities = [];
		gameData.state = "main-menu";
		gameData.currentManager = new MainMenu();
	}
	
	/*
	Returns the index of the currently selected game over button in the gameOverButtons array
	*/
	getSelectedGameOverButtonIndex(){
		let index = 0;
		for(let i = 0;i<this.gameOverButtons.length;i++){
			if(this.gameOverButtons[i].selected) index = i;
		}
		return index;
	}
	
	//Changes the selected controller button
	changeSelectedButton(now,buttons,currentlySelectedIndex,direction){
		this.lastButtonPress = now;
		buttons[currentlySelectedIndex].selected = false;
		buttons[currentlySelectedIndex+direction].selected = true;
	}
	
	/*
	Read controller inputs and manipulate game over menu buttons
	*/
	processGameOverButtons(gameData){
		let currentlySelectedIndex = this.getSelectedGameOverButtonIndex();
		let buttons = this.gameOverButtons;
		if(gameData.gc.getButton(this.controllerIndex,"RIGHT").pressed && currentlySelectedIndex+1<buttons.length) this.changeSelectedButton(gameData.now,buttons,currentlySelectedIndex,+1);
		else if(gameData.gc.getButton(this.controllerIndex,"LEFT").pressed && currentlySelectedIndex>0)this.changeSelectedButton(gameData.now,buttons,currentlySelectedIndex,-1);
		else if(gameData.gc.getButton(this.controllerIndex,"A").pressed){
			this.lastButtonPress = gameData.now;
			let value = buttons[currentlySelectedIndex].value;
			switch(value){
				case "retry":
					this.initialiseGame(gameData, gameData.playerData.players);
					break;
				case "quit":
					this.exit(gameData);
					break;
			}
		}
	}
	
	tick(gameData){
		if(gameData.state=="playing"){
			this.processEnemySpawning(gameData);
			if(gameData.playerData.baseHealth<=0) gameData.state="gameover";
		}
		else if(gameData.state=="gameover"){
			this.processGameOverButtons(gameData);
		}
	}
	
	//Draws player(s) health to top of the screen
	drawPlayerHealth(gameData){
		let playerOne = null;
		let playerTwo = null;
		//Search through entities for players
		for(let i=0; i<gameData.entities.length; i++){
			let c = gameData.entities[i];
			if(c.playerNum == 1) playerOne = c; //Found player one
			if(c.playerNum == 2) playerTwo = c; //Found player two
		}
		
		//Now calculate and draw health bar at top of screen
		let screenWidth = gameData.options.mapSize[0] * gameData.options.tileDimensions[0] * gameData.options.scale;
		let playerOneHealthWidth = (screenWidth/2)*playerOne.health/playerOne.maxHealth;
		let ctx = gameData.ctx; //abbreviate frequent use
		ctx.fillStyle = "#3a4d33";
		ctx.fillRect(0,0,playerOneHealthWidth,4);
		
		//If there is player two (i.e. multiplayer)
		if(playerTwo){
			let playerTwoHealthPercent = playerTwo.health/playerTwo.maxHealth;
			let playerTwoHealthWidth = (screenWidth/2)*playerTwoHealthPercent;
			let playerTwoLeftOffset = screenWidth-playerTwoHealthWidth;
			ctx.fillStyle = "#6b5a4a";
			ctx.fillRect(playerTwoLeftOffset,0,playerTwoHealthWidth,4);
		}
	}
	
	//Draw the shared player stats
	drawStats(gameData){
		let ctx = gameData.ctx;
		let baseHealthPercent = (gameData.playerData.baseHealth / gameData.playerData.maxBaseHealth) *100;
		let score = gameData.playerData.score;
		let coins = gameData.playerData.coins;
		ctx.font = "12px Ariel";
		ctx.fillText("Base: " + baseHealthPercent + "%",0,16);
		ctx.fillText("Score: " + score, 0, 28);
		ctx.fillText("Coins: " + coins, 0, 40);
	}
	
	//Draws game over window and text
	drawGameOverText(gameData){
		let ctx = gameData.ctx;
		ctx.fillStyle = "#000000";
		ctx.fillRect(130,143,292,258);
		
		ctx.fillStyle="#ffffff";
		
		ctx.font = "32px Ariel";
		const gameOver = "Game Over!";
		let textWidth = ctx.measureText(gameOver).width;
		const windowWidth = gameData.options.tileDimensions[0]*gameData.options.mapSize[0];
		let textLeft = (windowWidth - textWidth) / 2;
		
		ctx.fillText(gameOver, textLeft,170+32);
		
		const score = "Score "+gameData.playerData.score;
		ctx.font = "20px Ariel";
		textWidth = ctx.measureText(score).width;
		textLeft = (windowWidth - textWidth) / 2;
		ctx.fillText(score, textLeft,170+32+70);
		
	}
	
	//Draws game over buttons
	drawGameOverButtons(gameData){
		for(let i=0; i<this.gameOverButtons.length; i++){
			this.gameOverButtons[i].draw(gameData);
		}
	}
	
	render(gameData){
		this.drawPlayerHealth(gameData);
		this.drawStats(gameData);
		if(gameData.state=="gameover"){
			gameData.ctx.globalAlpha = 0.8;
			this.drawGameOverText(gameData);
			this.drawGameOverButtons(gameData);
			gameData.ctx.globalAlpha = 1;
		}
	}
}
