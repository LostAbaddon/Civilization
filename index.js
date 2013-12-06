require('./utils');

const libClass = require('./classCivilization');
const classCiv = libClass.Civilization;

var civilization = new classCiv();

function develop () {
	var i, limit = 250, j, step = 10;
	for (i = 0; i < limit; i += 1) {
		for (j = 0; j < step; j += 1) {
			civilization.grow();
		}
		civilization.draw();
	}
}
console.log(civilization);
develop();