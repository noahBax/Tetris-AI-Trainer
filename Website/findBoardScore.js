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

	// console.log("hey hey",highestBlock, perfectClearScore[linesCleared], highestBlock - linesCleared, weightConfig.perfectScoreCoefficient);

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