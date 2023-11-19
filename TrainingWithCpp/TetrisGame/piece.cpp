#include <vector>
#include "piece.hpp"
#include "tetrisRules.hpp"
#include <iostream>

Piece::Piece(std::mt19937 &generator) {
	short pieceNum = generator() % NUMBER_PIECES;
	shape = tetrominoes[pieceNum];
}

void Piece::rotatePiece(bool isRight) {
	const int size = shape.size();
	const Matrix backup = shape;

	if (isRight) {
		for (int j = 0; j < size; j++) {
			for (int i = 0; i < size; i++) {
				shape[i][size - 1 - j] = backup[j][i];
			}
		}
	}  else {
		for (int j = 0; j < size; j++) {
			for (int i = 0; i < size; i++) {
				shape[size - 1 - i][j] = backup[j][i];
			}
		}
	}
}

bool Piece::canPieceFit(const TetrisBoard &board) {

	// Loop through rows in board and check to see if either or both are 7
	for (int j = 0; j < shape.size(); j++) {
		for (int i = 0; i < shape.size(); i++) {
			bool shapeIsBlock = shape[j][i] != 7;
			bool belowBoard = position[1] + j >= BOARD_HEIGHT;
			bool boardIsBlock = (board[position[1] + j][position[0] + i] != 7);
			bool leftOfBoard = position[0] + i < 0;
			bool rightOfBoard = position[0] + i >= BOARD_WIDTH;
			if (shapeIsBlock && (belowBoard || boardIsBlock || leftOfBoard || rightOfBoard)) {
				return false;
			}
		}
	}

	return true;
}

bool Piece::movePieceDown(const TetrisBoard &board) {
	if (!canPieceFit(board)) return false;

	position[1]++;

	if (canPieceFit(board)) {
		return true;
	} else {
		position[1]--;
		return false;
	}
}

int Piece::findPieceShadow(TetrisBoard &shadowBoard) {

	// Keep track of the original position of us
	int originalPosition[2];
	originalPosition[0] = position[0];
	originalPosition[1] = position[1];

	int movedDown = 0;

	while (movePieceDown(shadowBoard)) {
		movedDown++;
	}

	// Draw the shadow onto the shadow board
	for (int j = 0; j < shape.size() && position[1] + j < BOARD_HEIGHT; j++) {

		for (int i = 0; i < shape.size() && position[0] + i < BOARD_WIDTH; i++) {

			if (shape[j][i] != 7) {
				shadowBoard[position[1] + j][position[0] + i] = shape[j][i];
			}
		}
	}

	// Restore our original position
	position[0] = originalPosition[0];
	position[1] = originalPosition[1];
	
	return movedDown;
}

void Piece::print() {
	for (int j = 0; j < shape.size(); j++) {
		for (int i = 0; i < shape.size(); i++) {
			if (shape[j][i] == 7) std::cout << ".  ";
			else std::cout << shape[j][i] << ", ";
		}
		std::cout << std::endl;
	}
	std::cout << std::endl;
}