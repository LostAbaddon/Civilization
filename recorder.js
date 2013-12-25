const utils = require('./utils');

const format = utils.format;

// 所有时间记录
var logs = {};

// 当前的记录
var currentEra = 0;

var eraLength = 10;

// 记录所以死去的文明
var deads = [];

exports.newYear = function (year) {
	currentEra = year;
};

exports.record = function (record) {
	logs[currentEra] = record;
};

exports.reset = function () {
	currentEra = 0;
	deads = [];
	logs = {};
};

exports.show = function (order) {
	order = getID(order);

	var LG = Object.keys(logs);
	LG = LG.map(function (index) {return logs[index]});

	var l = LG.length, i, sheet = [], year = 0, record = 0, max = 0, min = 1000000000;
	for (i = 0; i < l; i += 1) {
		record += LG[i][order];
		year += 1;
		if (year === eraLength) {
			if (record > max) max = record;
			if (record < min) min = record;
			year = 0;
			sheet.push(record);
			record = 0;
		}
	}
	
	console.log(order + "  | MIN = " + min + "   MAX = " + max);
	
	var total = 120, value;
	l = sheet.length;
	max = Math.ceil(max);
	for (i = 0; i < l; i += 1) {
		value = Math.round(total * sheet[i] / max);
		console.log(format('', value, '*'));
	}
}