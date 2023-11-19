const { Worker } = require("worker_threads");

var test = () => {for (let i = 0; i < 5; i++) {
	const worker = new Worker("./weightTraining/worker.js", {workerData: i * 1000_000_00});
	worker.on("message", (data) => {
		console.log(data.res);
	  });
}}

test();