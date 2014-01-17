$(document).ready(function() {
	BOX_WIDTH = $('#frame').width() - 200 + 'px'

	$('#chat-log').scroll(function() {
		onScreenScroll();
	});
});

var onScreenScroll = function(offset) {
	var offset = offset || 0;

	var mid_y = $('#frame').height() / 2;
	var mid_el = document.elementFromPoint(200, mid_y - offset);

	if ( $(mid_el).attr('id') == 'chat-log' )
		onScreenScroll(15);

	midEffect(mid_el, $('#frame').width() - 120);
}

var midEffect = function(el, w, p) {

	var width = $('#frame').width();
	var step = 20;
	var h = $(el).height();

	if ( w <= width - 200 ) return;
	if ( !$(el).hasClass('chat-msg') ) return;

	$(el).css({ 'width': w + 'px' });

	var _prev = $(el).prev().get(0);
	var _next = $(el).next().get(0);

	if (p && p == 'prev')
		midEffect(_prev, w - step, 'prev');
	
	if (p && p == 'next')		
		midEffect(_next, w - step, 'next');

	if (!p) {
		midEffect(_prev, w - step, 'prev');		
		midEffect(_next, w - step, 'next');
	}
};