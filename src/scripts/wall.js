/*
Wall instance which can be created by player tanks
*/
class Wall extends Entity{
	constructor(x, y){
		super("wall", x, y, 32, 32);
		this.position = [Math.floor(x/32),Math.floor(y/32)];
		this.solid = true;
		this.maxHealth = 400;
		this.health = 400;
		this.lastHitTime = new Date()-10000;
		this.healthTime = 4000; //Time that health will be displayed once hit
		this.spriteOffset = 32;
	}
	
	//Called on shell collision
	hit(damage){
		this.lastHitTime = new Date();
		this.health -= damage;
	}
	
	//23/04/22
	//Show weakened wall sprites
	processSprite(){
		let healthPercent = this.health/this.maxHealth;
		if(healthPercent<0.25) this.spriteOffset = 96; //32*3 - weak sprite
		else if(healthPercent<0.5) this.spriteOffset = 64;
	}
	
	tick(gameData){
		if(this.health<=0) this.removeEnt(this,gameData);
		this.processSprite();
	}
	
	draw(gameData){
		var image = document.getElementById("tiles-img");
		var scale = gameData.options.scale;
		gameData.ctx.drawImage(image,this.spriteOffset,0,32,32,this.x,this.y,this.width*scale,this.height*scale);
		
		if(gameData.now-this.lastHitTime < this.healthTime) this.drawHealth(this, gameData, 4);
	}
	
}
