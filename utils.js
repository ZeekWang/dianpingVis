function closeTipsy(node){
	var tip = $(node).parent().parent();
	var ele = tip.get(0).__element__;
	$(ele).bind("mouseout", function(){
		$(ele).tipsy("hide");
	})
	tip.remove();	
}

function mapping(value, vMin, vMax, tMin, tMax) {
	value = value < vMin ? vMin : value;
	value = value > vMax ? vMax : value;
	return (value - vMin) / (vMax - vMin) * (tMax - tMin) + tMin;
}

/*
	options = {
		dots: [{x:1, count:20}, {x:2, count:10}],
		width: 500,
		height: 50,
		sigma: 1,
		radius: 5 
	}
*/

 function dotsToLine(options) {
	if (!options || !options.dots){
		alert("Error! No dots data.");
		return;
	}
	options.width = options.width ? options.width : 500;
	options.height = options.height ? options.height : 500;
	options.sigma = options.sigma ? options.sigma : 1;
	options.radius = options.radius ? Math.round(options.radius) : 5;
	options.lastPointZero = options.lastPointZero == undefined ? true: options.lastPointZero; 
	var model = [];
	var sigma = options.sigma, 
		r = options.radius, 
		width = options.width,
		height = options.height;
	var vMin = Number.MAX_VALUE, vMax = Number.MIN_VALUE;

	for (var i = -r; i <= r; i++) {
		model.push( 1 / (Math.sqrt(2 * Math.PI)*sigma) * Math.exp(-(i*i)/(2*sigma*sigma)) );
	}
	var line = [];
	for (var i = 0; i <= width; i++){
		line.push(0);
	}
	options.dots.forEach(function(d){
		var x = Math.round(d.x);
		for (var i = Math.max(-x, -r); i <= Math.min(r, width-x); i++) {
			line[x+i] += model[i+r] * (d.count ? d.count : 1);
		}
	});
	for (var i = 0; i <= width; i++) {
		if (!options.minValue)
			if (line[i] < vMin)
					vMin = line[i];
		if (!options.maxValue)
			if (line[i] > vMax)
					vMax = line[i];
	}
	if (options.minValue)
		vMin = options.minValue;
	if (options.maxValue)
		vMax = options.maxValue;
	options.minValue = vMin;
	options.maxValue = vMax;

	for (var i = 0; i <= width; i++) {
		line[i] = mapping(line[i], 0, vMax, 0, height);
	}
	line[width] = 0;
	return line;

}