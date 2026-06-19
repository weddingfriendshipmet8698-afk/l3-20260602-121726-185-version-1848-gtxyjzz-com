(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('.hero-carousel');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    function startTimer() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-target')) || 0);
            startTimer();
        });
    });

    if (previous) {
        previous.addEventListener('click', function () {
            showSlide(activeIndex - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(activeIndex + 1);
            startTimer();
        });
    }

    startTimer();
})();
