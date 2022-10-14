 /*
 Simple button class to help with formatting and drawing buttons to screen
 */
 class Button{
 	
 	constructor(x,y,w,h,text,value,selected){
 		this.x = x;
 		this.y = y;
 		this.width = w;
 		this.height = h;
 		this.text = text;
 		this.value = value;
 		this.selected = selected;
 	}	
 	
 	tick(){
 	
 	}
 	
 	draw(gameData){
 		let fillColour = "#cfe4e6";
 		//different colour if button is selected
 		if(this.selected) fillColour = "#7cd3d9";
 		gameData.ctx.fillStyle = fillColour;
 		gameData.ctx.fillRect(this.x,this.y,this.width,this.height);
 		let fontSize = 16;
 		gameData.ctx.font = fontSize+"px Ariel";
 		gameData.ctx.fillStyle = "#000000";
 		var txtDimensions = gameData.ctx.measureText(this.text);
 		let paddingLeft = (this.width-txtDimensions.width)/2;
 		let paddingTop = txtDimensions.actualBoundingBoxAscent + txtDimensions.actualBoundingBoxDescent;//(this.height - txtDimensions.height)/2;
 		gameData.ctx.fillText(this.text, this.x+paddingLeft, this.y+paddingTop+((this.height-paddingTop)/2));
 	}
 }
