#include "possibility.hpp"
#include "tetrisRules.hpp"

Possibility::Possibility(TetrisBoard &board, double score) {
	
	for (int j = 0; j < BOARD_HEIGHT; j++) {
		for (int i = 0; i < BOARD_WIDTH; i++) {
			this->board[j][i] = board[j][i];
		}
	}

	this->score = score;
}