class Coin extends Entity{
	
	constructor(x,y,worth){
		super("coin",x,y,16,16);
		const frameInt = 64;
		this.worth = worth;
		/*
		worth 0 = silver
		worth 1 = gold
		*/
		this.worthValues = [5,10];
		this.aniFrames = [[[0,0],2000],[[1,0],frameInt],[[2,0],frameInt],[[3,0],frameInt],[[4,0],frameInt],[[5,0],frameInt],[[6,0],frameInt],[[7,0],frameInt]];
		this.currentFrame = 0;
		this.lastFrameUpd = new Date();
		this.sprite = document.getElementById("coin-img");
		this.spawnTime = new Date();
		this.lifeTime = 10000;
	}
	
	updateAnimation(gameData){
		let frameData = this.aniFrames[this.currentFrame];
		if(gameData.now-this.lastFrameUpd > frameData[1]){
			this.currentFrame++;
			if(this.currentFrame>=this.aniFrames.length) this.currentFrame=0;
			this.lastFrameUpd = gameData.now;
		}
	}
	
	/*
	update players coin and remove this entity
	*/
	hitPlayer(gameData){
		gameData.playerData.coins += this.worthValues[this.worth];
		this.removeEnt(this,gameData);
	}
	
	//Check to see if touching a player
	detectPlayer(gameData){
		let point = [this.x+this.width/2, this.y+this.height/2];
		for(let i=0;i<gameData.entities.length;i++){
			let curEnt = gameData.entities[i];
			let collision = this.pointTouching(point,curEnt);
			if(collision){
				if(curEnt.constructor.name=="Player") this.hitPlayer(gameData);
			}
		}
	}
	
	//Check to see if this coin has expired (>8 seconds)
	checkLife(gameData){
		if(gameData.now-this.spawnTime > this.lifeTime) this.removeEnt(this,gameData);
	}
	
	tick(gameData){
		this.updateAnimation(gameData);
		this.checkLife(gameData);
		this.detectPlayer(gameData);
	}
	
	draw(gameData){
		let scale = gameData.options.scale;
		let frameData = this.aniFrames[this.currentFrame];
		let sx = frameData[0][0]*16; //sprite x
		let sy = this.worth*16;
		gameData.ctx.drawImage(this.sprite, sx, sy, 16, 16, this.x*scale, this.y*scale, this.width*scale, this.height*scale);
	}
	
}
