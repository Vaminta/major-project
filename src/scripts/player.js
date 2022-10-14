class Player extends Entity{
	
	constructor(x,y,playerNum){
		super("player",x,y,32,32);
		this.playerNum = playerNum;
		this.gpInd = playerNum-1; //controller "G"ame"P"ad index from navigator.getGamepads()[]
		this.skinOffset = playerNum==2 ? 32:0;
		this.aimCursorOffset = [32,0]; //where the cursor will be rendered relative to player
		this.turretRotationAngle = 0;
		this.selectedTile = [0,0]; //highlighted tile (for building walls)
		this.lastFire = new Date();
		//this.gc = new GamepadController(true,false);
		this.maxHealth = 100;
		this.health = 100;
		this.alive = true;
	}
	
	//Called by collision with shell
	hit(damage){
		this.health -= damage;
	}
	
	//Move tank in direction of left analogue stick
	processMovement(gameData){
		var gc = gameData.gc;
		
		this.allowedMovement = this.detectAllowedMovement(this, gameData);
		//console.log(this.allowedMovement);
		var pos = gc.getStick(this.gpInd,"left");
		if(pos[0]>0) pos[0]*=this.allowedMovement[1]
		else pos[0]*=this.allowedMovement[3];
		if(pos[1]>0) pos[1]*=this.allowedMovement[2];
		else pos[1]*=this.allowedMovement[0];
		
		this.x += pos[0]*2;
		this.y += pos[1]*2;
	}
	
	//Calculate the currently selected virtual tile
	processSelectedTile(gameData){
		var x = this.x + this.aimCursorOffset[0]+15;
		var y = this.y + this.aimCursorOffset[1]+15;
		this.selectedTile[0] = Math.floor(x/32);
		this.selectedTile[1] = Math.floor(y/32);
	}
	
	/*
	returns bool
	A test when placing the walls to see if a valid path is found to ensure the player can enclose the base completely
	A wall is placed in a (virtual) copy of gameData which then is passed to the pathfinding class to check if a path can be found
	If a path can be found, the test is passed so true is returned
	*/
	pathTest(gameData){
		let result;
		let virtualGameData = JSON.parse(JSON.stringify(gameData));
		let virtualWall = new Wall(this.selectedTile[0]*32,this.selectedTile[1]*32,32,32);
		virtualGameData.entities.push(virtualWall);
		let path = new Path();
		path.generateNavGrid(virtualGameData,[0,0],[8,8]);
		path.pathfind();
		if(!path.pathFound) result = false;
		else result = true;
		return result;
	}
	
	/*
	Return a wall entity given its location
	*/
	getWall(gameData, location){
		let wall = null;
		for(let i=0; i<gameData.entities.length; i++){
			let ent = gameData.entities[i];
			if(ent.constructor.name=="Wall" && ent.position[0]==location[0] && ent.position[1]==location[1]) wall = ent;
		}
		return wall;
	}
	
	/*
		check if a wall is on the border where enemies will spawn, or too close to the base where players will respawn
	*/
	checkInvalidWallLocation(gameData){
		let invalidLocation = false;
		let mapSize = gameData.options.mapSize;
		if(this.selectedTile[0]<=0|| this.selectedTile[1]<=0 || this.selectedTile[0]>=mapSize[0]-1 || this.selectedTile[1]>=mapSize[1]-1) invalidLocation = true;
		let distanceBetween = this.distanceBetweenPoints(this.selectedTile,[8,8]);
		if(distanceBetween < 2) invalidLocation = true;
		return invalidLocation;
	}
	
	/*
	Checks for coins and then subtracts. Returns true if the players have enough coins
	*/
	spendCoins(gameData, amount){
		let enoughMoney = gameData.playerData.coins >= amount ? true:false;
		if(enoughMoney) gameData.playerData.coins -= amount;
		return enoughMoney;
	}
	
	//Check Left and Right bumper buttons so that walls can be built or destroyed
	processButtons(gameData){
		if(gameData.gc.getButton(this.gpInd,"LB").pressed){ //Player wants to build wall
			let tileSize = gameData.options.tileDimensions[0];
			var point = [this.selectedTile[0]*tileSize + tileSize/2, this.selectedTile[1]*tileSize + tileSize/2];
			var touchingWall = false;
			for(var i=0; i<gameData.entities.length; i++){
				if(this.pointTouching(point,gameData.entities[i])) touchingWall=true;
			}
			let invalidLocation = this.checkInvalidWallLocation(gameData);
			
			//Check to see if wall can be built here
			if(!touchingWall && !invalidLocation && this.pathTest(gameData) && this.spendCoins(gameData, 10)){
				var newWall = new Wall(this.selectedTile[0]*tileSize,this.selectedTile[1]*tileSize);
				gameData.entities.push(newWall);
				console.log("Wall Placed");
			}
		}
		else if(gameData.gc.getButton(this.gpInd,"RB").pressed){ //Player wants to destroy wall
			let wall = this.getWall(gameData,this.selectedTile);
			if(wall){
				this.removeEnt(wall,gameData);
			}
		}
	}
	
	//Creates and returns required shell entity
	createShell(){
		var offset = (this.width/2)-4; //4= halfwidth of shell
		var startX = this.x + (this.aimCursorOffset[0]/1.5)+offset;
		var startY = this.y + (this.aimCursorOffset[1]/1.5)+offset;
		var cx = this.aimCursorOffset[0]/32;
		var cy = this.aimCursorOffset[1]/32;
		var newShell = new Shell(startX,startY,cx,cy,this.id,this.playerNum,2);
		return newShell;
	}
	
	//Detect if right trigger pulled = fire shell
	processTriggers(gameData){
		const fireInterval = 250;
		var now = new Date();
		if(gameData.gc.getTrigger(this.gpInd,"right").pressed && now - this.lastFire > fireInterval){
			console.log("fire!");
			gameData.entities.push(this.createShell());
			gameData.gc.vibrate(this.gpInd,0,0.5,50);
			this.lastFire = new Date();
		}
	}
	
	processAim(gc, rightStickMag){
		//Calculate cursor position
		var pos = gc.getStick(this.gpInd,"right");
		pos[0] = (pos[0]/rightStickMag) * 32; //normalise
		pos[1] = (pos[1]/rightStickMag) * 32;
		this.aimCursorOffset = [pos[0],pos[1]];
		
		//Calculate angle
		pos = gc.getStick(this.gpInd,"right");
		this.turretRotationAngle = Math.atan(pos[1]/pos[0]);
		if(pos[0]<0) this.turretRotationAngle += Math.PI;
	}
	
	//Move player offscreen if killed
	kill(){
		this.alive = false;
		this.health = 0;
		this.x = -200;
		this.y = -200;
	}
	
	//Move player back into position once health has regenerated
	revive(gridDimensions){
		const spawnLocations = [[8,7],[8,9]]; //Grid locations where player one and player two will spawn when revived
		this.health = this.maxHealth;
		this.alive = true;
		let spawnLocation = spawnLocations[this.playerNum-1];
		let realSpawnLocation = [spawnLocation[0]*gridDimensions[0], spawnLocation[1]*gridDimensions[1]];
		this.x = realSpawnLocation[0];
		this.y = realSpawnLocation[1];
	}
	
	//Determine if the player has been killed or should be revived
	processHealth(gameData){
		if(this.alive){
			if(this.health<=0){
				this.kill();
			}
		}
		else{
			if(this.health==this.maxHealth){
				this.revive(gameData.options.tileDimensions);
			}
			else{
				this.health+= 0.25; //regenerate player's health
			}
		}
	}
	
	tick(gameData){
		var gc = gameData.gc;
		this.processHealth(gameData);
		if(!this.alive) return;  //Don't process anymore since there's no need
		
		//deadzone to prevent tiny rogue controller inputs
		const deadzone = gameData.options.deadzone;
		var rightStickMag = gc.getStickMagnitude(this.gpInd,"right");
		if(rightStickMag>deadzone){
			this.processAim(gc,rightStickMag);
		}
		if(gc.getStickMagnitude(this.gpInd,"left")>deadzone){
			this.processMovement(gameData);
		}
		this.processSelectedTile(gameData);
		this.processButtons(gameData);
		this.processTriggers(gameData);
	}
	
	draw(gameData){
		if(!this.alive) return;
		var scale = gameData.options.scale;
		var imageToDraw = document.getElementById("player_tanks-img");
		//Draw main body of tank
		gameData.ctx.drawImage(imageToDraw, 0,this.skinOffset+0,32,32,this.x*scale,this.y*scale,this.width*scale,this.height*scale);
		
		//Rotate turret sprite and draw on top
		gameData.ctx.translate((this.x+16)*scale,(this.y+16)*scale);
		gameData.ctx.rotate(this.turretRotationAngle);
		gameData.ctx.drawImage(imageToDraw, 32,this.skinOffset+0,32,32,-16*scale,-16*scale,this.width*scale,this.height*scale);
		gameData.ctx.rotate(-this.turretRotationAngle);
		gameData.ctx.translate(-((this.x+16)*scale),-((this.y+16)*scale));

		//aimcursor
		var aimPos = [this.x+this.aimCursorOffset[0], this.y+this.aimCursorOffset[1]]; //aimcursorpos
		gameData.ctx.drawImage(imageToDraw, 64,this.skinOffset+0,32,32, aimPos[0]*scale, aimPos[1]*scale,this.width*scale,this.height*scale);
		
		//selectedTile
		gameData.ctx.drawImage(imageToDraw, 96, this.skinOffset, 32, 32, this.selectedTile[0]*32*scale, this.selectedTile[1]*32*scale, this.width*scale, this.height*scale);
		var x = this.x + this.aimCursorOffset[0]+15;
		var y = this.y + this.aimCursorOffset[1]+15;
		gameData.ctx.fillStyle="#FF0000";
	}
}
