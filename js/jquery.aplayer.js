// Based on this tutorial: http://dev.opera.com/articles/view/custom-html5-video-player-with-css3-and-jquery/#sec5
(function($) {
	$.fn.aPlayer = function(options) {
		var defaults = {
			theme: 'ahrengot'
		}
		
		var options = $.extend(defaults, options);
		
		// iterate each matched <video> element
		return this.each(function() {
			var $video = $(this),
				unique = Math.round(Math.random()*(+new Date)).toString();
			
			//main wrapper
			var $video_wrap = $('<div class="a-video-player paused ended"></div>').addClass(options.theme);
			
			//controls wraper
			var html = '<div class="controls">';
			html += '<a class="play-pause paused" title="Play/Pause">Play/Pause</a>';
			html += '<div class="progress">';
			html += '<div class="playback-prog" id="prog-' + unique + '"></div>';
			html += '<div class="prog-hitbox" id="prog-hitbox-' + unique + '"></div>';
			html += '</div>';
			html += '<div class="timer"><time>00:00</time><p>Remaining</p></div>';
			html += '<div class="mute-unmute"></div>';
			html += '<div class="fullscreen"></div>';
			html += '</div>';
			
			var $video_controls = $(html);						
			
			// Wrap our video player in dynamically generated markup and remove default controls
			$video.wrap($video_wrap);
			$video.after($video_controls);
			$video.removeAttr('controls');
			
			// Cache video controls for later use
			var $container = $video.parent('.a-video-player');
			var $controls = $('.video-controls', $container);
			var $play_btn = $('.play-pause', $container);
			var $progress = $('#prog-' + unique, $container);
			var $timer = $('.timer', $container);
			var $mute_btn = $('.mute-unmute', $container);
			var $fullscreen_btn = $('.fullscreen', $container);
			
			$controls.fadeOut(0);
			
			// Progress bars – The larger stroke of progHitbox makes mouse-interaction easier.
			var playbackProg = new CircularProgress('prog-' + unique, 40, 4, 'white');
			var progHitbox = new CircularProgress('prog-hitbox-' + unique, 40, 20, 'red', {opacity: 0}, true, handleProgUpdate);
			
			// Hook up playback control events
			$play_btn.click(aPlay);
			$mute_btn.click(aMute);
			$fullscreen_btn.click(fullscreen);
			
			// Hook up media events
			$video.bind('play pause ended', handleVideoState);
			$video.bind('timeupdate', updateProg);
			//updateBuffer();
			
			var fadeTimer; 
			$(progHitbox.el).hover(function() {
				// Delay fadeIn so time read-out only shows when intended and not when they mouse simply passes over it to reach play/pause.
				fadeTimer = setTimeout(function() {
					$timer.fadeIn(100);
					$play_btn.fadeOut(200);
				}, 200);
			}, function() {
				clearTimeout(fadeTimer);
				$play_btn.fadeIn(100);
				$timer.fadeOut(200);
			});
			
			
			// Handle media events
			function handleVideoState(e) {
				switch(e.type) {
					case 'play':
						console.log('play event fired');
						$play_btn.removeClass('paused');
						$container.removeClass('paused ended');
						break;
					case 'pause':
						console.log('pause event fired');
						$play_btn.addClass('paused');
						$container.addClass('paused');
						break;
					case 'ended':
						console.log('ended event fired');
						$play_btn.addClass('paused');
						$container.addClass('paused ended');
						playbackProg.setProgress(0, 0);
						break;
				}
			}
			
			function updateProg() {
				var timeLeft 	= $video[0].duration - $video[0].currentTime,
					prog		= ($video[0].currentTime / $video[0].duration) * 100;
				
				if (!progHitbox.isScrubbing) progHitbox.setProgress(prog, 100);
				
				$timer.find('time').text(formatTime(timeLeft));							
			}
			
			/* function updateBuffer() {
				var percentBuffered = 0;
				// FF4+, Chrome, Safari6
				if ($video[0].buffered && $video[0].buffered.length > 0 && $video[0].buffered.end && $video[0].duration) {
					percentBuffered = $video[0].buffered.end(0) / $video[0].duration;	
				} 
				
				// FF3.6, Safari5
				else if ($video[0].bytesTotal != undefined && $video[0].bytesTotal > 0 && $video[0].bufferedBytes != undefined) {
					percentBuffered = $video[0].bufferedBytes / $video[0].bytesTotal;
				}
				
				// Fallback (probably not neccesary)
				//else percentBuffered = 1;
				
				if (percentBuffered < 1) setTimeout(updateBuffer, 300);
				console.log('updateBuffer: ' + percentBuffered);
			} */
			
			function handleProgUpdate(prog) {
				if (progHitbox.isScrubbing && prog < 100) {
					$video[0].currentTime = $video[0].duration * (prog / 100);
				}
				playbackProg.setProgress(prog);
			}
			
			// Playback logic
			function aPlay() {
				($video[0].paused)? $video[0].play() : $video[0].pause();
			}
			
			(function spawnControls() {
				// We need the video to be in the readyState before we can read it's duration.
				if($video[0].readyState > 0) {
					var duration = $video[0].duration;
					$timer.find('time').text(formatTime(duration));
					$video_controls.fadeIn(350);			
				} else {
					setTimeout(arguments.callee, 150);
				}
			})();
			
			function aMute() {
				($video[0].muted)? $video[0].muted = false : $video[0].muted = true;
				$mute_btn.toggleClass('muted', $video[0].muted);
			}
			
			// Playback helper methods
			
			function formatTime(seconds){
				// TODO: Refactor this section to make it more readable.
				var minutes = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
				var seconds = Math.floor(seconds - (minutes * 60)) < 10 ? "0" + Math.floor(seconds - (minutes * 60)) : Math.floor(seconds-(minutes * 60));
				
				return minutes + ":" + seconds;
			}
			
			// Other methods
			
			function fullscreen() {
				if ($video[0].requestFullScreen) {
					$video[0].requestFullScreen();
					resizePlayer('100%', '100%');
				} else if ($video[0].mozRequestFullScreen) {
					$video[0].mozRequestFullScreen();
					resizePlayer('100%', '100%');
				} else if ($video[0].webkitRequestFullScreen) {
					$video[0].webkitRequestFullScreen();
					resizePlayer('100%', '100%');
				} else {
					// Browser doesn't support fullscreen...
				}
			}
			
			function resizePlayer(w, h) {
				$video.css({'width': w, 'height': h});
			}
		});	
	}
})(jQuery);