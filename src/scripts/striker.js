/*
08/04/22
Enemy with shooting abilities
*/
class Striker extends Enemy{

	constructor(x,y){
		super(x,y);
		this.health = 50;
		this.shooting = false;
		this.target = [0,0];
		this.detectionRange = 150;
		this.turretRotationAngle = 0;
		this.lastFireTime = new Date();
		this.fireCooldown = 1500; //in ms
		this.points = 150; //Score for destroying
	}
	
	/*
	Get and return location of closest player to shoot towards
	*/
	getTarget(gameData){
		let target = null;
		//Added shortest distance to fix strikers focusing on player one and ignoring p2
		let shortestDistance = 99999;
		for(let i=0;i<gameData.entities.length;i++){
			let e = gameData.entities[i]; //current entity
			if(e.constructor.name!="Player") continue;
			let pointA = [e.x,e.y];
			let pointB = [this.x,this.y];
			let distance = this.distanceBetweenPoints(pointA, pointB);
			if(distance <  this.detectionRange && distance < shortestDistance){
				shortestDistance = distance; //update new shortest distance
				target = [e.x+16,e.y+16];
				//break;
			}
		}
		return target;
	}
	
	//Creates and returns a shell entity
	createShell(x,y,speed,bounceLimit){
	
		let startX = (this.x+14) + (x*15);
		let startY = (this.y+14) + (y*15);
		let cx = x*0.5;
		let cy = y*0.5;
		let newShell = new Shell(startX, startY, cx, cy, this.id, 0, 0);
		return newShell;
	}
	
	/*
	calculate rotation angle and fire a shell in target direction
	*/
	shootTarget(gameData){
		let x = this.target[0] - (this.x+16);
		let y = this.target[1] - (this.y+16);
		let magnitude = Math.sqrt((x*x)+(y*y)); //ie distance
		x = x/magnitude;
		y = y/magnitude;
		this.turretRotationAngle = Math.atan(y/x);
		if(x<0) this.turretRotationAngle += Math.PI;
		
		if(gameData.now - this.lastFireTime > this.fireCooldown){
			this.lastFireTime = gameData.now;
			gameData.entities.push(this.createShell(x,y));
		}
		
	}
	
	//spawn gold coin
	spawnCoin(gameData){
		let newCoin = new Coin(this.x+8,this.y+8,1);
		gameData.entities.push(newCoin);
	}
	
	tick(gameData){
		super.tick(gameData);
		this.target = this.getTarget(gameData);
		if(this.target) this.shootTarget(gameData);
	}
	
	draw(gameData){
		var scale = gameData.options.scale;
		gameData.ctx.drawImage(this.imageToDraw,0,0,32*scale,32*scale,this.x*scale,this.y*scale,this.width*scale,this.height*scale);
		
		gameData.ctx.translate((this.x+16)*scale,(this.y+16)*scale);
		gameData.ctx.rotate(this.turretRotationAngle);
		gameData.ctx.drawImage(this.imageToDraw,32,0,32*scale,32*scale,-16*scale,-16*scale,this.width*scale,this.height*scale);
		gameData.ctx.rotate(-this.turretRotationAngle);
		gameData.ctx.translate(-((this.x+16)*scale),-((this.y+16)*scale));
		//draw health if hit
		if(gameData.now-this.lastHitTime < this.healthTime) this.drawHealth(this, gameData, 4);
	}
	

}
