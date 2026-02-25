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

// Асинхронная функция для загрузки всех данных из Supabase
async function loadAllDataFromSupabase() {
  try {
    // 1. Загружаем hero-блок
    let { data: hero, error } = await window.supabase
      .from('hero')
      .select('*')
      .single(); // .single() потому что там только одна строка с id=1
    if (error) console.error('Ошибка загрузки hero:', error);
    else {
      document.querySelector('.hero h1').innerHTML = hero.title;
      document.querySelector('.hero .subhead').textContent = hero.subtitle;
    }

    // 2. Загружаем преимущества (features)
    let { data: features, error: featError } = await window.supabase
      .from('features')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!featError && features) {
      // Передаем массив features в функцию renderFeatures (ее мы создадим ниже)
      renderFeatures(features);
    }

    // 3. Загружаем отзывы (reviews) – без изменений на месте старых `reviews`
    let { data: reviewsData, error: revError } = await window.supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });
    if (!revError && reviewsData) {
      window.reviews = reviewsData; // Сохраняем в глобальную переменную
      renderReviews(); // Перерисовываем отзывы
    }

    // 4. Загружаем контакты (contacts)
    let { data: contacts, error: contError } = await window.supabase
      .from('contacts')
      .select('*')
      .single();
    if (!contError && contacts) {
      // Функция для обновления контактов в интерфейсе
      renderContacts(contacts);
    }

    // 5. Загружаем акции и расписание (info)
    let { data: info, error: infoError } = await window.supabase
      .from('info')
      .select('*')
      .single();
    if (!infoError && info) {
      renderInfo(info.offers, info.schedule);
    }
  } catch (e) {
    console.error('Общая ошибка загрузки:', e);
  }
}

// Пример функции renderFeatures (создайте её, если ещё нет)
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

// Функция для обновления контактов
function renderContacts(contacts) {
  const phoneSpan = document.querySelector('.contact-info span');
  if (phoneSpan) phoneSpan.innerHTML = `<i class="fas fa-phone-alt"></i> ${contacts.phone}`;
  const telegramBtn = document.querySelector('.contact-btn.telegram');
  if (telegramBtn) telegramBtn.href = contacts.telegram;
  // ... аналогично для WhatsApp, Viber, VK, MAX
}

// Функция для обновления акций и расписания
function renderInfo(offers, schedule) {
  const offersList = document.querySelector('.offers ul');
  if (offersList) offersList.innerHTML = offers.map(o => `<li>${o}</li>`).join('');
  const scheduleList = document.querySelector('.schedule ul');
  if (scheduleList) scheduleList.innerHTML = schedule.map(s => `<li>${s}</li>`).join('');
}

// ===== ДАННЫЕ ИЗ LOCALSTORAGE =====
// Загрузка данных из localStorage или использование начальных
const heroData = JSON.parse(localStorage.getItem('indriver72_hero')) || {
    title: "Международные пассажирские перевозки<br>и доставка посылок",
    subtitle: "Комфорт, надёжность и фиксированная цена. Индивидуальный трансфер на легковых автомобилях и минивэнах. Доставим Ваши посылки в любую точку."
};

let features = JSON.parse(localStorage.getItem('indriver72_features')) || [
    { icon: "fa-box", title: "Перевозка посылок", text: "Быстрая и надёжная доставка ваших грузов." },
    { icon: "fa-tag", title: "Фиксированная цена", text: "Никаких скрытых платежей и сюрпризов." },
    { icon: "fa-couch", title: "Комфорт премиум-класса", text: "Автомобили бизнес-класса, кожаный салон, климат-контроль." },
    { icon: "fa-child", title: "Детские кресла", text: "Безопасность для самых маленьких." }
];

// Загрузка отзывов из localStorage или начальные
let storedReviews = JSON.parse(localStorage.getItem('inDriver72_reviews')) || [];
let reviews = storedReviews.filter(r => r && typeof r === 'object' && r.name);

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

// Контакты
const contacts = JSON.parse(localStorage.getItem('indriver72_contacts')) || {
    phone: "+7 (999) 123-45-67",
    telegram: "#",
    whatsapp: "#",
    viber: "#",
    vk: "#",
    max: "#"
};

// Акции и расписание
const infoData = JSON.parse(localStorage.getItem('indriver72_info')) || {
    offers: [
        "Скидка 10% на обратный билет",
        "Детское кресло бесплатно при бронировании за 2 недели",
        "Спецпредложение для групп от 5 человек"
    ],
    schedule: [
        "Москва → Берлин: ежедневно, 08:00, 20:00",
        "Берлин → Москва: ежедневно, 10:00, 22:00",
        "Москва → Варшава: пн/ср/пт, 09:00"
    ]
};

// Текущее количество отображаемых отзывов
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

// Рендер преимуществ
function renderFeatures() {
    const container = document.querySelector('.features-grid');
    if (!container) return;
    container.innerHTML = features.map(f => `
        <div class="feature-item">
            <i class="fas ${f.icon}"></i>
            <h3>${f.title}</h3>
            <p>${f.text}</p>
        </div>
    `).join('');
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

// Рендер акций и расписания
function renderInfo() {
    const offersList = document.querySelector('.offers ul');
    const scheduleList = document.querySelector('.schedule ul');
    if (offersList) {
        offersList.innerHTML = infoData.offers.map(offer => `<li>${offer}</li>`).join('');
    }
    if (scheduleList) {
        scheduleList.innerHTML = infoData.schedule.map(item => `<li>${item}</li>`).join('');
    }
}

// Рендер контактов
function renderContacts() {
    const phoneSpan = document.querySelector('.contact-info span');
    if (phoneSpan) {
        phoneSpan.innerHTML = `<i class="fas fa-phone-alt" style="margin-right: 6px;"></i> ${contacts.phone}`;
    }
    const telegramBtn = document.querySelector('.contact-btn.telegram');
    const whatsappBtn = document.querySelector('.contact-btn.whatsapp');
    const viberBtn = document.querySelector('.contact-btn.viber');
    const vkBtn = document.querySelector('.contact-btn.vk');
    const maxBtn = document.getElementById('max-btn');
    if (telegramBtn) telegramBtn.href = contacts.telegram;
    if (whatsappBtn) whatsappBtn.href = contacts.whatsapp;
    if (viberBtn) viberBtn.href = contacts.viber;
    if (vkBtn) vkBtn.href = contacts.vk;
    if (maxBtn) maxBtn.href = contacts.max;
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
    document.querySelector('.hero h1').innerHTML = heroData.title;
    document.querySelector('.hero .subhead').textContent = heroData.subtitle;

    renderFeatures();
    renderGallery();
    renderReviews();
    renderInfo();
    renderContacts();

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