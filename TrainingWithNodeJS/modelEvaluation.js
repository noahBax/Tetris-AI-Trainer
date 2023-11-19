const { parentPort, workerData } = require('worker_threads');
const { runTetrisGame } = require("./tetrisModule");

var waitingForConfig = true;
var pieceCount = 0;
var workerID;

function testConfig(config, pieceCount) {
	
	let avgScore = 0;
	let avgLines = 0;
	
	for (let i = 0; i < 3; i++) {
		const res = runTetrisGame(config, pieceCount);
		avgScore += res.score;
		avgLines += res.linesCleared;
	}
	
	avgScore /= 3;
	avgLines /= 3;
		
	
	return {score: avgScore, lines: avgLines, ID: workerID, finishedOkay: true};

}

function workerMailbox(message) {
	if (message.action == "initialize") {
		workerID = message.ID;
		return;
	} else if (workerID == undefined) {
		console.log("Received config before ID was assigned");
		parentPort.postMessage( {finishedOkay: false, configInd: message.configInd} );
	}
	
	if (!waitingForConfig) {
		console.log("Received config when the worker thread wasn't ready");
		parentPort.postMessage( {finishedOkay: false, configInd: message.configInd} );
	}

	waitingForConfig = false;

	const outObj = structuredClone(message.config);
	outObj.index = message.configInd;

	// Simulate the games with the data we received
	const testResults = testConfig(message.config, message.pieceCount);
	testResults.configInd = message.configInd;
	
	waitingForConfig = true;

	parentPort.postMessage(testResults);
}

// Initialize this worker thread;
pieceCount = workerData.pieceCount;
parentPort.on("message", workerMailbox);