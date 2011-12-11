// Based on this tutorial: http://dev.opera.com/articles/view/custom-html5-video-player-with-css3-and-jquery/#sec5
(function($) {
	$.fn.aPlayer = function(options) {
		var defaults = {
			theme: 'ahrengot'
		}
		
		var options = $.extend(defaults, options);
		
		// iterate each matched <video> element
		return this.each(function() {
			var $video = $(this);
			
			//main wrapper
			var $video_wrap = $('<div class="a-video-player paused ended"></div>').addClass(options.theme);
			
			//controls wraper
			var html = '<div class="controls">';
			html += '<a class="play-pause" title="Play/Pause">Play/Pause</a>';
			html += '<div class="seek">Seek</div>';
			html += '<div class="timer">00:00</div>';
			html += '<div class="volume-box">';
			html += '<a class="mute-unmute" title="Mute/Unmute">Mute/Unmute</a>';
			html += '</div>';
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
			var $video_seek = $('.seek', $container);
			var $video_timer = $('.timer', $container);
			var $mute_btn = $('.mute-unmute', $container);
			
			$controls.hide();
			
			// Hook up event listeners to the controls
			$play_btn.click(function() {
				console.log('Play/pause button clicked!');
				aPlay();
			});
			
			$video.click(function() {
				console.log('Video element clicked!');
				aPlay();
			});
			
			$mute_btn.click(function() {
				console.log('Mute/unmute button clicked');
				aMute();
			});
			
			// TODO: Refactor this into something like $el.bind('something', stateChanged) and handle all cases in the stateChanged method.
			$video.bind('play', function() {
				console.log('play event fired');
				$play_btn.removeClass('paused');
				$container.removeClass('paused ended');
			});
			
			$video.bind('pause', function() {
				console.log('pause event fired');
				$play_btn.addClass('paused');
				$container.addClass('paused');
			});
			
			$video.bind('ended', function() {
				console.log('ended event fired');
				$play_btn.addClass('paused');
				$container.addClass('paused ended');
			});
			
			$video.bind('timeupdate', updateSeek);
			
			// Playback logic
			var aPlay = function() {
				console.log('aPlay()');
				($video[0].paused)? $video[0].play() : $video[0].pause();
			}
			
			var aSeek = function() {
				console.log('aSeek() - $video.readyState: ' + $video[0].readyState);
				// We need the video to be in the readyState before we can read it's duration.
				if($video[0].readyState > 0) {
					var duration = $video[0].duration;
					console.log('Video is ' + duration + ' seconds long');
					$video_timer.text(formatTime(duration));
					
					// TODO: Implement circular seek/progress logic here
					$video_controls.show();			
				} else {
					setTimeout(aSeek, 150);
				}
			}
			aSeek();
			
			var aMute = function() {
				console.log('aMute()');
				if($video[0].muted) {
					$video[0].muted = false;
					$mute_btn.removeClass('muted');					
				} else {
					$video[0].muted = true;
					$mute_btn.addClass('muted');
				};
			}
			
			// Playback helper methods
			var updateSeek = function() {
				console.log('updateSeek()');
				var timeLeft = $video[0].duration - $video[0].currentTime;
				// if(!seeksliding) $video_seek.slider('value', currenttime);
				$video_timer.text(formatTime(timeLeft));							
			}
		
			var formatTime = function(seconds){
				// TODO: Refactor this section to make it more readable.
				var minutes = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
				var seconds = Math.floor(seconds - (minutes * 60)) < 10 ? "0" + Math.floor(seconds - (minutes * 60)) : Math.floor(seconds-(minutes * 60));
				
				return minutes + ":" + seconds;
			}
		});	
	}
})(jQuery);