const scoreEle = document.getElementById("score");
const linesEle = document.getElementById("lines");
const ratioEle = document.getElementById("ratio");
const fitnessEle = document.getElementById("fitness");
const board = document.getElementById("gameBoard");
const next_ele = document.getElementsByClassName("next");
const held_ele = document.getElementsByClassName("held");
const ctx = board.getContext("2d", { alpha: false });
const pixelDimension = 100;
const boardDimensions = {
	width: 10,
	height: 20
};
const OGweightConfig = {
	crackiness : 12.334284194900137,
	unreachableHoles : 13.061927428806257,
	unfillableHoles : 15.306537913043336,
	aggregate : -17.07030019908656,
	linesCleared : 15.128122414362249,
	bumpiness: 0,
	highestBlock : 15.316930994684759,
	scoreValue: 0,
	averageColumnLoad: 0,
	wellCoefficient: 2,
	rightColumn : 0,
	crackinessCoefficient: 2,
	unreachableCoefficient: 3,
	movedDown: 0,
	boardClearScore: 0,
	scoreCoefficient: 1,
	perfectScoreCoefficient: 1
}
const OGOGweightConfig = {
	crackiness : 6.29609204496402,
	unreachableHoles : 6.6885647433507565,
	unfillableHoles : 2.312951618647077,
	aggregate : 0.24010987618705315,
	linesCleared : 0.019120552084399858,
	bumpiness: 0,
	highestBlock : 2.5780557546950127,
	scoreValue : -5.800741647528431,
	averageColumnLoad : -1.3772646335537115,
	wellCoefficient : -0.16626569655959308,
	rightColumn : 1.0039819278170223,
	crackinessCoefficient : 0.7862391593243911,
	unreachableCoefficient : 5.770615441940043,
	movedDown : -2.5302772589270486,
	boardClearScore : -0.744632468470819,
	scoreCoefficient : 1.5210840302729025,
	perfectScoreCoefficient : 0.22865744206938926,
}
const weightConfig = {
	crackiness:              2.576050,
	unreachableHoles:        6.633182,
	unfillableHoles:         1.167440,
	aggregate:               -1.534945,
	linesCleared:            -0.327773,
	bumpiness:               3.749969,
	highestBlock:            1.111029,
	scoreValue:              -6.169104,
	averageColumnLoad:       0.971408,
	wellCoefficient:         -1.175204,
	rightColumn:             2.849583,
	crackinessCoefficient:   -1.614651,
	unreachableCoefficient:  6.436507,
	movedDown:               -1.910537,
	boardClearScore:         -1.267411,
	scoreCoefficient:        1.100455,
	perfectScoreCoefficient: 8.438853,
}
const ActuallyGoodweightConfig = {
	crackiness:              7.01361,
	unreachableHoles:        5.16102,
	unfillableHoles:         0.92767,
	aggregate:               2.32184,
	linesCleared:            -3.41262,
	bumpiness: 0,
	highestBlock:            4.43476,
	scoreValue:              -4.69787,
	averageColumnLoad:       3.6851,
	wellCoefficient:         -2.04528,
	rightColumn:             15.7326,
	crackinessCoefficient:   0.121492,
	unreachableCoefficient:  2.83857,
	movedDown:               -3.2087,
	boardClearScore:         -1.34793,
	scoreCoefficient:        0.541196,
	perfectScoreCoefficient: -0.564741,
}
const RiskyButGoodweightConfig = {
	crackiness : 6.436394578695133,
	unreachableHoles : 6.176589757833838,
	unfillableHoles : 7.6888741939238425,
	aggregate : 0.4145672859499802,
	linesCleared : -0.08514015314571571,
	bumpiness: 0,
	highestBlock : 2.0472780316811154,
	scoreValue : -5.774021161590162,
	averageColumnLoad : -0.618991999697075,
	wellCoefficient : -0.6632149380931032,
	rightColumn : 0.07561636414610629,
	crackinessCoefficient : 0.5389183176716,
	unreachableCoefficient : 5.127902425202187,
	movedDown : -2.331194452395347,
	boardClearScore : -0.9409588346461982,
	scoreCoefficient : 0.21370379365281167,
	perfectScoreCoefficient : -0.0648265595598337,
}
const colorsToNumbers = {
	"cyan": 0,
	"blue": 1,
	"orange": 2,
	"yellow": 3,
	"green": 4,
	"purple": 5,
	"red": 6,
	"white": 7,
	"black": 8
};
const numbersToColors = [
	"rgb(0,240,240)",	/* cyan */
	"rgb(0,0,240)",		/* blue */
	"rgb(240,160,0)",	/* orange */
	"rgb(240,240,0)",	/* yellow */
	"rgb(0,240,0)",		/* green */
	"rgb(160,0,240)",	/* purple */
	"rgb(240,0,0",		/* red */
	"rgb(120,120,120)",	/* white */
	"rgb(0,0,0)",		/* black */
];
const tetrominoes = [
	[	/* cyan */
		[ 7, 7, 7, 7 ],
		[ 0, 0, 0, 0 ],
		[ 7, 7, 7, 7 ],
		[ 7, 7, 7, 7 ],
	],
	[	/* "blue" */
		[ 1, 7, 7 ],
		[ 1, 1, 1 ],
		[ 7, 7, 7 ],
	],
	[	/* "orange" */
		[ 7, 7, 2 ],
		[ 2, 2, 2 ],
		[ 7, 7, 7 ],
	],
	[	/* "yellow" */
		[ 3, 3 ], 
		[ 3, 3 ], 
	],
	[	/* "green" */
		[ 7, 4, 4 ],
		[ 4, 4, 7 ],
		[ 7, 7, 7 ],
	],
	[	/* "purple" */
		[ 7, 5, 7 ],
		[ 5, 5, 5 ],
		[ 7, 7, 7 ],
	],
	[	/* "red" */
		[ 6, 6, 7 ],
		[ 7, 6, 6 ],
		[ 7, 7, 7 ],
	]
];
const boardState = [
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,],
	[ 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,]
];
const tryTurnOrdersNotI = [
	[ [ 0, 0], [-1, 0], [-1,+1], [ 0,-2], [-1,-2] ],
	[ [ 0, 0], [ 1, 0], [ 1,-1], [ 0, 2], [ 1, 2] ],
	[ [ 0, 0], [ 1, 0], [ 1, 1], [ 0,-2], [ 1,-2] ],
	[ [ 0, 0], [-1, 0], [-1,-1], [ 0, 2], [-1, 2] ]
]
const tryTurnOrdersI = [
	[ [ 0, 0], [-2, 0], [ 1, 0], [-2,-1], [ 1, 2] ],
	[ [ 0, 0], [-1, 0], [ 2, 0], [-1, 2], [ 2,-1] ],
	[ [ 0, 0], [ 2, 0], [-1, 0], [ 2, 1], [-1,-2] ],
	[ [ 0, 0], [ 1, 0], [-2, 0], [ 1,-2], [-2,+1] ],
]
const scoresForLines = [0, 40, 100, 300, 1200];
const perfectClearScore = [0,800, 1200, 1800, 2000, 3200];