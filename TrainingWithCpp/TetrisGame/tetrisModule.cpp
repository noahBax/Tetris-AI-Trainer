#include "tetrisModule.hpp"
#include <iostream>
#include <vector>
#include <numeric>
#include "cmath"
#include <algorithm>
#include "../TetrisGame/possibility.hpp"
#include "piece.hpp"


#include <chrono>
#include <thread>

const int scoresForLines[] 		= { 0, 40, 100, 300, 1200 };
const int perfectClearScores[] 	= { 0, 800, 1200, 1800, 2000, 3200 };

double findBoardScore(TetrisBoard &board, AI_Instance &weightConfig, int timeMovedDown) {

	double crackiness = 0;			// Spaces that are empty and in the column directly adjacent to the current one
	double unreachableHoles = 0;	// Holes which we can't ever fill. They are inaccessible
	double unfillableHoles = 0;		// Holes which we can only partially fill. 3 deep or deeper
	double boardClearScore = 0;
	int rightColumnCount = 0;
	int linesCleared = 0;

	// Count the number of blocks in the rightmost column

	int depthList[BOARD_WIDTH] = {};	// The row of the minimum depth block in a column
	std::fill_n(depthList, BOARD_WIDTH, BOARD_HEIGHT);
	int columnCounts[BOARD_WIDTH] = {};	// The counts of blocks in each column
	int wellSize[BOARD_WIDTH] = {};		// Used to keep track of the size of a well in each column


	// Yes, yes the following code might look a bit weird
	// I'm trying to avoid looping through columns in the board by just going through it line by line
	// It may not offer the speed benefits I think it does (given the scale), but its fun to think like this

	int rightCounter = 0;
	int leftCounter = 0;

	for (int j = 0; j < BOARD_HEIGHT; j++) {
		int blocksInLine = 0;

		// Do an initial scan to update non-holes
		for (int i = 0; i < BOARD_WIDTH; i++) {
			// Update heights if need be
			if (board[j][i] != 7) {
				if (depthList[i] == BOARD_HEIGHT) depthList[i] = j;
				
				// Increase column counts
				columnCounts[i]++;
				
				// Increase the number of blocks in the line
				blocksInLine++;

				if (wellSize[i] >= 3) {
					unfillableHoles += pow(wellSize[i], weightConfig.wellCoefficient);
				}

				// Reset well counter
				wellSize[i] = 0;
			}

		}

		for (int i = 0; i < BOARD_WIDTH; i++) {
			if (board[j][i] == 7) {		// Holes

				// Adjust crackiness. It's just adding booleans, calm down Noah
				short crackCount = 0;

				leftCounter += (i != 0 && j >= depthList[i-1]);
				rightCounter += (i != 0 && j >= depthList[i+1]);

				crackCount += (i != 0 && j >= depthList[i-1]);	// If column is higher left of us
				crackCount += (i != 9 && j >= depthList[i+1]);	// If column is higher right of us
				
				crackiness += crackCount * pow((BOARD_HEIGHT - j + 1), weightConfig.crackinessCoefficient);
				
				// Adjust unreachable holes
				if (j > depthList[i]) {
					unreachableHoles += pow(BOARD_HEIGHT - j + 1, weightConfig.unreachableCoefficient);
				}

				// Increase well size
				if (j >= depthList[i]) wellSize[i]++;

			}
		}

		// Increment the right column counter if necessary
		if (board[j][BOARD_WIDTH - 1] != 7) rightColumnCount++;

		// Check to see if we cleared a line
		if (blocksInLine == BOARD_WIDTH) linesCleared++;
	}


	// Okay, after finding info, lets get some statistics
	// Find height aggregate
	double heightAgg = (double) (BOARD_HEIGHT * BOARD_WIDTH - std::accumulate(depthList, depthList + BOARD_WIDTH, 0)) / BOARD_WIDTH;

	// Now bumpiness
	int bumpiness = 0;
	for (short i = 1; i < BOARD_WIDTH; i++) {
		bumpiness += abs(depthList[i] - depthList[i-1]);
	}

	// Find highest block
	int highestBlock = BOARD_HEIGHT - std::accumulate(depthList, depthList + BOARD_WIDTH, BOARD_HEIGHT, [](int a, int b) {
		return a < b ? a : b;
	});

	// Average the amount in columns
	double averageColumnLoad = std::accumulate(columnCounts, columnCounts + BOARD_WIDTH, 0) / BOARD_WIDTH;

	// Factor in the number of points the move would have given us
	double scoreValue = pow(scoresForLines[linesCleared], weightConfig.scoreCoefficient);
	if (highestBlock - linesCleared == 0) boardClearScore = pow(perfectClearScores[linesCleared], weightConfig.perfectScoreCoefficient);

	// std::cout << "crackiness: " << crackiness << std::endl;
	// std::cout << "unreachableHoles: " << unreachableHoles << std::endl;
	// std::cout << "unfillableHoles: " << unfillableHoles << std::endl;
	// std::cout << "heightAgg: " << heightAgg << std::endl;
	// std::cout << "linesCleared: " << linesCleared << std::endl;
	// std::cout << "bumpiness: " << bumpiness << std::endl;
	// std::cout << "highestBlock: " << highestBlock << std::endl;
	// std::cout << "averageColumnLoad: " << averageColumnLoad << std::endl;
	// std::cout << "scoreValue: " << scoreValue << std::endl;
	// std::cout << "rightColumnCount: " << rightColumnCount << std::endl;
	// std::cout << "timeMovedDown: " << timeMovedDown << std::endl;
	// std::cout << "boardClearScore: " << boardClearScore << std::endl;

	double finalScore = weightConfig.crackiness * crackiness +
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

std::vector<Possibility>* tryAllOrientations(Piece piece, TetrisBoard &board, AI_Instance &weightConfig) {

	// Create the return vector
	std::vector<Possibility>* possibilities = new std::vector<Possibility>;

	// Loop through each possible turn of the piece
	for (int t = 0; t < 4; t++) {
		piece.position[0] = -1;	// We're trying to move it to the left because there are gaps in the matrix
		piece.position[1] = 0;
		if (!piece.canPieceFit(board)) piece.position[0]++;

		// Try to move it left again, this is really only for the i piece
		piece.position[0]--;
		if (!piece.canPieceFit(board)) piece.position[0]++;
		
		// Keep trying until the piece won't fit AND we're at the edge of the board
		for (int a = 0; a < BOARD_WIDTH; a++) {

			if (piece.canPieceFit(board)) {

				// Create a copy of the board
				TetrisBoard boardCopy;
				for (int j = 0; j < BOARD_HEIGHT; j++) {
					for (int i = 0; i < BOARD_WIDTH; i++) {
						boardCopy[j][i] = board[j][i];
					}
				}

				// Cast the piece shadow onto the board
				const int timeMovedDown = piece.findPieceShadow(boardCopy);
				const double score = findBoardScore(boardCopy, weightConfig, timeMovedDown);

				// Write our results to the return vector
				possibilities->push_back(Possibility(
					boardCopy,
					score
				));
			}
			piece.position[0]++;
		}
		
		piece.rotatePiece(true);
	}

	return possibilities;
}

void pieceCleanup(int &lines, int &score, bool &prevRowTetrisClearOut, TetrisBoard &board) {

	// First check to see if any of the lines got cleared
	int linesCleared = 0;
	for (int j = BOARD_HEIGHT - 1; j > 1; j--) {

		bool lineHasSpace = false;

		for (int i = 0; i < BOARD_WIDTH; i++) {

			// If any element in the row is empty, continue
			if (board[j][i] == 7) {
				lineHasSpace = true;
				break;
			}
		}
		// If the line has a space, we don't score it
		if (lineHasSpace) continue;

		// If the line has no spaces, we need to move the board down
		for (int k = j; k > 0; k--) {
			for (int l = 0; l < BOARD_WIDTH; l++) {
				board[k][l] = board[k-1][l];
			}
		}

		// Set the topmost row to all 7's
		for (int l = 0; l < BOARD_WIDTH; l++) {
			board[0][l] = 7;
		}

		// Make sure we stay on the same row
		j++;

		// Increment appropriate stuff
		lines++;
		linesCleared++;
	}

	score += scoresForLines[linesCleared];

	bool clearBoard = true;
	for (int j = BOARD_HEIGHT - 1; j > 2; j--) {
		for (int i = 0; i < BOARD_WIDTH; i++) {
			if (board[j][i] != 7) {
				clearBoard = false;
				break;
			}
		}
		if (!clearBoard) break;
	}

	if (clearBoard) {
		if (linesCleared == 4) {
			if (prevRowTetrisClearOut) {
				// 2 tetris's in a row!
				score += perfectClearScores[5];
			} else {
				score += perfectClearScores[4];
			}
			prevRowTetrisClearOut = true;
		} else {
			prevRowTetrisClearOut = false;
			score += perfectClearScores[linesCleared];
		}
	} else {
		prevRowTetrisClearOut = false;
	}

}

void switchHeldPiece(Piece &currentPiece, Piece &heldPiece) {
	Piece temp = currentPiece;
	currentPiece = heldPiece;
	heldPiece = temp;
}

void runTetrisGame(AI_Instance weightConfig, int maxPieces, int (&results)[3], std::mt19937 &generator) {

	TetrisBoard boardState = {
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 },
		{ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7 }
	};

	int lines = 0;
	int score = 0;
	int piecesPlaced = 0;
	bool prevRowTetrisClearOut = false;
	
	Piece currentPiece = Piece(generator);
	Piece nextPiece    = Piece(generator);
	Piece heldPiece    = Piece(generator);

	bool running = true;

	while (running && piecesPlaced < maxPieces) {

		piecesPlaced++;

		// Find the best orientation to put a piece in
		int currBestInd = -1;
		double currBestScore = 0;
		int heldBestInd = -1;
		double heldBestScore = 0;


		// Find the best orientation of the current piece
		std::vector<Possibility>* allOrientationsCurrent = tryAllOrientations(currentPiece, boardState, weightConfig);
		if (allOrientationsCurrent->size() > 0) {
			currBestScore = (*allOrientationsCurrent)[0].score;
			currBestInd = 0;
			for (int i = 0; i < allOrientationsCurrent->size(); i++) {
				if ((*allOrientationsCurrent)[i].score < currBestScore) {
					currBestInd = i;
					currBestScore = (*allOrientationsCurrent)[i].score;
				}
			}
		}

		// Of the held piece
		std::vector<Possibility>* allOrientationsHeld = tryAllOrientations(heldPiece, boardState, weightConfig);
		if (allOrientationsHeld->size() > 0) {
			heldBestScore = (*allOrientationsHeld)[0].score;
			heldBestInd = 0;
			for (int i = 0; i < allOrientationsHeld->size(); i++) {
				if ((*allOrientationsHeld)[i].score < heldBestScore) {
					heldBestInd = i;
					heldBestScore = (*allOrientationsHeld)[i].score;
				}
			}
		}

		
		// If there are no orientations available, consider the game lost
		if (allOrientationsCurrent->size() == 0 && allOrientationsHeld->size() == 0) {
			running = false;

			// Get rid of the lists that got returned
			delete allOrientationsCurrent;
			delete allOrientationsHeld;
			
			continue;
		}

		// Pick the overall best orientation and stamp it on the board
		if (heldBestScore < currBestScore && heldBestInd != -1) {
			
			for (int j = 0; j < BOARD_HEIGHT; j++) {
				for (int i = 0; i < BOARD_WIDTH; i++) {
					boardState[j][i] = (*allOrientationsHeld)[heldBestInd].board[j][i];
				}
			}

			switchHeldPiece(currentPiece, heldPiece);
		} else if (currBestInd != -1) {
			
			for (int j = 0; j < BOARD_HEIGHT; j++) {
				for (int i = 0; i < BOARD_WIDTH; i++) {
					boardState[j][i] = (*allOrientationsCurrent)[currBestInd].board[j][i];
				}
			}
		} else {
			running = false;
			
			// Get rid of the lists that got returned
			delete allOrientationsCurrent;
			delete allOrientationsHeld;

			continue;
			// Why would it do this? Idk
			// I had it in my old code
		}



		// Get rid of the lists that got returned
		delete allOrientationsCurrent;
		delete allOrientationsHeld;

		// std::cout << "check6" << std::endl;
		
		pieceCleanup(lines, score, prevRowTetrisClearOut, boardState);

		// Get a new current piece
		currentPiece = nextPiece;
		nextPiece = Piece(generator);

	}

	results[0] = score;
	results[1] = lines;
	results[2] = piecesPlaced;

	return;
}