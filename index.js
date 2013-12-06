require('./utils');

const libClass = require('./classCivilization');
const classCiv = libClass.Civilization;
const classSoc = libClass.Society;

var society = new classSoc();

function develop () {
	var i, limit = 200, j, step = 15;
	for (i = 0; i < limit; i += 1) {
		for (j = 0; j < step; j += 1) {
			society.develop();
		}
		society.draw();
	}
}
console.log(society);
develop();