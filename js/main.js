document.addEventListener('DOMContentLoaded', () => {
    // --- Global Config ---
    const nav = document.querySelector('.glass-nav');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const canvas = document.getElementById('canvas-bg');
    const ctx = canvas.getContext('2d');

    // --- Dynamic Canvas Core (Network Particles) ---
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 30 : 60; // Fewer particles on mobile
    let mouse = { x: null, y: null };
    let animationId;
    let lastTime = 0;
    const fpsLimit = 60;

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.4 - 0.2,
                speedY: Math.random() * 0.4 - 0.2
            });
        }
    }

    function animate(time) {
        if (time - lastTime < 1000 / fpsLimit) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        lastTime = time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(14, 165, 233, 0.3)';
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';

        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 10000) { // 100px squared
                    const distance = Math.sqrt(distSq);
                    ctx.lineWidth = 1 - distance / 100;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', initCanvas);
    // --- Custom Tactical Cursor Logic ---
    const cursor = document.querySelector('.custom-cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';

        // Particle mouse tracking
        mouse.x = e.x;
        mouse.y = e.y;
    });

    document.querySelectorAll('a, button, [data-dest], .project-card, .service-card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });

    initCanvas();
    animate();

    // --- Dynamic Navigation ---
    // --- Dynamic Navigation (Hide on Scroll Down / Show on Up) ---
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add background glass effect
        if (currentScrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Hide/Show Logic
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling Down -> Hide Nav
            nav.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling Up -> Show Nav
            nav.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    });

    // --- Mobile Menu Logic ---
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');

        // Dynamic Hamburger Animation
        const spans = hamburger.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(8px, 8px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(8px, -8px)';
            document.body.style.overflow = 'hidden';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            document.body.style.overflow = 'initial';
        }
    });

    // --- Project Tab Logic ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const projectCards = document.querySelectorAll('.project-card');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');

                if (filter === 'all' || filter === category) {
                    card.classList.remove('hide');
                    // Small delay to trigger AOS entry again if needed
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.classList.add('hide');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                }
            });

            // Refresh AOS to detect new visibility states
            AOS.refresh();
        });
    });

    // --- Global Stealth Link Handling ---
    document.querySelectorAll('[data-dest]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const dest = link.getAttribute('data-dest');
            if (!dest) return;

            // Close mobile menu if open
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
                document.body.style.overflow = 'initial';
            }

            if (dest.startsWith('#')) {
                const target = document.querySelector(dest);
                if (target) {
                    const headerOffset = 90;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    // Update active state
                    document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
                    const navMatch = document.querySelector(`.nav-links a[data-dest="${dest}"]`);
                    if (navMatch) navMatch.classList.add('active');
                }
            } else if (dest.includes('mail.google.com') || dest.includes('wa.me')) {
                window.open(dest, '_blank', 'noopener,noreferrer');
            } else {
                window.location.assign(dest);
            }
        });
    });

    // --- AOS Initialization ---
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic'
    });

    // --- GSAP High-Impact Reveal ---
    if (window.gsap) {
        gsap.from('.title', {
            opacity: 0,
            y: 50,
            duration: 1.2,
            ease: 'power4.out',
            delay: 0.2
        });

        gsap.from('.subtitle', {
            opacity: 0,
            x: -30,
            duration: 1,
            ease: 'power3.out',
            delay: 0.1
        });
    }

    // --- DevOps Background Engine ---
    const techTagsContainer = document.querySelector('.bg-tech-tags');
    const technicalTerms = [
        'DOCKER_BUILD', 'K8S_DEPLOY', 'AWS_IAM_SYNC', 'TF_PLAN',
        'JENKINS_PIPELINE', 'CI_CD_ACTIVE', 'NGINX_CONF', 'LINUX_KERNEL',
        'YAML_PARSE', 'GCR_PUSH', 'PROMETHEUS_UP', 'STAGING_READY'
    ];

    function createTechTags() {
        for (let i = 0; i < 20; i++) {
            const tag = document.createElement('div');
            tag.className = 'tech-tag-floating';
            tag.innerText = technicalTerms[Math.floor(Math.random() * technicalTerms.length)];

            // Random Positioning
            tag.style.left = `${Math.random() * 100}%`;
            tag.style.top = `${Math.random() * 100}%`;

            // Varied Animation
            const duration = 15 + Math.random() * 20;
            const delay = Math.random() * -20;
            tag.style.animation = `drift ${duration}s linear ${delay}s infinite`;
            tag.style.opacity = Math.random() * 0.6 + 0.2;

            techTagsContainer.appendChild(tag);
        }
    }
    createTechTags();

    // --- Distributed Achievement Cloud ---
    const achievements = [
        "99.9% SLI", "500+ NODES", "SECURED_IAM",
        "CI/CD_FLOW", "DOCKER_GRID", "AWS_ARCH",
        "KERNEL_CONTRIB", "MARIADB_OPT"
    ];

    function createAchievementCloud() {
        achievements.forEach((text, index) => {
            const el = document.createElement('div');
            el.className = 'bg-achievement';
            el.innerText = text;
            el.style.left = `${(index * 12) % 90}%`;
            el.style.top = `${(index * 15) % 80}%`;
            document.body.appendChild(el);
        });
    }
    createAchievementCloud();

    // --- Context Protection & Security Layer ---
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Prevent Image Dragging (Anti-Asset Theft)
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('dragstart', (e) => e.preventDefault());
    });



    // --- Performance Optimization for Low-End Devices ---
    const isLowEndDevice = () => {
        // Simple check for low memory or low hardware concurrency
        return (navigator.deviceMemory && navigator.deviceMemory < 4) ||
            (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    };

    if (isLowEndDevice()) {
        document.body.classList.add('low-end-performance');
        // Reduce animations or disable canvas if needed
        cancelAnimationFrame(animationId);
        canvas.style.display = 'none';
    }

    // --- Context Protection (Softened) ---
    // Instead of nuking the site, we just prevent default behaviors (Duplication removed)
    // Note: The primary listeners are already attached above at line 291/294

});
