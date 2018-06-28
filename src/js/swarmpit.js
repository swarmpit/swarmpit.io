(function ($) {
	"use strict";

	// jQuery for page scrolling feature - requires jQuery Easing plugin
	$(document).on('click', 'a.page-scroll', function (event) {
		var $anchor = $(this);
		$('html, body').stop().animate({
			scrollTop: ($($anchor.attr('href')).offset().top - 50)
		}, 1250, 'easeInOutExpo');
		event.preventDefault();
	});

	// Closes the Responsive Menu on Menu Item Click
	$('.navbar-collapse ul li a').click(function () {
		$('.navbar-toggle:visible').click();
	});

	// Offset for Main Navigation
	$('#mainNav').affix({
		offset: {
			top: 50
		}
	});

	$(function () {
		$("#contact-form").submit(function (e) {
			e.stopImmediatePropagation();
			e.preventDefault();
			if (typeof window["fetch"] === "undefined") return;
			var data = {};
			var $form = $(this);
			$form.serializeArray().forEach(function (x) {
				data[x.name] = x.value;
			});

			fetch("https://fokgz5bqh2.execute-api.eu-central-1.amazonaws.com/swarmpit/contact-form", {
				method: "POST",
				body: JSON.stringify(data)
			}).then(function () {
				$('#contact-form').html("<p>Thank you for your message! </p>");
			});
		});
	});
})(jQuery); // End of use strict
