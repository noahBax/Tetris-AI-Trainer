#include "tetrisRules.hpp"

class Possibility {

public:
	TetrisBoard board;
	double score;

	Possibility(TetrisBoard &board, double score);
};