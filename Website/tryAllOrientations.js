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
			if (canPieceFit(pieceCopy, boardCopy)){
				const shadConfig = findPieceShadow(pieceCopy, boardCopy);
				const newBoard = shadConfig[1];
				let score

				// If we are at the top we want to know what the best position for the next piece is
				score = findBoardScore(newBoard, weightConfig, shadConfig[0].movedDown);
				// console.log("NEWNEWNEWNEW----------", score)
				// oldScore = findBoardScoreOG(newBoard, weightConfig, shadConfig[0]);
				// console.log("OLDOLDOLDOLDtttttttttt", oldScore);
				// if (Math.abs(score - oldScore) > 0.1) {
				// 	console.log("Dif");
				// }
				
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