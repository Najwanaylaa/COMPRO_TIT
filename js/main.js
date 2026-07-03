/* =============================================
   PT Thermal Inovasi Teknik - Main JavaScript
   ============================================= */

/* ---------- Mobile Menu Toggle ---------- */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('#mobile-menu a').forEach(a => a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    }));
}

/* ---------- Project Filter & Toggle Show More ---------- */
let currentProjectFilter = 'all';
let showAllProjects = false;
const PROJECTS_LIMIT = 6;

function updateProjects() {
    const items = document.querySelectorAll('.project-item');
    if (items.length === 0) return;
    const matchingItems = [];
    
    // Separate matching and non-matching items
    items.forEach(item => {
        const matches = (currentProjectFilter === 'all' || item.dataset.category === currentProjectFilter);
        if (matches) {
            matchingItems.push(item);
        } else {
            item.style.display = 'none';
        }
    });

    const toggleContainer = document.getElementById('project-toggle-container');
    const toggleText = document.getElementById('project-toggle-text');
    const toggleIcon = document.getElementById('project-toggle-icon');

    // Handle pagination/toggle display
    if (matchingItems.length > PROJECTS_LIMIT) {
        if (toggleContainer) toggleContainer.classList.remove('hidden');
        
        matchingItems.forEach((item, index) => {
            if (showAllProjects || index < PROJECTS_LIMIT) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        if (showAllProjects) {
            if (toggleText) toggleText.textContent = 'Tampilkan Lebih Sedikit';
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-up');
        } else {
            if (toggleText) toggleText.textContent = 'Tampilkan Lebih Banyak';
            if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-down');
        }
    } else {
        if (toggleContainer) toggleContainer.classList.add('hidden');
        matchingItems.forEach(item => {
            item.style.display = '';
        });
    }
    
    // Refresh icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// Filter Button Click Listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Reset all buttons
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.style.background = '#e8f4f8';
            b.style.color = '#4a6280';
        });
        // Activate clicked button
        btn.style.background = '#00b4d8';
        btn.style.color = '#fff';

        currentProjectFilter = btn.dataset.filter;
        showAllProjects = false; // Reset to only show limit
        updateProjects();
    });
});

// Toggle Button Click Listener
const toggleBtn = document.getElementById('project-toggle-btn');
if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        showAllProjects = !showAllProjects;
        updateProjects();
        
        // If collapse to 6 items, scroll back to projects section so they don't lose focus
        if (!showAllProjects) {
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Initial call to set state on load
updateProjects();

/* ---------- Quotation Wizard ---------- */
function nextStep(step) {
    const targetStep = document.getElementById('q-step-' + step);
    if (!targetStep) return;
    document.querySelectorAll('[id^="q-step-"]').forEach(s => s.classList.add('hidden'));
    targetStep.classList.remove('hidden');
    document.querySelectorAll('.step-indicator').forEach(ind => {
        ind.className = 'step-indicator w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ' +
            (parseInt(ind.dataset.step) <= step ? 'step-active' : 'step-inactive');
    });
}

/* ---------- Scroll Fade-in Animations ---------- */
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.glass, .card-hover').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

/* ---------- Data SDK Initialization ---------- */
let sdkReady = false;

// Mock SDK fallback for local development
if (!window.dataSdk) {
    window.dataSdk = {
        init: async () => {
            console.warn("Running in local environment: Mocking window.dataSdk.init");
            return { isOk: true };
        },
        create: async (data) => {
            console.warn("Running in local environment: Mocking window.dataSdk.create", data);
            return { isOk: true };
        }
    };
}

async function initSDK() {
    const result = await window.dataSdk.init({ onDataChanged() { } });
    if (result.isOk) sdkReady = true;
}

initSDK();

/* ---------- Contact Form Submission ---------- */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!sdkReady) return;

        const btn = document.querySelector('[data-template-id="contact-submit-btn"]');
        btn.disabled = true;
        btn.textContent = 'Mengirim...';

        const result = await window.dataSdk.create({
            form_type: 'contact',
            company_name: document.getElementById('cf-company').value,
            pic_name: document.getElementById('cf-pic').value,
            email: document.getElementById('cf-email').value,
            phone: document.getElementById('cf-phone').value,
            industry_type: document.getElementById('cf-industry').value,
            description: document.getElementById('cf-desc').value,
            sector: '',
            material: '',
            hvac_component: '',
            submitted_at: new Date().toISOString()
        });

        btn.disabled = false;
        btn.textContent = 'Kirim Permintaan Konsultasi';

        if (result.isOk) {
            document.getElementById('contact-success').classList.remove('hidden');
            e.target.reset();
            setTimeout(() => document.getElementById('contact-success').classList.add('hidden'), 4000);
        }
    });
}

/* ---------- Quotation Form Submission ---------- */
const quotationForm = document.getElementById('quotation-form');
if (quotationForm) {
    quotationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!sdkReady) return;

        const btn = document.getElementById('q-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Mengirim...';

        const sectors   = [...document.querySelectorAll('input[name="sector"]:checked')].map(c => c.value).join(', ');
        const materials = [...document.querySelectorAll('input[name="material"]:checked')].map(c => c.value).join(', ');
        const hvacs     = [...document.querySelectorAll('input[name="hvac"]:checked')].map(c => c.value).join(', ');

        const result = await window.dataSdk.create({
            form_type: 'quotation',
            company_name: document.getElementById('q-company').value,
            pic_name: document.getElementById('q-pic').value,
            email: document.getElementById('q-email').value,
            phone: document.getElementById('q-phone').value,
            industry_type: '',
            description: '',
            sector: sectors,
            material: materials,
            hvac_component: hvacs,
            submitted_at: new Date().toISOString()
        });

        btn.disabled = false;
        btn.textContent = 'Kirim Request Penawaran';

        if (result.isOk) {
            document.querySelectorAll('[id^="q-step-"]').forEach(s => s.classList.add('hidden'));
            document.getElementById('q-success').classList.remove('hidden');
        }
    });
}

/* ---------- Hero Slideshow Carousel ---------- */
const track = document.getElementById('hero-slide-track');
const slidesCount = 7;
let currentSlide = 0;
let slideInterval;

function updateSlide() {
    if (track) {
        track.style.transform = `translateX(-${(currentSlide * 100) / slidesCount}%)`;
    }
}

function startSlideShow() {
    slideInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % slidesCount;
        updateSlide();
    }, 4000);
}

function resetSlideShow() {
    clearInterval(slideInterval);
    startSlideShow();
}

const prevBtn = document.getElementById('hero-prev-btn');
const nextBtn = document.getElementById('hero-next-btn');

if (track && prevBtn && nextBtn) {
    startSlideShow();

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + slidesCount) % slidesCount;
        updateSlide();
        resetSlideShow();
    });

    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % slidesCount;
        updateSlide();
        resetSlideShow();
    });
}

/* ---------- Lucide Icons ---------- */
lucide.createIcons();
