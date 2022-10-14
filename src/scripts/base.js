/*
Base entity which appears in centre of the map
*/
class Base extends Entity{

	constructor(x, y){
		const size = 32;
		super("base", x, y, size, size);
		this.solid = true;
	}
	
	draw(gameData){
		var image = document.getElementById("tiles-img");
		var scale = gameData.options.scale;
		gameData.ctx.drawImage(image,0,0,32*scale,32*scale,this.x*scale,this.y*scale,this.width*scale,this.height*scale);
	}
}
