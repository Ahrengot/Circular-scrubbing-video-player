window.CircularProgress = function(containerEl, radius, strokeWidth, strokeColor, setProgressCallback) {
	// Internal properties
	var self 				= this,
		radius 				= radius,
		w					= (radius * 2) + strokeWidth,
		h					= w,
		halfW				= w >> 1,
		halfH				= h >> 1,
		paper 				= Raphael(containerEl, w, h),
		paperCenterX		= 0,
		paperCenterY		= 0,
		$container			= $('#' + containerEl),
		progressBar;
	
	// Custom Attribute
	paper.customAttributes.arc = function (value, total, radius) {
	    var angle 			= 360 / total * value,
	        radians			= (90 - angle) * Math.PI / 180,
	        x 				= halfW + radius * Math.cos(radians),
	        y 				= halfH - radius * Math.sin(radians),
	        isMoreThan180 	= +(angle > 180),
	        path 			= [["M", halfW, halfH - radius], ["A", radius, radius, 0, isMoreThan180, 1, x, y]];
	    
	    return {path: path};
	};
	
	function init() {
		self.progress = 0;
		self.lastProgress = self.progress;
		self.isScrubbing = false;
		drawProgBar();
		
		$(window).resize(handleResize);
		$(window).resize();
	}
	
	function drawProgBar() {
		progressBar = paper.path()
						.attr({stroke: strokeColor, "stroke-width": strokeWidth, cursor: 'pointer', arc: [0, 100, radius]})
						.click(handleProgBarClick)
						.drag(handleProgBarMove, handleProgBarDown, handleProgBarUp);
	}
	
	// Event Handlers
	function handleResize(e) {
		var containerPos 	= $container.offset(),
			paddingLeft 	= $container.css('padding-left'),
			paddingTop		= $container.css('padding-top');
		
		paperCenterX = containerPos.left + (w >> 1) + parseInt(paddingLeft);
		paperCenterY = containerPos.top + (h >> 1) + parseInt(paddingTop);
	}
	
	function handleProgBarClick() {
		
	}
	
	function handleProgBarMove(dragLenghtX, dragLenghtY, pageX, pageY, event) {
		var angle = calculateAngle(paperCenterX, paperCenterY, event.pageX, event.pageY);
		angle = Math.round(angle);
		
		// Convert 0-360° value to 0-100% value.
		var perc = Math.round((angle / 360) * 100);
		
		self.setProgress(perc, 100);
	}
	
	function handleProgBarDown() { self.isScrubbing = true; }
	
	function handleProgBarUp() { self.isScrubbing = false; }
	
	function calculateAngle(x1, y1, x2, y2) {
		var radiansToDegrees 	= Math.PI / 180,
			degreesToRadians 	= 180 / Math.PI,
			xDiff 				= x2 - x1,
			yDiff 				= (y2 - y1) * -1,
			angleInRadians 		= Math.atan(yDiff / xDiff),
			angle 				= angleInRadians / radiansToDegrees;
		
		
		if (xDiff < 0) angle += 180;
		if (xDiff > 0 && yDiff < 0) angle += 360;
		
		angle = (angle * -1) + 90;
		if (angle < 0) angle += 360;
		
		return angle;
	}
	
	// Public methods
	self.setProgress = function(value, duration, ease) {
		if (ease == undefined) ease = 'easeOut';
		if (duration == undefined) duration = 400;
		
		self.progress = value;
		
		if (self.progress != self.lastProgress) {
			if (duration == 0) {
				progressBar.attr({arc: [self.progress, 100, radius]});
			} else {
				progressBar.animate({arc: [self.progress, 100, radius]}, duration, ease);
			}
			self.lastProgress = self.progress;
		}
		
		setProgressCallback(value);
	}
	
	self.getProgress = function() { return self.progress; }
	
	// Alright, everything looks ready – Let's go!
	init();
}