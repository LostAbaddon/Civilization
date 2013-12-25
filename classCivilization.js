/*
 * 每个文明可以有多个星球
 * 每个文明的发展程度取决于所占据星球和空间的资源总和。
 * 文明值决定了星际探索能力，而星际探索能力分为以下几个等级：
 * 1.星系探索能力，可以发展星际空间探索
 * 2.星际探索能力，能发现别的文明
 * 3.星际交互能力，能发动远程攻击和援助
 */

const utils		= require('./utils');
const recorder	= require('./recorder');

const cosmos	= require('./classCosmos');

const isNull = utils.isNull;
const random = utils.random;

const INTSTL_CIV_LIMIT	= 1;	// 具有星际探索能力的文明阀值，这个值也决定了发现别的文明的能力
const EXPAND_LIMIT		= 100;	// 拓展的极限速度（倍）

/*
 * 这个类代表了所有在星际范围传播的元素，包括通讯信息、援助和攻击
 * 信号内容：
 * 0：空信号
 * 1：搜索信号
 * 2：展示信号，可携带信息，表示星球代号
 * 3：援助信号，可携带信息，表示援助文明值
 * 4：攻击信号，可携带信息，表示攻击值
 * 5：攻击发出信号，可携带信息，表示攻击者所在星球
 * 6：遭遇攻击信号，可携带信息，表示遭遇攻击的星球
 */
function classMessage () {
	this.start	= cosmos.currentEra();
	this.from	= -1;
	this.to		= -1;
	
	this.timeSpent	= 0;
	this.timeLeft	= 0;
	this.arrive		= false;
	
	this.signal		= 0;
	this.message	= 0;
}
classMessage.prototype.fly = function () {
	this.timeSpent	+= 1;
	this.timeLeft	-= 1;
	if (this.timeLeft <= 0) {
		this.arrive = true;
	}
};

var civilizationCount = 0;

function pickStar (civ) {
	var id, needFind = true, universe = cosmos.universe;
	while (needFind) {
		id = Math.floor(random(universe.starCount));
		if (universe.stars[id].civilization === null) {
			needFind = false;
		}
	}
	civ.stars.push(id);
	universe.stars[id].occupy(civ);
}

function classCivilization () {
	this.id = civilizationCount;
	civilizationCount += 1;
	
	this.birth	= cosmos.currentEra();	// 出生纪年
	this.death	= -1;					// 死亡纪年
	
	this.stars	= [];
	
	this.resource		= 0;
	this.civilization	= 1;
	this.explore		= 1;
	
	this.curiosity	= random(0.5, 1);
	
	pickStar(this);
	this.resource = cosmos.universe.stars[this.stars[0]].support();
}
classCivilization.prototype.die = function () {
	var len, i;
	
	len = this.stars.length;
	for (i = 0; i < len; i += 1) {
		cosmos.universe.stars[this.stars[i]].civilization = null;
	}
	
	this.death = cosmos.currentEra();
};
classCivilization.prototype.grow = function () {
	var me = this;
	
	this.explore = 0;
	this.resource = 0;
	this.stars.map(function (star) {
		star = cosmos.universe.stars[star];
		star.expand(me);
		me.explore += star.explore;
		me.resource += star.support();
	});

	var devRate = this.civilization / CIVILIZATION_SLOWDOWN_LIMIT;
	devRate = 1 / (1 + devRate * devRate);
	var civLimit = this.resource;
	var resRate = (civLimit - this.civilization) / civLimit;
	var civRate = (CIVILIZATION_LIMIT - this.civilization) / CIVILIZATION_LIMIT;
	var civSpeed = CIVILIZATION_DEVELOP_SPEED * this.civilization * devRate * resRate * civRate;
	this.civilization += civSpeed;
	if (this.civilization > CIVILIZATION_LIMIT) this.civilization = CIVILIZATION_LIMIT;
};

module.exports = classCivilization;