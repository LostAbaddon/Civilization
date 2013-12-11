// 所有时间记录
var logs = {};

// 当前的记录
var currentEra = 0;
var currentSheet;

// 记录所以死去的文明
var deads = [];
function showDead (dead) {
	var result = format(dead.ID, 4);
	result = result + '> Era:' + format(dead.Birth, 4) + ' | ' + format(dead.Age, 4);
	result = result + ' Civ:' + format(dead.Civilization, 9);
	result = result + ' Exp:' + format(dead.Explore, 5) + ' | ' + format(dead.Found, 4) + ' | ' + format(dead.Ally, 4);
	result = result + ' Atck:' + format(dead.Attack, 4) + ' | ' + format(dead.BeAttacked, 4);
	result = result + ' Help:' + format(dead.Help, 5) + ' | ' + format(dead.BeHelped, 5);
	result = result + ' Char:' + format(dead.Age === 0 ? 0 : Math.round(dead.ChrAttack / dead.Age * 10000) / 100, 5);
	result = result + ' | ' + format(dead.Age === 0 ? 0 : Math.round(dead.ChrHelp / dead.Age * 10000) / 100, 5);
	result = result + ' | ' + format(dead.Age === 0 ? 0 : Math.round(dead.ChrShow / dead.Age * 10000) / 100, 5);
	return result;
}
function format (text, length) {
	text = '' + text;
	var len = text.length;
	var i, result = text;
	for (i = len; i < length; i += 1) result = result + ' ';
	return result;
}
function deadFilter (civ) {
	return civ.Civilization > 10000 && civ.Explore > 1000;
}

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
		ID			: civ.id,
		Birth		: civ.birth,
		Age			: civ.age,
		Civilization: Math.round(civ.maxCiv),
		Explore		: Math.round(civ.maxExp),
		Found		: Math.round(civ.maxFound),
		Ally		: Math.round(civ.maxAlly),
		Attack		: civ.attack,
		BeAttacked	: civ.beattacked,
		Help		: civ.help,
		BeHelped	: civ.behelped,
		ChrAttack	: civ.atckRate,
		ChrHelp		: civ.helpRate,
		ChrShow		: civ.showRate
	});
};

exports.show = function () {
	console.log(
		format('', 2) +
		format('ID', 8) +
		format('Birth', 10) +
		format('Age', 5) +
		format('Civilization', 14) +
		format('Explore', 12) +
		format('Found', 7) +
		format('Ally', 5) +
		format('Atck', 10) +
		format('BeAtck', 7) +
		format('Help', 10) +
		format('BeHelp', 10) +
		format('Attack', 10) +
		format('Help', 8) +
		format('Show', 4));
	console.log(deads.filter(deadFilter).map(showDead));
};