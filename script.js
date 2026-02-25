// Массив фотографий для галереи
const photos = [
    {
        name: "Mercedes-Benz V-Class – экстерьер",
        small: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop",
        large: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&h=800&fit=crop"
    },
    {
        name: "Mercedes-Benz V-Class – салон",
        small: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=600&h=400&fit=crop",
        large: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=1200&h=800&fit=crop"
    },
    {
        name: "BMW 7 Series",
        small: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop",
        large: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=800&fit=crop"
    },
    {
        name: "Toyota Alphard",
        small: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&h=400&fit=crop",
        large: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1200&h=800&fit=crop"
    },
    {
        name: "Mercedes Sprinter",
        small: "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=600&h=400&fit=crop",
        large: "https://images.unsplash.com/photo-1570125909517-53cb21c89ff2?w=1200&h=800&fit=crop"
    },
    {
        name: "Volkswagen Multivan",
        small: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=600&h=400&fit=crop",
        large: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=1200&h=800&fit=crop"
    }
];

// Глобальные переменные
let reviews = [];
let currentDisplayCount = 3;

// Функции для отображения данных, загруженных из Supabase
function renderFeatures(features) {
    const container = document.querySelector('.features-grid');
    if (!container) return;
    container.innerHTML = features.map(f => `
        <div class="feature-item">
            <i class="fas ${f.icon}"></i>
            <h3>${f.title}</h3>
            <p>${f.description}</p>
        </div>
    `).join('');
}

function renderContacts(contacts) {
    const phoneSpan = document.querySelector('.contact-info span');
    if (phoneSpan) phoneSpan.innerHTML = `<i class="fas fa-phone-alt"></i> ${contacts.phone}`;
    const telegramBtn = document.querySelector('.contact-btn.telegram');
    if (telegramBtn) telegramBtn.href = contacts.telegram;
    const whatsappBtn = document.querySelector('.contact-btn.whatsapp');
    if (whatsappBtn) whatsappBtn.href = contacts.whatsapp;
    const viberBtn = document.querySelector('.contact-btn.viber');
    if (viberBtn) viberBtn.href = contacts.viber;
    const vkBtn = document.querySelector('.contact-btn.vk');
    if (vkBtn) vkBtn.href = contacts.vk;
    const maxBtn = document.getElementById('max-btn');
    if (maxBtn) maxBtn.href = contacts.max;
}

function renderInfo(offers, schedule) {
    const offersList = document.querySelector('.offers ul');
    if (offersList) offersList.innerHTML = offers.map(o => `<li>${o}</li>`).join('');
    const scheduleList = document.querySelector('.schedule ul');
    if (scheduleList) scheduleList.innerHTML = schedule.map(s => `<li>${s}</li>`).join('');
}

// Асинхронная функция загрузки всех данных из Supabase
async function loadAllDataFromSupabase() {
    try {
        // 1. Hero
        let { data: hero, error } = await window.supabase
            .from('hero')
            .select('*')
            .single();
        if (error) console.error('Ошибка загрузки hero:', error);
        else {
            document.querySelector('.hero h1').innerHTML = hero.title;
            document.querySelector('.hero .subhead').textContent = hero.subtitle;
        }

        // 2. Features
        let { data: features, error: featError } = await window.supabase
            .from('features')
            .select('*')
            .order('sort_order', { ascending: true });
        if (!featError && features) renderFeatures(features);

        // 3. Reviews
        let { data: reviewsData, error: revError } = await window.supabase
            .from('reviews')
            .select('*')
            .order('date', { ascending: false });
        if (!revError && reviewsData) {
            reviews = reviewsData;
            renderReviews();
        }

        // 4. Contacts
        let { data: contacts, error: contError } = await window.supabase
            .from('contacts')
            .select('*')
            .single();
        if (!contError && contacts) renderContacts(contacts);

        // 5. Info
        let { data: info, error: infoError } = await window.supabase
            .from('info')
            .select('*')
            .single();
        if (!infoError && info) renderInfo(info.offers, info.schedule);

    } catch (e) {
        console.error('Общая ошибка загрузки:', e);
    }
}

// Функция сохранения отзывов в Supabase
async function saveReviews() {
    const { error } = await window.supabase
        .from('reviews')
        .upsert(reviews);
    if (error) {
        console.error('Ошибка сохранения отзывов:', error);
    } else {
        console.log('Отзывы сохранены в Supabase');
    }
}

// Рендер галереи
function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';
    photos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <a href="${photo.large}" class="glightbox" data-gallery="fleet">
                <img src="${photo.small}" alt="${photo.name}" loading="lazy">
            </a>
            <p>${photo.name}</p>
        `;
        grid.appendChild(item);
    });

    if (typeof GLightbox !== 'undefined') {
        GLightbox({ selector: '.glightbox', touchNavigation: true, loop: true, zoomable: true });
    }
}

// Рендер отзывов с кнопкой "Подробнее"
function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    const hideBtn = document.getElementById('hideReviews');
    if (!grid) return;

    const toShow = reviews.slice(0, currentDisplayCount);

    grid.innerHTML = toShow.map((r, index) => {
        const name = r.name || 'Аноним';
        const route = r.route || 'Не указан';
        const rating = r.rating || 0;
        const fullText = r.text || '';
        const date = r.date ? new Date(r.date).toLocaleDateString('ru-RU') : 'неизвестно';
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const avatarLetter = name ? name.charAt(0) : '?';

        const shortText = fullText.length > 100 ? fullText.slice(0, 100) + '…' : fullText;
        const hasMore = fullText.length > 100;

        return `
            <div class="review-card" data-index="${index}">
                <div class="review-header">
                    <div class="review-avatar">${avatarLetter}</div>
                    <div class="review-info">
                        <h4>${name}</h4>
                        <div class="review-rating">${stars}</div>
                    </div>
                </div>
                <div class="review-route">${route}</div>
                <div class="review-text short">${shortText}</div>
                ${hasMore ? `<button class="btn-more" data-index="${index}">Подробнее</button>` : ''}
                <div class="review-text full" style="display: none;">${fullText}</div>
                <div class="review-date">${date}</div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.btn-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const card = btn.closest('.review-card');
            const shortTextDiv = card.querySelector('.review-text.short');
            const fullTextDiv = card.querySelector('.review-text.full');
            if (shortTextDiv && fullTextDiv) {
                shortTextDiv.style.display = 'none';
                fullTextDiv.style.display = 'block';
                btn.style.display = 'none';
            }
        });
    });

    if (loadMoreBtn) {
        loadMoreBtn.style.display = currentDisplayCount < reviews.length ? 'inline-block' : 'none';
    }
    if (hideBtn) {
        hideBtn.style.display = currentDisplayCount > 3 ? 'inline-block' : 'none';
    }
}

// Функции управления отзывами
function loadMoreReviews() {
    currentDisplayCount = Math.min(currentDisplayCount + 10, reviews.length);
    renderReviews();
}
function hideReviews() {
    currentDisplayCount = 3;
    renderReviews();
}

// FAQ аккордеон
function initFaq() {
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

// Инициализация модальных окон
function initModals() {
    const modal = document.getElementById('bookingModal');
    const btn = document.getElementById('booking-btn');
    const closeBtn = document.querySelector('.close-modal');
    const form = document.getElementById('bookingForm');
    const consent = document.getElementById('consent');
    const showPrivacy = document.getElementById('showPrivacyPolicy');
    const privacyModal = document.getElementById('privacyModal');
    const closePrivacy = document.getElementById('closePrivacy');

    if (btn && modal) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    if (showPrivacy && privacyModal) {
        showPrivacy.addEventListener('click', (e) => {
            e.preventDefault();
            privacyModal.style.display = 'block';
        });
    }
    if (closePrivacy && privacyModal) {
        closePrivacy.addEventListener('click', () => {
            privacyModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === privacyModal) privacyModal.style.display = 'none';
    });

    const routeSelect = document.getElementById('route');
    const otherRouteGroup = document.getElementById('otherRouteGroup');
    const otherRouteInput = document.getElementById('otherRoute');
    if (routeSelect && otherRouteGroup) {
        routeSelect.addEventListener('change', () => {
            if (routeSelect.value === 'other') {
                otherRouteGroup.style.display = 'block';
                otherRouteInput.required = true;
            } else {
                otherRouteGroup.style.display = 'none';
                otherRouteInput.required = false;
                otherRouteInput.value = '';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!consent.checked) {
                alert('Пожалуйста, подтвердите согласие на обработку данных');
                return;
            }
            const name = document.getElementById('name')?.value || '';
            alert(`Спасибо, ${name}! Заявка отправлена.`);
            form.reset();
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    const reviewModal = document.getElementById('reviewModal');
    const addReviewBtn = document.getElementById('addReviewBtn');
    const closeReview = document.getElementById('closeReviewModal');
    const reviewForm = document.getElementById('reviewForm');
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('reviewRating');

    if (addReviewBtn && reviewModal) {
        addReviewBtn.addEventListener('click', () => {
            reviewModal.style.display = 'block';
        });
    }
    if (closeReview && reviewModal) {
        closeReview.addEventListener('click', () => {
            reviewModal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === reviewModal) reviewModal.style.display = 'none';
    });

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.dataset.rating;
            ratingInput.value = rating;
            stars.forEach((s, i) => {
                if (i < rating) s.classList.add('active');
                else s.classList.remove('active');
            });
        });
    });

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newReview = {
                name: document.getElementById('reviewName').value,
                route: document.getElementById('reviewRoute').value,
                rating: parseInt(ratingInput.value),
                text: document.getElementById('reviewText').value,
                date: new Date().toISOString().split('T')[0]
            };
            reviews.unshift(newReview);
            await saveReviews();
            currentDisplayCount = 3;
            renderReviews();
            reviewForm.reset();
            ratingInput.value = 5;
            stars.forEach((s, i) => {
                if (i < 5) s.classList.add('active');
                else s.classList.remove('active');
            });
            reviewModal.style.display = 'none';
            alert('Спасибо за отзыв!');
        });
    }
}

// Фиксированная панель и тёмная тема
function initScrollEffects() {
    const topBar = document.getElementById('topBar');
    const body = document.body;
    const gallerySection = document.getElementById('gallery-section');

    function update() {
        if (!topBar) return;
        if (window.scrollY > 0) {
            topBar.classList.add('fixed');
            body.style.paddingTop = topBar.offsetHeight + 'px';
        } else {
            topBar.classList.remove('fixed');
            body.style.paddingTop = '0';
        }
        if (gallerySection) {
            const galleryTop = gallerySection.getBoundingClientRect().top + window.scrollY;
            body.classList.toggle('dark-theme', window.scrollY + 100 >= galleryTop);
        }
    }

    window.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    update();
}

// Ссылки MAX
function initMaxLinks() {
    document.querySelectorAll('#max-link, #max-link-hero, #max-btn').forEach(el => {
        if (el) {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://max.ru', '_blank');
            });
        }
    });
}

// Запуск после загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    await loadAllDataFromSupabase();
    renderGallery();
    initFaq();
    initModals();
    initScrollEffects();
    initMaxLinks();

    document.getElementById('loadMoreReviews')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadMoreReviews();
    });

    document.getElementById('hideReviews')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideReviews();
    });

    document.querySelectorAll('.booking-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('bookingModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    console.log('Сайт inDriver72 загружен!');
});