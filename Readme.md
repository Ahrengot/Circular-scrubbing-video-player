# Video Player with circular timeline
This is a HTML5/JavaScript/CSS3 conversion of [my old Flash based video player](http://activeden.net/item/video-player-with-circular-scrubbingprogress/130624). 

**It's based around 3 items**:
1. A HTML5 template page for you to work with
2. A jQuery plugin that sets handles all the required event listeners, controls-markup and redering of progress bars, timers etc.
3. A CSS3 theme for you to customize or keep as is.

## The design
My aim is a miminal user iterface that works well within a wide variety of designs without colliding with the existing aesthetics in your projects. Still this will have more of an egde than just throwing in a standard Vimeo/YouTube/Whatever video player.

## Cross-browser compability
This is a prototype for the moment. It will be designed to work with webkit before any cross-browser adjustments are made, but in the long run I want this to be fairly cross-browser compatible (IE9 and up).

## No Flash fallback
I don't want to clutter the JavaScript files with fallback code. If you care about IE8 and below you should implement your own fallback or send your visitors along to http://browsehappy.com/ – You'll be doing them a favor anyway :)
 