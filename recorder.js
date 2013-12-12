// 所有时间记录
var logs = {};

// 当前的记录
var currentEra = 0;

var eraLength = 10;

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
function format (text, length, char) {
	char = char || ' ';
	text = '' + text;
	var len = text.length;
	var i, result = text;
	for (i = len; i < length; i += 1) result = result + char;
	return result;
}
function deadFilter (civ) {
	return civ.Civilization > 9000000 && civ.Explore > 1500;
}

exports.newYear = function (year) {
	currentEra = year;
};

exports.record = function (record) {
	logs[currentEra] = record;
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

exports.showDead = function () {
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

exports.setEraLength = function (len) {
	eraLength = len;
};

exports.reset = function () {
	currentEra = 0;
	deads = [];
	logs = {};
};

function getID (index) {
	var id = 'hasNew';
	switch (index) {
		case 1:
			id = 'dead';
		break;
		case 2:
			id = 'live';
		break;
		case 3:
			id = 'civ';
		break;
		case 4:
			id = 'exp';
		break;
		case 5:
			id = 'founds';
		break;
		case 6:
			id = 'allies';
		break;
		case 7:
			id = 'attackers';
		break;
		case 8:
			id = 'helpers';
		break;
		case 9:
			id = 'showers';
		break;
		case 10:
			id = 'wars';
		break;
		case 11:
			id = 'warPower';
		break;
		case 12:
			id = 'help';
		break;
		case 13:
			id = 'helpPower';
		break;
	}
	return id;
}
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