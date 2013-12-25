const utils	= require('./utils');

const libResource	= require('./classResource');
const libSociety	= require('./classSociety');

const format = utils.format;

var age	= 0;

var universe;
var society;

function drawLine (origin, length, char) {
	char = char || '.';
	var i, len = origin.length, temp = '';
	if (len >= length) {
		origin = origin.substr(0, len - length);
		for (i = 0; i < length; i += 1) {
			temp += char;
		}
		origin = temp + origin;
	}
	else {
		for (i = len; i < length; i += 1) {
			temp += char;
		}
		origin = origin + temp;
	}
	return origin;
}

exports.currentEra = function () {
	return age;
};

exports.universe = universe;

exports.initial = function () {
	universe	= new libResource();
	exports.universe = universe;
	
	society		= new libSociety();
};

exports.evolute = function (eraLimit, yearsPerEra) {
	var wordLen = ('' + eraLimit).length + 1;
	var i, j, value, logs = [], line, lineLength = 120;
	for (i = 0; i < eraLimit; i += 1) {
		logs[i] = [0, 0, 0];
		for (j = 0; j < yearsPerEra; j += 1) {
			value = society.evolute();
			logs[i][0] += value[0];
			logs[i][1] += value[1];
			logs[i][2] += value[2];
		}
		logs[i][0] /= yearsPerEra;
		logs[i][1] /= yearsPerEra;
		logs[i][2] /= yearsPerEra;
		line = '';
		line = drawLine(line, Math.round(lineLength * logs[i][0] / CIVILIZATION_LIMIT), '0');
		line = drawLine(line, Math.round(lineLength * logs[i][1] / ENV_SIZE), 'X');
		line = drawLine(line, Math.round(lineLength * logs[i][2] / libResource.Resource_Limit), '=');
		line = format(line, lineLength, '.');
		line = line + ' ' + format(i, wordLen);
		console.log(line);
	}
};