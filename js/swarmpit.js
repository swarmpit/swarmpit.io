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
        $("#postcontentsb").submit(function (e) {
            if (typeof window["fetch"] === "undefined") return;
            e.preventDefault();
            var data = {};
            var $form = $(this);
            $form.serializeArray().forEach(function (x) {
                data[x.name] = x.value;
            });

            fetch($form.attr("action"), {
                method: $form.attr("method").toUpperCase(),
                body: JSON.stringify(data)
            }).then(function () {
                $('.email-wrapper').html("<p>Thank you for submitting!</p>");
            });
        });
    });
})(jQuery); // End of use strict
