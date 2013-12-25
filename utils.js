function isNull (obj) {
	if (obj === undefined) return true;
	if (typeof obj === 'undefined') return true;
	if (obj === null) return true;
	return false;
}

function random (min, max) {
	if (isNull(min)) return Math.random();
	if (min === true) return Math.random() > 0.5 ? true : false;
	if (isNull(max)) return Math.random() * min;
	if (max === true) return Math.random() < min ? true : false;
	return min + (max - min) * Math.random();
}

function format (text, length, char) {
	char = char || ' ';
	text = '' + text;
	var len = text.length;
	var i, result = text;
	for (i = len; i < length; i += 1) result = result + char;
	return result;
}

exports.isNull = isNull;
exports.random = random;
exports.format = format;