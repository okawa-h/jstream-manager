(function($) {

	var _$win;
	var _jstream;

	$(function() {

		_$win    = $(window);
		_jstream = new Jstream('eqz989uscl','NDk2','50');
		_$win.on({ 'resize':onResize });

	});

	function onResize() {

		var winW = _$win.width();
		var winH = _$win.height();
		_jstream.onResize(winW,winH);

	}

	function Jstream(UNIQUE_ID,CONTACT_ID,FILE_NO) {

		var $videoList = $('[data-js="video"]');
		var BASE_URL   = UNIQUE_ID + '.eq.webcdn.stream.ne.jp/www' + FILE_NO + '/' + UNIQUE_ID + '/jmc_pub/jmc_swf/player/';
		var isInit     = false;
		var playerList = [];
		var landingConter = $videoList.length;

		(function loadBaseScript() {

			var $script = $('<script></script>');
			$script.on('load',function() {
				init();
			});
			$script.prop('src','https://ssl-cache.stream.ne.jp/www' + FILE_NO + '/' + UNIQUE_ID + '/jmc_pub/jmc_swf/player/t3/obj.js');
			var location = $('script').get(0);
			location.parentNode.insertBefore($script.get(0),location);

		})();

		function init() {

			if ($videoList.length <= 0) return false;
			setVideo();

		};

		this.onResize = function onResize(winW,winH) {

			if (!isInit) return false;
			for (var i = 0; i < playerList.length; i++) {
				var $target = playerList[i].custom.element;
				if ($target.hasClass('open')) $target.find('.video-position').css(getOpenProperty(winW,winH));
			}

		}

		function setVideo() {

			for (var i = 0; i < $videoList.length; i++) {

				var $target   = $videoList.eq(i);
				var videoId   = $target.data('meta_id');
				var elementId = 'video-' + i;
				var isModal   = true == $target.data('modal');

				var html = '<div class="video-frame">';
				html += '<div class="video-position">';
				html += '<div class="video-inner" id="' + elementId + '"></div>';
				if (isModal) html += '<div class="cover" data-js="open"></div>';
				html += '</div>';
				if (isModal) html += '<div class="background" data-js="close"></div>';
				html += '</div>';

				$target.data('id',elementId);
				$target.append(html);

				var player = jstream_t3.PlayerFactoryOBJ.create({
					b:BASE_URL, c:CONTACT_ID, m:videoId,
					s:{ rp:'fit', ti:'off', el:'off', tg:'off', il:'off' }
				},elementId);

				if (isModal) {
					$target.on('click','[data-js="open"]',onOpen );
					$target.on('click','[data-js="close"]',onClose);
				}

				player.custom = { id:elementId,element:$target };
				player.accessor.addEventListener('landing',onLanding);
				player.accessor.addEventListener('change_state',onChangeStatus);
				playerList.push(player);

			}

			return false;

		}

		function onLanding(event) {

			// var player = getVideoById(event.currentTarget.jmcPlayer.custom.id);
			// player.custom.element.css({ backgroundImage:'url(' + player.flashVars.thumbnail_url + ')' });

			landingConter--;
			if (landingConter <= 0) onLandingAll();
			return false;

		}

		function onChangeStatus(event) {

			var id     = event.currentTarget.jmcPlayer.custom.id;
			var player = getVideoById(id);
			if (event.currentTarget.state == 'playing') {

				for (var i = 0; i < playerList.length; i++) {
					var info = playerList[i];
					if (info.custom.id == id) continue;
					info.accessor.pause();
				}
				if (!player.custom.element.hasClass('open') && player.custom.element.data('modal') == true) {
					player.accessor.pause();
				}

			}
			return false;

		}

		function onLandingAll() {

			isInit = true;
			return false;

		}

		function onOpen(event) {

			if (!isInit) return false;
			var $parent = $(this).parents('[data-js="video"]');
			var player  = getVideoById($parent.data('id'));
			var $posi   = $parent.find('.video-position');
			var $bg     = $parent.find('.background');

			$parent.addClass('open');
			$posi
				.css(getStaticProperty($parent))
				.animate(getOpenProperty(_$win.width(),_$win.height()),200,'easeInOutSine',function() {
					player.accessor.play();
				});
			$bg.fadeIn(200);

			return false;

		}

		function onClose(event) {

			var $parent = $(this).parents('[data-js="video"]');
			var player  = getVideoById($parent.data('id'));
			var $posi   = $parent.find('.video-position');
			var $bg     = $parent.find('.background');

			player.accessor.pause();
			$posi.animate(getStaticProperty($parent),200,'easeInOutSine',function() {
				$posi.css(getResetProperty());
				$parent.removeClass('open');
			});
			$bg.fadeOut(200);
			return false;

		}

		function getVideoById(id) {

			for (var i = 0; i < playerList.length; i++) {
				var player = playerList[i];
				if (id == player.custom.id) return player;
			}
			return null;

		}

		function getStaticProperty($parent) {

			var top    = $parent.offset().top  - _$win.scrollTop();
			var left   = $parent.offset().left - _$win.scrollLeft();
			var width  = $parent.width();
			var height = width * 0.5625;
			return { top:top,left:left,width:width,height:height };

		}

		function getOpenProperty(winW,winH) {

			var width  = winW;
			if (800 < width) width = 800;
			var height = width * 0.5625;
			var top    = (winH - height) * .5;
			var left   = (winW - width) * .5;

			if (winH < height) top = 0;
			return { top:top,left:left,width:width,height:height };

		}

		function getResetProperty() {

			return { top:0,left:0,width:'100%',height:'100%' };

		}

	}

})(jQuery);