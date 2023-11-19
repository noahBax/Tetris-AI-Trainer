#include <random>		/* random_device, mt19937 */
#include "genetics.hpp"

class AI_Instance {

private:
	void alterGeneByIndex(int index, double newValue);
	double getGeneValueByIndex(int index);

public:
	static const int genomeSize = 17;

	static void serializeAll(AI_Instance (&instances)[POP_SIZE], int &generationNumber, std::string &logPrefix);
	static bool deserializeAll(AI_Instance (&instances)[POP_SIZE], int &generationNumber, std::string &logPrefix);

	AI_Instance(
		double crackiness,
		double unreachableHoles,
		double unfillableHoles,
		double aggregate,
		double linesCleared,
		double bumpiness,
		double highestBlock,
		double scoreValue,
		double averageColumnLoad,
		double wellCoefficient,
		double rightColumn,
		double crackinessCoefficient,
		double unreachableCoefficient,
		double movedDown,
		double boardClearScore,
		double scoreCoefficient,
		double perfectScoreCoefficient
	);

	AI_Instance();
	
	void crossover(AI_Instance &parent1, AI_Instance &parent2);
	void initialize(double weightSize, std::mt19937 &generator);
	std::string displayAI();
	int applyMutation(int mutationRate, double weightSize, std::mt19937 &generator);

	double fitness = 0;
	double linesResult = 0;
	double scoreResult = 0;

	double crackiness;
	double unreachableHoles;
	double unfillableHoles;
	double aggregate;
	double linesCleared;
	double bumpiness;
	double highestBlock;
	double scoreValue;
	double averageColumnLoad;
	double wellCoefficient;
	double rightColumn;
	double crackinessCoefficient;
	double unreachableCoefficient;
	double movedDown;
	double boardClearScore;
	double scoreCoefficient;
	double perfectScoreCoefficient;

};
