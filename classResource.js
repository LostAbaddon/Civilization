/*
 * 宇宙，星球，资源
 */

const utils		= require('./utils');
const recorder	= require('./recorder');

const isNull	= utils.isNull;
const random	= utils.random;

const cosmos	= require('./classCosmos');

const STAR_COUNT		= 2000;		// 星球总数
//const STAR_COUNT		= 10000;	// 星球总数

const SPACE_RESOURCE			= 2;		// 星际空间的资源值
const STAR_RESOURCE_MIN			= 10000;	// 星球资源的最小值
const STAR_RESOURCE_MAX			= 100000;	// 星球资源的最大值

const STAR_OCCUPY_DESTROY	= 0.5;			// 一颗星球被占领时已探索区域的折损率
const STAR_EXPAND_RATE		= 50000;		// 每单位文明值所提供的推广探索区域的能力
const STAR_EXPAND_CONSUME	= 100;			// 维持并推广探索区域所消耗的文明点
const STAR_EXPAND_DECAY		= 0.00000001;	// 星球探索范围每纪年的自然衰败率
const STAR_RECOVER			= 100;			// 每个纪年星球资源的恢复量
const STAR_USE_RATE			= 10000;		// 每个纪年每个文明点要消耗的资源量
const STAR_EXPAND_LIMIT		= 500;			// 每个纪年每个文明点能提供的最大发展速率

function classStar (id) {
	this.id = id;
	this.position = {
		x	: Math.floor(random(ENV_SIZE)),
		y	: Math.floor(random(ENV_SIZE)),
		z	: Math.floor(random(ENV_SIZE))
	};
	this.resource = Math.round(random(STAR_RESOURCE_MIN, STAR_RESOURCE_MAX));
	this.used = 0;
	this.civilization = null;
	this.explore = 1;
	this.size = 1;
	this.sphere = 1;
}
classStar.prototype.occupy = function (civ) {
	this.civilization = civ;
	this.explore *= STAR_OCCUPY_DESTROY;
	if (this.explore < 1) this.explore = 1;
};
classStar.prototype.expand = function (civ) {
	var me = this;
	
	var civ_rate = civ.civilization / CIVILIZATION_LIMIT;

	this.used += civ_rate * STAR_USE_RATE - STAR_RECOVER * (1 - this.used / this.resource);
	var totalR = this.resource + this.size * SPACE_RESOURCE;
	if (this.used < 0) this.used = 0;
	else if (this.used > totalR) this.used = totalR;
	
	var exp_limit = civ_rate * STAR_EXPAND_LIMIT * this.explore;
	var exp_rate = civ_rate * STAR_EXPAND_RATE / this.sphere * (ENV_SIZE - this.explore) / ENV_SIZE * civ.curiosity * civ.eager;
	civ.civilization -= this.sphere * exp_rate * STAR_EXPAND_CONSUME;	// 拓张会消耗文明值
	if (civ.civilization < 1) civ.civilization = 1;
	exp_rate -= this.size * STAR_EXPAND_DECAY;							// 每年星球探索区域的衰落
	if (exp_rate > exp_limit) exp_rate = exp_limit;

	this.explore += exp_rate;
	if (this.explore < 1) this.explore = 1;
	else if (this.explore > ENV_SIZE) this.explore = ENV_SIZE;
	
	this.sphere = this.explore * this.explore;
	this.size = this.sphere * this.explore;
	
	var dis, min = ENV_SIZE;
	cosmos.universe.stars.map(function (star) {
		if (star !== me && star.civilization !== civ) {
			dis = cosmos.universe.distances[me.id][star.id];
			if (dis < min) min = dis;
			if (dis <= me.explore) {
				civ.findStar(star);
			}
		}
	});
	/**/
	var exp_speed = (exp_rate / this.explore) / (civ.civilization / CIVILIZATION_LIMIT);
	if (exp_speed > MAX_EXP_SPEED) MAX_EXP_SPEED = exp_speed;
	console.log(this.id, min,
		Math.round(this.explore * 100) / 100,
		Math.round(this.used / totalR * 100) / 100,
		Math.round(civ.eager * 100) / 100,
		Math.round(exp_speed * 100) / 100,
		Math.round(MAX_EXP_SPEED * 100) / 100
	);
	if (this.explore > 1000) throw 'Develop Too Fast!!!';
	/**/
};
var MAX_EXP_SPEED = 0;

classStar.prototype.support = function () {
	return (this.resource - this.used + SPACE_RESOURCE * this.size);
};

/*
 * 创造星球。为了简单，会随机在宇宙格点位置生成星球，然后将重复的星球去除。
 */
function createStars (universe) {
	var i, names = [], star, name;
	for (i = 0; i < STAR_COUNT; i += 1) {
		star = new classStar(i);
		name = star.position.x + "-" + star.position.y + "-" + star.position.z;
		if (names.indexOf(name) >= 0) {
			i -= 1;
		}
		else {
			names.push(name);
			universe.stars[i] = star;
			classUniverse.Resource_Limit += star.resource;
		}
	}
	classUniverse.Resource_Limit += ENV_SIZE * ENV_SIZE * ENV_SIZE * SPACE_RESOURCE;
	universe.starCount = universe.stars.length;
}

/*
 * 计算星球间距离
 */
function distance (starA, starB) {
	var half_size = Math.ceil(ENV_SIZE / 2);
	var dX = Math.abs(starA.position.x - starB.position.x);
	var dY = Math.abs(starA.position.y - starB.position.y);
	var dZ = Math.abs(starA.position.z - starB.position.z);
	if (dX > half_size) dX = ENV_SIZE - dX;
	if (dY > half_size) dY = ENV_SIZE - dY;
	if (dZ > half_size) dZ = ENV_SIZE - dZ;
	return Math.ceil(Math.sqrt(dX * dX + dY * dY + dZ * dZ));
}
function calculateDistance (universe) {
	var i, j, len = universe.starCount, disA, disB, dis;
	
	for (i = 0; i < len; i += 1) {
		universe.distances[i] = universe.distances[i] || [];
	}
	universe.distances[0][0] = 0;
	
	for (i = 1; i < len; i += 1) {
		disA = universe.distances[i];
		disA[i] = 0;
		for (j = 0; j < i; j += 1) {
			disB = universe.distances[j];
			dis = distance(universe.stars[i], universe.stars[j]);
			disA[j] = dis;
			disB[i] = dis;
		}
	}
	
	var min = [], dis, MIN = ENV_SIZE, MAX = 0, AVE = 0;
	for (i = 0; i < len; i += 1) {
		min[i] = ENV_SIZE;
		for (j = 0; j < len; j += 1) {
			if (i === j) continue;
			dis = universe.distances[i][j];
			if (min[i] > dis) min[i] = dis;
		}
		if (MIN > min[i]) MIN = min[i];
		if (MAX < min[i]) MAX = min[i];
		AVE += min[i];
	}
	console.log(MIN, MAX, AVE / len);
}

function classUniverse () {
	this.resource	= SPACE_RESOURCE;	// 星际空间的平均资源量
	
	this.stars		= [];
	this.starCount	= 0;
	
	this.distances	= [];
	
	createStars(this);
	calculateDistance(this);
}

classUniverse.Resource_Limit = 0;

module.exports = classUniverse;