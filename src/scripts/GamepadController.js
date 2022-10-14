// 09/03/22 
class GamepadController {
	
	constructor(consoleOut, nonStandard){
		this.lastPrint = new Date();
		this.consoleOut = consoleOut;
		this.nonStandardAllowed = nonStandard;
		this.lastMessage = "";
	}
	
	/*
	Custom print method to help debug controller issues
	*/
	consolePrint(message,type){
		if(message==null){
			var message = "consolePrint: message null";
			var type = "error";
		}

		var now = new Date();
		if(type==null) var type = "log";
		if(this.consoleOut && (now-this.lastPrint>1000 || this.lastMessage!=message)){
			if(type=="log") console.log(message);
			else if(type=="warn") console.warn(message);
			else if(type=="error") console.error(message);
			this.lastMessage = message;
			this.lastPrint = new Date();
		}
	}
	
	/*
	Checks if the requested controller can be accessed yet
	*/
	validIndex(index){
		const length = navigator.getGamepads().length;
		if(index<= length-1 && index>=0 && navigator.getGamepads()[index]!=null){
			return true;
		}
		else{
			var message = "No gamepad at index " + index + ". There are " + length + " gamepads connected.";
			this.consolePrint(message,"warn");
			
			return false;
		}
	}
	
	isStandard(index){
		if(index==null){
			index = 0;
			this.consolePrint("isStandard index null!","error");
		}
		let isXInput = navigator.getGamepads()[index].axes.length == 4 ? true:false;
		return isXInput;
	}
	
	//Returns object containing bool specifying if button is pressed.
	getButton(index, buttonName){
		const standardMappings = [["A",0],["B",1],["X",2],["Y",3],["LB",4],["RB",5],["SELECT",8],["START",9],["LS",10],["RS",11],["UP",12],["DOWN",13],["LEFT",14],["RIGHT",15]];
		const nonStandardMappings = [["A",0],["B",1],["X",2],["Y",3],["LB",4],["RB",5],["SELECT",6],["START",7],["HOME",8],["LS",9],["RS",10]];
		//Object which mimics standard browser api
		var result = {
			pressed: false,
			touched: false,
			value: 0
		};
		if(!this.validIndex(index)) return result;
		buttonName = buttonName.toUpperCase();
		let currentMapping = standardMappings;
		if(!this.isStandard(index)){ //Handle the unusual d-pad on linux
			currentMapping = nonStandardMappings;
			let yVal = navigator.getGamepads()[index].axes[7];
			let xVal = navigator.getGamepads()[index].axes[6];
			if(buttonName=="UP"){
				if(yVal == -1){
					result.pressed = true;
					result.touched = true;
					result.value = yVal
				}
			}
			else if(buttonName=="DOWN"){
				if(yVal == 1){
					result.pressed = true;
				}
			}
			else if(buttonName=="LEFT"){
				if(xVal == -1){
					result.pressed = true;
				}
			}
			else if(buttonName=="RIGHT"){
				if(xVal == 1){
					result.pressed = true;
				}
			}
		}
		let buttonIndex = -1;
		for(let i=0;i<currentMapping.length;i++){ //loop through mappings to get correct index
			let c = currentMapping[i];
			if(c[0]==buttonName) buttonIndex = c[1];
		}
		if(buttonIndex<0) return result;
		result = navigator.getGamepads()[index].buttons[buttonIndex];
		
		return result;
	}
	
	//Returns array containing x and y position of analogue stick
	getStick(index, side){
		var result = [0,0];
		if(!this.validIndex(index)) return result;
		if(side=="left"){
			//var offset = axis == "x" ? 0:2;
			result[0] = navigator.getGamepads()[index].axes[0];
			result[1] = navigator.getGamepads()[index].axes[1];
		}
		else{
			//Offset if not windows xinput (probably linux)
			var offset = navigator.getGamepads()[index].id.toLowerCase().indexOf("xinput")<0 ? 3:2;
			result[0] = (navigator.getGamepads()[index].axes[0+offset]);
			result[1] = (navigator.getGamepads()[index].axes[1+offset]);
		}
		return result;
	}
	
	/*
	Gets Magnitude of gamepad joystick
	*/
	getStickMagnitude(index, side){
		var result = 0;
		//if(!this.validIndex(index)) return result;
		var xy = this.getStick(index, side);
		//pythagoras
		result = Math.sqrt(Math.pow(xy[0],2)+Math.pow(xy[1],2));
		return result;
	}
	
	//Returns object containing trigger parameters
	getTrigger(index, side){
		var result = {
			pressed: false,
			touched: false,
			value: 0
		};
		if(!this.validIndex(index)) return result;
		
		if(!this.isStandard(index)){ //not xinput
			var axesIndex = side=="left" ? 2:5;
			var value = navigator.getGamepads()[index].axes[axesIndex];
			if(value>0){
				result.pressed = true;
				result.touched = true;
				result.value = value;
			}
			return result;
		}
		else{ //probably xinput (or compatible
			var buttonIndex = side=="left" ? 6:7;
			result = navigator.getGamepads()[index].buttons[buttonIndex];
			return result;
		}
	}
	
	/*
	Experimental feature
	Vibrates the controller
	*/
	vibrate(index, strong, weak, length){
		if(!this.validIndex(index) || !this.nonStandardAllowed) return;
		if(typeof navigator.getGamepads()[index].vibrationActuator==='undefined'){
			this.consolePrint("No vibration support found");
			return;
		}
		var target = navigator.getGamepads()[index];
		target.vibrationActuator.playEffect("dual-rumble",{
			startDelay: 0,
			duration: length,
			weakMagnitude: weak,
			strongMagnitude: strong,
		});
		
	}
}
