/* ═══════════════════════════════════════════════════════════════
   NEURAL LIGHT — Awwwards-Level Interactions
   Lenis smooth scroll, GSAP orchestration, 3D tilt, cursor glow,
   magnetic buttons, split-text hero, cinematic preloader
   ═══════════════════════════════════════════════════════════════ */

// ─── Lenis Smooth Scroll ───
let lenis;
function initLenis() {
    lenis = new Lenis({ duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 2 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
}

// ─── Neural Network Canvas ───
function initNeuralCanvas() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    canvas.style.willChange = 'transform';
    let particles = [], mouse = { x: null, y: null, radius: 150 };
    function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; initP(); }
    function initP() {
        particles = [];
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 100);
        for (let i = 0; i < count; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.5 + 0.5, o: Math.random() * 0.4 + 0.15 });
    }
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            if (mouse.x !== null) { const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.sqrt(dx*dx+dy*dy); if (d < mouse.radius * 0.6) { p.x += dx/d*0.8; p.y += dy/d*0.8; } }
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fillStyle = `rgba(8,145,178,${p.o*0.7})`; ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) for (let j = i+1; j < particles.length; j++) {
            const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y, d = Math.sqrt(dx*dx+dy*dy);
            if (d < 140) { ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.strokeStyle = `rgba(8,145,178,${(1-d/140)*0.15})`; ctx.lineWidth=0.5; ctx.stroke(); }
        }
        if (mouse.x !== null) particles.forEach(p => { const dx=mouse.x-p.x,dy=mouse.y-p.y,d=Math.sqrt(dx*dx+dy*dy); if(d<mouse.radius){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);ctx.strokeStyle=`rgba(229,88,10,${(1-d/mouse.radius)*0.3})`;ctx.lineWidth=0.6;ctx.stroke();} });
        requestAnimationFrame(draw);
    }
    canvas.parentElement.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; });
    canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
    resize(); window.addEventListener('resize', resize); draw();
}

// ─── Custom Cursor ───
function initCursor() {
    if (window.innerWidth <= 768) return;
    const dot = document.getElementById('cursorDot'), ring = document.getElementById('cursorRing'), txt = document.getElementById('cursorText');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx+'px'; dot.style.top = my+'px'; txt.style.left = mx+'px'; txt.style.top = (my-30)+'px'; });
    (function animR() { rx += (mx-rx)*0.12; ry += (my-ry)*0.12; ring.style.left = rx+'px'; ring.style.top = ry+'px'; requestAnimationFrame(animR); })();
    document.querySelectorAll('a, button, .btn-neural, .social-link, .nav-link, .nav-cta, .contact-card, .cred-link, .pub-link, .project-ext, .social-btn-lg').forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('hovering'); ring.classList.add('hovering'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('hovering'); ring.classList.remove('hovering'); });
    });
    document.querySelectorAll('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('card-hover'); ring.classList.add('card-hover'); txt.textContent = el.dataset.cursor; txt.classList.add('visible'); });
        el.addEventListener('mouseleave', () => { dot.classList.remove('card-hover'); ring.classList.remove('card-hover'); txt.classList.remove('visible'); });
    });
}

// ─── Scroll Progress ───
function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
}

// ─── Cinematic Preloader ───
function initPreloader() {
    const pre = document.getElementById('preloader'), fill = document.getElementById('preloaderFill'), counter = document.getElementById('preloaderCounter'), wipe = document.getElementById('preloaderWipe');
    let p = 0;
    const iv = setInterval(() => {
        p += Math.random() * 12 + 3;
        if (p >= 100) {
            p = 100; fill.style.width = '100%'; counter.textContent = '100'; clearInterval(iv);
            setTimeout(() => {
                gsap.to(wipe, { scaleY: 1, duration: 0.6, ease: 'power4.inOut', onComplete: () => {
                    pre.classList.add('done');
                    gsap.to(pre, { opacity: 0, duration: 0.4, delay: 0.1, onComplete: () => { pre.style.display = 'none'; } });
                    runHeroSequence();
                }});
            }, 300);
        } else { fill.style.width = p+'%'; counter.textContent = Math.floor(p); }
    }, 60);
}

// ─── Hero GSAP Sequence ───
function runHeroSequence() {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to('.hero-tag', { opacity: 1, y: 0, duration: 1, delay: 0.2 })
      .to('.split-word', { y: 0, duration: 1.2, stagger: 0.15, ease: 'power4.out' }, '-=0.6')
      .to('.name-dot', { y: 0, duration: 0.8, ease: 'back.out(2)' }, '-=0.5')
      .to('#heroRole', { opacity: 1, duration: 0.8 }, '-=0.4')
      .to('#heroDesc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .to('#heroActions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .to('#heroSocials', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .to('#heroScroll', { opacity: 1, duration: 0.8 }, '-=0.2')
      .from('.hero-portrait', { scale: 0.85, opacity: 0, duration: 1.5, ease: 'back.out(1.4)' }, '-=1.8');
    // Counters
    document.querySelectorAll('.metric-num').forEach(el => {
        gsap.to(el, { textContent: +el.dataset.target, duration: 1.5, ease: 'power2.out', snap: { textContent: 1 }, delay: 1, scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    initScrollAnimations();
}

// ─── Scroll-Triggered Animations ───
function initScrollAnimations() {
    gsap.utils.toArray('.gs-reveal').forEach(el => {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    });
    document.querySelectorAll('.about-stats .stat-number').forEach(el => {
        gsap.to(el, { textContent: +el.dataset.target, duration: 1.5, ease: 'power2.out', snap: { textContent: 1 }, scrollTrigger: { trigger: el, start: 'top 85%', once: true, onEnter: () => el.closest('.stat-block')?.classList.add('in-view') } });
    });
    const staggerSets = [
        { sel: '.project-card', delay: 0.08 }, { sel: '.skill-block', delay: 0.06 },
        { sel: '.exp-card', delay: 0.1 }, { sel: '.pub-card', delay: 0.1 },
        { sel: '.cred-card', delay: 0.06 }, { sel: '.edu-card', delay: 0.1 }
    ];
    staggerSets.forEach(({ sel, delay }) => {
        gsap.utils.toArray(sel).forEach((el, i) => {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.7, delay: i * delay, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
        });
    });
    gsap.to('.contact-form', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.contact-form', start: 'top 85%', once: true } });
    gsap.to('.hero-portrait', { y: 80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.utils.toArray('.section-line').forEach(l => { gsap.from(l, { width: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 85%', once: true } }); });
}

// ─── Sticky Card Stack ───
function initStickyStack() {
    const wrappers = gsap.utils.toArray('.project-sticky-wrapper');
    const stack = document.getElementById('projectsStack');
    if (!wrappers.length || !stack) return;
    
    wrappers.forEach((wrapper, i) => {
        const card = wrapper.querySelector('.project-card');
        
        // Inject a pure black overlay that we can control via opacity for high-performance shadows
        // This is 100x smoother than animating CSS filter: brightness()
        let overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; inset:0; background:rgba(0,0,0,0.6); opacity:0; z-index:10; pointer-events:none; border-radius:inherit; transition:none;';
        card.appendChild(overlay);

        if (i === wrappers.length - 1) return; // Last card stays static
        
        const targetScale = 1 - ((wrappers.length - i - 1) * 0.05); // e.g. 5 cards remaining = scales to 0.75
        
        // Timeline ensures scale and opacity run identically
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper,
                start: "top top+=15%", // Anchors specifically when the card reaches its sticky position
                endTrigger: stack,
                end: "bottom bottom-=5%", // Finishes exactly when the whole stack is scrolled past
                scrub: 0.5, // Added smoothing to make reverse unscroll fluid,
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
        });
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
        });
    });
}

// ─── Magnetic Effect ───
function initMagnetic() {
    if (window.innerWidth <= 768) return;
    document.querySelectorAll('.btn-neural, .social-link, .back-to-top').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, { x: (e.clientX - r.left - r.width/2) * 0.25, y: (e.clientY - r.top - r.height/2) * 0.25, duration: 0.3, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => { gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' }); });
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
            ripple.offsetHeight;
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

// ─── Navbar ───
function initNavbar() {
    const navbar = document.getElementById('navbar'), btt = document.getElementById('backToTop');
    const toggle = document.getElementById('navToggle'), links = document.getElementById('navLinks');
    const sections = document.querySelectorAll('.section'), navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 50);
        btt.classList.toggle('visible', y > 500);
        let cur = '';
        sections.forEach(s => { if (y >= s.offsetTop - 120) cur = s.id; });
        navLinks.forEach(l => { l.classList.toggle('active', l.getAttribute('href') === '#'+cur); });
    }, { passive: true });
    btt.addEventListener('click', () => { if (lenis) lenis.scrollTo(0); else window.scrollTo({ top:0, behavior:'smooth' }); });
    toggle.addEventListener('click', () => { toggle.classList.toggle('active'); links.classList.toggle('active'); });
    links.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => { toggle.classList.remove('active'); links.classList.remove('active'); }));
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            e.preventDefault();
            const t = document.querySelector(this.getAttribute('href'));
            if (t) { if (lenis) lenis.scrollTo(t); else t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });
}

// ─── Contact Form ───
function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(form));
        window.location.href = `mailto:muhammad.azem03@gmail.com?subject=${encodeURIComponent(d.subject||'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${d.name}\nEmail: ${d.email}\n\n${d.message}`)}`;
        const btn = form.querySelector('.btn-neural-text');
        if (btn) { const orig = btn.textContent; btn.textContent = 'Opening Mail...'; setTimeout(() => { btn.textContent = orig; form.reset(); }, 3000); }
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
    initTypewriter();
    initNavbar();
    initForm();
    initRipple();
    initStickyStack();
    setTimeout(() => { initTilt(); initCardGlow(); initMagnetic(); }, 1500);
});
