const { parentPort, workerData } = require('worker_threads');


let counter = 0;
for (let i = 0; i < workerData; i++) {
	counter++;
}

parentPort.postMessage({res: counter});