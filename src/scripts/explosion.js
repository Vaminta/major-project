/*
22/04/22
Explosion effect appears on tank destruction
*/

class Explosion extends Entity{
	
	constructor(x,y){
		super("exp",x,y,32,32);
		const frameInt = 80;
		this.aniFrames = [[[0,0],frameInt],[[1,0],frameInt],[[2,0],frameInt],[[3,0],frameInt],[[0,1],frameInt],[[1,1],frameInt],[[2,1],frameInt],[[3,1],frameInt]];
		this.currentFrame = 0;
		this.lastFrameUpd = new Date();
		this.sprite = document.getElementById("explosion-img");
	}
	
	tick(gameData){
		let frameData = this.aniFrames[this.currentFrame];
		if(gameData.now-this.lastFrameUpd > frameData[1]){
			this.currentFrame++;
			if(this.currentFrame>=this.aniFrames.length) this.removeEnt(this,gameData);
			this.lastFrameUpd = gameData.now;
		}
	}
	
	draw(gameData){
		let scale = gameData.options.scale;
		let frameData = this.aniFrames[this.currentFrame];
		let sx = frameData[0][0]*32; //sprite x
		let sy = frameData[0][1]*32;
		gameData.ctx.drawImage(this.sprite, sx, sy, 32, 32, this.x*scale, this.y*scale, this.width*scale, this.height*scale);
	}
	
}
