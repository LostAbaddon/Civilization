const utils = require('./utils');

const isNull = utils.isNull;
const random = utils.random;

const ENV_SIZE = 1000000;		// 容器尺寸
const CIV_MAX = 100000;			// 文明数量
const CIV_LIMIT = 99999999999;	// 文明的文明值上限

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

exports.Civilization = Civilization;