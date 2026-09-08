/* TEDxKPRIT — speaker slider.
   Lives in its own file so a strict script-src CSP can load it;
   inline scripts are blocked by the Express server's helmet config. */
(function () {
    "use strict";

    function initSpeakerSlider() {
        var root = document.querySelector(".speaker-slider[data-slider]");
        if (!root || root.dataset.speakerSliderReady === "true") return;

        var viewport = root.querySelector("[data-viewport]");
        var track = root.querySelector("[data-track]");
        var slides = Array.prototype.slice.call(root.querySelectorAll(".speaker-slide"));
        var prev = root.querySelector("[data-prev]");
        var next = root.querySelector("[data-next]");
        var currentEl = root.querySelector("[data-current]");
        var totalEl = root.querySelector("[data-total]");
        var progress = root.querySelector("[data-progress]");

        if (!viewport || !track || !slides.length || !prev || !next) return;

        root.dataset.speakerSliderReady = "true";

        var realCount = slides.length;
        var AUTOPLAY_MS = 3000;
        var ANIMATION_MS = 450;

        if (totalEl) {
            totalEl.textContent = String(realCount).padStart(2, "0");
        }

        if (realCount <= 1) {
            if (prev) prev.style.display = "none";
            if (next) next.style.display = "none";
            return;
        }

        // Clone last slide to prepend (before slide 0)
        var cloneLast = slides[realCount - 1].cloneNode(true);
        cloneLast.setAttribute("data-clone", "last");
        cloneLast.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(
            cloneLast.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
            function (el) { el.setAttribute("tabindex", "-1"); }
        );
        track.insertBefore(cloneLast, slides[0]);

        // Clone first slide to append (after slide 7)
        var cloneFirst = slides[0].cloneNode(true);
        cloneFirst.setAttribute("data-clone", "first");
        cloneFirst.setAttribute("aria-hidden", "true");
        Array.prototype.forEach.call(
            cloneFirst.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
            function (el) { el.setAttribute("tabindex", "-1"); }
        );
        track.appendChild(cloneFirst);

        // Real slides live at indices 1 .. realCount (e.g. 1..8)
        var currentIndex = 1;
        var isAnimating = false;
        var snapTimer = null;
        var autoplayTimer = null;

        function getRealIndex(idx) {
            return (idx - 1 + realCount) % realCount;
        }

        function updateUI() {
            var real = getRealIndex(currentIndex);
            if (currentEl) {
                currentEl.textContent = String(real + 1).padStart(2, "0");
            }
            if (progress) {
                progress.style.width = ((real + 1) / realCount * 100) + "%";
            }
            slides.forEach(function (slide, i) {
                slide.setAttribute("aria-hidden", i === real ? "false" : "true");
            });
        }

        function setPosition(idx, animate) {
            track.style.transition = animate
                ? "transform " + (ANIMATION_MS / 1000) + "s cubic-bezier(.2,.8,.2,1)"
                : "none";
            track.style.transform = "translate3d(" + (-idx * 100) + "%, 0, 0)";
        }

        function snapIfNeeded() {
            clearTimeout(snapTimer);
            if (currentIndex === 0) {
                currentIndex = realCount;
                setPosition(currentIndex, false);
            } else if (currentIndex === realCount + 1) {
                currentIndex = 1;
                setPosition(currentIndex, false);
            }
            isAnimating = false;
        }

        track.addEventListener("transitionend", function (event) {
            if (event.target === track && event.propertyName === "transform") {
                snapIfNeeded();
            }
        });

        function goTo(newIndex) {
            if (isAnimating) return;
            isAnimating = true;

            currentIndex = newIndex;
            setPosition(currentIndex, true);
            updateUI();

            clearTimeout(snapTimer);
            snapTimer = setTimeout(function () {
                snapIfNeeded();
            }, ANIMATION_MS + 60);
        }

        function goNext() {
            goTo(currentIndex + 1);
        }

        function goPrev() {
            goTo(currentIndex - 1);
        }

        // Autoplay management
        function startAutoplay() {
            stopAutoplay();
            if (document.hidden) return;
            autoplayTimer = setInterval(function () {
                if (document.hidden) {
                    stopAutoplay();
                    return;
                }
                goNext();
            }, AUTOPLAY_MS);
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        // Arrow button click handlers
        prev.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            goPrev();
            startAutoplay();
        });

        next.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            goNext();
            startAutoplay();
        });

        // Keyboard navigation
        viewport.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrev();
                startAutoplay();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goNext();
                startAutoplay();
            }
        });

        // Pointer Drag & Touch Handling
        var startX = 0;
        var startY = 0;
        var dragging = false;
        var moved = false;
        var pointerId = null;
        var suppressClickUntil = 0;

        function onPointerDown(event) {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            if (event.target.closest("button, a, input, select, textarea")) return;

            pointerId = event.pointerId;
            startX = event.clientX;
            startY = event.clientY;
            dragging = true;
            moved = false;
            viewport.classList.add("is-dragging");
            stopAutoplay();

            try {
                viewport.setPointerCapture(pointerId);
            } catch (_) {}
        }

        function onPointerMove(event) {
            if (!dragging || event.pointerId !== pointerId) return;

            var dx = event.clientX - startX;
            var dy = event.clientY - startY;

            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                moved = true;
            }

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
                var width = viewport.getBoundingClientRect().width || 1;
                var base = -currentIndex * 100;
                var dragPercent = (dx / width) * 100;

                track.style.transition = "none";
                track.style.transform = "translate3d(" + (base + dragPercent) + "%, 0, 0)";
            }
        }

        function onPointerUp(event) {
            if (!dragging || event.pointerId !== pointerId) return;

            var dx = event.clientX - startX;
            var dy = event.clientY - startY;
            var width = viewport.getBoundingClientRect().width || 1;

            dragging = false;
            viewport.classList.remove("is-dragging");

            try {
                viewport.releasePointerCapture(pointerId);
            } catch (_) {}

            pointerId = null;

            var horizontalSwipe =
                Math.abs(dx) > Math.abs(dy) &&
                (Math.abs(dx) > 40 || Math.abs(dx) > width * 0.12);

            if (horizontalSwipe) {
                if (dx < 0) {
                    goNext();
                } else {
                    goPrev();
                }
                suppressClickUntil = Date.now() + 350;
            } else {
                setPosition(currentIndex, true);
            }

            startAutoplay();
        }

        viewport.addEventListener("pointerdown", onPointerDown, { passive: true });
        viewport.addEventListener("pointermove", onPointerMove, { passive: true });
        viewport.addEventListener("pointerup", onPointerUp, { passive: true });
        viewport.addEventListener("pointercancel", onPointerUp, { passive: true });

        viewport.addEventListener("click", function (event) {
            if (Date.now() < suppressClickUntil) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);

        // Fallback for Touch events
        var touchStartX = 0;
        var touchStartY = 0;

        viewport.addEventListener("touchstart", function (event) {
            if (!event.touches.length) return;
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            stopAutoplay();
        }, { passive: true });

        viewport.addEventListener("touchend", function (event) {
            if (!event.changedTouches.length) return;
            var dx = event.changedTouches[0].clientX - touchStartX;
            var dy = event.changedTouches[0].clientY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
                if (dx < 0) {
                    goNext();
                } else {
                    goPrev();
                }
            } else {
                setPosition(currentIndex, true);
            }
            startAutoplay();
        }, { passive: true });

        // Tab visibility change
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        // Resize handler
        window.addEventListener("resize", function () {
            setPosition(currentIndex, false);
        }, { passive: true });

        // Initialize position & state
        setPosition(currentIndex, false);
        updateUI();
        startAutoplay();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSpeakerSlider, { once: true });
    } else {
        initSpeakerSlider();
    }
})();
