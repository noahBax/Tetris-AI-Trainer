#include "genetics.hpp"
#include <iostream>
#include <stdlib.h>     /* srand, rand */
#include <time.h>       /* time */
#include <random>		/* random_device, mt19937 */
#include <cmath>
#include <algorithm>
#include <fstream>
#include <string>
#include "TetrisGame/tetrisModule.hpp"

void generateInitialPopulation(std::mt19937 &generator, AI_Instance (&population)[POP_SIZE]) {
	for (int i = 0; i < POP_SIZE; i++) {
		population[i].initialize(WEIGHT_SIZE, generator);
	}
}

void evaluateFitness(AI_Instance (&population)[POP_SIZE], std::mt19937 &generator) {

	// Run through each AI and test them over 3 games, average the result
	for (int i = 0; i < POP_SIZE; i++) {

		double avgScore = 0;
		double avgLines = 0;
		double avgRatio = 0;
		double avgPiecesUsed = 0;

		for (int j = 0; j < 6; j++) {
			int results[3] = {};
			// Run game...
			runTetrisGame(population[i], PIECE_COUNT, results, generator);


			avgScore += results[0];
			avgLines += results[1];
			avgPiecesUsed += results[2];
			if (results[1] > 0) {
				avgRatio += (results[0] / results[1]);
			}
		}

		avgScore /= 6;
		avgLines /= 6;
		avgRatio /= 6;
		avgPiecesUsed /= 6;

		population[i].scoreResult = avgScore;
		population[i].linesResult = avgLines;

		population[i].fitness = avgScore;

		// Uncomment this if you want to try to maximize ratio
		// In my experience, this isn't very fast but if you
		// plot the average score it shows some interesting
		// behavior
		// if (avgLines == 0) {
		// 	population[i].fitness = 0;
		// } else {
		// 	population[i].fitness = avgScore / avgLines;
		// }
	}
}

void populateNewGeneration(AI_Instance (&population)[POP_SIZE], std::mt19937 &generator, std::ofstream &logFile) {

	// Decide the parents first
	// Create empty parents array
	AI_Instance parents[POP_SIZE] = {};
	for (int i = 0; i < POP_SIZE; i++) {
		
		// Randomly select 3 potential parents (indexes)
		int p1 = rand() % POP_SIZE;
		int p2 = rand() % POP_SIZE;
		int p3 = rand() % POP_SIZE;

		// Select the best
		double bestScore = population[p1].fitness;
		int best = p1;
		if (population[p2].fitness > bestScore) {
			bestScore = population[p2].fitness;
			best = p2; 
		}
		if (population[p3].fitness > bestScore) {
			bestScore = population[p3].fitness;
			best = p3; 
		}

		// Set the tournament winner as the parent
		parents[i] = population[best];
	}

	// Now populate the new generation
	population[0].crossover(parents[0], parents[POP_SIZE - 1]);
	for (int i = 1; i < POP_SIZE; i++) {
		population[i].crossover(parents[i-1], parents[i]);
	}

	// And apply mutations
	int mutationCount = 0;
	for (int i = 0; i < POP_SIZE; i++) {
		mutationCount += population[i].applyMutation(MUTATE_RATE, WEIGHT_SIZE, generator);
	}

	logFile << "Applied " << mutationCount << " mutations" << std::endl;
}

int findBestAIIndex(const AI_Instance (&population)[POP_SIZE]) {
	int bestIndex = 0;
	double bestFitness = population[0].fitness;
	for (int i = 1; i < POP_SIZE; i++) {
		if (population[i].fitness > bestFitness) {
			bestIndex = i;
			bestFitness = population[i].fitness;
		}
	}

	return bestIndex;
}

int main() {
	
	// Before we do anything, seed the random number generator
	srand((unsigned) time(NULL));

	// std::random_device rd;
	std::mt19937 generator(time(0));

	// Create our population
	AI_Instance population[POP_SIZE];
	int genNumber = 1;

	// Create log file
	std::string logPrefix = __TIMESTAMP__;
	size_t pos = 0;
	while ((pos = logPrefix.find(':', pos)) != std::string::npos) {
		logPrefix.replace(pos, 1, "_");
		pos += 1;
	}
	while ((pos = logPrefix.find(' ', pos)) != std::string::npos) {
		logPrefix.replace(pos, 1, "_");
		pos += 1;
	}
		
	// std::cout << "Using file prefix " << logPrefix << std::endl;
	std::string logName = logPrefix + ".txt";
	std::ofstream logFile(logName, std::ios_base::app);

	// Try to load in the last trained generation
	const bool didLoad = AI_Instance::deserializeAll(population, genNumber, logPrefix);

	// If we weren't able to load the previous generation in, create a new one
	if (!didLoad) {
		logFile << "Couldn't find any previous population\n";
		generateInitialPopulation(generator, population);
		AI_Instance::serializeAll(population, genNumber, logPrefix);
	} else {
		logFile << "Found previous population at generation " << genNumber << "\n";
	}

	for (int generation = 0; generation < GENERATION_LIMIT; generation++) {

		logFile << "Training generation " << genNumber << std::endl;

		// Evaluate fitness
		evaluateFitness(population, generator);

		// We don't need to change up the population on the last round
		if (generation == GENERATION_LIMIT - 1) {
			break;
		}

		// Find the best model to display of the generation
		const int bestAI = findBestAIIndex(population);
		double meanFitness = 0;
		for (int i = 0; i < POP_SIZE; i++) {
			meanFitness += population[i].fitness;
		}
		meanFitness /= POP_SIZE;

		logFile << "Generation evaluated. Best fitness " << round(population[bestAI].fitness);
		logFile << " with " << population[bestAI].linesResult << " lines cleared and a score of " << population[bestAI].scoreResult;
		logFile << ". Average fitness: " << meanFitness << ". Best AI was..." << std::endl;
		logFile << population[bestAI].displayAI();

		// Go onto the next generation
		populateNewGeneration(population, generator, logFile);
		genNumber++;

		// Write this to disk so we can access it next time we try to start
		AI_Instance::serializeAll(population, genNumber, logPrefix);
	}

}