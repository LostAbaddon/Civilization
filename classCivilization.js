/*
 * 说明：
 * 这里的文明都是单星模式，所以不考虑文明分裂导致的内耗等问题。
 */

const utils = require('./utils');

const isNull = utils.isNull;
const random = utils.random;

const ENV_SIZE	= 10000;		// 容器尺寸
const CIV_MAX	= 100000;		// 文明数量
const CIV_LIMIT	= 999999999;	// 文明的文明值上限

const CIV_VALVE			= 50000000;	// 发展速度减半的阀值
const INTSTL_CIV_LIMIT	= 100;		// 具有星际探索能力的文明阀值

var civilization_total = 0;		// 目前文明总数

function Civilization () {
	this.id = civilization_total;
	civilization_total += 1;
	
	this.position = {
		x : random(-ENV_SIZE, ENV_SIZE),
		y : random(-ENV_SIZE, ENV_SIZE),
		z : random(-ENV_SIZE, ENV_SIZE)
	};
	this.explore = 1;		// 当前文明已经探索区域，文明只能对explore范围内的星体做检测
	this.civilization = 1;	// 当前文明的文明值
	
	this.curiosity = random(0.01, 1);	// 向外探索的好奇心，增加explore范围，也决定了被发现的几率
};

Civilization.prototype.grow = function () {
	var exp_rate = this.civilization / INTSTL_CIV_LIMIT / (this.explore * this.explore * this.explore) * (ENV_SIZE - this.explore) / ENV_SIZE * this.curiosity;
	this.explore += exp_rate;

	var rate = this.civilization / CIV_VALVE;
	var speed = this.civilization / (1 + rate * rate) * (CIV_LIMIT - this.civilization) / CIV_LIMIT;
	this.civilization += speed;
};
Civilization.prototype.draw = function () {
	var total = 120;
	var value1 = Math.round(this.civilization / CIV_LIMIT * total);
	var value2 = Math.round(this.explore / ENV_SIZE * total);
	var s = '';
	var i;
	
	for (i = 0; i < value2; i += 1) {
		s += 'X';
	}
	for (i = value2; i < value1; i += 1) {
		s += '0';
	}
	for (i = value1; i < total; i += 1) {
		s += '.';
	}
	
	console.log(s);
};

exports.Civilization = Civilization;