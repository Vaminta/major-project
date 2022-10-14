/*
A class that does stuff
*/
class Path{
	
	constructor(){
		this.tiles = [];
		this.dx;
		this.dy;
		this.pathfindDate = 0; //pathfinding run date
		this.pathFound = false;
		this.generatedPathNodes = [];
		this.generatedPathCoords = [];
	}
	
	//returns true or false if point in map is occupied
	isOccupiedSpace(point,entities){
		var result = false;
		for(var i=0; i<entities.length; i++){
			var entity = entities[i];
			if(point[0]>=entity.x && point[0]<=entity.x+entity.width && point[1]>= entity.y && point[1]<=entity.y+entity.height){
				if(entity.solid) {
					result = true;
					//console.log(entity);
					//console.log(point[0]+" "+point[1]);
				}
			}
		}
		return result;
	}
	
	generateNavGrid(gameData,startPoint,endPoint){
		this.tiles = [];
		this.dx = gameData.options.mapSize[0]+2; //+2 adds border
		this.dy = gameData.options.mapSize[1]+2;
		var scale = gameData.options.scale;
		var tileWidth = gameData.options.tileDimensions[0] * scale;
		var tileHeight = gameData.options.tileDimensions[1] * scale;
		for(var ly=0; ly<this.dy; ly++){ //loop y - (map) dimension y
			for(var lx=0; lx<this.dx; lx++){
			
				var traversable = true;
				if(lx==0||ly==0|| lx==this.dx-1|| ly==this.dy-1) traversable = false; //boundaries
				var currentPoint = [((lx-1)*tileWidth)+tileWidth/2, ((ly-1)*tileHeight)+tileHeight/2];
				if(this.isOccupiedSpace(currentPoint,gameData.entities)) traversable = false;
				
				var start = false;
				if(lx-1 == startPoint[0] && ly-1 == startPoint[1]) start = true;
				
				var end = false;
				if(lx-1 == endPoint[0] && ly-1 == endPoint[1]) end = true;
				
				if(start||end) traversable = true;
				
				var tile = new Object();
				tile.x = lx;
				tile.y = ly;
				tile.traversable = traversable;
				tile.gCost = 9999; //from start
				tile.hCost = 9999; //to end
				tile.fCost = 99999;
				tile.inspected = false;
				tile.origin = null;
				tile.start = start;
				tile.end = end;
				this.tiles.push(tile);
			}
		}
	}
	
	/*
		returns the euclidean distance between two tiles
	*/
	distanceBetweenTiles(a,b){
		let cx = a.x-b.x;
		let cy = a.y-b.y;
		let result = Math.sqrt((cx*cx)+(cy*cy));
		return result;
	}
	
	pathfind(){
		this.pathfindDate =  new Date();
		this.pathFound = false;
		var startNode;
		var endNode;
		var tiles = this.tiles;
		for(var i=0; i<tiles.length; i++){
			if(tiles[i].start) startNode = i;
			if(tiles[i].end) endNode = i;
		}
		if(!startNode || !endNode){
			if(!startNode) console.error("path.js - missing start node");
			return;
		}
		var cn = startNode; //current Node
		tiles[cn].gCost = 0;
		var pathfinding = true;
		let loops = 0;
		while(pathfinding==true){
			let currentNode = tiles[cn];
			const possibleNeighbourPositions = [-1,1,-this.dx,this.dx];
			let validNeighbours = [];
			for(let i=0;i<possibleNeighbourPositions.length;i++){
				let possibleNeighbour = tiles[cn+possibleNeighbourPositions[i]];
				if(possibleNeighbour.traversable) validNeighbours.push(possibleNeighbourPositions[i]);
			}
			for(let nn=0;nn<validNeighbours.length;nn++){ //neighbour node
				let neighbourNode = tiles[cn+validNeighbours[nn]];
				let gCost = tiles[cn].gCost + this.distanceBetweenTiles(currentNode,neighbourNode);
				let hCost = this.distanceBetweenTiles(neighbourNode,tiles[endNode]);
				let fCost = gCost+hCost;
				//console.log(gCost+ " " +hCost+ " " +fCost);
				if(fCost<neighbourNode.fCost){
					neighbourNode.gCost = gCost;
					neighbourNode.hCost = hCost;
					neighbourNode.fCost = fCost;
					neighbourNode.origin = cn;
				}
			}
			currentNode.inspected = true;
			let currentLowest = 99998;
			let newNode = null;
			for(let i=0;i<tiles.length;i++){
				let c = tiles[i]; //current
				if(c.fCost<currentLowest && !c.inspected && c.traversable){
					currentLowest = c.fCost;
					newNode = i;
				}
			}
			//console.log("new node: " + newNode);
			if(newNode==null){
				console.log("no path could be found");
				break;
			}
			else if(newNode==endNode){
				pathfinding = false;
				//tiles[endNode].origin = cn;
				this.pathFound = true;
				this.processPath(endNode);
			}
			else{
				cn = newNode;
			}
			loops++;
			if(loops>360){
				console.log("too many loops");
				break;
			}
			
		}
	}
	
	/*
	Backtracks from the end to the start to get path
	*/
	processPath(endNode){
		var currentNode = this.tiles[endNode];
		let path = [];
		let loops=0;
		while(!currentNode.start){
			currentNode.finalPath = true;
			path.push(currentNode);
			currentNode = this.tiles[currentNode.origin];
			loop++;
			if(loops>40){
				console.log("process path too many loops");
				break;
			}
		}
		let inversePath = [];
		let coordinatePath = [];
		for(let i=path.length;i>0;i--){
			let c = path[i-1]; //current
			inversePath.push(c);
			let x = c.x-1;
			let y = c.y-1;
			coordinatePath.push([x,y]);
		}
		this.generatedPathNodes = inversePath;
		this.generatedPathCoords = coordinatePath;
	}
	
	/*
	Prints a visual of the current status of the pathfinding grid to the console
	*/
	consolePrintGrid(){
		for(var ly=0; ly<this.dy; ly++){ //loop y - (map) dimension y
			var lineString = "";
			for(var lx=0; lx<this.dx; lx++){
				var currentTile = this.tiles[(ly*this.dx)+lx];
				if(currentTile.start) lineString += " S ";
				else if(currentTile.end) lineString += " E ";
				else if(currentTile.finalPath) lineString += " # ";
				else if(currentTile.origin!=null) lineString += " + ";
				else if(currentTile.traversable) lineString += "   ";
				else lineString += "[X]";
			}
			console.log(lineString);
		}
	}
	
}
