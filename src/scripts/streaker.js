/*
Streaker (no guns, just moves)
*/

class Streaker extends Enemy{
	constructor(x,y){
		super(x,y);
		this.health = 50;
		this.points = 100; //Score for destroying
	}
	
	//spawn silver coin
	spawnCoin(gameData){
		let newCoin = new Coin(this.x+8,this.y+8,0);
		gameData.entities.push(newCoin);
	}
	
	tick(gameData){
		super.tick(gameData);
	}
	
	draw(gameData){
		var scale = gameData.options.scale;
		gameData.ctx.drawImage(this.imageToDraw,0,0,32*scale,32*scale,this.x*scale,this.y*scale,this.width*scale,this.height*scale);
		if(gameData.now-this.lastHitTime < this.healthTime) this.drawHealth(this, gameData, 4);
	}
}
