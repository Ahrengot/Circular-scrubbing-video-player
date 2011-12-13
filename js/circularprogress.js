window.CircularProgress = function(radius, strokewidth, setProgressCallback) {
	// Internal properties
	var self 				= this,
		radius 				= radius,
		strokeWidth			= strokewidth,
		w					= (radius * 2) + strokeWidth,
		h					= w,
		halfW				= w >> 1,
		halfH				= h >> 1,
		paper 				= Raphael("holder", w, h),
		progressBar;
	
	// Custom Attribute
	paper.customAttributes.arc = function (value, total, radius) {
	    var angle 	= 360 / total * value,
	        radians	= (90 - angle) * Math.PI / 180,
	        x 		= halfW + radius * Math.cos(radians),
	        y 		= halfH - radius * Math.sin(radians),
	        path 	= [["M", halfW, halfH - radius]];
	    
	    // +(expression) converts true/false to 1/0 
	    var isMoreThan180 = +(angle > 180);
	    
	    // Make bar appear as 100% complete by setting it to 99% – Otherwise it's removed
	    if (total == value) x = halfW - 0.01, y = halfH - radius;
	    
	    path.push(["A", radius, radius, 0, isMoreThan180, 1, x, y]);
	    
	    return {path: path};
	};
	
	function init() {
		self.progress = 0;
		self.isScrubbing = false;
		drawProgBar();
	}
	
	function drawProgBar() {
		progressBar = paper.path()
						.attr({stroke: "rgb(255,255,255)", "stroke-width": strokeWidth, arc: [0, 100, radius]})
						.click(handleProgBarClick)
						.drag(handleProgBarMove, handleProgBarDown, handleProgBarUp);
	}
	
	// Event Handlers
	function handleProgBarClick() {
		console.log('clicked progress bar');
	}
	
	function handleProgBarMove(startX, startY, pageX, pageY) {
		var centerX = 0,
			centerY = 0,
			angle 	= Raphael.angle(centerX, centerY, pageX, pageY);
		
		/*angle = (angle * -1) + 90;
		if (angle < 0) angle += 360;*/
		
		console.log('Angle: ' + angle);
		
		/*if (angle < 0) {
			console.log('old angle was: ' + angle + ' – Correcting it to: ' + (360 - angle));
			angle = 360 - angle;
		}*/
			
		var perc = (angle / 360) * 100;
		
		self.setProgress(perc, 20);
	}
	
	function handleProgBarDown() {
		self.isScrubbing = true;
	}
	
	function handleProgBarUp() {
		self.isScrubbing = false;
	}
	
	// Public methods
	self.setProgress = function(value, duration, ease) {
		if (ease == undefined) ease = 'easeOut';
		if (duration == undefined) duration = 400;
		
		self.progress = value;
		progressBar.animate({arc: [self.progress, 100, radius]}, duration, ease);
		
		setProgressCallback(value);
	}
	
	self.getProgress = function() { return self.progress; }
	
	// Alright, everything looks ready – Let's go!
	init();
}