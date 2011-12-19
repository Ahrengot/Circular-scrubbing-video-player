// Based on this tutorial: http://dev.opera.com/articles/view/custom-html5-video-player-with-css3-and-jquery/#sec5
(function($) {
	$.fn.aPlayer = function(options) {
		var defaultOptions = {
			theme: 				'ahrengot',
			showTitle:			true,
			muteButton:			true,
			fullscreenButton: 	true	
		}
		
		var options = $.extend(defaultOptions, options);
		
		// Detect mobile
		var mobileUserAgents 	= ["iphone", "ipod","ipad","android"],
			currUserAgent 		= navigator.userAgent.toLowerCase(),
			isMobile 			= false;
		
		for (var ua in mobileUserAgents) {
			if (currUserAgent.indexOf(mobileUserAgents[ua]) != -1) {
				isMobile = true;
				break;
			}
		}
		
		// iterate each matched <video> element
		return this.each(function() {
			var $video 				= $(this),
				videoW				= $video[0].width,
				videoH				= $video[0].height,
				playPauseFadeTimer	= null,
				controlsFadeTimer	= null,
				unique 	= Math.round(Math.random()*(+new Date)).toString();
			
			//main wrapper
			if (!isMobile) {
				var wrapHTML = '<div class="a-video-player paused ended"></div>';
				var $video_wrap = $(wrapHTML).addClass(options.theme);
				$video.wrap($video_wrap);
				
				//controls wraper
				var controlsHTML = '<div class="controls">';
				controlsHTML += '<a class="play-pause paused" title="Play/Pause">Play/Pause</a>';
				controlsHTML += '<div class="progress">';
				controlsHTML += '<div class="playback-prog" id="prog-' + unique + '"></div>';
				controlsHTML += '<div class="prog-hitbox" id="prog-hitbox-' + unique + '"></div>';
				controlsHTML += '</div>';
				controlsHTML += '<div class="timer"><time>00:00</time><p>Remaining</p></div>';
				controlsHTML += '</div>';
				
				var $video_controls = $(controlsHTML);
			
			
				$video.after($video_controls);
				$video.removeAttr('controls');
			
				var $container 	= $video.parent('.a-video-player'),
					$controls 	= $('.video-controls', $container),
					$play_btn 	= $('.play-pause', $container),
					$progress 	= $('#prog-' + unique, $container),
					$timer 		= $('.timer', $container);
			
				// Mute and Fullscreen buttons
				var secondaryControlsHTML = '<div class="secondary-controls">';
				if (options.fullscreenButton) secondaryControlsHTML += '<div class="fullscreen"></div>';
				if (options.muteButton) secondaryControlsHTML += '<div class="mute"></div>';
				secondaryControlsHTML += '</div>';
				
				var $secondary_controls = $(secondaryControlsHTML);
				
				$video.after($secondary_controls);
				
				var $mute_btn 		= $('.mute', $secondary_controls),
					$fullscreen_btn = $('.fullscreen', $secondary_controls);
			}
			
			// Title bar
			var titlebarHTML = '<header class="titlebar"><p class="title"></p><p class="duration"><time>00:00</time></p></header>';
			
			var $titlebar 		= $(titlebarHTML),
				$video_title 	= $('.title', $titlebar),
				$titlebar_time 	= $('time', $titlebar);
			
			$video_title[0].innerHTML = '<strong>' + $video.attr('title') + '</strong>';
			
			if (options.showTitle) {
				if (!isMobile) $secondary_controls.after($titlebar);
				else $video.after($titlebar);
			}
			
			if (!isMobile) {
				// Fade out controls and titlebar for now. We'll show them again when the video is ready.
				$video_controls.fadeOut(0);
				$titlebar.css('top', $titlebar.height() * -1);
				
				// Progress bars – The larger stroke of progHitbox makes mouse-interaction easier.
				var playbackProg = new CircularProgress('prog-' + unique, 40, 4, 'white');
				var progHitbox = new CircularProgress('prog-hitbox-' + unique, 40, 20, 'red', {opacity: 0}, true, false, handleHitboxMove);
				
				progHitbox.setProgress(99.99, 0);
				
				// TODO: Implement timeline click: scrub to clicked position
				
				// Hook up playback control events
				$play_btn.click(aPlay);
				if (options.muteButton) $mute_btn.click(aMute);
				if (options.fullscreenButton) {
					$fullscreen_btn.click(toggleFullscreen);
					$container.bind('fullscreenchange mozfullscreenchange webkitfullscreenchange', handleFullscreen)
				}
				
				// Hook up media events
				$video.bind('play pause ended', handleVideoState);
				$video.bind('timeupdate', updateProg);
				//updateBuffer();
				
				$(progHitbox.progressBar.node).hover(function() {
					// Delay fadeIn so time read-out only shows when intended and not when they mouse simply passes over it to reach play/pause.
					playPauseFadeTimer = setTimeout(function() {
						$timer.fadeIn(100);
						$play_btn.fadeOut(200);
					}, 200);
				}, function() {
					clearTimeout(playPauseFadeTimer);
					$play_btn.fadeIn(100);
					$timer.fadeOut(200);
				});
				
				// Handle media events
				function handleVideoState(e) {
					switch(e.type) {
						case 'play':
							$play_btn.removeClass('paused');
							$container.removeClass('paused ended');
							$titlebar.animate({'top': $titlebar.height() * -1}, 350);
							startFadeTimer();
							break;
						case 'pause':
							$play_btn.addClass('paused');
							$container.addClass('paused');
							$titlebar.animate({'top': 0}, 500);
							stopFadeTimer();
							break;
						case 'ended':
							$play_btn.addClass('paused');
							$container.addClass('paused ended');
							playbackProg.setProgress(0, 0);
							$titlebar.animate({'top': 0}, 500);
							stopFadeTimer();
							break;
					}
				}
				
				function startFadeTimer() {
					$container.mousemove(function() {
						$container.removeClass('fadecontrols');
						clearTimeout(controlsFadeTimer);
						controlsFadeTimer = setTimeout(function() {
							$container.addClass('fadecontrols');
						}, 1500);
					});
					
					controlsFadeTimer = setTimeout(function() {
						$container.addClass('fadecontrols');
					}, 1500);
				}
				
				function stopFadeTimer() {
					clearTimeout(controlsFadeTimer);
					$container.unbind('mousemove');
					$container.removeClass('fadecontrols');
				}
				
				function updateProg() {
					var timeLeft 	= $video[0].duration - $video[0].currentTime,
						prog		= ($video[0].currentTime / $video[0].duration) * 100;
					
					if (!progHitbox.isScrubbing) playbackProg.setProgress(prog, 100);
					
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
				
				function handleHitboxMove(prog) {
					if (prog < 100) {
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
						$titlebar_time.text(formatTime(duration));
						$video_controls.fadeIn(10);
						$titlebar.css({'top': 0}).fadeOut(0).fadeIn(250);
						
						// Fix autoplay bug
						if ($video[0].autoplay) $video.trigger('play');		
					} else {
						setTimeout(arguments.callee, 150);
					}
				})();
				
				function aMute() {
					($video[0].muted)? $video[0].muted = false : $video[0].muted = true;
					$mute_btn.toggleClass('toggled', $video[0].muted);
				}
				
				// Playback helper methods
				
				function formatTime(seconds){
					// TODO: Refactor this section to make it more readable.
					var minutes = Math.floor(seconds / 60) < 10 ? "0" + Math.floor(seconds / 60) : Math.floor(seconds / 60);
					var seconds = Math.floor(seconds - (minutes * 60)) < 10 ? "0" + Math.floor(seconds - (minutes * 60)) : Math.floor(seconds-(minutes * 60));
					
					return minutes + ":" + seconds;
				}
				
				// Fullscreen logic
				function toggleFullscreen() {
					var fullscreenCapable = ($container[0].requestFullScreen || $container[0].mozRequestFullScreen || $container[0].webkitRequestFullScreen);
					var isFullscreen = document.mozFullScreen || document.webkitIsFullScreen || document.fullScreen;
				
					if (fullscreenCapable) {
						if (!isFullscreen) {
							if ($container[0].requestFullScreen) $container[0].requestFullScreen();
							else if ($container[0].mozRequestFullScreen) $container[0].mozRequestFullScreen(); 
							else if ($container[0].webkitRequestFullScreen) $container[0].webkitRequestFullScreen(); 
						} else {
							if (document.cancelFullScreen) document.cancelFullScreen();  
						  	else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
							else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();  
						}
					} else {
						// Fullscreen isn't supported
						// TODO: Instead of showing browsehappy just fill the browser.
						$video.trigger('pause');
						if (confirm('Balls! Your browser doesn\'t support fullscreen. Want to head over to browsehappy.com and upgrade to a better one?')) {
							window.open("http://browsehappy.com", "_blank");
						}
					}
				}
				
				function handleFullscreen(e) {
					var w = screen.width;
					var h = screen.height;
					var isFullscreen = document.mozFullScreen || document.webkitIsFullScreen || document.fullScreen;
					
					$fullscreen_btn.toggleClass('toggled', isFullscreen);
					
					if (isFullscreen) {
						$container.css({ 'width': w, 'height': h });
						$video[0].width = w;
						$video[0].height = h;
					} else {
						$container.css({ 'width': '', 'height': '' });
						$video[0].width = videoW;
						$video[0].height = videoH;
					}
				}
			} else {
				// On mobile we always want default media controls
				$video.attr('controls', 'controls');
				
				// On mobile, only thing we want to show is the titlebar
				if (options.showTitle) {
					var $parent = $titlebar.parent();
					var videoPos = $video.position();
					
					$parent.css('position', $parent.css('position'));
					$parent.addClass('a-video-player paused ended');
					
					$titlebar.css({
						'top': videoPos.top,
						'left': videoPos.left,
						'width': $video.width()
					}).fadeOut(0).delay(1000).fadeIn(500);
					$titlebar.find('.duration').remove();
					
					$video.bind('play pause ended', function(e) {
						switch(e.type) {
							case 'play':
								$titlebar.delay(500).fadeOut(500);
								break;
							case 'pause':
								$titlebar.delay(500).fadeIn(500);
								break;
							case 'ended':
								$titlebar.delay(500).fadeIn(500);
								break;
						}

					});
				}
			}
		});
	}
})(jQuery);