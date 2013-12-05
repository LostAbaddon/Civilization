function isNull (obj) {
	if (obj === undefined) return true;
	if (typeof obj === 'undefined') return true;
	if (obj === null) return true;
	return false;
}

function random (min, max) {
	if (isNull(min)) return Math.random();
	if (isNull(max)) return Math.random() * min;
	return min + (max - min) * Math.random();
}

exports.isNull = isNull;
exports.random = random;