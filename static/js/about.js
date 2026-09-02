document.addEventListener("DOMContentLoaded", () => {

    const page = document.querySelector(".about-page");
    if (!page) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.documentElement.classList.add("js-about-ready");


    /**************************************************************
        HELPERS
    **************************************************************/

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const isElementInViewport = (element, offset = 0) => {

        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

        return rect.top <= viewportHeight - offset && rect.bottom >= offset;

    };

    const rafThrottle = (callback) => {

        let ticking = false;

        return (...args) => {

            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(() => {

                callback(...args);
                ticking = false;

            });

        };

    };


    /**************************************************************
        1. SCROLL REVEAL
    **************************************************************/

    const revealElements = [...document.querySelectorAll("[data-about-reveal]")];

    if (prefersReducedMotion) {

        revealElements.forEach(element => element.classList.add("is-visible"));

    } else {

        const revealObserver = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);

            });

        }, {
            threshold: 0.14,
            rootMargin: "0px 0px -7% 0px"
        });

        revealElements.forEach(element => revealObserver.observe(element));

    }


    /**************************************************************
        2. STAGGERED REVEALS
    **************************************************************/

    const staggerGroups = [
        ".about-story-highlights > div",
        ".about-value",
        ".about-service-row",
        ".about-org-summary-item",
        ".about-trust-light-item",
        ".about-trust-audience-grid > div",
        ".about-hero-facts > div"
    ];

    staggerGroups.forEach(selector => {

        const items = [...document.querySelectorAll(selector)];

        items.forEach((item, index) => {

            item.style.setProperty("--about-stagger", `${index * 70}ms`);

        });

    });


    /**************************************************************
        3. SMOOTH INTERNAL LINKS
    **************************************************************/

    const internalLinks = [...document.querySelectorAll('a[href^="#"]')];

    internalLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            const headerOffset = 110;
            const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;

            window.scrollTo({
                top: targetY,
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });

        });

    });


    /**************************************************************
        4. ACTIVE SECTION TRACKING
    **************************************************************/

    const trackedSections = [
        document.querySelector(".about-hero"),
        document.querySelector("#about-story"),
        document.querySelector(".about-purpose"),
        document.querySelector(".about-values"),
        document.querySelector("#about-services"),
        document.querySelector(".about-organisation"),
        document.querySelector(".about-trust-light")
    ].filter(Boolean);

    const updateActiveSection = () => {

        const marker = window.innerHeight * 0.38;

        let activeSection = null;

        trackedSections.forEach(section => {

            const rect = section.getBoundingClientRect();

            if (rect.top <= marker && rect.bottom >= marker) {
                activeSection = section;
            }

        });

        trackedSections.forEach(section => section.classList.toggle("is-active-section", section === activeSection));

    };


    /**************************************************************
        5. HERO PARALLAX
    **************************************************************/

    const hero = document.querySelector(".about-hero");
    const heroImage = document.querySelector(".about-hero-image-wrap img");
    const heroWordmark = document.querySelector(".about-hero-wordmark");
    const heroVisual = document.querySelector(".about-hero-visual");

    const updateHeroParallax = () => {

        if (prefersReducedMotion || !hero) return;

        const rect = hero.getBoundingClientRect();

        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const progress = clamp((0 - rect.top) / Math.max(rect.height, 1), 0, 1);

        if (heroImage) {
            heroImage.style.transform = `scale(${1.02 + progress * 0.025}) translateY(${progress * 7}px)`;
        }

        if (heroWordmark) {
            heroWordmark.style.transform = `translate3d(${progress * 10}px, ${progress * -13}px, 0)`;
        }

        if (heroVisual) {
            heroVisual.style.transform = `translate3d(0, ${progress * -8}px, 0)`;
        }

    };


    /**************************************************************
        6. SECTION LABEL ENTRANCE DETAIL
    **************************************************************/

    const labels = [...document.querySelectorAll(".about-section-label, .about-eyebrow")];

    if (!prefersReducedMotion) {

        const labelObserver = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("is-label-visible");
                labelObserver.unobserve(entry.target);

            });

        }, {
            threshold: 0.35
        });

        labels.forEach(label => labelObserver.observe(label));

    } else {

        labels.forEach(label => label.classList.add("is-label-visible"));

    }


    /**************************************************************
        7. SERVICE ROW SEQUENTIAL REVEAL
    **************************************************************/

    const serviceRows = [...document.querySelectorAll(".about-service-row")];

    if (!prefersReducedMotion && serviceRows.length) {

        const serviceObserver = new IntersectionObserver(entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                const column = entry.target.closest(".about-services-column");

                if (!column || column.dataset.revealed === "true") return;

                column.dataset.revealed = "true";

                [...column.querySelectorAll(".about-service-row")].forEach((row, index) => {

                    window.setTimeout(() => row.classList.add("is-sequence-visible"), index * 85);

                });

                serviceObserver.unobserve(entry.target);

            });

        }, {
            threshold: 0.12
        });

        serviceRows.forEach(row => serviceObserver.observe(row));

    } else {

        serviceRows.forEach(row => row.classList.add("is-sequence-visible"));

    }


    /**************************************************************
        8. CORE VALUES SEQUENTIAL REVEAL
    **************************************************************/

    const valueItems = [...document.querySelectorAll(".about-value")];
    const valuesSection = document.querySelector(".about-values-list");

    if (valuesSection && valueItems.length) {

        if (prefersReducedMotion) {

            valueItems.forEach(item => item.classList.add("is-sequence-visible"));

        } else {

            const valueObserver = new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    valueItems.forEach((item, index) => {

                        window.setTimeout(() => item.classList.add("is-sequence-visible"), index * 90);

                    });

                    valueObserver.disconnect();

                });

            }, {
                threshold: 0.18
            });

            valueObserver.observe(valuesSection);

        }

    }


    /**************************************************************
        9. TRUST SECTION SEQUENTIAL REVEAL
    **************************************************************/

    const trustItems = [...document.querySelectorAll(".about-trust-light-item")];
    const trustGrid = document.querySelector(".about-trust-light-grid");

    if (trustGrid && trustItems.length) {

        if (prefersReducedMotion) {

            trustItems.forEach(item => item.classList.add("is-sequence-visible"));

        } else {

            const trustObserver = new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    trustItems.forEach((item, index) => {

                        window.setTimeout(() => item.classList.add("is-sequence-visible"), index * 85);

                    });

                    trustObserver.disconnect();

                });

            }, {
                threshold: 0.16
            });

            trustObserver.observe(trustGrid);

        }

    }


    /**************************************************************
        10. ORGANOGRAM REVEAL
    **************************************************************/

    const organogram = document.querySelector(".about-organogram");
    const organogramImage = organogram?.querySelector("img");

    if (organogram && organogramImage) {

        if (prefersReducedMotion) {

            organogram.classList.add("is-organogram-visible");

        } else {

            const organogramObserver = new IntersectionObserver(entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    organogram.classList.add("is-organogram-visible");
                    organogramObserver.disconnect();

                });

            }, {
                threshold: 0.12,
                rootMargin: "0px 0px -5% 0px"
            });

            organogramObserver.observe(organogram);

        }

    }


    /**************************************************************
        11. ORGANOGRAM CLICK TO FOCUS
    **************************************************************/

    let organogramViewer = null;

    const closeOrganogramViewer = () => {

        if (!organogramViewer) return;

        organogramViewer.classList.remove("is-open");

        window.setTimeout(() => {

            organogramViewer?.remove();
            organogramViewer = null;
            document.body.classList.remove("about-organogram-viewer-open");

        }, prefersReducedMotion ? 0 : 260);

    };

    const openOrganogramViewer = () => {

        if (!organogramImage || organogramViewer) return;

        organogramViewer = document.createElement("div");
        organogramViewer.className = "about-organogram-viewer";

        const inner = document.createElement("div");
        inner.className = "about-organogram-viewer-inner";

        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "about-organogram-viewer-close";
        closeButton.setAttribute("aria-label", "Close organisational structure");
        closeButton.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';

        const image = document.createElement("img");
        image.src = organogramImage.currentSrc || organogramImage.src;
        image.alt = organogramImage.alt || "Epiconsult organisational structure";

        inner.append(closeButton, image);
        organogramViewer.appendChild(inner);
        document.body.appendChild(organogramViewer);

        document.body.classList.add("about-organogram-viewer-open");

        requestAnimationFrame(() => organogramViewer?.classList.add("is-open"));

        closeButton.addEventListener("click", closeOrganogramViewer);

        organogramViewer.addEventListener("click", event => {

            if (event.target === organogramViewer) closeOrganogramViewer();

        });

    };

    if (organogramImage) {

        organogramImage.tabIndex = 0;
        organogramImage.setAttribute("role", "button");
        organogramImage.setAttribute("aria-label", "Open organisational structure in larger view");

        organogramImage.addEventListener("click", openOrganogramViewer);

        organogramImage.addEventListener("keydown", event => {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();
                openOrganogramViewer();

            }

        });

    }


    /**************************************************************
        12. ESCAPE KEY SUPPORT
    **************************************************************/

    document.addEventListener("keydown", event => {

        if (event.key === "Escape") closeOrganogramViewer();

    });


    /**************************************************************
        13. SCROLL PROGRESS INDICATOR
    **************************************************************/

    const progressTrack = document.createElement("div");
    progressTrack.className = "about-scroll-progress";

    const progressBar = document.createElement("span");
    progressBar.className = "about-scroll-progress-bar";

    progressTrack.appendChild(progressBar);
    document.body.appendChild(progressTrack);

    const updateScrollProgress = () => {

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

        const progress = documentHeight > 0 ? clamp(scrollTop / documentHeight, 0, 1) : 0;

        progressBar.style.transform = `scaleX(${progress})`;

    };


    /**************************************************************
        14. BACK TO TOP
    **************************************************************/

    const backToTop = document.createElement("button");

    backToTop.type = "button";
    backToTop.className = "about-back-to-top";
    backToTop.setAttribute("aria-label", "Back to top");
    backToTop.innerHTML = '<i class="fa fa-arrow-up" aria-hidden="true"></i>';

    document.body.appendChild(backToTop);

    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth"
        });

    });

    const updateBackToTop = () => {

        backToTop.classList.toggle("is-visible", window.scrollY > 650);

    };


    /**************************************************************
        15. SECTION SCROLL STATE
    **************************************************************/

    const sectionElements = [...document.querySelectorAll(".about-section, .about-hero")];

    const updateSectionScrollState = () => {

        sectionElements.forEach(section => {

            const rect = section.getBoundingClientRect();

            const center = rect.top + rect.height / 2;
            const viewportCenter = window.innerHeight / 2;

            const distance = Math.abs(center - viewportCenter);
            const strength = clamp(1 - distance / window.innerHeight, 0, 1);

            section.style.setProperty("--about-section-focus", strength.toFixed(3));

        });

    };


    /**************************************************************
        16. MOUSE MICRO-PARALLAX ON HERO IMAGE
    **************************************************************/

    if (heroVisual && !prefersReducedMotion && window.matchMedia("(pointer:fine)").matches) {

        heroVisual.addEventListener("mousemove", event => {

            const rect = heroVisual.getBoundingClientRect();

            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            heroVisual.style.setProperty("--about-mouse-x", `${x * 5}px`);
            heroVisual.style.setProperty("--about-mouse-y", `${y * 5}px`);

        });

        heroVisual.addEventListener("mouseleave", () => {

            heroVisual.style.setProperty("--about-mouse-x", "0px");
            heroVisual.style.setProperty("--about-mouse-y", "0px");

        });

    }


    /**************************************************************
        17. SMART HOVER CLASS FOR POINTER DEVICES
    **************************************************************/

    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {

        document.documentElement.classList.add("about-has-hover");

    }


    /**************************************************************
        18. RESIZE RECALCULATION
    **************************************************************/

    const handleResize = rafThrottle(() => {

        updateActiveSection();
        updateHeroParallax();
        updateScrollProgress();
        updateSectionScrollState();

    });


    /**************************************************************
        19. SCROLL LOOP
    **************************************************************/

    const handleScroll = rafThrottle(() => {

        updateActiveSection();
        updateHeroParallax();
        updateScrollProgress();
        updateBackToTop();
        updateSectionScrollState();

    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });


    /**************************************************************
        20. INITIAL STATE
    **************************************************************/

    updateActiveSection();
    updateHeroParallax();
    updateScrollProgress();
    updateBackToTop();
    updateSectionScrollState();

});