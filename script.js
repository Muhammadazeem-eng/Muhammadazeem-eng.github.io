/* ===================================================================
   MUHAMMAD AZEEM - PORTFOLIO SCRIPTS
   Smooth scroll, typewriter, animations, nav interactions, wave BG
   =================================================================== */

// ---- Flowing Wave Lines Background ----
function initWaveBackground() {
    const canvas = document.getElementById('waveBg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function drawWaveLine(yBase, amplitude, frequency, speed, color, lineWidth, phaseOffset) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        for (let x = 0; x <= canvas.width; x += 2) {
            const normalX = x / canvas.width;
            const y = yBase +
                Math.sin(normalX * frequency + time * speed + phaseOffset) * amplitude +
                Math.sin(normalX * frequency * 0.5 + time * speed * 0.7 + phaseOffset * 1.3) * (amplitude * 0.4);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const h = canvas.height;
        const w = canvas.width;

        // Draw multiple flowing wave lines — purple and cyan
        const waveConfig = [
            // Purple waves
            { yBase: h * 0.25, amp: 60, freq: 4, speed: 0.4, color: 'rgba(124, 58, 237, 0.06)', width: 1.2, phase: 0 },
            { yBase: h * 0.30, amp: 80, freq: 3.5, speed: 0.35, color: 'rgba(124, 58, 237, 0.08)', width: 1.5, phase: 1 },
            { yBase: h * 0.35, amp: 55, freq: 5, speed: 0.5, color: 'rgba(124, 58, 237, 0.05)', width: 1.0, phase: 2 },
            { yBase: h * 0.28, amp: 70, freq: 3, speed: 0.3, color: 'rgba(168, 85, 247, 0.07)', width: 1.3, phase: 3 },
            { yBase: h * 0.40, amp: 50, freq: 6, speed: 0.45, color: 'rgba(139, 92, 246, 0.04)', width: 0.8, phase: 4 },
            // Cyan waves
            { yBase: h * 0.55, amp: 70, freq: 3.5, speed: 0.38, color: 'rgba(6, 182, 212, 0.06)', width: 1.2, phase: 0.5 },
            { yBase: h * 0.60, amp: 90, freq: 3, speed: 0.32, color: 'rgba(6, 182, 212, 0.08)', width: 1.5, phase: 1.5 },
            { yBase: h * 0.65, amp: 55, freq: 4.5, speed: 0.42, color: 'rgba(6, 182, 212, 0.05)', width: 1.0, phase: 2.5 },
            { yBase: h * 0.58, amp: 65, freq: 3.8, speed: 0.28, color: 'rgba(34, 211, 238, 0.06)', width: 1.2, phase: 3.5 },
            { yBase: h * 0.70, amp: 45, freq: 5.5, speed: 0.5, color: 'rgba(6, 182, 212, 0.04)', width: 0.8, phase: 4.5 },
            // Intersecting lines in middle
            { yBase: h * 0.45, amp: 100, freq: 2.5, speed: 0.25, color: 'rgba(124, 58, 237, 0.04)', width: 1.0, phase: 5 },
            { yBase: h * 0.50, amp: 85, freq: 2.8, speed: 0.3, color: 'rgba(6, 182, 212, 0.04)', width: 1.0, phase: 5.5 },
        ];

        waveConfig.forEach(w => {
            drawWaveLine(w.yBase, w.amp, w.freq, w.speed, w.color, w.width, w.phase);
        });

        time += 0.008;
        animationId = requestAnimationFrame(animate);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', () => {
    // ---- Init wave background ----
    initWaveBackground();

    // ---- Typewriter Effect ----
    const typewriterEl = document.getElementById('typewriterText');
    const titles = [
        'AI Engineer',
        'ML Researcher',
        'LLM Specialist',
        'Computer Vision Engineer',
        'RAG Pipeline Architect'
    ];
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typewrite() {
        const current = titles[titleIndex];

        if (isDeleting) {
            typewriterEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 40;
        } else {
            typewriterEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80;
        }

        if (!isDeleting && charIndex === current.length) {
            typingSpeed = 2000; // pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            titleIndex = (titleIndex + 1) % titles.length;
            typingSpeed = 400; // pause before next word
        }

        setTimeout(typewrite, typingSpeed);
    }

    typewrite();

    // ---- Navbar scroll effect ----
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleScroll() {
        const scrollY = window.scrollY;

        // Navbar background
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top
        if (scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active nav link
        highlightActiveNav();
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    // ---- Back to top ----
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- Mobile menu toggle ----
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ---- Active nav highlight on scroll ----
    const sections = document.querySelectorAll('.section');
    const navLinkElements = document.querySelectorAll('.nav-link');

    function highlightActiveNav() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinkElements.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ---- Scroll reveal (IntersectionObserver) ----
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // ---- Animated counter for stats ----
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => counterObserver.observe(num));

    function animateCounter(el, target) {
        let count = 0;
        const duration = 1500;
        const increment = target / (duration / 30);

        const timer = setInterval(() => {
            count += increment;
            if (count >= target) {
                el.textContent = target;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(count);
            }
        }, 30);
    }

    // ---- Contact form (basic handler) ----
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // Construct mailto link as fallback
        const subject = encodeURIComponent(data.subject || 'Portfolio Contact');
        const body = encodeURIComponent(
            `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`
        );
        window.location.href = `mailto:muhammad.azem03@gmail.com?subject=${subject}&body=${body}`;

        // Visual feedback
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Opening Mail Client...';
        btn.style.pointerEvents = 'none';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.pointerEvents = '';
            contactForm.reset();
        }, 3000);
    });

    // ---- Smooth scroll for all anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
