/*
Abstract base class for all game entities
07/03/22
*/

class Entity {
	
	//Keep track of created entities to make id
	static idCounter = 0;
	
	constructor(type,x,y,w,h){
		this.id = Entity.idCounter;
		Entity.idCounter++;
		this.type = type;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.solid = false;
		this.allowedMovement = [1,1,1,1];
	}
	
	/*
	Takes entity and returns array of four sides [top,right,bottom,left] - 0 = touching
	*/
	detectAllowedMovement(entity, gameData){
		var allowedMovement = [1,1,1,1];
		for(var i=0;i<gameData.entities.length;i++){
			var ce = gameData.entities[i]; //current entity
			if (ce.id == entity.id) continue;
			let offset = 4; //was 4
			if(ce.solid){
				var topBarOne = [entity.x+offset, entity.y];
				var topBarTwo = [entity.x+entity.width-offset, entity.y];
				var leftBarOne = [entity.x, entity.y+offset];
				var leftBarTwo = [entity.x, entity.y+entity.height-offset];
				var bottomBarOne = [entity.x+offset, entity.y+entity.height];
				var bottomBarTwo = [entity.x+entity.width-offset, entity.y+entity.height];
				var rightBarOne = [entity.x+entity.width, entity.y+offset];
				var rightBarTwo = [entity.x+entity.width, entity.y+entity.height-offset];
				
				if(this.pointTouching(topBarOne,ce) || this.pointTouching(topBarTwo,ce)) allowedMovement[0] = 0; //no up
				if(this.pointTouching(leftBarOne,ce) || this.pointTouching(leftBarTwo,ce)) allowedMovement[3] = 0; //no left
				if(this.pointTouching(bottomBarOne,ce) || this.pointTouching(bottomBarTwo,ce)) allowedMovement[2] = 0; //no down
				if(this.pointTouching(rightBarOne,ce) || this.pointTouching(rightBarTwo,ce)) allowedMovement[1] = 0; //no up
			}
		}
		
		//screen bounds
		let tileDimensions = gameData.options.tileDimensions;
		let mapSize = gameData.options.mapSize;
		let dimensions = [tileDimensions[0] * mapSize[0], tileDimensions[1] * mapSize[1]];
		if(entity.x <= 0) allowedMovement[3] = 0; //no left
		if(entity.y <= 0) allowedMovement[0] = 0; //no up
		if(entity.x + entity.width >= dimensions[0]) allowedMovement[1] = 0; //no right
		if(entity.y + entity.width >= dimensions[1]) allowedMovement[2] = 0; //no down
		return allowedMovement;
	}
	
	/*
	Detects if point is touching entity
	*/
	pointTouching(point, entity){
		var result = false;
		if(point[0]>=entity.x && point[0]<=entity.x+entity.width && point[1]>= entity.y && point[1]<=entity.y+entity.height) result = true;
		return result;
	}
	
	/*
		returns the euclidean distance
	*/
	distanceBetweenPoints(a,b){
		let cx = a[0]-b[0];
		let cy = a[1]-b[1];
		let result = Math.sqrt((cx*cx)+(cy*cy));
		return result;
	}
	
	/*
	Draws health bar of given entity
	*/
	drawHealth(ent, gameData, yOffset){
		if(!yOffset) yOffset = -1;
		var x = ent.x+2;
		var y = ent.y+yOffset;
		const width = 26;
		const height = 2;
		var percent = ent.health/ent.maxHealth;
		
		gameData.ctx.fillStyle = "#000000";
		gameData.ctx.fillRect(x,y,width+2, height+2);
		gameData.ctx.fillStyle = "#665555";
		gameData.ctx.fillRect(x+1,y+1, width, height);
		gameData.ctx.fillStyle = "#11FF11";
		gameData.ctx.fillRect(x+1,y+1, width*percent, height);
	}
	
	/*
	Remove an entity from gameData list
	*/
	removeEnt(ent, gameData){
		for(var i=0;i<gameData.entities.length;i++){
			if(gameData.entities[i].id==ent.id) gameData.entities.splice(i,1);
		}
	}
	
	/*
	Must be overridden
	Called every cycle to update entity data
	*/
	tick(gd){
	
	}
	
	/*
	Called every time entity is to be drawn to canvas
	*/
	draw(gd){
		var imageToDraw = document.getElementById("missing-img");
		var scale = gd.options.scale;
		gd.ctx.drawImage(imageToDraw,0,0,32*scale,32*scale,this.x*scale,this.y*scale,this.width*scale,this.height*scale);
	}
}
