function autoIncrementInstant() {

	if (gamePaused) return;

	iterCount++;

	let currBest = Infinity;
	let currInd = 0;
	let heldBest = Infinity;
	let heldInd = 0;

	// Try to find best orientation
	const allOrientationsCurrent = tryAllOrientations(currentPiece, boardState, weightConfig);
	if (allOrientationsCurrent.length > 0) {
		for (let i = 0; i < allOrientationsCurrent.length; i++) {
			if (allOrientationsCurrent[i].score < currBest) {
				currInd = i;
				currBest = allOrientationsCurrent[i].score;
			}
		}
	} else {
		console.log("No current piece orientations available");
	}

	// Also try to find best orientation of held piece
	const allOrientationsHeld = tryAllOrientations(heldPiece, boardState, weightConfig);
	if (allOrientationsHeld.length > 0) {
		for (let i = 0; i < allOrientationsHeld.length; i++) {
			if (allOrientationsHeld[i].score < heldBest) {
				heldInd = i;
				heldBest = allOrientationsHeld[i].score;
			}
		}
	} else {
		console.log("No held piece orientations available");
	}


	// Check to see if the game is over
	if (allOrientationsCurrent.length == 0 && allOrientationsHeld.length == 0) {
		console.log("Game complete");
		gamePaused = true;
		return;
	}

	// Find the best orientation
	if (heldBest < currBest) {
		for (let i = 0; i < boardState.length; i++) {
			boardState[i] = allOrientationsHeld[heldInd].board[i];
		}
		switchHeldPiece();
		hasPieceLanded = true;
	} else {
		for (let i = 0; i < boardState.length; i++) {
			boardState[i] = allOrientationsCurrent[currInd].board[i];
		}
		hasPieceLanded = true;
	}

	// First check to see if any lines were cleared
	let linesCleared = 0;
	for (let j = boardDimensions.height-1; j > 0; j--) {
		if (boardState[j].every(block => block != 7)) {
			// Full line
			boardState.splice(j, 1);
			boardState.unshift( [7, 7, 7, 7, 7, 7, 7, 7, 7, 7] );

			j++;
			lines++;
			linesCleared++;
		}
	}
	
	// Test to see if there is a clear board
	let noneLeft = !boardState.some( row => row.some( block => block != 7));
	
	if (noneLeft) {
		if (linesCleared == 4) {
			if (prevRowTetrisClearOut) {
				// We got 2 tetris's in a row
				score += perfectClearScore[5];
			} else {
				score += perfectClearScore[4];
			}
			prevRowTetrisClearOut = true;
		} else {
			prevRowTetrisClearOut = false;
			score += perfectClearScore[linesCleared];
		}
	} else {
		prevRowTetrisClearOut = false;
	}


	score += scoresForLines[linesCleared];

	// Refresh score line
	scoreEle.innerHTML = score;
	linesEle.innerHTML = lines;
	ratioEle.innerHTML = lines != 0 ? Math.round(score / lines * 100) / 100 : 0;
	fitnessEle.innerHTML = score * lines;

	// Pick a new piece
	currentPiece = {...nextPiece};
	nextPiece = generateAPiece();

	drawNextPiece();

	setTimeout(autoIncrementInstant, progressSpeed);
}