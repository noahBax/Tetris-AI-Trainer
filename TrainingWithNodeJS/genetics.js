const { Worker } = require('worker_threads');

const weightList = [
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
];

function generateInitialPopulation(populationSize, weightSize) {
	const population = [];
	for (let i = 0; i < populationSize; i++) {
		const aiConfig = {
			crackiness: Math.random() * weightSize - weightSize / 2,
			unreachableHoles: Math.random() * weightSize - weightSize / 2,
			unfillableHoles: Math.random() * weightSize - weightSize / 2,
			aggregate: Math.random() * weightSize - weightSize / 2,
			linesCleared: Math.random() * weightSize - weightSize / 2,
			bumpiness: Math.random() * weightSize - weightSize / 2,
			highestBlock: Math.random() * weightSize - weightSize / 2,
			scoreValue: Math.random() * weightSize - weightSize / 2,
			averageColumnLoad: Math.random() * weightSize - weightSize / 2,
			wellCoefficient: Math.random() * weightSize - weightSize / 2,
			rightColumn: Math.random() * weightSize - weightSize / 2,
			crackinessCoefficient: Math.random() * weightSize - weightSize / 2,
			unreachableCoefficient: Math.random() * weightSize - weightSize / 2,
			movedDown: Math.random() * weightSize - weightSize / 2,
			boardClearScore: Math.random() * weightSize - weightSize / 2,
			scoreCoefficient: Math.random() * weightSize - weightSize / 2,
			perfectScoreCoefficient: Math.random() * weightSize - weightSize / 2
		};
		population.push(aiConfig);
	}
	return population;
}


async function evaluateFitness(population, pieceCount, threadLimit) {

	
	
	const promise = new Promise( (resolve, reject) => {
		
		const activeWorkers = [];
		
		let activeThreads = threadLimit;
		let populationCursor = 0;
		let totalFitness = 0;
		let totalLines = 0;
		let totalScore = 0;
		let threadFailsLeft = 50;
		// let visited = [];
		
		function workerMailbox(result) {

			let worker = activeWorkers.find( worker => worker.threadId == result.ID);
			
			if (!result.finishedOkay) {

				console.log(`Worker ${worker.threadId} failed, creating new one`);

				// Check to see if we've passed the thread fails limit
				threadFailsLeft--;
				if (threadFailsLeft == 0) {

					// Kill off everything existing
					activeWorkers.forEach(worker => worker.terminate());
					
					console.log("Thread kill limit was reached, killing training process");
					process.exit();
				}
				
				// Something went wrong, we should recreate the thread
				const index = activeWorkers.indexOf(worker);
				activeWorkers.splice(index, 1);

				const newWorker = createWorker();

				// Start the recreated worker running
				// Make sure it runs with the same config it failed on
				const aiConfig = population[worker.configInd];
				newWorker.postMessage( {config: aiConfig, configInd: worker.configInd, pieceCount: pieceCount, action: "simulate"} );

				// Actually terminate the old worker thread
				worker.terminate();

				// Don't continue because we don't have any information
				return;
			}

			population[result.configInd].lines = result.lines;
			population[result.configInd].score = result.score;
			
			if (result.lines == 0) {
				population[result.configInd].fitness = 0;
			} else {
				population[result.configInd].fitness = result.score * result.lines;
			}
	
			totalFitness += result.score * result.lines;
			totalLines += result.lines;
			totalScore += result.score;

			// visited.push(result.configInd)
			// console.log("Config scored", result.score, "and cleared", result.lines, "lines. Fitness:", population[result.configInd].fitness);
	
			if (populationCursor < population.length) {
				const aiConfig = population[populationCursor];
				worker.postMessage({config: aiConfig, configInd: populationCursor, pieceCount: pieceCount, action: "simulate"});
				populationCursor++
			} else if (activeThreads == 1) {
				worker.terminate();
				resolve([totalFitness, totalLines, totalScore]);
			} else {
				worker.terminate();
				activeThreads--;
			}
		}

		function createWorker() {
			
			const worker = new Worker("./weightTraining/modelEvaluation.js", {workerData: {pieceCount: pieceCount}} );
			activeWorkers.push(worker);
			worker.postMessage( {action: "initialize", ID: worker.threadId} );
			worker.on('message', workerMailbox);

			return worker;
		}

		// Create the workers initially
		for (let i = 0; i < threadLimit; i++) createWorker();
		
		// Start the workers going
		for (let i = 0; i < threadLimit; i++) {
			
			const aiConfig = population[populationCursor];
			activeWorkers[i].postMessage( {config: aiConfig, configInd: populationCursor, pieceCount: pieceCount, action: "simulate"} );
			populationCursor++
			
		}
	});


	return promise;

}

function selectParents(population) {
	const selectedParents = [];

	// First find find the top 3 best parents to make sure they are included in the next generation
	const best = findTopAIs(population)
	for (let i = 0; i < 3; i++) {
		selectedParents.push(structuredClone(best[i]));
	}

	// Here I'm using tournament selection
	// Loop through the size of the population so we can fill it with new parents
	for (let i = 3; i < population.length; i++) {

		// Randomly select 3 parents
		const p1 = Math.floor(Math.random() * population.length);
		const p2 = Math.floor(Math.random() * population.length);
		const p3 = Math.floor(Math.random() * population.length);

		// Select best
		let bestScore = population[p1].fitness;
		let best = p1;
		if (population[p2].fitness > bestScore) {
			bestScore = population[p2].fitness;
			best = p2;
		}
		if (population[p3].fitness > bestScore) {
			bestScore = population[p3].fitness;
			best = p3;
		}
	
		// Add the selected parent to the list of selected parents
		selectedParents.push(structuredClone(population[best]));
	}
  
	return selectedParents;
}

function shuffle(array) {
	let currentIndex = array.length,  randomIndex;
  
	// While there remain elements to shuffle.
	while (currentIndex > 0) {
  
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
		array[randomIndex], array[currentIndex]];
	}
  
	return array;
}

function performCrossover(parent1, parent2) {
	const childConfig = {
		crackiness: (parent1.crackiness + parent2.crackiness) / 2,
		unreachableHoles: (parent1.unreachableHoles + parent2.unreachableHoles) / 2,
		unfillableHoles: (parent1.unfillableHoles + parent2.unfillableHoles) / 2,
		aggregate: (parent1.aggregate + parent2.aggregate) / 2,
		linesCleared: (parent1.linesCleared + parent2.linesCleared) / 2,
		bumpiness: (parent1.bumpiness + parent2.bumpiness) / 2,
		highestBlock: (parent1.highestBlock + parent2.highestBlock) / 2,
		scoreValue: (parent1.scoreValue + parent2.scoreValue) / 2,
		averageColumnLoad: (parent1.averageColumnLoad + parent2.averageColumnLoad) / 2,
		wellCoefficient: (parent1.wellCoefficient + parent2.wellCoefficient) / 2,
		rightColumn: (parent1.rightColumn + parent2.rightColumn) / 2,
		crackinessCoefficient: (parent1.crackinessCoefficient + parent2.crackinessCoefficient) / 2,
		unreachableCoefficient: (parent1.unreachableCoefficient + parent2.unreachableCoefficient) / 2,
		movedDown: (parent1.movedDown + parent2.movedDown) / 2,
		boardClearScore: (parent1.boardClearScore + parent2.boardClearScore) / 2,
		scoreCoefficient: (parent1.scoreCoefficient + parent2.scoreCoefficient) / 2,
		perfectScoreCoefficient: (parent1.perfectScoreCoefficient + parent2.perfectScoreCoefficient) / 2
	};

	return childConfig;
}

function crossover(parents) {
	const newGeneration = [];
	while (newGeneration.length < parents.length) {
		const randomIndex1 = Math.floor(Math.random() * parents.length);
		const randomIndex2 = Math.floor(Math.random() * parents.length);
		const parent1 = parents[randomIndex1];
		const parent2 = parents[randomIndex2];
		
		// Perform crossover to create a child configuration
		const child = performCrossover(parent1, parent2);
		
		newGeneration.push(child);
	}
	return newGeneration;
}

function applyMutation(newGeneration, mutationRate, weightSize) {
	let mutationCount = 0;

	for (const aiConfig of newGeneration) {
		
		if (Math.random() < mutationRate) {
			let mutationsLeft = Math.random() * 4;
			while(mutationsLeft > 0) {
				if (Math.random() > 0.8) {
					mutationCount += 2;
					mutationsLeft -= 2;

					// Pick 2 mutations
					let ind1 = Math.floor(Math.random() * 7);
					let ind2 = Math.floor(Math.random() * 7);
					ind2 = ind2 == ind1 ? (ind2 + 1) % 7 : ind2;

					// Swap
					const temp = aiConfig[weightList[ind1]];
					aiConfig[weightList[ind1]] = aiConfig[weightList[ind2]];
					aiConfig[weightList[ind2]] = temp;
				} else {
					mutationCount++;
					mutationsLeft--;

					// Pick random weight to mutate
					const weight = Math.floor(Math.random() * weightList.length);
					aiConfig[weightList[weight]] = Math.random() * weightSize - weightSize / 2;
				}

			}

	  	}
	}
	console.log("Applied", mutationCount, "mutations");
}

function findBestAI(population) {
	let bestAI = population[0];
	for (const aiConfig of population) {
		if (aiConfig.fitness > bestAI.fitness) {
			bestAI = aiConfig;
		}
	}
	return bestAI;
}

function findTopAIs(population) {
	const best = [population[0], population[1], population[2]];
	for (let i = 3; i < population.length; i++) {
		if (population[i].fitness > best[0].fitness) {
			best[0] = population[i];
		} else if (population[i].fitness > best[1].fitness) {
			best[1] = population[i];
		} else if (population[i].fitness > best[2].fitness) {
			best[2] = population[i];
		}
	}

	return best;
}

async function beginTraining(config) {

	console.log(`Beginning training`);
	console.log(`Population size: ${config.populationSize}`);
	console.log(`Generations simulated: ${config.generations}`);
	console.log(`Mutation rate: ${config.mutationRate}`);
	console.log(`Pieces allowed: ${config.pieceCount}`);
	console.log(`Commencing training...`)
	
	// Define the initial population and parameters
	const fitnessTrend = [];
	let population = generateInitialPopulation(config.populationSize, config.weightSize);



	for (let generation = 0; generation < config.generations; generation++) {
		try {
			// Evaluate fitness
			generationFitness = await evaluateFitness(population, config.pieceCount, config.threadLimit);
			fitnessTrend.push(generationFitness[0] / config.populationSize);

			// If we are at the end we don't want to find the next generation
			if (generation == config.generations - 1) {
				break;
			}

			shuffle(population);
			
			// Find best model to display
			const bestAI = findBestAI(population);
			console.log("Generation evaluated. Best fitness:", Math.round(bestAI.fitness), "with", bestAI.lines, "lines cleared and a score of", bestAI.score,"Average fitness:", generationFitness[0] / config.populationSize);
			for (let i = 0; i < weightList.length; i++) {
				console.log(weightList[i], ":", bestAI[weightList[i]]);
			}
	
			// Select parents
			const parents = selectParents(population);
	
			// Create a new generation through crossover
			const newGeneration = crossover(parents);
			
			// Apply mutation
			applyMutation(newGeneration, config.mutationRate, config.weightSize);
	
			// Replace the old population with the new one
			population = newGeneration;
	
			console.log("Generation", generation+1, "of", config.generations, "trained");
		} catch(err) {
			console.error(err);
			return;
		}
	}

	// Get the best AI configuration
	const bestAI = findBestAI(population);
	console.log("Training finished. Best AI had fitness", bestAI.fitness);
	console.log("Fitness trend was", fitnessTrend);
	for (let i = 0; i < weightList.length; i++) {
		console.log(weightList[i], ":", bestAI[weightList[i]]);
	}
}


const config = {
	weightSize: 45,
	threadLimit: 3,
	populationSize: 2700,
	generations: 150,
	mutationRate: 0.1,
	pieceCount: 600
}

beginTraining(config);

// start /B node weightTraining\genetics.js > trainingOut.txt