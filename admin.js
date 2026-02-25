// admin.js – управление сайтом через Supabase

// Глобальные переменные для хранения текущих списков
let currentFeatures = [];
let currentReviews = [];
let currentFaq = []; // добавлено

// Функция для загрузки всех данных из Supabase в форму
async function loadDataFromSupabase() {
  try {
    // Hero
    const { data: hero, error: heroErr } = await supabase
      .from('hero')
      .select('*')
      .single();
    if (!heroErr && hero) {
      document.getElementById('heroTitle').value = hero.title.replace(/<br>/g, '\n');
      document.getElementById('heroSubtitle').value = hero.subtitle;
    }

    // Features
    const { data: features, error: featErr } = await supabase
      .from('features')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!featErr && features) {
      currentFeatures = features;
      renderFeaturesList(features);
    }

    // Reviews
    const { data: reviews, error: revErr } = await supabase
      .from('reviews')
      .select('*')
      .order('date', { ascending: false });
    if (!revErr && reviews) {
      currentReviews = reviews;
      renderReviewsList(reviews);
    }

    // Contacts
    const { data: contacts, error: contErr } = await supabase
      .from('contacts')
      .select('*')
      .single();
    if (!contErr && contacts) {
      document.getElementById('contactPhone').value = contacts.phone || '';
      document.getElementById('contactTelegram').value = contacts.telegram || '';
      document.getElementById('contactWhatsapp').value = contacts.whatsapp || '';
      document.getElementById('contactViber').value = contacts.viber || '';
      document.getElementById('contactVk').value = contacts.vk || '';
      document.getElementById('contactMax').value = contacts.max || '';
    }

    // Info (акции и расписание)
    const { data: info, error: infoErr } = await supabase
      .from('info')
      .select('*')
      .single();
    if (!infoErr && info) {
      document.getElementById('offersList').value = info.offers.join('\n');
      document.getElementById('scheduleList').value = info.schedule.join('\n');
    }

    // FAQ
    await loadFaqFromSupabase();

  } catch (e) {
    console.error('Ошибка загрузки данных:', e);
  }
}

// ==== FEATURES (преимущества) ====
function renderFeaturesList(features) {
  const container = document.getElementById('features-list');
  container.innerHTML = '';
  features.forEach((feat, index) => {
    const div = document.createElement('div');
    div.className = 'feature-item';
    div.innerHTML = `
      <h4>Преимущество ${index + 1}</h4>
      <div class="form-group">
        <label>Заголовок:</label>
        <input type="text" class="form-control feature-title" value="${feat.title.replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label>Текст:</label>
        <textarea class="form-control feature-text" rows="2">${feat.description.replace(/"/g, '&quot;')}</textarea>
      </div>
      <div class="form-group">
        <label>Иконка (класс Font Awesome, например fa-box):</label>
        <input type="text" class="form-control feature-icon" value="${feat.icon.replace(/"/g, '&quot;')}">
      </div>
      <button class="btn-remove" onclick="removeFeature(${index})">Удалить</button>
    `;
    container.appendChild(div);
  });
}

window.addFeature = function() {
  currentFeatures.push({
    icon: "fa-star",
    title: "Новое преимущество",
    description: "Описание..."
  });
  renderFeaturesList(currentFeatures);
};

window.removeFeature = function(index) {
  currentFeatures.splice(index, 1);
  renderFeaturesList(currentFeatures);
};

// ==== REVIEWS (отзывы) ====
function renderReviewsList(reviews) {
  const container = document.getElementById('reviews-list');
  container.innerHTML = '';
  reviews.forEach((rev, index) => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <h4>Отзыв ${index + 1}</h4>
      <div class="form-group">
        <label>Имя:</label>
        <input type="text" class="form-control review-name" value="${rev.name.replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label>Маршрут:</label>
        <input type="text" class="form-control review-route" value="${rev.route.replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label>Рейтинг (1-5):</label>
        <div class="rating-input" data-index="${index}">
          ${[1,2,3,4,5].map(r => `<span class="${r <= rev.rating ? 'active' : ''}" data-rating="${r}">★</span>`).join('')}
        </div>
        <input type="hidden" class="review-rating" value="${rev.rating}">
      </div>
      <div class="form-group">
        <label>Текст отзыва:</label>
        <textarea class="form-control review-text" rows="3">${rev.text.replace(/"/g, '&quot;')}</textarea>
      </div>
      <div class="form-group">
        <label>Дата (ГГГГ-ММ-ДД):</label>
        <input type="date" class="form-control review-date" value="${rev.date || ''}">
      </div>
      <button class="btn-remove" onclick="removeReview(${index})">Удалить</button>
    `;
    container.appendChild(div);
  });

  // Обработчики звёзд
  document.querySelectorAll('.rating-input').forEach(container => {
    const stars = container.querySelectorAll('span');
    const hiddenInput = container.nextElementSibling;
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const rating = star.dataset.rating;
        hiddenInput.value = rating;
        stars.forEach((s, i) => {
          if (i < rating) s.classList.add('active');
          else s.classList.remove('active');
        });
      });
    });
  });
}

window.addReview = function() {
  const newReview = {
    name: "Новый пользователь",
    route: "Маршрут",
    rating: 5,
    text: "Текст отзыва...",
    date: new Date().toISOString().split('T')[0]
  };
  currentReviews.unshift(newReview);
  renderReviewsList(currentReviews);
};

window.removeReview = function(index) {
  currentReviews.splice(index, 1);
  renderReviewsList(currentReviews);
};

// ==== ФУНКЦИИ СОХРАНЕНИЯ (отправка в Supabase) ====
async function saveHero() {
  const heroData = {
    title: document.getElementById('heroTitle').value.replace(/\n/g, '<br>'),
    subtitle: document.getElementById('heroSubtitle').value
  };
  const { error } = await supabase
    .from('hero')
    .update(heroData)
    .eq('id', 1);
  if (error) console.error('Ошибка сохранения hero:', error);
}

async function saveFeatures() {
  // Преобразуем данные из DOM в массив
  const featureTitles = document.querySelectorAll('.feature-title');
  const featureTexts = document.querySelectorAll('.feature-text');
  const featureIcons = document.querySelectorAll('.feature-icon');
  const features = [];
  for (let i = 0; i < featureTitles.length; i++) {
    features.push({
      icon: featureIcons[i]?.value || 'fa-box',
      title: featureTitles[i].value,
      description: featureTexts[i].value,
      sort_order: i
    });
  }
  // Удаляем старые и вставляем новые
  await supabase.from('features').delete().neq('id', 0);
  const { error } = await supabase.from('features').insert(features);
  if (error) console.error('Ошибка сохранения features:', error);
}

async function saveReviews() {
  const reviewNames = document.querySelectorAll('.review-name');
  const reviewRoutes = document.querySelectorAll('.review-route');
  const reviewRatings = document.querySelectorAll('.review-rating');
  const reviewTexts = document.querySelectorAll('.review-text');
  const reviewDates = document.querySelectorAll('.review-date');
  const reviews = [];
  for (let i = 0; i < reviewNames.length; i++) {
    reviews.push({
      name: reviewNames[i].value,
      route: reviewRoutes[i].value,
      rating: parseInt(reviewRatings[i].value) || 5,
      text: reviewTexts[i].value,
      date: reviewDates[i].value || new Date().toISOString().split('T')[0]
    });
  }
  await supabase.from('reviews').delete().neq('id', 0);
  const { error } = await supabase.from('reviews').insert(reviews);
  if (error) console.error('Ошибка сохранения reviews:', error);
}

async function saveContacts() {
  const contacts = {
    phone: document.getElementById('contactPhone').value,
    telegram: document.getElementById('contactTelegram').value,
    whatsapp: document.getElementById('contactWhatsapp').value,
    viber: document.getElementById('contactViber').value,
    vk: document.getElementById('contactVk').value,
    max: document.getElementById('contactMax').value
  };
  const { error } = await supabase
    .from('contacts')
    .update(contacts)
    .eq('id', 1);
  if (error) console.error('Ошибка сохранения contacts:', error);
}

async function saveInfo() {
  const offers = document.getElementById('offersList').value.split('\n').filter(line => line.trim() !== '');
  const schedule = document.getElementById('scheduleList').value.split('\n').filter(line => line.trim() !== '');
  const infoData = { offers, schedule };
  const { error } = await supabase
    .from('info')
    .update(infoData)
    .eq('id', 1);
  if (error) console.error('Ошибка сохранения info:', error);
}

// ==== ФУНКЦИИ ДЛЯ FAQ ====
async function loadFaqFromSupabase() {
  const { data, error } = await supabase
    .from('faq')
    .select('*')
    .order('sort_order', { ascending: true });
  if (!error && data) {
    currentFaq = data;
    renderFaqList(data);
  } else {
    console.error('Ошибка загрузки FAQ:', error);
  }
}

function renderFaqList(faqItems) {
  const container = document.getElementById('faq-list');
  if (!container) return;
  container.innerHTML = '';
  faqItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'faq-item';
    div.innerHTML = `
      <h4>Вопрос ${index + 1}</h4>
      <div class="form-group">
        <label>Вопрос:</label>
        <input type="text" class="form-control faq-question" value="${item.question.replace(/"/g, '&quot;')}">
      </div>
      <div class="form-group">
        <label>Ответ:</label>
        <textarea class="form-control faq-answer" rows="3">${item.answer.replace(/"/g, '&quot;')}</textarea>
      </div>
      <button class="btn-remove" onclick="removeFaqItem(${index})">Удалить</button>
    `;
    container.appendChild(div);
  });
}

window.addFaqItem = function() {
  currentFaq.push({ question: "Новый вопрос", answer: "Ответ на вопрос" });
  renderFaqList(currentFaq);
};

window.removeFaqItem = function(index) {
  currentFaq.splice(index, 1);
  renderFaqList(currentFaq);
};

async function saveFaq() {
  const questionInputs = document.querySelectorAll('#faq-list .faq-question');
  const answerInputs = document.querySelectorAll('#faq-list .faq-answer');
  const faqItems = [];
  for (let i = 0; i < questionInputs.length; i++) {
    faqItems.push({
      question: questionInputs[i].value,
      answer: answerInputs[i].value,
      sort_order: i
    });
  }
  // Удаляем старые и вставляем новые
  await supabase.from('faq').delete().neq('id', 0);
  const { error } = await supabase.from('faq').insert(faqItems);
  if (error) console.error('Ошибка сохранения FAQ:', error);
}

// ==== КНОПКА "СОХРАНИТЬ ВСЁ" (добавлен saveFaq) ====
window.saveAllData = async function() {
  await saveHero();
  await saveFeatures();
  await saveReviews();
  await saveContacts();
  await saveInfo();
  await saveFaq(); // добавлено
  alert('Все данные сохранены в облаке!');
};

// ==== ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ====
window.showTab = function(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName + 'Tab').classList.add('active');
  event.target.classList.add('active');
};

// ==== ПРОВЕРКА ПАРОЛЯ ====
const ADMIN_PASSWORD = "admin123"; // смените на свой
window.checkPassword = function() {
  const inputPass = document.getElementById('adminPassword').value;
  if (inputPass === ADMIN_PASSWORD) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadDataFromSupabase(); // загружаем данные из Supabase
  } else {
    alert('Неверный пароль!');
  }
};

// Инициализация: скрываем панель, пока не введён пароль (это уже в HTML)