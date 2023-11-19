const boardDimensions = {
	width: 10,
	height: 20
};
const tetrominoes = [
	[	/* cyan */
		[ 7, 7, 7, 7 ],
		[ 0, 0, 0, 0 ],
		[ 7, 7, 7, 7 ],
		[ 7, 7, 7, 7 ],
	],
	[	/* "blue" */
		[ 1, 7, 7 ],
		[ 1, 1, 1 ],
		[ 7, 7, 7 ],
	],
	[	/* "orange" */
		[ 7, 7, 2 ],
		[ 2, 2, 2 ],
		[ 7, 7, 7 ],
	],
	[	/* "yellow" */
		[ 3, 3 ], 
		[ 3, 3 ], 
	],
	[	/* "green" */
		[ 7, 4, 4 ],
		[ 4, 4, 7 ],
		[ 7, 7, 7 ],
	],
	[	/* "purple" */
		[ 7, 5, 7 ],
		[ 5, 5, 5 ],
		[ 7, 7, 7 ],
	],
	[	/* "red" */
		[ 6, 6, 7 ],
		[ 7, 6, 6 ],
		[ 7, 7, 7 ],
	]
];
const scoresForLines = [0, 40, 100, 300, 1200];
const perfectClearScore = [0,800, 1200, 1800, 2000, 3200];


function generateAPiece() {
	const pieceNum = Math.floor(Math.random() * tetrominoes.length);
	return {
		pieceNum: pieceNum,
		shape: [...tetrominoes[pieceNum]],
		position: {
			x: 3, y: 0
		},
		rotations: 0,
	}
}


function canPieceFit(piece, board) {
	
	// Loop through rows of piece at locations in board and check to see if either or both are 7
	for (let j = 0; j < piece.shape.length; j++) {

		for (let i = 0; i < piece.shape[j].length; i++) {

			if (piece.shape[j][i] != 7 && (piece.position.y + j >= boardDimensions.height || (board[piece.position.y + j][piece.position.x + i] != 7))) 
				return false;
		}
	}

	return true;
}

function movePieceDown(piece, board) {
	if (!canPieceFit(piece, board)) return false;
	piece.position.y++;
	if (canPieceFit(piece, board)) {
		return true;
	} else {
		piece.position.y--;
		return false;
	}
}

function rotatePiece(piece, direction) {

	const size = piece.shape.length
	let rotatedMatrix = []

	// Initialize the rotatedMatrix with zeros
	for (let i = 0; i < size; i++) {
		rotatedMatrix.push(new Array(size).fill(0));
	}

	if (direction === "right") {
		for (let j = 0; j < size; j++) {
			for (let i = 0; i < size; i++) {
				rotatedMatrix[i][size - 1 - j] = piece.shape[j][i];
			}
		}
	} else if (direction === "left") {
		for (let j = 0; j < size; j++) {
			for (let i = 0; i < size; i++) {
				rotatedMatrix[size - 1 - i][j] = piece.shape[j][i];
			}
		}
	}

	piece.shape = rotatedMatrix;
}

function findPieceShadow(piece, board) {
	const pieceShadow = structuredClone(piece);
	const boardShadow = structuredClone(board);

	let movedDown = 0;

	while (movePieceDown(pieceShadow, boardShadow)) {
		movedDown++;
	}
	pieceShadow.movedDown = movedDown;

	// Draw the piece onto the board
	for (let j = 0; j < pieceShadow.shape.length && pieceShadow.position.y + j < boardDimensions.height; j++) {

		for (let i = 0; i < pieceShadow.shape[j].length && pieceShadow.position.x + i < boardDimensions.width; i++) {

			if (pieceShadow.shape[j][i] != 7) {
				boardShadow[pieceShadow.position.y + j][pieceShadow.position.x + i] = pieceShadow.shape[j][i]
			}
		}
	}

	return [pieceShadow, boardShadow];
}

function findBoardScore(board, weightConfig, timeMovedDown) {

	let crackiness = 0;			// Spaces that are empty and in the column directly adjacent to the current one
	let unreachableHoles = 0;	// Holes which we can't ever fill. They are inaccessible
	let unfillableHoles = 0;	// Holes which we can only partially fill. 3 deep or deeper
	let boardClearScore = 0;
	let rightColumnCount = 0;
	let linesCleared = 0;

	// Count the number of blocks in the rightmost column
	// The row of the minimum depth block in a column
	let depthList = [boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height, boardDimensions.height];
	let columnCounts = [0,0,0,0,0,0,0,0,0,0];	// The counts of blocks in each column
	let wellSize = [0,0,0,0,0,0,0,0,0,0];		// Used to keep track of the size of a well in each column


	// Yes, yes the following code might look a bit weird
	// I'm trying to avoid looping through columns in the board by just going through it line by line
	// It may not offer the speed benefits I think it does (given the scale), but its fun to think like this
	// and to practice!

	let rightCounter = 0;
	let leftCounter = 0;

	for (let j = 0; j < boardDimensions.height; j++) {
		let blocksInLine = 0;

		// Do an initial scan to update non-holes
		for (let i = 0; i < boardDimensions.width; i++) {
			// Update heights if need be
			if (board[j][i] != 7) {
				if (depthList[i] == boardDimensions.height) depthList[i] = j;
				
				// Increase column counts
				columnCounts[i]++;
				
				// Increase the number of blocks in the line
				blocksInLine++;

				if (wellSize[i] >= 3) {
					unfillableHoles += wellSize[i] ** weightConfig.wellCoefficient;
				}

				// Reset well counter
				wellSize[i] = 0;
			}

		}

		for (let i = 0; i < boardDimensions.width; i++) {
			if (board[j][i] == 7) {		// Holes

				// Adjust crackiness. It's just adding booleans, calm down Noah
				let crackCount = 0;

				leftCounter += (i != 0 && j >= depthList[i-1]);
				rightCounter += (i != 0 && j >= depthList[i+1]);

				crackCount += (i != 0 && j >= depthList[i-1]);	// If column is higher left of us
				crackCount += (i != 9 && j >= depthList[i+1]);	// If column is higher right of us
				
				crackiness += crackCount * (boardDimensions.height - j + 1) ** weightConfig.crackinessCoefficient;
				
				// Adjust unreachable holes
				if (j > depthList[i]) {
					unreachableHoles += (boardDimensions.height - j + 1) ** weightConfig.unreachableCoefficient;
				}

				// Increase well size
				if (j >= depthList[i]) wellSize[i]++;

			}
		}

		// Increment the right column counter if necessary
		if (board[j][boardDimensions.width - 1] != 7) rightColumnCount++;

		// Check to see if we cleared a line
		if (blocksInLine == boardDimensions.width) linesCleared++;
	}


	// Okay, after finding info, lets get some statistics
	// Find height aggregate
	let heightAgg = (boardDimensions.height * boardDimensions.width - depthList.reduce((a, b) => a + b)) / boardDimensions.width;

	// Now bumpiness
	let bumpiness = 0;
	for (let i = 1; i < boardDimensions.width; i++) {
		bumpiness += Math.abs(depthList[i] - depthList[i-1]);
	}

	// Find highest block
	let highestBlock = boardDimensions.height - depthList.reduce( (a, b) => a < b ? a : b)

	// Average the amount in columns
	let averageColumnLoad = columnCounts.reduce((a, b) => a + b) / boardDimensions.width;

	// Factor in the number of points the move would have given us
	let scoreValue = scoresForLines[linesCleared] ** weightConfig.scoreCoefficient;
	if (highestBlock - linesCleared == 0) boardClearScore = perfectClearScore[linesCleared] ** weightConfig.perfectScoreCoefficient;

	// console.log(depthList);

	// console.log("crackiness: " + crackiness);
	// console.log("unreachableHoles: " + unreachableHoles);
	// console.log("unfillableHoles: " + unfillableHoles);
	// console.log("heightAgg: " + heightAgg);
	// console.log("linesCleared: " + linesCleared);
	// console.log("bumpiness: " + bumpiness);
	// console.log("highestBlock: " + highestBlock);
	// console.log("averageColumnLoad: " + averageColumnLoad);
	// console.log("scoreValue: " + scoreValue);
	// console.log("rightColumnCount: " + rightColumnCount);
	// console.log("timeMovedDown: " + timeMovedDown);
	// console.log("boardClearScore: " + boardClearScore);

	let finalScore = weightConfig.crackiness * crackiness +
				weightConfig.unreachableHoles * unreachableHoles +
				weightConfig.unfillableHoles * unfillableHoles +
				weightConfig.aggregate * heightAgg +
				weightConfig.linesCleared * linesCleared +
				weightConfig.bumpiness * bumpiness +
				weightConfig.highestBlock * highestBlock +
				weightConfig.averageColumnLoad * averageColumnLoad +
				weightConfig.scoreValue * scoreValue +
				weightConfig.rightColumn * rightColumnCount +
				weightConfig.movedDown * timeMovedDown +
				weightConfig.boardClearScore * boardClearScore;

	return finalScore;
}

function tryAllOrientations(piece, board, weightConfig) {
	
	let pieceCopy = structuredClone(piece);
	const boardCopy = structuredClone(board);
	
	const possibilities = [];
	
	for (t = 0; t < 4; t++) {
		pieceCopy.position = { x: 0, y: 0}
		// Try to move it left, this is really just for the i piece
		pieceCopy.position.x--;
		if (!canPieceFit(pieceCopy, boardCopy)) pieceCopy.position.x++;
		pieceCopy.position.x--;
		if (!canPieceFit(pieceCopy, boardCopy)) pieceCopy.position.x++;
		while (canPieceFit(pieceCopy, boardCopy) || pieceCopy.position.x + pieceCopy.shape.length < boardDimensions.width) {
			if (canPieceFit(pieceCopy, boardCopy)) {
				const shadConfig = findPieceShadow(pieceCopy, boardCopy);
				const newBoard = shadConfig[1];
				let score

				// If we are at the top we want to know what the best position for the next piece is
				score = findBoardScore(newBoard, weightConfig, shadConfig[0]);
				
				possibilities.push({
					rotations: t,
					position: {...pieceCopy.position},
					board: newBoard,
					score: score
				});
			}
			
			pieceCopy.position.x++;
		}
		rotatePiece(pieceCopy, "right")
	}

	return possibilities;
}

function runTetrisGame(weightConfig, maxPieces=Infinity) {

	const boardState = [
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
		[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,]
	];

	var lines = 0;
	var score = 0;
	var iterationCount = 0;

	var currentPiece = generateAPiece();
	// Move it down
	while (movePieceDown(currentPiece, boardState)) {}
	
	var nextPiece = generateAPiece();
	var heldPiece = generateAPiece();

	function switchHeldPiece() {
		const temp = heldPiece;
		heldPiece = currentPiece;
		currentPiece = temp;
		heldPiece.position.x = 3;
		heldPiece.position.y = 1;
	}

	function autoIncrement() {
	
		
		// Check to see if rows are filled
		let linesCleared = 0;
		for (let j = boardDimensions.height-1; j > 2; j--) {
			
			if (boardState[j].every(color => color != 7)) {
				// Level cleared, remove the row and then add a new one at the top

				boardState.splice(j, 1);
				boardState.unshift( [7, 7, 7, 7, 7, 7, 7, 7, 7, 7] );
				
				j++;
				lines++;
				linesCleared++;
			}

			
		}
		score += scoresForLines[linesCleared];

		
		let noneLeft = !boardState.some( row => row.some( block => block != 7));
		
		if (noneLeft) {
			if (linesCleared == 4) {
				if (prevRowTetrisClearOut) {
					// We got 2 tetris's in a row
					score += perfectClearScore[5];
				}
				prevRowTetrisClearOut = true;
			} else {
				prevRowTetrisClearOut = false;
				score += perfectClearScore[linesCleared];
			}
		} else {
			prevRowTetrisClearOut = false;
		}

		// Pick a new piece
		iterationCount++;
		
		currentPiece = {...nextPiece};
		nextPiece = generateAPiece();

		// Try to find best orientation
		const allOrientationsCurrent = tryAllOrientations(currentPiece, boardState, weightConfig);
		let currBest = Infinity;
		let currInd = 0;
		if (allOrientationsCurrent.length > 0) {
			for (let i = 0; i < allOrientationsCurrent.length; i++) {
				if (allOrientationsCurrent[i].score < currBest) {
					currInd = i;
					currBest = allOrientationsCurrent[i].score;
				}
			}
		}
		// Also try to find best orientation of held piece
		const allOrientationsHeld = tryAllOrientations(heldPiece, boardState, weightConfig);
		let heldBest = Infinity;
		let heldInd = 0;
		if (allOrientationsHeld.length > 0) {
			for (let i = 0; i < allOrientationsHeld.length; i++) {
				if (allOrientationsHeld[i].score < heldBest) {
					heldInd = i;
					heldBest = allOrientationsHeld[i].score;
				}
			}
		}

		
		if (allOrientationsCurrent.length == 0 && allOrientationsHeld.length == 0) {
			return false;
		}
		
		if (heldBest < currBest && allOrientationsHeld.length > 0) {
			for (let i = 0; i < boardState.length; i++) {
				boardState[i] = allOrientationsHeld[heldInd].board[i];
			}
			switchHeldPiece();
		} else if (allOrientationsCurrent.length > 0) {
			for (let i = 0; i < boardState.length; i++) {
				boardState[i] = allOrientationsCurrent[currInd].board[i];
			}
		} else {
			return false;
		}
	
	
		return true;
	
	}
	
	let running = true;
	
	while(running && iterationCount < maxPieces)
		running = autoIncrement();

	return {linesCleared: lines, score: score, percentSurvived: iterationCount / (maxPieces > 1000000000 ? 1 : maxPieces)};
}

module.exports = { runTetrisGame };