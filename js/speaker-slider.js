/* TEDxKPRIT — speaker slider.
   Lives in its own file so a strict script-src CSP can load it;
   inline scripts are blocked by the Express server's helmet config. */
(function () {
    "use strict";

    function initSpeakerSlider() {
        var root = document.querySelector(".speaker-slider[data-slider]");
        if (!root || root.dataset.speakerFixReady === "true") return;

        var viewport = root.querySelector("[data-viewport]");
        var track = root.querySelector("[data-track]");
        var slides = Array.prototype.slice.call(root.querySelectorAll(".speaker-slide"));
        var prev = root.querySelector("[data-prev]");
        var next = root.querySelector("[data-next]");
        var currentEl = root.querySelector("[data-current]");
        var totalEl = root.querySelector("[data-total]");
        var progress = root.querySelector("[data-progress]");

        if (!viewport || !track || !slides.length || !prev || !next) return;

        root.dataset.speakerFixReady = "true";

        var AUTOPLAY_MS = 5200;

        var index = 0;
        var startX = 0;
        var startY = 0;
        var dragging = false;
        var moved = false;
        var pointerId = null;
        var suppressClickUntil = 0;

        var realCount = slides.length;
        var motionQuery = window.matchMedia
            ? window.matchMedia("(prefers-reduced-motion: reduce)")
            : null;

        function reducedMotion() {
            return !!(motionQuery && motionQuery.matches);
        }

        if (totalEl) totalEl.textContent = String(realCount).padStart(2, "0");

        /* A copy of the first speaker is parked after the last one, so looping
           back to the start happens as one more forward step instead of a
           visible rewind through every slide. */
        var clone = null;

        if (realCount > 1) {
            clone = slides[0].cloneNode(true);
            clone.setAttribute("data-clone", "true");
            clone.setAttribute("aria-hidden", "true");
            Array.prototype.forEach.call(
                clone.querySelectorAll("a, button, input, select, textarea, [tabindex]"),
                function (el) {
                    el.setAttribute("tabindex", "-1");
                }
            );
            track.appendChild(clone);
        }

        var frameCount = realCount + (clone ? 1 : 0);
        var snapTimer = null;
        var suppressSnapUntil = 0;

        function clampFrame(value) {
            return Math.max(0, Math.min(value, frameCount - 1));
        }

        function realIndex() {
            return index % realCount;
        }

        function update(animate) {
            index = clampFrame(index);

            track.style.transition = animate === false
                ? "none"
                : "transform .55s cubic-bezier(.2,.8,.2,1)";

            track.style.transform = "translate3d(" + (-index * 100) + "%, 0, 0)";

            var real = realIndex();

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

        /* Once the clone is on screen, swap to the real first slide with the
           animation off. They render identically, so the seam is invisible. */
        function snapBack() {
            clearTimeout(snapTimer);
            if (Date.now() < suppressSnapUntil) return;
            if (!clone || index !== realCount) return;

            index = 0;
            update(false);
        }

        function goTo(newIndex, animate) {
            index = clampFrame(newIndex);
            update(animate);

            if (clone && index === realCount) {
                /* transitionend is the fast path; the timer covers the cases
                   where it never fires (reduced motion, backgrounded tab). */
                clearTimeout(snapTimer);
                snapTimer = setTimeout(snapBack, 700);
            }
        }

        track.addEventListener("transitionend", function (event) {
            if (event.target === track && event.propertyName === "transform") {
                snapBack();
            }
        });

        function goNext() {
            if (!clone) {
                goTo(index + 1, true);
                return;
            }

            goTo(index >= frameCount - 1 ? 0 : index + 1, true);
        }

        function goPrev() {
            if (index > 0) {
                goTo(index - 1, true);
                return;
            }

            if (!clone) return;

            /* Park on the clone instantly, then slide left onto the real last
               slide so wrapping backwards is seamless as well. */
            suppressSnapUntil = Date.now() + 150;
            index = realCount;
            update(false);
            void track.offsetWidth;

            setTimeout(function () {
                suppressSnapUntil = 0;
                goTo(realCount - 1, true);
            }, 20);
        }

        var autoplayTimer = null;
        var pointerInside = false;
        var focusInside = false;
        var inView = true;

        function autoplayAllowed() {
            return realCount > 1 &&
                !reducedMotion() &&
                !pointerInside &&
                !focusInside &&
                !dragging &&
                inView &&
                !document.hidden;
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        /* Also acts as "restart": any manual navigation gives the viewer a
           full interval before the slider moves on by itself. */
        function startAutoplay() {
            stopAutoplay();
            if (!autoplayAllowed()) return;

            autoplayTimer = setInterval(function () {
                if (!autoplayAllowed()) {
                    stopAutoplay();
                    return;
                }

                goNext();
            }, AUTOPLAY_MS);
        }

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

        viewport.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrev();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                goNext();
            }
        });

        function pointerDown(event) {
            if (event.pointerType === "mouse" && event.button !== 0) return;

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

        function pointerMove(event) {
            if (!dragging || event.pointerId !== pointerId) return;

            var dx = event.clientX - startX;
            var dy = event.clientY - startY;

            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                moved = true;
            }

            // Once horizontal intent is clear, slightly follow the finger.
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
                var width = viewport.getBoundingClientRect().width || 1;
                var base = -index * 100;
                var dragPercent = (dx / width) * 100;

                track.style.transition = "none";
                track.style.transform =
                    "translate3d(" + (base + dragPercent) + "%, 0, 0)";
            }
        }

        function pointerUp(event) {
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
                (Math.abs(dx) > 45 || Math.abs(dx) > width * 0.12);

            if (horizontalSwipe) {
                if (dx < 0) {
                    goNext();
                } else {
                    goPrev();
                }
                suppressClickUntil = Date.now() + 350;
            } else {
                update(true);
            }

            startAutoplay();
        }

        viewport.addEventListener("pointerdown", pointerDown, { passive: true });
        viewport.addEventListener("pointermove", pointerMove, { passive: true });
        viewport.addEventListener("pointerup", pointerUp, { passive: true });
        viewport.addEventListener("pointercancel", pointerUp, { passive: true });

        viewport.addEventListener("click", function (event) {
            if (Date.now() < suppressClickUntil) {
                event.preventDefault();
                event.stopPropagation();
            }
        }, true);

        // Fallback for older mobile browsers without Pointer Events.
        var touchStartX = 0;
        var touchStartY = 0;

        viewport.addEventListener("touchstart", function (event) {
            if (!event.touches.length) return;
            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
        }, { passive: true });

        viewport.addEventListener("touchend", function (event) {
            if (!event.changedTouches.length) return;

            var touch = event.changedTouches[0];
            var dx = touch.clientX - touchStartX;
            var dy = touch.clientY - touchStartY;

            if (
                Math.abs(dx) > Math.abs(dy) &&
                Math.abs(dx) > 45
            ) {
                if (dx < 0) {
                    goNext();
                } else {
                    goPrev();
                }

                startAutoplay();
            }
        }, { passive: true });

        root.addEventListener("pointerenter", function (event) {
            if (event.pointerType && event.pointerType !== "mouse") return;
            pointerInside = true;
            stopAutoplay();
        });

        root.addEventListener("pointerleave", function (event) {
            if (event.pointerType && event.pointerType !== "mouse") return;
            pointerInside = false;
            startAutoplay();
        });

        root.addEventListener("focusin", function () {
            focusInside = true;
            stopAutoplay();
        });

        root.addEventListener("focusout", function () {
            focusInside = false;
            startAutoplay();
        });

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });

        if (window.IntersectionObserver) {
            new window.IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    inView = entry.isIntersecting;

                    if (inView) {
                        startAutoplay();
                    } else {
                        stopAutoplay();
                    }
                });
            }, { threshold: 0.25 }).observe(root);
        }

        if (motionQuery && motionQuery.addEventListener) {
            motionQuery.addEventListener("change", startAutoplay);
        }

        window.addEventListener("resize", function () {
            update(false);
        }, { passive: true });

        update(false);
        startAutoplay();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSpeakerSlider, { once: true });
    } else {
        initSpeakerSlider();
    }
})();
