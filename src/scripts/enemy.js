/*
31/03/22
abstract Enemy base class
@author Greg
*/

class Enemy extends Entity{
	
	constructor(x,y){
		super("enemy",x,y,32,32);
		this.maxHealth = 50;
		this.health = 100;
		this.path = new Path();
		this.imageToDraw = document.getElementById("enemy_tanks-img");
		this.aiMoving = false;
		this.currentPathIndex = 0;
		this.lastHitTime = new Date()-10000;
		this.healthTime = 4000;
		this.speed = 0.5;
		this.baseDamage = 100;
	}
	
	//Trigger the pathfinder to generate a path
	processPath(gameData, forced){
		if(!this.path.pathFound || forced){
			if(this.path.pathfindDate==0 || forced){
				this.path.generateNavGrid(gameData,[this.x/32,this.y/32],[8,8]);
				this.path.pathfind();
				if(this.path.pathFound) {
					this.aiMoving = true;
					this.currentPathIndex = 0;
				}
				else{ //Destroy the tank if no path is found, it is likely trapped by user
					this.destroyed(gameData,false);
				}
			}
			else{ //been generated before but no path was found
			
			}
		}
	}
	
	// Move tank along the generated path
	processMovement(gameData){
		const speed = this.speed;
		if(this.aiMoving){
			this.allowedMovement = this.detectAllowedMovement(this, gameData);
			let pathCoords = this.path.generatedPathCoords;
			if(pathCoords[this.currentPathIndex]){
				let movement = [0,0,0,0];
				let targetX = pathCoords[this.currentPathIndex][0]*32;
				let targetY = pathCoords[this.currentPathIndex][1]*32;
				if(this.x < targetX) movement[1] = 1;
				else if(this.x > targetX) movement[3] = 1;
				if(this.y > targetY) movement[0] = 1;
				else if(this.y < targetY) movement[2] = 1;
				
				let collision = false;
				if(this.currentPathIndex<pathCoords.length-2){ //ignore collision near the base
					for(let i=0;i<movement.length;i++){
						if(movement[i] && !this.allowedMovement[i]) collision = true;
						movement[i] *= this.allowedMovement[i];
					}
				}
				if(collision){
					console.log("Unexpected obstacle");
					this.processPath(gameData, true);
					return;
				}
				
				let cx = 0; //change in x
				let cy = 0;
				if(movement[0]==1) cy = -speed;
				if(movement[1]==1) cx = speed;
				if(movement[2]==1) cy = speed;
				if(movement[3]==1) cx = -speed;
				
				this.x += cx;
				this.y += cy;
				
				if(this.x==targetX && this.y==targetY) this.currentPathIndex++;
				if(this.currentPathIndex >= pathCoords.length) {
				this.aiMoving = false;
				this.destroyed(gameData, false);
				gameData.playerData.baseHealth -= this.baseDamage; //damage base
				}
			}
		}
	}
	
	//Tank destroyed
	destroyed(gameData, awardPoints){
		if(awardPoints){ //destroyed by player - not hit base
			gameData.playerData.score += this.points;
			if(Math.random()>0.5) this.spawnCoin(gameData);
		}
		let explosion = new Explosion(this.x,this.y);
		gameData.entities.push(explosion);
		this.removeEnt(this, gameData);
	}
	
	//Called by collision with shell
	hit(damage){
		this.health -=damage;
		this.lastHitTime = new Date();
	}
	
	tick(gameData){
		this.processPath(gameData);
		this.processMovement(gameData);
		if(this.health<=0) this.destroyed(gameData, true);
	}
	/*
	draw(gameData){
		
	}*/
}
