document.addEventListener('DOMContentLoaded', () => {
    const showcase = document.querySelector('.showcase');
    const showcaseContent = document.querySelector('.showcase-content');
    const mainCard = document.querySelector('.showcase-card');
    const pills = document.querySelectorAll('.pill');
    const lines = document.querySelectorAll('.line');
    const leftPillsContainer = document.querySelector('.left-pills');

    let isLocked = false;
    let currentIndex = 0;
    let scrollProgress = 0;
    const scrollPerItem = 500; // pixels of scroll per item transition (slower)
    let lockPosition = 0;

    // Create progress bars inside lines
    lines.forEach(line => {
        const progress = document.createElement('div');
        progress.className = 'line-progress';
        line.appendChild(progress);
    });

    function updateProgress(delta) {
        if (currentIndex >= pills.length) return false;

        scrollProgress += delta;

        if (scrollProgress < 0) {
            // Going backwards
            if (currentIndex > 0) {
                currentIndex--;
                scrollProgress = scrollPerItem;
                reverseTransition();
            } else {
                scrollProgress = 0;
                return false; // Allow normal scroll
            }
        }

        const progress = Math.min(scrollProgress / scrollPerItem, 1);
        const currentLine = lines[currentIndex].querySelector('.line-progress');
        currentLine.style.width = `${progress * 100}%`;

        if (scrollProgress >= scrollPerItem) {
            // Transition complete
            triggerTransition();
            scrollProgress = 0;
            currentIndex++;

            if (currentIndex >= pills.length) {
                return false; // Unlock scrolling
            }
        }

        return true; // Keep locked
    }

    function triggerTransition() {
        const pill = pills[currentIndex];
        const line = lines[currentIndex];

        // Hide the right pill immediately
        pill.classList.add('hidden');
        line.classList.add('hidden');
        line.classList.add('complete');

        // Add left pill at the same time
        const leftPill = document.createElement('div');
        leftPill.className = 'left-pill';
        leftPill.style.backgroundColor = '#e8e4dd';
        leftPillsContainer.appendChild(leftPill);
    }

    function reverseTransition() {
        const pill = pills[currentIndex];
        const line = lines[currentIndex];
        const leftPill = leftPillsContainer.lastChild;

        if (leftPill) {
            leftPill.remove();
        }

        pill.classList.remove('hidden');
        line.classList.remove('hidden');
        line.classList.remove('complete');
        line.querySelector('.line-progress').style.width = '100%';
    }

    function checkLock() {
        const rect = showcase.getBoundingClientRect();
        const headerHeight = document.querySelector('.showcase-header').offsetHeight;
        const targetTop = -80; // Distance from top when locked

        // Lock when showcase content is at the right position
        if (rect.top <= targetTop && rect.bottom > window.innerHeight && currentIndex < pills.length) {
            if (!isLocked) {
                isLocked = true;
                lockPosition = window.scrollY;
                document.body.style.overflow = 'hidden';
            }
            return true;
        }

        return false;
    }

    function handleWheel(e) {
        if (!isLocked && checkLock()) {
            e.preventDefault();
            return;
        }

        if (isLocked) {
            e.preventDefault();

            const shouldStayLocked = updateProgress(e.deltaY);

            if (!shouldStayLocked) {
                isLocked = false;
                document.body.style.overflow = '';

                // If scrolling up and at start, allow normal scroll
                if (e.deltaY < 0 && currentIndex === 0 && scrollProgress <= 0) {
                    return;
                }
            }
        }
    }

    // Touch support
    let touchStartY = 0;

    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchMove(e) {
        if (!isLocked && checkLock()) {
            e.preventDefault();
            return;
        }

        if (isLocked) {
            e.preventDefault();
            const touchY = e.touches[0].clientY;
            const delta = (touchStartY - touchY) * 2;
            touchStartY = touchY;

            const shouldStayLocked = updateProgress(delta);

            if (!shouldStayLocked) {
                isLocked = false;
                document.body.style.overflow = '';
            }
        }
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Check on scroll for initial lock
    window.addEventListener('scroll', () => {
        if (!isLocked) {
            checkLock();
        }
    });
});
