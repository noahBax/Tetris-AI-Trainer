#include "../ai_instance.hpp"
#include "tetrisRules.hpp"
#include <random>

void runTetrisGame(AI_Instance weightConfig, int maxPieces, int (&results)[3], std::mt19937 &generator);
double findBoardScore(TetrisBoard &board, AI_Instance &weightConfig, int timeMovedDown);