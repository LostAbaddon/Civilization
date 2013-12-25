/**
process.on('uncaughtException', function(err) {
	console.log('Caught exception: ' + err);
	showResult();
});
/**/

// 设置系统参数
global.ENV_SIZE						= 10000;			// 宇宙尺寸
global.CIVILIZATION_LIMIT			= 1000000000000;	// 文明可发展到的文明上限
global.CIVILIZATION_SLOWDOWN_LIMIT	= 10000000000;		// 文明发展速度减半的阀值
global.CIVILIZATION_DEVELOP_SPEED	= 1;				// 文明在每个纪年的发展速度
global.EXPLORE_GATE					= 1000000000000;	// 文明探索星际能力的

const recorder	= require('./recorder');
const cosmos	= require('./classCosmos');

cosmos.initial();
cosmos.evolute(100, 10);