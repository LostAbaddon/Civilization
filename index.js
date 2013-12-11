/*process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
	recorder.show();
});*/

require('./utils');
const recorder	= require('./recorder');

const libClass	= require('./classCivilization');
const classCiv	= libClass.Civilization;
const classSoc	= libClass.Society;

var society = new classSoc();

var developEra = 200;
var era = 0;
function develop () {
	var i, step = 50;
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
		recorder.show();
	}
}
develop();