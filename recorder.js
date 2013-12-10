// 所有时间记录
var logs = {};

// 当前的记录
var currentEra = 0;
var currentSheet;

// 记录所以死去的文明
var deads = [];

exports.newYear = function (year) {
	currentEra = year;
	logs[year] = logs[year] || {
		deads	: 0,
		attacks	: 0,
		helps	: 0
	};
	currentSheet = logs[year];
};

exports.record = function () {
};

exports.funeral = function (civ) {
	deads.push({
		ID				: civ.id,
		'Birth/Age   '	: civ.birth + '|' + civ.age,
		'Civilization'	: Math.round(civ.maxCiv),
		'Explore     '	: Math.round(civ.maxExp),
		'Found/Ally  '	: Math.round(civ.maxFound) + '|' + Math.round(civ.maxAlly),
		'AHV         '	: civ.attack + '|' + civ.beattacked + '|' + civ.help + '|' + civ.behelped,
		'Charactor   '	: civ.charactor.attack + "|" + civ.charactor.helpWeaker + "|" + civ.charactor.showSelf
	});
};

exports.show = function () {
	console.log(deads);
};