var scrollToElement = function(el, ms){
    var speed = (ms) ? ms : 600;
    $('html,body').animate({
        scrollTop: $(el).offset().top
    }, speed);
}

// specify id of element and optional scroll speed as arguments
scrollToElement('#PIXIcanvas', 600);
