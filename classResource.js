/*
 * 宇宙，星球，资源
 */

const utils		= require('./utils');
const recorder	= require('./recorder');

const isNull = utils.isNull;
const random = utils.random;

const STAR_COUNT		= 1000;	// 星球总数
//const STAR_COUNT		= 10000;	// 星球总数
const RESOURCE_COUNT	= 100000;	// 每个星球上的资源上限

const SPACE_RESOURCE			= 1;		// 星际空间的资源值
const STAR_RESOURCE_MIN			= 10000;	// 星球资源的最小值
const STAR_RESOURCE_MAX			= 100000;	// 星球资源的最大值

const STAR_OCCUPY_DESTROY	= 0.5;			// 一颗星球被占领时已探索区域的折损率
const STAR_EXPAND_RATE		= 0.001;		// 每单位文明值所提供的推广探索区域的能力
const STAR_EXPAND_CONSUME	= 10000;		// 维持并推广探索区域所消耗的文明点
const STAR_EXPAND_DECAY		= 10;			// 星球探索范围每纪年的自然衰败率
const STAR_EXPAND_LIMIT		= 10000;		// 每单位文明值支持的星球每个纪元探索区域扩展速度的极限，是已探索区域的倍数
const CIV_PER_RESOURCE		= 10000;			// 一点资源可以支持多少文明值


function classStar () {
	this.position = {
		x	: Math.floor(random(ENV_SIZE)),
		y	: Math.floor(random(ENV_SIZE)),
		z	: Math.floor(random(ENV_SIZE))
	};
	this.resource = Math.round(random(STAR_RESOURCE_MIN, STAR_RESOURCE_MAX));
	this.civilization = null;
	this.explore = 1;
	this.size = 1;
}
classStar.prototype.occupy = function (civ) {
	this.civilization = civ;
	this.explore *= STAR_OCCUPY_DESTROY;
	if (this.explore < 1) this.explore = 1;
};
classStar.prototype.expand = function (civ) {
	var rate_limit = civ.civilization / CIVILIZATION_LIMIT * STAR_EXPAND_LIMIT * this.explore;
	var exp_rate = civ.civilization * STAR_EXPAND_RATE / this.size * (ENV_SIZE - this.explore) / ENV_SIZE * civ.curiosity;
	if (exp_rate > rate_limit) exp_rate = rate_limit;
	civ.civilization -= this.explore * this.explore * exp_rate * STAR_EXPAND_CONSUME;	// 拓张会消耗文明值
	exp_rate -= this.size * STAR_EXPAND_DECAY;							// 每年星球探索区域的衰落
	if (civ.civilization < 1) civ.civilization = 1;
	this.explore += exp_rate;
	if (this.explore < 1) this.explore = 1;
	else if (this.explore > ENV_SIZE) this.explore = ENV_SIZE;
	this.size = Math.pow(this.explore, 3);
};
classStar.prototype.support = function () {
	return (this.resource + SPACE_RESOURCE * this.size) * CIV_PER_RESOURCE;
};

/*
 * 创造星球。为了简单，会随机在宇宙格点位置生成星球，然后将重复的星球去除。
 */
function createStars (universe) {
	var i, names = [], star, name;
	for (i = 0; i < STAR_COUNT; i += 1) {
		star = new classStar();
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
	
	for (i = 1; i < len; i += 1) {
		disA = universe.distances[i] || [];
		disA[i] = 0;
		for (j = 0; j < i; j += 1) {
			disB = universe.distances[j] || [];
			dis = distance(universe.stars[i], universe.stars[j]);
			disA[j] = dis;
			disB[i] = dis;
		}
	}
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