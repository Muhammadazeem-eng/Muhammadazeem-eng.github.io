/* ═══════════════════════════════════════════════════════════════
   NEURAL LIGHT — Awwwards-Level Interactions
   Lenis smooth scroll, GSAP orchestration, 3D tilt, cursor glow,
   magnetic buttons, split-text hero, cinematic preloader
   ═══════════════════════════════════════════════════════════════ */

// ─── Lenis Smooth Scroll ───
let lenis;
function initLenis() {
    const isMobile = window.innerWidth <= 768;
    lenis = new Lenis({ 
        duration: isMobile ? 0.7 : 1.2, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        smooth: true, 
        smoothWheel: true, 
        wheelMultiplier: 0.9, 
        touchMultiplier: 1.5 
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

// ─── Neural Network Canvas (optimized) ───
function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const isMobile = window.innerWidth <= 768;
    const maxParticles = isMobile ? 24 : 48;
    const linkDistance = isMobile ? 80 : 110;
    const linkDistSq = linkDistance * linkDistance; // Pre-compute squared distance
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let isVisible = true;
    let rafId = null;
    let lastFrame = 0;
    const targetFrameMs = isMobile ? 50 : 33;

    function resize() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        initParticles();
    }

    function initParticles() {
        particles = [];
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 25000), maxParticles);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.5,
                o: Math.random() * 0.35 + 0.15
            });
        }
    }

    function draw(ts) {
        rafId = requestAnimationFrame(draw);
        if (!isVisible || ts - lastFrame < targetFrameMs) return;
        lastFrame = ts;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        const len = particles.length;

        // Update positions
        for (let i = 0; i < len; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            // Mouse repulsion
            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dSq = dx * dx + dy * dy;
                const threshold = mouse.radius * 0.36; // 0.6^2
                if (dSq < threshold * mouse.radius) {
                    const d = Math.sqrt(dSq);
                    p.x += (dx / d) * 0.8;
                    p.y += (dy / d) * 0.8;
                }
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(8,145,178,${p.o * 0.7})`;
            ctx.fill();
        }

        // Draw links — O(n²) but optimized with squared distance check (no sqrt)
        ctx.lineWidth = 0.5;
        for (let i = 0; i < len; i++) {
            for (let j = i + 1; j < len; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dSq = dx * dx + dy * dy;
                if (dSq < linkDistSq) {
                    const alpha = (1 - Math.sqrt(dSq) / linkDistance) * 0.14;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(8,145,178,${alpha})`;
                    ctx.stroke();
                }
            }
        }

        // Mouse links
        if (mouse.x !== null) {
            ctx.lineWidth = 0.6;
            for (let i = 0; i < len; i++) {
                const dx = mouse.x - particles[i].x;
                const dy = mouse.y - particles[i].y;
                const dSq = dx * dx + dy * dy;
                const rSq = mouse.radius * mouse.radius;
                if (dSq < rSq) {
                    const d = Math.sqrt(dSq);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(229,88,10,${(1 - d / mouse.radius) * 0.3})`;
                    ctx.stroke();
                }
            }
        }
    }

    // Passive event listeners for better scroll perf
    canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
    }, { passive: true });

    canvas.parentElement.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    }, { passive: true });

    // Pause canvas when tab is hidden
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    // Pause canvas when scrolled out of hero
    const heroSection = document.getElementById('hero');
    if (heroSection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
            isVisible = entry.isIntersecting && !document.hidden;
        }, { threshold: 0.05 });
        observer.observe(heroSection);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    draw(0);
}

// ─── Custom Cursor (GPU-accelerated) ───
function initCursor() {
    if (window.innerWidth <= 768) return;
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const txt = document.getElementById('cursorText');
    let mx = 0, my = 0;

    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
        txt.style.transform = `translate3d(${mx}px, ${my - 30}px, 0)`;
    }, { passive: true });

    // Use event delegation for hover states
    document.addEventListener('mouseenter', e => {
        const el = e.target;
        if (el.matches('a, button, .btn-neural, .social-link, .nav-link, .nav-cta, .contact-card, .cred-link, .pub-link, .project-ext, .social-btn-lg')) {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
        }
        if (el.closest('[data-cursor]')) {
            const parent = el.closest('[data-cursor]');
            dot.classList.add('card-hover');
            ring.classList.add('card-hover');
            txt.textContent = parent.dataset.cursor;
            txt.classList.add('visible');
        }
    }, true);

    document.addEventListener('mouseleave', e => {
        const el = e.target;
        if (el.matches('a, button, .btn-neural, .social-link, .nav-link, .nav-cta, .contact-card, .cred-link, .pub-link, .project-ext, .social-btn-lg')) {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
        }
        if (el.closest('[data-cursor]')) {
            dot.classList.remove('card-hover');
            ring.classList.remove('card-hover');
            txt.classList.remove('visible');
        }
    }, true);
}

// ─── Scroll Progress (passive, throttled via rAF) ───
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                const h = document.documentElement.scrollHeight - window.innerHeight;
                if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
                ticking = false;
            });
        }
    }, { passive: true });
}

// ─── Cinematic Preloader ───
function initPreloader() {
    const pre = document.getElementById('preloader');
    const fill = document.getElementById('preloaderFill');
    const counter = document.getElementById('preloaderCounter');
    const wipe = document.getElementById('preloaderWipe');
    let p = 0;
    const iv = setInterval(() => {
        p += Math.random() * 25 + 10;
        if (p >= 100) {
            p = 100;
            fill.style.width = '100%';
            counter.textContent = '100';
            clearInterval(iv);
            setTimeout(() => {
                gsap.to(wipe, {
                    scaleY: 1, duration: 0.4, ease: 'power4.inOut',
                    onComplete: () => {
                        pre.classList.add('done');
                        gsap.to(pre, {
                            opacity: 0, duration: 0.2,
                            onComplete: () => { pre.style.display = 'none'; }
                        });
                        runHeroSequence();
                    }
                });
            }, 100);
        } else {
            fill.style.width = p + '%';
            counter.textContent = Math.floor(p);
        }
    }, 30);
}

// ─── Hero GSAP Sequence ───
function runHeroSequence() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero-tag', { opacity: 1, y: 0, duration: 0.6, delay: 0.1 })
      .to('.split-word', { y: 0, duration: 0.8, stagger: 0.08, ease: 'power4.out' }, '-=0.4')
      .to('.name-dot', { y: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.3')
      .to('#heroRole', { opacity: 1, duration: 0.5 }, '-=0.2')
      .to('#heroDesc', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('#heroActions', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('#heroSocials', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('#heroScroll', { opacity: 1, duration: 0.5 }, '-=0.3')
      .from('.hero-portrait', { scale: 0.95, opacity: 0, duration: 1, ease: 'power4.out' }, '-=1.2');

    // Counters with lazy trigger
    document.querySelectorAll('.metric-num').forEach(el => {
        gsap.to(el, {
            textContent: +el.dataset.target, duration: 1.5, ease: 'power2.out',
            snap: { textContent: 1 }, delay: 1,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        });
    });
    initScrollAnimations();
}

// ─── Scroll-Triggered Animations ───
function initScrollAnimations() {
    // Batch reveal animations for better performance
    ScrollTrigger.batch('.gs-reveal', {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => {
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 });
        }
    });

    // Stat number counters
    document.querySelectorAll('.about-stats .stat-number').forEach(el => {
        gsap.to(el, {
            textContent: +el.dataset.target, duration: 1.5, ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
                trigger: el, start: 'top 85%', once: true,
                onEnter: () => el.closest('.stat-block')?.classList.add('in-view')
            }
        });
    });

    // Contact form reveal
    gsap.to('.contact-form', {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: '.contact-form', start: 'top 85%', once: true }
    });

    // Parallax hero portrait
    gsap.to('.hero-portrait', {
        y: 80, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
    });

    // Section line reveals
    gsap.utils.toArray('.section-line').forEach(l => {
        gsap.from(l, {
            width: 0, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: l, start: 'top 85%', once: true }
        });
    });
}

// ─── Sticky Card Stack ───
function initStickyStack() {
    const wrappers = gsap.utils.toArray('.project-sticky-wrapper');
    const stack = document.getElementById('projectsStack');
    if (!wrappers.length || !stack) return;
    
    wrappers.forEach((wrapper, i) => {
        const card = wrapper.querySelector('.project-card');
        
        // GPU-composited overlay for smooth dimming
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.6);opacity:0;z-index:10;pointer-events:none;border-radius:inherit;will-change:opacity;';
        card.appendChild(overlay);

        if (i === wrappers.length - 1) return;
        
        const targetScale = 1 - ((wrappers.length - i - 1) * 0.05);
        
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: "top top+=15%",
                endTrigger: stack,
                end: "bottom bottom-=5%",
                scrub: 0.5,
                invalidateOnRefresh: true
            }
        });

        tl.to(card, { scale: targetScale, transformOrigin: "top center", ease: "none" }, 0)
          .to(overlay, { opacity: 1, ease: "none" }, 0);
    });
}

// ─── 3D Tilt Effect ───
function initTilt() {
    if (window.innerWidth <= 768) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(el, { rotateY: x * 8, rotateX: -y * 8, duration: 0.4, ease: 'power2.out', transformPerspective: 600 });
        }, { passive: true });
        el.addEventListener('mouseleave', () => {
            gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
        });
    });
}

// ─── Cursor-Following Card Glow ───
function initCardGlow() {
    if (window.innerWidth <= 768) return;
    document.querySelectorAll('.project-card-glow, .skill-block-glow, .exp-card-glow').forEach(glow => {
        const card = glow.parentElement;
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            glow.style.left = (e.clientX - r.left - 100) + 'px';
            glow.style.top = (e.clientY - r.top - 100) + 'px';
        }, { passive: true });
    });
}

// ─── Magnetic Effect ───
function initMagnetic() {
    if (window.innerWidth <= 768) return;
    document.querySelectorAll('.btn-neural, .social-link, .back-to-top').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, { x: (e.clientX - r.left - r.width/2) * 0.25, y: (e.clientY - r.top - r.height/2) * 0.25, duration: 0.3, ease: 'power2.out' });
        }, { passive: true });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
        });
    });
}

// ─── Button Ripple ───
function initRipple() {
    document.querySelectorAll('.btn-neural').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = this.querySelector('.btn-ripple');
            if (!ripple) return;
            const r = this.getBoundingClientRect();
            const size = Math.max(r.width, r.height) * 2;
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - r.left - size/2) + 'px';
            ripple.style.top = (e.clientY - r.top - size/2) + 'px';
            ripple.style.animation = 'none';
            ripple.offsetHeight; // force reflow
            ripple.style.animation = 'rippleEffect 0.6s ease-out forwards';
        });
    });
}

// ─── Typewriter ───
function initTypewriter() {
    const el = document.getElementById('roleDynamic');
    if (!el) return;
    const phrases = ['production ML systems', 'RAG pipelines & LLM agents', 'computer vision models', 'enterprise AI platforms', 'multi-agent orchestration'];
    let pi = 0, ci = 0, del = false, spd = 60;
    (function type() {
        const cur = phrases[pi];
        if (del) { el.textContent = cur.substring(0, --ci); spd = 30; }
        else { el.textContent = cur.substring(0, ++ci); spd = 60; }
        if (!del && ci === cur.length) { spd = 2500; del = true; }
        else if (del && ci === 0) { del = false; pi = (pi+1) % phrases.length; spd = 300; }
        setTimeout(type, spd);
    })();
}

// ─── Keep hero video running ───
function initHeroMedia() {
    const video = document.querySelector('.portrait-video');
    if (!video || video.tagName !== 'VIDEO') return;
    video.muted = true;
    video.playsInline = true;

    const tryPlay = () => video.play().catch(() => setTimeout(() => video.play().catch(() => {}), 500));
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && video.paused) tryPlay(); });
}

// ─── Navbar (throttled via rAF) ───
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const btt = document.getElementById('backToTop');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(() => {
                const y = window.scrollY;
                navbar.classList.toggle('scrolled', y > 50);
                btt.classList.toggle('visible', y > 500);

                let cur = '';
                sections.forEach(s => { if (y >= s.offsetTop - 120) cur = s.id; });
                navLinks.forEach(l => {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
                });
                ticking = false;
            });
        }
    }, { passive: true });

    btt.addEventListener('click', () => {
        if (lenis) lenis.scrollTo(0, { duration: window.innerWidth <= 768 ? 0.6 : 1.2 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const t = document.querySelector(targetId);
            if (t) {
                if (lenis) lenis.scrollTo(t, { duration: window.innerWidth <= 768 ? 0.6 : 1.2, lock: true });
                else t.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ─── Contact Form (with honeypot check) ───
function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));

        // Honeypot check — if bot filled the hidden field, silently reject
        if (d.website && d.website.length > 0) {
            console.warn('Bot submission blocked');
            return;
        }

        window.location.href = `mailto:muhammad.azem03@gmail.com?subject=${encodeURIComponent(d.subject||'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${d.name}\nEmail: ${d.email}\n\n${d.message}`)}`;
        const btn = form.querySelector('.btn-neural-text');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Opening Mail...';
            setTimeout(() => { btn.textContent = orig; form.reset(); }, 3000);
        }
    });
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    initLenis();
    initNeuralCanvas();
    initCursor();
    initScrollProgress();
    initPreloader();
    initHeroMedia();
    initTypewriter();
    initNavbar();
    initForm();
    initRipple();
    initStickyStack();
    // Defer non-critical effects
    setTimeout(() => { initTilt(); initCardGlow(); initMagnetic(); }, 1500);
});
