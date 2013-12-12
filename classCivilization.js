/*
 * 说明：
 * 这里的文明都是单星模式，所以不考虑文明分裂导致的内耗等问题。
 */

const utils		= require('./utils');
const recorder	= require('./recorder');

const isNull = utils.isNull;
const random = utils.random;

const ENV_SIZE	= 10000;		// 容器尺寸
const CIV_MAX	= 100000;		// 文明数量
const CIV_LIMIT	= 999999999;	// 文明的文明值上限

const CIV_VALVE			= 50000000;	// 发展速度减半的阀值
const CIV_SHOW			= 0.5;		// 主动告知对方的概率
const CIV_ATCK			= 0.5;		// 主动攻击对方的概率
const CIV_HELP			= 0.5;		// 主动帮助弱者的概
const CIV_ATTACK_HIDE	= 0.5;		// 被攻击后隐藏
const CIV_ATTACK_HELP	= 0.5;		// 被攻击后援助
const CIV_ATTACK_BACK	= 0.5;		// 被攻击后反击
const CIV_ATTACK_ANIT	= 0.5;		// 被攻击后协助反击
const INTSTL_CIV_LIMIT	= 1;		// 具有星际探索能力的文明阀值，这个值也决定了发现别的文明的能力
const CIV_HIDE_LIMIT	= 10000;	// 文明隐藏自身能力的标值
const EXPAND_LIMIT		= 100;		// 拓展的极限速度（倍）
const HELP_LIMIT		= 100;		// 拓展的极限速度（倍）

const CIV_HELP_RATE		= 0.01;	// 帮助弱者文明的程度，为文明差的比例
const CIV_ATTACK_DAMAGE	= 0.5;	// 文明攻击力，为文明的比例

const CIV_BIRTH_RATE	= 0.5;	// 每一轮新文明诞生几率

var civilization_total	= 0;	// 目前文明总数
var warPerYear			= 0;	// 每年战争次数
var helpPerYear			= 0;	// 每年援助次数
var warPower			= 0;	// 每年战争次数
var helpPower			= 0;	// 每年援助次数

var beenAttacked	= [];

function Civilization (year) {
	this.id = civilization_total;
	civilization_total += 1;
	
	this.position = {
		x	: random(-ENV_SIZE, ENV_SIZE),
		y	: random(-ENV_SIZE, ENV_SIZE),
		z	: random(-ENV_SIZE, ENV_SIZE)
	};
	this.explore = 1;		// 当前文明已经探索区域，文明只能对explore范围内的星体做检测
	this.civilization = 1;	// 当前文明的文明值
	
	this.curiosity	= random(0.01, 1);	// 向外探索的好奇心，增加explore范围，也决定了发现其它文明的几率
	this.obscurity	= random(0.01, 1);	// 隐藏自己的倾向
	this.mental		= random(0.01, 1);	// 坚持个性不变的系数。在收到攻击或者援助的时候会改变自身属性的概率
	
	this.charactor = {
		showSelf		: random(CIV_SHOW, true),			// 这个值决定了是否主动向新发现的文明宣告自己的存在；一旦告知，则对方文明所有联盟文明都会知道自己的存在
		attack			: random(CIV_ATCK, true),			// 一旦发现新文明则主动发动攻击。被攻击的文明的所有联盟文明都将知道其存在，且在全局范围自身隐蔽性降低。
		helpWeaker		: random(CIV_HELP, true), 			// 一旦已知文明比自己落后就提供帮助
		hideAfterAttack	: random(CIV_ATTACK_HIDE, true),	// 一旦被攻击就隐藏自身的概率；如果为false，则一旦被攻击就立刻反击。
		helpAfterAttack	: random(CIV_ATTACK_HELP, true),	// 在联盟文明被攻击时提供帮助
		backAfterAttack	: random(CIV_ATTACK_BACK, true),	// 在被攻击时攻击攻击者
		anitAfterAttack	: random(CIV_ATTACK_ANIT, true),	// 在联盟文明被攻击时攻击攻击者
	};
	
	this.distance	= [];	// 记录了和别的文明的距离
	this.others		= [];	// 所有此文明已经发现的别的文明
	this.ally		= [];	// 主动告知对方自己存在或者帮助过对方的文明
	this.known		= [];	// 记录所有知道此文明的文明
	
	this.powerHide = 0;
	this.powerSeek = 0;
	
	this.findRequest	= [];
	this.helpRequest	= [];
	this.attackRequest	= [];
	this.findTask	= [];
	this.helpTask	= [];
	this.attackTask	= [];
	
	this.helpScore	= 0;
	
	this.beenAttackedScore	= 0;
	this.beenHelpedScore	= 0;
	
	// 记录部分
	this.birth		= year;
	this.age		= 0;
	this.attack		= 0;
	this.beattacked	= 0;
	this.help		= 0;
	this.behelped	= 0;
	this.maxCiv		= 0;
	this.maxExp		= 0;
	this.maxFound	= 0;
	this.maxAlly	= 0;
	this.atckRate	= 0;
	this.helpRate	= 0;
	this.showRate	= 0;
};

Civilization.prototype.grow = function () {
	this.age += 1;
	
	// 性格转变
	// 收到的攻击是否比收到的援助多
	if (this.beenAttackedScroe > this.beenHelpedScore) {
		if (random() < this.mental) this.charactor.showSelf	= false;
		if (random() < this.mental) this.charactor.attack	= true;
	}
	else if (this.beenHelpedScore > this.beenAttackedScore) {
		if (random() < this.mental) this.charactor.showSelf	= true;
		if (random() < this.mental) this.charactor.attack	= false;
	}
	// 付出大于获得
	if (this.civilization - this.helpScore > this.beenHelpedScore) {
		if (random() < this.mental) this.charactor.helpWeaker	= false;
	}
	else {
		if (random() < this.mental) this.charactor.helpWeaker	= true;
	}
	this.beenAttackedScore	= 0;
	this.beenHelpedScroe	= 0;
	
	var exp_rate = this.civilization / INTSTL_CIV_LIMIT / Math.pow(this.explore, 3) * (ENV_SIZE - this.explore) / ENV_SIZE * this.curiosity;
	exp_rate *= Math.min(this.civilization / INTSTL_CIV_LIMIT - this.explore, 1);
	if (exp_rate > this.explore * EXPAND_LIMIT) exp_rate = this.explore * EXPAND_LIMIT;
	this.explore += exp_rate;
	if (this.explore < 1) this.explore = 1;
	else if (this.explore > ENV_SIZE) this.explore = ENV_SIZE;

	var rate = this.civilization / CIV_VALVE;
	var speed = this.civilization / (1 + rate * rate) * (CIV_LIMIT - this.civilization) / CIV_LIMIT;
	this.civilization += speed;
	if (this.civilization > CIV_LIMIT) this.civilization = CIV_LIMIT;

	this.helpScore = this.civilization;
};
Civilization.prototype.hidePower = function () {
	if (this.charactor.showSelf) {
		return this.obscurity * this.civilization / (1 + Math.pow(this.civilization / CIV_HIDE_LIMIT, 2));
	}
	else {
		return this.obscurity * this.civilization / (1 + Math.pow(this.civilization / CIV_HIDE_LIMIT, 1));
	}
};
Civilization.prototype.seekPower = function () {
	return this.curiosity * this.civilization / (1 + Math.pow(this.civilization / CIV_HIDE_LIMIT, 1));
};
Civilization.prototype.findCivilization = function (civ) {
	if (civ === this) return;
	// 如果已经发现过了
	if (this.others.indexOf(civ) >= 0) return;
	
	this.others.push(civ);
	if (civ.known.indexOf(this) < 0) civ.known.push(this);
	
	// 如果是自我展示的性格，则告知对方自己的存在
	if (this.charactor.showSelf) {
		if (this.ally.indexOf(civ) < 0) {
			this.ally.push(civ);
		}
	}
	// 告诉所有盟友这颗星球的存在
	var l = this.ally.length, i, ally;
	for (i = 0; i < l; i += 1) {
		ally = this.ally[i];
		if (!isNull(ally) && ally !== this && ally !== civ) {
			if (ally.findRequest.indexOf(this) < 0) ally.findRequest.push(this);
		}
	}
	
	// 如果是主动攻击的性格，则攻击对方
	if (this.charactor.attack) {
		civ.beenAttacked(this);
	}
	
	// 如果是帮助弱者的性格，则判断对方比自己弱，若真则帮助对方
	if (!this.charactor.attack && this.charactor.helpWeaker) {
		if (civ.civilization < this.civilization) {
			civ.beenHelped(this);
		}
	}
};
Civilization.prototype.dealFindRequest = function () {
	var l = this.findTask.length, i;
	for (i = 0; i < l; i += 1) {
		this.findCivilization(this.findTask[i]);
	}
};
Civilization.prototype.beenAttacked = function (civ) {
	if (this === civ) return;
	if (civ.civilization <= 0) return;
	if (this.civilization <= 0) return;
	
	this.beattacked		+= 1;
	civ.attack			+= 1;
	warPerYear			+= 1;
	
	// 如果是友方文明，则从盟友状态解除
	var i;
	i = this.ally.indexOf(civ);
	if (i >= 0) this.ally.splice(i, 1);

	// 遭受打击
	var attack = civ.civilization * CIV_ATTACK_DAMAGE;
	this.civilization -= attack;
	if (this.civilization < 0) this.civilization = 0;
	this.beenAttackedScore	+= attack;
	warPower				+= attack;
	
	if (this.others.indexOf(civ) < 0) this.findCivilization(civ);

	// 反击
	if (this.charactor.backAfterAttack) {
		civ.beenAttacked(this);
	}
	// 盟友行为
	var l = this.ally.length, ally;
	for (i = 0; i < l; i += 1) {
		ally = this.ally[i];
		if (!isNull(ally) && ally !== this && ally !== civ) {
			// 协助反击
			if (ally.charactor.anitAfterAttack) {
				ally.attackRequest.push(civ);
			}
			// 协助重建
			if (ally.charactor.helpAfterAttack) {
				if (ally.civilization > this.civilization) ally.helpRequest.push(this);
			}
		}
	}
	
	// 隐藏自己
	if (this.charactor.hideAfterAttack) {
		this.hideSelf();
	}
};
Civilization.prototype.dealAtckRequest = function () {
	var l = this.attackTask.length, i;
	for (i = 0; i < l; i += 1) {
		this.attackTask[i].beenAttacked(this);
	}
};
Civilization.prototype.beenHelped = function (civ) {
	if (this === civ) return;

	// 对已死的文明，就不救了
	if (civ.helpScore < 0) return;
	if (civ.civilization <= 0) return;
	if (this.civilization <= 0) return;
	
	if (random() < 0.5) return;
	
	this.behelped	+= 1;
	civ.help		+= 1;
	helpPerYear		+= 1;
	
	// 如果不是友方文明，则加为盟友
	var i;
	i = this.ally.indexOf(civ);
	if (i < 0) this.ally.push(civ);

	// 获得帮助
	var help = (civ.civilization - this.civilization) * CIV_HELP_RATE * (CIV_LIMIT - this.civilization) / CIV_LIMIT;
	if (help > this.civilization * HELP_LIMIT) help = this.civilization * HELP_LIMIT;
	this.civilization += help;
	if (this.civilization > CIV_LIMIT) this.civilization = CIV_LIMIT;
	civ.helpScore			-= help;
	this.beenHelpedScore	+= help;
	helpPower				+= help;
	
	if (this.others.indexOf(civ) < 0) this.findCivilization(civ);
};
Civilization.prototype.dealHelpRequest = function () {
	var l = this.helpTask.length, i;
	for (i = 0; i < l; i += 1) {
		if (this.helpScore > 0) this.helpTask[i].beenHelped(this);
	}
};
Civilization.prototype.hideSelf = function () {
	var circle = this.known;
	var len = circle.length;
	var i, j;
	for (i = 0; i < len; i += 1) {
		j = circle[i].others.indexOf(this);
		if (j >= 0) circle[i].others.splice(j, 1);
		j = circle[i].ally.indexOf(this);
		if (j >= 0) circle[i].ally.splice(j, 1);
	}
	this.known = [];
	this.ally = [];
};

function getAllies (civ) {
	var allies = [], circle = [civ], next = [];
	var found = true;
	var len, l, i, j, civA, civB;
	
	while (found) {
		found = false;
		next = [];
		len = circle.length;
		for (i = 0; i < len; i += 1) {
			civA = circle[i].ally;
			l = civA.length;
			for (j = 0; j < l; j += 1) {
				civB = civA[j];
				if (isNull(civB)) continue;
				if (allies.indexOf(civB) < 0 && civB !== civ) {
					found = true;
					next.push(civB);
					allies.push(civB);
				}
			}
		}
		circle = next;
	}
	
	return allies;
}
function getDistance (civA, civB) {
	var dX, dY, dZ, half = ENV_SIZE / 2;
	dX = Math.abs(civA.position.x - civB.position.x);
	dY = Math.abs(civA.position.y - civB.position.y);
	dZ = Math.abs(civA.position.z - civB.position.z);
	if (dX > half) dX = ENV_SIZE - dX;
	if (dY > half) dY = ENV_SIZE - dY;
	if (dZ > half) dZ = ENV_SIZE - dZ;
	dX *= dX;
	dY *= dY;
	dZ *= dZ;
	return Math.sqrt(dX + dY + dZ);
}

function Society () {
	this.year = 0;
	this.civilizations = [new Civilization(this.year)];
}
Society.prototype.develop = function () {
	var len = this.civilizations.length;
	var i;
	var civA;
	var hasNew = false;
	
	warPerYear	= 0;
	helpPerYear	= 0;
	warPower	= 0;
	helpPower	= 0;
	
	this.year += 1;
	recorder.newYear(this.year);
	
	// 按照一定的几率创建新文明
	if (len < CIV_MAX && random() < CIV_BIRTH_RATE) {
		this.civilizations.push(new Civilization(this.year));
		len += 1;
		hasNew = true;
	}
	
	// 每个文明自己的发展
	for (i = 0; i < len; i += 1) {
		civA = this.civilizations[i];
		civA.grow();
		civA.powerHide = civA.hidePower();
		civA.powerSeek = civA.seekPower();
	}
	
	// 每个文明探索自己已知范围内的别的文明
	var distance, l;
	for (i = 0; i < len; i += 1) {
		civA = this.civilizations[i];
		for (j = 0; j < len; j += 1) {
			if (i === j) continue;
			civB = this.civilizations[j];
			distance = civA.distance[civB.id];
			if (isNull(distance)) {
				distance = getDistance(civA, civB);
				civA.distance[civB.id] = distance;
				civB.distance[civA.id] = distance;
			}
			// 如果在已探测范围，检测是否能发现它
			if (distance < civA.explore) {
				if (random(civA.powerSeek) > random(civB.powerHide)) {
					civA.findCivilization(civB);
				}
			}
		}
	}

	// 三类请求的预处理
	for (i = 0; i < len; i += 1) {
		civA = this.civilizations[i];

		civA.findTask = civA.findRequest;
		civA.findRequest = [];

		civA.helpTask = civA.helpRequest;
		civA.helpRequest = [];

		civA.attackTask = civA.attackRequest;
		civA.attackRequest = [];
	}
	
	for (i = 0; i < len; i += 1) {
		civA = this.civilizations[i];
		
		// 处理三类请求
		civA.dealFindRequest();
		civA.dealHelpRequest();
		civA.dealAtckRequest();
		
		// 对已知文明做例行监测，判断是否攻击或者帮助
		l = civA.others.length;
		for (j = 0; j < l; j += 1) {
			civB = civA.others[j];
			if (isNull(civB) || civB.civilization <= 0) continue;
			// 如果是帮助弱者的性格，则判断是否需要给予帮助
			if (!civA.charactor.attack && civA.charactor.helpWeaker && civA.helpScore > 0) {
				if (civA.civilization > civB.civilization) {
					civB.beenHelped(civA);
				}
			}
			if (civA.charactor.attack) {
				civB.beenAttacked(civA);
			}
		}
	}
	
	var dead = 0, attacker = 0, helper = 0, shower = 0, found = 0, ally = 0, civ = 0, exp = 0;
	for (i = len - 1; i >= 0; i -= 1) {
		civA = this.civilizations[i];

		// 对每个文明做统计
		if (civA.explore > civA.maxExp) civA.maxExp = civA.explore;
		if (civA.civilization > civA.maxCiv) civA.maxCiv = civA.civilization;
		if (civA.ally.length > civA.maxAlly) civA.maxAlly = civA.ally.length;
		if (civA.others.length > civA.maxFound) civA.maxFound = civA.others.length;
		if (civA.charactor.attack) {
			civA.atckRate += 1;
			attacker += 1;
		}
		else if (civA.charactor.helpWeaker) {
			civA.helpRate += 1;
			helper += 1;
		}
		if (civA.charactor.showSelf) {
			civA.showRate += 1;
			shower += 1;
		}
		found += civA.others.length;
		ally += civA.ally.length;
		civ += civA.civilization;
		exp += civA.explore;

		// 去除已经死亡的文明
		if (civA.civilization <= 0) {
			dead += 1;
			civA.hideSelf();
			recorder.funeral(civA);
			for (j = 0; j < len; j += 1) {
				civB = this.civilizations[j];
				if (!isNull(civB)) {
					distance = civB.known.indexOf(civA);
					if (distance >= 0) {
						civB.known.splice(distance, 1);
					}
				}
			}
			this.civilizations.splice(i, 1);
		}
	}
	
	// 记录
	recorder.record({
		hasNew		: hasNew,
		dead		: dead,
		live		: len,
		civ			: civ / len,
		exp			: exp / len,
		founds		: found / len,
		allies		: ally / len,
		attackers	: attacker,
		helpers		: helper,
		showers		: shower,
		wars		: warPerYear,
		warPower	: warPower,
		help		: helpPerYear,
		helpPower	: helpPower
	});
};
Society.prototype.draw = function (time) {
	var civ = 0, exp = 0;
	var i, len = this.civilizations.length, civil;
	
	var allyNum = 0;
	var knowNum = 0;
	var attacker = 0;
	var helper = 0;
	var shower = 0;
	for (i = 0; i < len; i += 1) {
		civil = this.civilizations[i];
		civ += civil.civilization;
		exp += civil.explore;
		allyNum += civil.ally.length;
		knowNum += civil.others.length;
		if (civil.charactor.attack) attacker += 1;
		if (civil.charactor.helpWeaker) helper += 1;
		if (civil.charactor.showSelf) shower += 1;
	}
	civ /= len;
	exp /= len;
	allyNum /= len;
	knowNum /= len;
	
	var total = 90;
	var value1 = Math.round(civ / CIV_LIMIT * total);
	var value2 = Math.round(exp / ENV_SIZE * total);
	var s = '';
	
	if (value1 > value2) {
		for (i = 0; i < value2; i += 1) {
			s += 'X';
		}
		for (i = value2; i < value1; i += 1) {
			s += '0';
		}
		for (i = value1; i < total; i += 1) {
			s += '.';
		}
	}
	else {
		for (i = 0; i < value1; i += 1) {
			s += 'X';
		}
		for (i = value1; i < value2; i += 1) {
			s += '0';
		}
		for (i = value2; i < total; i += 1) {
			s += '.';
		}
	}
	
	console.log(s + ' ' + time + ' | ' + len + '/' + civilization_total + " > "
		+ Math.round(allyNum * 10) / 10 + ","
		+ Math.round(knowNum * 10) / 10 + "|"
		+ attacker + "," + helper + "," + shower + " | "
		+ warPerYear + "/" + helpPerYear);
};

exports.Civilization	= Civilization;
exports.Society			= Society;