// 21/03/22
// Greg Card
class Shell extends Entity {
	
	constructor(x, y, cx, cy, origin, playerNum, maxBounce){
		super("shell", x, y, 8, 8);
		this.originID = origin; //Id of entity which fired
		this.cx = cx;
		this.cy = cy;
		if(playerNum==null) this.skinOffset = 0; //0 = AI
		else this.skinOffset = playerNum;
		this.sinceLastBounce = new Date()-1000;
		this.bounceCount = 0;
		this.maxBounce = maxBounce;
		this.createdTime = new Date();
		this.damage = 10;
	}
	
	/*
	Removes this shell from the gameData entities array
	*/
	deleteShell(gameData){
		for(var i=0;i<gameData.entities.length;i++){
			if(gameData.entities[i].id==this.id) gameData.entities.splice(i,1);
		}
	}
	
	/*
	call to see if bounce should be registed + can also invert movement on both axis
	*/
	bounce(invert){
		const bounceMin = 50;
		const now = new Date();
		if(now-this.sinceLastBounce > bounceMin){
				this.bounceCount++;
				this.sinceLastBounce = new Date();
		}
		if(invert){
			this.cx*=-1;
			this.cy*=-1;
		}
	}
	
	//Move shell and cause shell to bounce (invert direction) if hitting wall
	processMovement(gameData){
		this.allowedMovement = this.detectAllowedMovement(this, gameData);
		if(this.allowedMovement[1] == 0 || this.allowedMovement[3] == 0){
			this.bounce(false);
		 	this.cx*=-1;
		}
		if(this.allowedMovement[0] == 0 || this.allowedMovement[2] == 0) {
			this.bounce(false);
			this.cy*=-1;
		}
		if(this.bounceCount>this.maxBounce) this.removeEnt(this, gameData);
		const speed = 5;
		this.x += this.cx*speed;
		this.y += this.cy*speed;
	}
	
	/*
	detect what the shell hit, if anything
	*/
	detectHit(gameData){
		//top left corner, clockwise ending with bottom left
		var touchedEntity = null;
		var points = [[this.x-1, this.y-1], [this.x+this.width+1,this.y-1], [this.x+this.width+1, this.y+this.height+1], [this.x-1,this.y+this.height+1]];
		for(var i=0; i<gameData.entities.length;i++){
			for(var n=0; n<points.length; n++){
				var touching = this.pointTouching(points[n],gameData.entities[i]);
				if(touching) touchedEntity = gameData.entities[i];
			}
		}
		return touchedEntity;
	}
	
	//Apply damage to the hit entity
	processHit(ent,gameData){
		if(ent==null) return;
		if(ent.id == this.originID && gameData.now-this.createdTime<200){ //Don't instantly hurt shell's creator
			//console.log("safe");
			return;
		}
		
		//Call damage if entity can be damaged
		if(ent.hit) ent.hit(this.damage);
		
		//if(ent.constructor.name=="Shell") this.bounce(true);
		
		//Destroy if hit these:
		var entitiesWhichDestroy = ["Base","Player","Streaker","Striker"];
		for(var i=0;i<entitiesWhichDestroy.length;i++){
			if(ent.constructor.name==entitiesWhichDestroy[i]) this.removeEnt(this,gameData);
		}
		
	}
	
	tick(gameData){
		this.processMovement(gameData);
		var touched = this.detectHit(gameData);
		if(touched) this.processHit(touched, gameData);
	}
	
	draw(gameData){
		var image = document.getElementById("shells-img");
		var scale = gameData.options.scale;
		var size = this.width;
		gameData.ctx.drawImage(image, this.skinOffset*this.width,0,size*scale, size*scale, this.x*scale, this.y*scale, this.width*scale,this.height*scale);
	}
}
