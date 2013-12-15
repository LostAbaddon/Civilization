process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
	showResult();
});

require('./utils');
const recorder	= require('./recorder');

const libClass	= require('./classCivilization');
const classCiv	= libClass.Civilization;
const classSoc	= libClass.Society;

var society = new classSoc();

function showResult () {
	processStep = 1;
	console.log('>> ');
}

var evoluteEra = 200, stepPerEra = 20;
var developEra = evoluteEra;
var era = 0;
function develop () {
	var i, step = stepPerEra;
	for (i = 0; i < step; i += 1) {
		society.develop(era);
	}
	era += 1;
	society.draw(era);
	
	developEra -= 1;
	if (developEra > 0) {
		process.nextTick(develop);
	}
	else {
		showResult();
	}
}

function setVar (command) {
	command = command.split('=');
	command = command.map(function (item) {return item.trim()});
	if (command[0] === 'era') {
		recorder.setEraLength(parseInt(command[1]));
		console.log('Set Done.');
	}
	else if (command[0] === 'evolute') {
		evoluteEra = parseInt(command[1]);
		console.log('Set Done.');
	}
	else if (command[0] === 'step') {
		stepPerEra = parseInt(command[1]);
		console.log('Set Done.');
	}
	else {
		console.log('Missing Command: ' + command[0] + " = " + command[1]);
	}
}

var processStep = 0;
process.stdin.resume();
process.stdin.on('data', function (chunk) {
	if (processStep === 0) return;

	chunk = '' + chunk;
	chunk = chunk.replace('\n', '').replace('\r', '');
	
	if (chunk === 'quit') {
		console.log('Byebye~~');
		process.stdin.pause();
		process.stdin.end();
		return;
	}

	console.log('::');
	if (chunk === 'dead') {
		recorder.showDead();
	}
	else if (chunk === 'new') {
		recorder.show(0);
	}
	else if (chunk === 'die') {
		recorder.show(1);
	}
	else if (chunk === 'live') {
		recorder.show(2);
	}
	else if (chunk === 'civ') {
		recorder.show(3);
	}
	else if (chunk === 'exp') {
		recorder.show(4);
	}
	else if (chunk === 'found') {
		recorder.show(5);
	}
	else if (chunk === 'ally') {
		recorder.show(6);
	}
	else if (chunk === 'atck') {
		recorder.show(7);
	}
	else if (chunk === 'help') {
		recorder.show(8);
	}
	else if (chunk === 'show') {
		recorder.show(9);
	}
	else if (chunk === 'war') {
		recorder.show(10);
	}
	else if (chunk === 'warP') {
		recorder.show(11);
	}
	else if (chunk === 'hlp') {
		recorder.show(12);
	}
	else if (chunk === 'hlpP') {
		recorder.show(13);
	}
	else if (chunk === 'lifeDist') {
		recorder.showLiveDist(society);
	}
	else if (chunk === 'restart') {
		era = 0;
		developEra = evoluteEra;
		society = new classSoc();
		recorder.reset();
		develop();
		return;
	}
	else if (chunk.indexOf('set ') === 0) {
		chunk = chunk.substring(4, chunk.length);
		setVar(chunk);
	}
	else {
		console.log('Missing Order: ' + chunk + "   " + (chunk === 'quit'));
	}
	
	console.log('>>');
});

develop();