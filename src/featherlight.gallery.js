/**
 * Featherlight Gallery – an extension for the ultra slim jQuery lightbox
 * Version 0.4.9 - http://noelboss.github.io/featherlight/
 *
 * Copyright 2014, Noël Raoul Bossart (http://www.noelboss.com)
 * MIT Licensed.
**/
(function($) {
	"use strict";

	if('undefined' === typeof $) {
		if('console' in window){ window.console.info('Too much lightness, Featherlight needs jQuery.');
			if(!('featherlight' in $)){	window.console.info('Load the featherlight plugin before the gallery plugin'); }
		}
		return;
	}

	var isTouchAware = 'ontouchstart' in document.documentElement,
		jQueryConstructor = $.event && $.event.special.swipeleft && $,
		hammerConstructor = ('Hammer' in window) && function($el){ new window.Hammer(el[0]); },
		swipeAwareConstructor = isTouchAware && (jQueryConstructor || hammerConstructor),
		callbackChain = {
			afterClose: function(_super, event) {
					var fl = this;
					fl.$instance.off('next.'+fl.config.namespace+' previous.'+fl.config.namespace);
					if (swipeAwareConstructor) {
						fl.$instance.off('swipeleft');
						fl.$instance.off('swiperight');
					}
					return _super(event);
			},
			afterOpen: function(_super, event){
					var self = this,
						$img = self.$instance.find('img');

					self.$instance.on('next.'+self.namespace+' previous.'+self.namespace, function(event){
							var offset = event.type === 'next' ? +1 : -1;
							self.$currentTarget = self.$source.eq((self.$source.length + self.$source.index(self.$currentTarget) + offset) % self.$source.length);
							self.beforeImage(event);
							$.when(
								self.getContent(),
								$img.fadeTo(self.galleryFadeOut,0.2)
							).done(function($i) {
									$img[0].src = $i[0].src;
									self.afterImage(event);
									$img.fadeTo(self.galleryFadeIn,1);
								});
							});

					if (swipeAwareConstructor) {
						swipeAwareConstructor(self.$instance)
							.on('swipeleft', function()  { self.$instance.trigger('next'); })
							.on('swiperight', function() { self.$instance.trigger('previous'); });
					} else {
						var createNav = function(target){
								return $('<span title="'+target+'" class="'+self.namespace+'-'+target+'"><span>'+self[target+'Icon']+'</span></span>').click(function(){
									$(this).trigger(target+'.'+self.namespace);
								});
							};

						$img.after(createNav('previous'))
							.after(createNav('next'));
					}

					_super(event);

					self.afterImage(event);
			}
		};

	function FeatherlightGallery($source, config) {
		if(this instanceof FeatherlightGallery) {  /* called with new */
			$.featherlight.apply(this, arguments);
			this.chainCallbacks(callbackChain);
		} else {
			var flg = new FeatherlightGallery($.extend({$source: $source, $currentTarget: $source.first()}, config));
			flg.open();
			return flg;
		}
	}

	$.featherlight.extend(FeatherlightGallery);

	$.extend(FeatherlightGallery.prototype, {
		type: 'image',
		/** Additional settings for Gallery **/
		beforeImage: $.noop,         /* Callback before an image is changed */
		afterImage: $.noop,          /* Callback after an image is presented */
		previousIcon: '&#9664;',     /* Code that is used as previous icon */
		nextIcon: '&#9654;',         /* Code that is used as next icon */
		galleryFadeIn: 100,          /* fadeIn speed when image is loaded */
		galleryFadeOut: 300          /* fadeOut speed before image is loaded */
	});

	FeatherlightGallery.functionAttributes = FeatherlightGallery.functionAttributes.concat([
		'beforeImage', 'afterImage'
	]);

	$.featherlightGallery = FeatherlightGallery;

	/* extend jQuery with selector featherlight method $(elm).featherlight(config, elm); */
	$.fn.featherlightGallery = function(config) {
		return FeatherlightGallery.attach(this, config);
	};

}(jQuery));
