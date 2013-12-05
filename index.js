require('./utils');

const libClass = require('./classCivilization');
const classCiv = libClass.Civilization;

var civilization = new classCiv();

function develop () {
	var i;
	civilization.grow();
}
console.log(civilization);
develop();