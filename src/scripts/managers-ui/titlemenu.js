class MainMenu {

	
	constructor(){
		let singlePlayerButton = new Button(40,480,140,40,"Single Player","single",true);
		let multiPlayerButton = new Button(200,480,140,40,"Multi Player","multi",false);
		let helpButton = new Button(360,480,140,40,"Help","help",false);
		this.mainButtons = [singlePlayerButton, multiPlayerButton, helpButton];
		this.lastButtonPress = new Date();
		this.buttonInterval = 200;
		this.iconImg = document.getElementById("connected_players-img");
		this.connectedControllers = 0;
		this.controllerIndex = 0;
	}	
	
	/*
	Use gamepad controller class to safetly determine connected controllers
	*/
	detectControllers(gc){
		let controllers = 0;
		if(gc.validIndex(0)) controllers++;
		if(gc.validIndex(1)) controllers++;
		//Make sure that a button cannot immediately be pressed
		if(controllers!=this.connectedControllers) this.lastButtonPress = new Date();
		this.connectedControllers = controllers;
	}
	
	/*
	Returns the index of the currently selected main menu buttong in the mainButtons array
	*/
	getSelectedMainButtonIndex(){
		let index = 0;
		for(let i = 0;i<this.mainButtons.length;i++){
			if(this.mainButtons[i].selected) index = i;
		}
		return index;
	}
	
	//Starts a game with either one or two players
	startGame(gameData, players){
		//Prevent multiplayer game starting if not enough controllers
		if(!players || players > this.connectedControllers) return;
		let game = new Game();
		game.initialiseGame(gameData, players);
		gameData.currentManager = game;
	}
	
	//Opens a popup window containing online help document
	openHelp(){
		const url = "https://users.aber.ac.uk/glc3/mmp/help";
		window.open(url,"Game Help","popup");
	}
	
	/*
	Read inputs from controller so menu buttons can be changed or selected.
	*/
	processButtons(gameData){
		let currentlySelectedIndex = this.getSelectedMainButtonIndex();
		if(gameData.gc.getButton(this.controllerIndex,"RIGHT").pressed && currentlySelectedIndex+1<this.mainButtons.length){
			this.lastButtonPress = gameData.now;
			this.mainButtons[currentlySelectedIndex].selected = false;
			this.mainButtons[currentlySelectedIndex+1].selected = true;
		}
		else if(gameData.gc.getButton(this.controllerIndex,"LEFT").pressed && currentlySelectedIndex>0){
			this.lastButtonPress = gameData.now;
			this.mainButtons[currentlySelectedIndex].selected = false;
			this.mainButtons[currentlySelectedIndex-1].selected = true;
		}
		else if(gameData.gc.getButton(this.controllerIndex,"A").pressed){
			this.lastButtonPress = gameData.now;
			let value = this.mainButtons[currentlySelectedIndex].value;
			switch(value){
				case "single":
					this.startGame(gameData,1);
					break;
				case "multi":
					this.startGame(gameData,2);
					break;
				case "help":
					this.openHelp();
					break;
			}
		}
	}
	
	tick(gameData){
		this.detectControllers(gameData.gc);
		if(gameData.now-this.lastButtonPress>this.buttonInterval) this.processButtons(gameData);
	}
	
	render(gameData){
		let ctx = gameData.ctx;
		let scale = gameData.options.scale;
		
		// For displaying connected controllers
		let controllerText = "Connected Controllers";
		ctx.fillStyle = "#000000";
		ctx.font = "16px Ariel";
		let dimensions = ctx.measureText(controllerText);
		let paddingLeft = (544-dimensions.width)/2;
		ctx.fillText(controllerText, paddingLeft, 40);
		let p1Offset = this.connectedControllers>0 ? 32:0;
		let p2Offset = this.connectedControllers==2 ? 32:0;
		gameData.ctx.drawImage(this.iconImg,p1Offset,0,32*scale,32*scale,235*scale,50*scale,32*scale,32*scale);
		gameData.ctx.drawImage(this.iconImg,p2Offset,32,32*scale,32*scale,277*scale,50*scale,32*scale,32*scale);
		
		//draw buttons
		for(let i=0;i<this.mainButtons.length;i++){
			this.mainButtons[i].draw(gameData);
		}
		
		//This was removed because it looked low quality - uncomment to see temporary title text
		/*
		//TANK-OFF text
		let titleText = "TANK-OFF!";
		ctx.font = "60px Courier New";
		let titleWidth = ctx.measureText(titleText).width;
		let leftOffset = (544-titleWidth)/2;
		ctx.fillText(titleText,leftOffset, 272);
		*/
	}
	
}	
