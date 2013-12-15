const libClass	= require('./classResource');

var age = 0;
var universe = new libClass.Universe();

exports.currentEra = function () {
	return age;
};

exports.universe = universe;