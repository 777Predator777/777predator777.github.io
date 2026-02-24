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

// Загрузка отзывов из localStorage или начальные
let storedReviews = JSON.parse(localStorage.getItem('inDriver72_reviews')) || [];
// Фильтруем только те, у которых есть имя (чтобы избежать ошибок)
let reviews = storedReviews.filter(r => r && typeof r === 'object' && r.name);

// Если после фильтрации нет отзывов, подставляем начальные
if (reviews.length === 0) {
    reviews = [
        {
            name: "Алексей Петров",
            route: "Москва → Берлин",
            rating: 5,
            text: "Отличная поездка! Автобус комфортный, водитель профессионал. Всё вовремя, без нареканий. Обязательно поеду ещё.",
            date: "2026-02-15"
        },
        {
            name: "Елена Смирнова",
            route: "Берлин → Москва",
            rating: 5,
            text: "Перевозила посылку с документами. Всё доставили быстро и в целости. Очень удобно, что можно отслеживать через WhatsApp.",
            date: "2026-02-10"
        },
        {
            name: "Михаил Иванов",
            route: "Москва → Варшава",
            rating: 4,
            text: "Хороший сервис, машина чистая, кондиционер работал. Немного задержались на границе, но это не от них зависело.",
            date: "2026-02-05"
        }
    ];
}

// Текущее количество отображаемых отзывов (по умолчанию 3)
let currentDisplayCount = 3;

// Функция сохранения отзывов
function saveReviews() {
    localStorage.setItem('inDriver72_reviews', JSON.stringify(reviews));
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

// Рендер отзывов (без параметра showAll)
function renderReviews() {
    const grid = document.getElementById('reviewsGrid');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    const hideBtn = document.getElementById('hideReviews');
    if (!grid) return;

    const toShow = reviews.slice(0, currentDisplayCount);

    grid.innerHTML = toShow.map(r => {
        // Проверка, что все поля существуют
        const name = r.name || 'Аноним';
        const route = r.route || 'Не указан';
        const rating = r.rating || 0;
        const text = r.text || '';
        const date = r.date ? new Date(r.date).toLocaleDateString('ru-RU') : 'неизвестно';
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        const avatarLetter = name ? name.charAt(0) : '?';
        return `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-avatar">${avatarLetter}</div>
                    <div class="review-info">
                        <h4>${name}</h4>
                        <div class="review-rating">${stars}</div>
                    </div>
                </div>
                <div class="review-route">${route}</div>
                <div class="review-text">${text}</div>
                <div class="review-date">${date}</div>
            </div>
        `;
    }).join('');

    // Управление видимостью кнопок
    if (loadMoreBtn) {
        loadMoreBtn.style.display = currentDisplayCount < reviews.length ? 'inline-block' : 'none';
    }
    if (hideBtn) {
        hideBtn.style.display = currentDisplayCount > 3 ? 'inline-block' : 'none';
    }
}

// Функция "Показать ещё" (добавляет 10 отзывов)
function loadMoreReviews() {
    currentDisplayCount = Math.min(currentDisplayCount + 10, reviews.length);
    renderReviews();
}

// Функция "Скрыть" (возвращает к первым трём)
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
            // Закрыть все остальные (опционально)
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });
}

// Инициализация всех модальных окон и форм
function initModals() {
    // Модалка бронирования
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

    // Переключение "Другой маршрут"
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

    // Отправка формы бронирования
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!consent.checked) {
                alert('Пожалуйста, подтвердите согласие на обработку данных');
                return;
            }
            // Сбор данных (можно расширить)
            const name = document.getElementById('name')?.value || '';
            alert(`Спасибо, ${name}! Заявка отправлена. (В рабочей версии здесь будет отправка на сервер)`);
            form.reset();
            modal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    // Модалка отзыва
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
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newReview = {
                name: document.getElementById('reviewName').value,
                route: document.getElementById('reviewRoute').value,
                rating: parseInt(ratingInput.value),
                text: document.getElementById('reviewText').value,
                date: new Date().toISOString().split('T')[0]
            };
            reviews.unshift(newReview);
            saveReviews();
            currentDisplayCount = 3; // сбрасываем на первые три
            renderReviews();
            reviewForm.reset();
            // Сбросить звёзды до 5
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
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
    renderReviews(); // начальный рендер (первые 3)
    initFaq();
    initModals();
    initScrollEffects();
    initMaxLinks();

    // Новые кнопки управления отзывами
    document.getElementById('loadMoreReviews')?.addEventListener('click', (e) => {
        e.preventDefault();
        loadMoreReviews();
    });

    document.getElementById('hideReviews')?.addEventListener('click', (e) => {
        e.preventDefault();
        hideReviews();
    });

    console.log('Сайт inDriver72 загружен!');
        // Обработчики для всех кнопок с классом booking-trigger
    document.querySelectorAll('.booking-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('bookingModal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
});