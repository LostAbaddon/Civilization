/*
 * 宇宙，星球，资源
 */

const utils		= require('./utils');
const recorder	= require('./recorder');

const isNull = utils.isNull;
const random = utils.random;

const ENV_SIZE			= 10000;	// 宇宙尺寸
const STAR_COUNT		= 10000;	// 星球总数
const RESOURCE_COUNT	= 100000;	// 每个星球上的资源上限

const SPACE_RESOURCE			= 1;	// 星际空间的资源值
const STAR_RESOURCE_MIN			= 100;	// 星球资源的最小值
const STAR_RESOURCE_MAX			= 1000;	// 星球资源的最大值
const CIVILIZATION_PER_RESOURCE	= 10000;	// 一点资源可以支持多少文明值

function classStar () {
	this.position = {
		x	: Math.floor(random(ENV_SIZE)),
		y	: Math.floor(random(ENV_SIZE)),
		z	: Math.floor(random(ENV_SIZE))
	};
	this.resource = Math.round(random(STAR_RESOURCE_MIN, STAR_RESOURCE_MAX));
	this.civilization = -1;
}
classStar.prototype.getCivilizationLimit = function () {
	return this.resource * CIVILIZATION_PER_RESOURCE;
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
			universe.stars[i] = new classStar();
		}
	}
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
		for (j = 0; i < i; i += 1) {
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

exports.Universe = classUniverse;