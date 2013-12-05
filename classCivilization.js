const utils = require('./utils');

const isNull = utils.isNull;
const random = utils.random;

const ENV_SIZE	= 1000000;		// 容器尺寸
const CIV_MAX	= 100000;		// 文明数量
const CIV_LIMIT	= 999999999;	// 文明的文明值上限

const CIV_VALVE	= 10000000;		// 发展速度减半的阀值

var civilization_total = 0;		// 目前文明总数

function Civilization () {
	this.id = civilization_total;
	civilization_total += 1;
	
	this.position = {
		x : random(-ENV_SIZE, ENV_SIZE),
		y : random(-ENV_SIZE, ENV_SIZE),
		z : random(-ENV_SIZE, ENV_SIZE)
	};
	this.occupy = 1;		// 当前文明实际占有区域
	this.explore = 1;		// 当前文明已经探索区域
	this.civilization = 1;	// 当前文明的文明值
};

Civilization.prototype.grow = function () {
	var rate = this.civilizationi / CIV_VALVE;
	var speed = this.civilization / (1 + rate * rate) * (CIV_LIMIT - this.civilization);
	if (speed < 0) speed = 0;
	this.civilization += speed;
	
	var total = 120, value = Math.round(this.civilization / CIV_LIMIT * total);
	var s = '';
	var i;
	for (i = 0; i < value; i += 1) {
		s += '+';
	}
	for (i = value; i < total; i += 1) {
		s += '-';
	}
	console.log('s');
	console.log(s.length);
};

exports.Civilization = Civilization;