// Based on this tutorial: http://dev.opera.com/articles/view/custom-html5-video-player-with-css3-and-jquery/#sec5
(function($) {
	$.fn.aPlayer = function(options) {
		var defaults = {
			theme: 'ahrengot',
			childtheme: ''
		}
		
		var options = $.extend(defaults, options);
		
		// iterate each matched <video> element
		return this.each(function() {
			var $video = $(this);
			
			//main wrapper
			var $video_wrap = $('<div></div>').addClass('a-video-player').addClass(options.theme).addClass(options.childtheme);
			
			//controls wraper
			var html = '<div class="a-video-controls">';
			html += '<a class="a-video-play" title="Play/Pause"></a>';
			html += '<div class="a-video-seek"></div>';
			html += '<div class="a-video-timer">00:00</div>';
			html += '<div class="a-volume-box">';
			html += '<a class="a-mute-button" title="Mute/Unmute"></a>';
			html += '</div>';
			html += '</div>';
			
			var $video_controls = $(html);						
			
			// Wrap our video player in dynamically generated markup and remove default controls
			$video.wrap($video_wrap);
			$video.after($video_controls);
			$video.removeAttr('controls');
			
			// Cache video controls for later use
			var $container = $video.parent('.a-video-player');
			var $controls = $('.a-video-controls', $container);
			var $play_btn = $('.a-video-play', $container);
			var $video_seek = $('.a-video-seek', $container);
			var $video_timer = $('.a-video-timer', $container);
			var $volume = $('.a-volume-slider', $container);
			var $mute_btn = $('.a-mute-button', $container);
			
			$controls.hide();
			
			// Hook up event listeners to the controls
			$play_btn.click(aPlay);
			
			$video.click(aPlay);
			
			$mute_btn.click(aMute);
			
			// TODO: Refactor this into something like $el.bind('something', stateChanged) and handle all cases in the stateChanged method.
			$video.bind('play', function() {
				console.log('play event fired');
				$play_btn.addClass('a-paused-button');
			});
			
			$video.bind('pause', function() {
				console.log('pause event fired');
				$play_btn.removeClass('a-paused-button');
			});
			
			$video.bind('ended', function() {
				console.log('ended event fired');
				$play_btn.removeClass('a-paused-button');
			});
			
			$video.bind('timeupdate', function() {
				updateSeek();
			});
			
			// Playback logic
			var aPlay = function() {
				console.log('aPlay()');
				($video.attr('paused'))? $video[0].play() : $video[0].pause();
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
				if($video.attr('muted')==true) {
					$video.attr('muted', false);
					$volume_btn.removeClass('a-volume-mute');					
				} else {
					$video.attr('muted', true);
					$volume_btn.addClass('a-volume-mute');
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