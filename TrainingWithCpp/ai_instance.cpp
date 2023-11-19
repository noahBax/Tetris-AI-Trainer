#include "ai_instance.hpp"
#include <stdlib.h>     /* srand rand */
#include <stdexcept>
#include <iostream>
#include <fstream>
#include <algorithm>
#include <string>
#include <regex>

// * Remember that every time you update this list, you have to go and update the class definition too
std::string weight_list[] = {
	"crackiness",
	"unreachableHoles",
	"unfillableHoles",
	"aggregate",
	"linesCleared",
	"bumpiness",
	"highestBlock",
	"scoreValue",
	"averageColumnLoad",
	"wellCoefficient",
	"rightColumn",
	"crackinessCoefficient",
	"unreachableCoefficient",
	"movedDown",
	"boardClearScore",
	"scoreCoefficient",
	"perfectScoreCoefficient"
};

void AI_Instance::initialize(double weightSize, std::mt19937 &generator) {

    std::uniform_real_distribution<> distr(-weightSize, weightSize);

	// Go through and assign random values
	crackiness = distr(generator);
	unreachableHoles = distr(generator);
	unfillableHoles = distr(generator);
	aggregate = distr(generator);
	linesCleared = distr(generator);
	bumpiness = distr(generator);
	highestBlock = distr(generator);
	scoreValue = distr(generator);
	averageColumnLoad = distr(generator);
	wellCoefficient = distr(generator);
	rightColumn = distr(generator);
	crackinessCoefficient = distr(generator);
	unreachableCoefficient = distr(generator);
	movedDown = distr(generator);
	boardClearScore = distr(generator);
	scoreCoefficient = distr(generator);
	perfectScoreCoefficient = distr(generator);
}

void AI_Instance::crossover(AI_Instance &parent1, AI_Instance &parent2) {

	// Compute the average of all the values
	crackiness = (parent1.crackiness + parent2.crackiness) / 2;
	unreachableHoles = (parent1.unreachableHoles + parent2.unreachableHoles) / 2;
	unfillableHoles = (parent1.unfillableHoles + parent2.unfillableHoles) / 2;
	aggregate = (parent1.aggregate + parent2.aggregate) / 2;
	linesCleared = (parent1.linesCleared + parent2.linesCleared) / 2;
	bumpiness = (parent1.bumpiness + parent2.bumpiness) / 2;
	highestBlock = (parent1.highestBlock + parent2.highestBlock) / 2;
	scoreValue = (parent1.scoreValue + parent2.scoreValue) / 2;
	averageColumnLoad = (parent1.averageColumnLoad + parent2.averageColumnLoad) / 2;
	wellCoefficient = (parent1.wellCoefficient + parent2.wellCoefficient) / 2;
	rightColumn = (parent1.rightColumn + parent2.rightColumn) / 2;
	crackinessCoefficient = (parent1.crackinessCoefficient + parent2.crackinessCoefficient) / 2;
	unreachableCoefficient = (parent1.unreachableCoefficient + parent2.unreachableCoefficient) / 2;
	movedDown = (parent1.movedDown + parent2.movedDown) / 2;
	boardClearScore = (parent1.boardClearScore + parent2.boardClearScore) / 2;
	scoreCoefficient = (parent1.scoreCoefficient + parent2.scoreCoefficient) / 2;
	perfectScoreCoefficient = (parent1.perfectScoreCoefficient + parent2.perfectScoreCoefficient) / 2;
}

int AI_Instance::applyMutation(int mutationRate, double weightSize, std::mt19937 &generator) {

	if (rand() % 100 > mutationRate) return 0;

	int mutationCount = 0;
	int mutationsLeft = (rand() % 3) + 1;
	std::uniform_real_distribution<> distr(-weightSize, weightSize);

	while (mutationsLeft > 0) {
		if (rand() % 100 < 20) {
			// We do a swap between two random mutations here
			mutationCount += 2;
			mutationsLeft -= 2;

			// Pick 2 genes to swap
			int ind1 = rand() % AI_Instance::genomeSize;
			int ind2 = rand() % AI_Instance::genomeSize;

			// Swap
			double temp = getGeneValueByIndex(ind1);
			alterGeneByIndex(ind1, getGeneValueByIndex(ind2));
			alterGeneByIndex(ind2, temp);
		} else {
			mutationCount++;
			mutationsLeft--;

			// Pick a random weight to mutate
			int ind = rand() % AI_Instance::genomeSize;
			alterGeneByIndex(ind, distr(generator));
		}
	}

	return mutationCount;
}

AI_Instance::AI_Instance() {}

AI_Instance::AI_Instance(double crackiness, double unreachableHoles, double unfillableHoles, double aggregate, double linesCleared, double bumpiness, double highestBlock, double scoreValue, double averageColumnLoad, double wellCoefficient, double rightColumn, double crackinessCoefficient, double unreachableCoefficient, double movedDown, double boardClearScore, double scoreCoefficient, double perfectScoreCoefficient) {
	this->crackiness = crackiness;
	this->unreachableHoles = unreachableHoles;
	this->unfillableHoles = unfillableHoles;
	this->aggregate = aggregate;
	this->linesCleared = linesCleared;
	this->bumpiness = bumpiness;
	this->highestBlock = highestBlock;
	this->scoreValue = scoreValue;
	this->averageColumnLoad = averageColumnLoad;
	this->wellCoefficient = wellCoefficient;
	this->rightColumn = rightColumn;
	this->crackinessCoefficient = crackinessCoefficient;
	this->unreachableCoefficient = unreachableCoefficient;
	this->movedDown = movedDown;
	this->boardClearScore = boardClearScore;
	this->scoreCoefficient = scoreCoefficient;
	this->perfectScoreCoefficient = perfectScoreCoefficient;
}

// Here me out, I'm inexperienced with C++ and I've never really done this before
// There is probably a better way to do this but um... no
// This is totally one of those things that would show up on r/badcode
void AI_Instance::alterGeneByIndex(int index, double newValue) {
	switch (index) {
		case 0:
			crackiness = newValue;
			break;
		case 1:
			unreachableHoles = newValue;
			break;
		case 2:
			unfillableHoles = newValue;
			break;
		case 3:
			aggregate = newValue;
			break;
		case 4:
			linesCleared = newValue;
			break;
		case 5:
			bumpiness = newValue;
			break;
		case 6:
			highestBlock = newValue;
			break;
		case 7:
			scoreValue = newValue;
			break;
		case 8:
			averageColumnLoad = newValue;
			break;
		case 9:
			wellCoefficient = newValue;
			break;
		case 10:
			rightColumn = newValue;
			break;
		case 11:
			crackinessCoefficient = newValue;
			break;
		case 12:
			unreachableCoefficient = newValue;
			break;
		case 13:
			movedDown = newValue;
			break;
		case 14:
			boardClearScore = newValue;
			break;
		case 15:
			scoreCoefficient = newValue;
			break;
		case 16:
			perfectScoreCoefficient = newValue;
			break;
		default:
			throw std::invalid_argument("Index received for altering gene is invalid value");
	}
}

double AI_Instance::getGeneValueByIndex(int index) {
		switch (index) {
		case 0:
			return crackiness;
		case 1:
			return unreachableHoles;
		case 2:
			return unfillableHoles;
		case 3:
			return aggregate;
		case 4:
			return linesCleared;
		case 5:
			return bumpiness;
		case 6:
			return highestBlock;
		case 7:
			return scoreValue;
		case 8:
			return averageColumnLoad;
		case 9:
			return wellCoefficient;
		case 10:
			return rightColumn;
		case 11:
			return crackinessCoefficient;
		case 12:
			return unreachableCoefficient;
		case 13:
			return movedDown;
		case 14:
			return boardClearScore;
		case 15:
			return scoreCoefficient;
		case 16:
			return perfectScoreCoefficient;
		default:
			throw std::invalid_argument("Index received for fetching gene value is invalid value");
	}
}

// Serialization method to write a vector of AI_Instance objects to a file
void AI_Instance::serializeAll(AI_Instance (&instances)[POP_SIZE], int &generationNumber, std::string &logPrefix) {
	std::string fname = logPrefix + ".ailist";
	std::ofstream file(fname, std::ios::out | std::ios::binary);
	if (file.is_open()) {
		file.write(reinterpret_cast<const char*>(&generationNumber), sizeof(int));
		file.write(reinterpret_cast<const char*>(instances), sizeof(AI_Instance) * POP_SIZE);
		file.close();
	} else {
		std::cerr << "Unable to open file for serialization\n";
	}
}

bool AI_Instance::deserializeAll(AI_Instance (&instances)[POP_SIZE], int &generationNumber, std::string &logPrefix) {
	std::string fname = logPrefix + ".ailist";
	std::ifstream file(fname, std::ios::in | std::ios::binary);
	if (file.is_open()) {
		file.read(reinterpret_cast<char*>(&generationNumber), sizeof(int));
		file.read(reinterpret_cast<char*>(instances), sizeof(AI_Instance) * POP_SIZE);
		file.close();
		return true;
	} else {
		return false;
	}
}

std::string AI_Instance::displayAI() {
	std::string ret = "  crackiness:              " + std::to_string(crackiness) + ",\n" +
	"  unreachableHoles:        " + std::to_string(unreachableHoles) + ",\n" +
	"  unfillableHoles:         " + std::to_string(unfillableHoles) + ",\n" +
	"  aggregate:               " + std::to_string(aggregate) + ",\n" +
	"  linesCleared:            " + std::to_string(linesCleared) + ",\n" +
	"  bumpiness:               " + std::to_string(bumpiness) + ",\n" +
	"  highestBlock:            " + std::to_string(highestBlock) + ",\n" +
	"  scoreValue:              " + std::to_string(scoreValue) + ",\n" +
	"  averageColumnLoad:       " + std::to_string(averageColumnLoad) + ",\n" +
	"  wellCoefficient:         " + std::to_string(wellCoefficient) + ",\n" +
	"  rightColumn:             " + std::to_string(rightColumn) + ",\n" +
	"  crackinessCoefficient:   " + std::to_string(crackinessCoefficient) + ",\n" +
	"  unreachableCoefficient:  " + std::to_string(unreachableCoefficient) + ",\n" +
	"  movedDown:               " + std::to_string(movedDown) + ",\n" +
	"  boardClearScore:         " + std::to_string(boardClearScore) + ",\n" +
	"  scoreCoefficient:        " + std::to_string(scoreCoefficient) + ",\n" +
	"  perfectScoreCoefficient: " + std::to_string(perfectScoreCoefficient) + ",\n";

	return ret;
}