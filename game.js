// ============================================================================
// ПЕРЕКУП В РОССИИ - Полная игровая логика (game.js)
// ============================================================================

class PerecupGame {
  constructor() {
    this.player = {
      money: 10000,
      name: 'Игрок',
      checkSkillLevel: 0, // Уровень навыка проверки товаров (повышается за успешные проверки)
    };

    this.gameState = {
      currentScreen: 'marketplace',
      selectedProduct: null,
      meetingScheduled: null,
      cart: [],
      inventory: [],
      soldItems: [],
    };

    this.marketplace = {
      products: [],
    };

    this.npcs = {
      buyers: [],
    };

    this.meetupPlaces = [
      { name: 'Парк культуры', id: 'park' },
      { name: 'ТЦ Метрополь', id: 'mall' },
      { name: 'Метро Тверская', id: 'metro' },
      { name: 'Берег реки', id: 'river' },
      { name: 'Библиотека', id: 'library' },
    ];

    this.loadGame();
    this.generateMarketplace();
  }

  // ========== СИСТЕМА СОХРАНЕНИЙ ==========

  saveGame() {
    const gameData = {
      player: this.player,
      gameState: this.gameState,
      marketplace: this.marketplace,
      npcs: this.npcs,
    };
    localStorage.setItem('perec_game_save', JSON.stringify(gameData));
  }

  loadGame() {
    const saved = localStorage.getItem('perec_game_save');
    if (saved) {
      const data = JSON.parse(saved);
      this.player = data.player || this.player;
      this.gameState = data.gameState || this.gameState;
      this.marketplace = data.marketplace || this.marketplace;
      this.npcs = data.npcs || this.npcs;
    }
  }

  resetProgress() {
    // Полная очистка всех данных
    localStorage.removeItem('perec_game_save');
    sessionStorage.clear();
    
    // Сброс объектов игры
    this.player = {
      money: 10000,
      name: 'Игрок',
      checkSkillLevel: 0,
    };

    this.gameState = {
      currentScreen: 'marketplace',
      selectedProduct: null,
      meetingScheduled: null,
      cart: [],
      inventory: [],
      soldItems: [],
    };

    this.marketplace = { products: [] };
    this.npcs = { buyers: [] };

    // Перегенерируем маркетплейс
    this.generateMarketplace();

    // Обновляем UI
    this.updateUI();
  }

  // ========== ГЕНЕРАЦИЯ ТОВАРОВ ==========

  generateMarketplace() {
    const products = [];

    // Айфоны
    for (let i = 0; i < 8; i++) {
      const isOriginal = Math.random() > 0.4;
      const hasHiddenDefect = Math.random() < 0.7; // 70% скрытых дефектов
      products.push({
        id: `iphone-${i}`,
        name: `iPhone 13 ${isOriginal ? '(Оригинал)' : '(Реплика)'}`,
        price: isOriginal ? 35000 + Math.random() * 5000 : 8000 + Math.random() * 3000,
        type: 'phone',
        isOriginal: isOriginal,
        visibleCondition: '9/10',
        hiddenDefect: hasHiddenDefect ? 'Восстановленный корпус' : null,
        category: 'Смартфоны',
      });
    }

    // Наушники
    for (let i = 0; i < 6; i++) {
      const isOriginal = Math.random() > 0.5;
      const hasHiddenDefect = Math.random() < 0.7;
      products.push({
        id: `earbuds-${i}`,
        name: `AirPods Pro ${isOriginal ? '(Оригинал)' : '(Реплика)'}`,
        price: isOriginal ? 25000 : 2500 + Math.random() * 2000, // Значительно дешевле реплики
        type: 'earbuds',
        isOriginal: isOriginal,
        visibleCondition: '8/10',
        hiddenDefect: hasHiddenDefect ? 'Плохая работа батареи' : null,
        category: 'Наушники',
      });
    }

    // Зарядки
    for (let i = 0; i < 7; i++) {
      const isOriginal = Math.random() > 0.35;
      const hasHiddenDefect = Math.random() < 0.7;
      products.push({
        id: `charger-${i}`,
        name: `USB-C ${isOriginal ? 'Оригинал' : 'Реплика'}`,
        price: isOriginal ? 3500 : 500 + Math.random() * 800,
        type: 'charger',
        isOriginal: isOriginal,
        visibleCondition: 'Отличное',
        hiddenDefect: hasHiddenDefect ? 'Медленная зарядка' : null,
        category: 'Зарядки',
      });
    }

    // Одежда - полноценное количество реплик (не фиксированные 6)
    const clothCount = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < clothCount; i++) {
      const isOriginal = Math.random() > 0.6;
      const hasHiddenDefect = Math.random() < 0.7;
      const brands = ['Nike', 'Adidas', 'Puma', 'Supreme', 'Gucci'];
      products.push({
        id: `cloth-${i}`,
        name: `${brands[Math.floor(Math.random() * brands.length)]} ${isOriginal ? 'Оригинал' : 'Реплика'}`,
        price: isOriginal ? 8000 + Math.random() * 5000 : 1500 + Math.random() * 3000,
        type: 'cloth',
        isOriginal: isOriginal,
        visibleCondition: 'Новое',
        hiddenDefect: hasHiddenDefect ? 'Неправильная отделка швов' : null,
        category: 'Одежда',
      });
    }

    // Машины
    for (let i = 0; i < 4; i++) {
      const hasHiddenDefect = Math.random() < 0.7;
      products.push({
        id: `car-${i}`,
        name: `BMW 320 ${2020 + i}`,
        price: 2500000 + Math.random() * 500000,
        type: 'car',
        isOriginal: true,
        visibleMileage: 15000 + Math.random() * 30000,
        hiddenDefect: hasHiddenDefect ? `Скрученный пробег: +${50000 + Math.random() * 100000} км` : null,
        category: 'Автомобили',
      });
    }

    this.marketplace.products = products;
  }

  // ========== ЛОГИКА ДОСТАВКИ ==========

  getDeliveryMethod() {
    return {
      pickup: {
        name: 'Самовывоз',
        description: 'Встреча с продавцом в выбранном месте',
        requiresCheck: true,
      },
      delivery: {
        name: 'Доставка',
        description: 'Доставка по адресу (проверка невозможна)',
        requiresCheck: false,
      },
    };
  }

  // ========== ВСТРЕЧИ И ПРОВЕРКИ ==========

  scheduleMeeting(product, date, time, place) {
    this.gameState.meetingScheduled = {
      product: product,
      date: date,
      time: time,
      place: place,
      createdAt: new Date(),
    };
    this.saveGame();
  }

  startMeetingCheck() {
    const meeting = this.gameState.meetingScheduled;
    if (!meeting) return null;

    return {
      product: meeting.product,
      sellerName: 'Сергей',
      actions: {
        checkAuthenticity: () => this.performCheck('authenticity'),
        checkCondition: () => this.performCheck('condition'),
        buyWithoutCheck: () => this.completeBuy(),
        refuse: () => this.refuseMeeting(),
      },
    };
  }

  performCheck(checkType) {
    const meeting = this.gameState.meetingScheduled;
    const product = meeting.product;
    
    // Базовый шанс обнаружения обмана 50% + бонус от навыка
    const baseChance = 50;
    const skillBonus = this.player.checkSkillLevel;
    const detectionChance = baseChance + skillBonus;
    
    // Проверка
    const random = Math.random() * 100;
    const isDefectFound = random < detectionChance && product.hiddenDefect;

    // Анимация проверки (5 секунд)
    const checkTexts = [
      'Проверяем корпус...',
      'Проверяем серийный номер...',
      'Проверяем экран...',
      'Анализируем детали...',
      'Завершаем проверку...',
    ];

    return {
      isLoading: true,
      duration: 5000,
      checkTexts: checkTexts,
      result: isDefectFound ? 'defect' : 'ok',
      defect: isDefectFound ? product.hiddenDefect : null,
    };
  }

  completeBuy() {
    const meeting = this.gameState.meetingScheduled;
    const product = meeting.product;
    
    this.player.money -= product.price;
    this.gameState.inventory.push(product);
    
    // Повышаем навык после успешной покупки
    this.player.checkSkillLevel += 1;
    
    this.gameState.meetingScheduled = null;
    this.saveGame();

    return { success: true, message: 'Товар успешно куплен!' };
  }

  refuseMeeting() {
    this.gameState.meetingScheduled = null;
    this.saveGame();
    return { success: false, message: 'Встреча отменена' };
  }

  requestDiscount(defectFound) {
    const meeting = this.gameState.meetingScheduled;
    const product = meeting.product;
    
    // Если найден дефект, цена снижается
    const discountPercent = defectFound ? 25 : 15;
    const newPrice = product.price * (1 - discountPercent / 100);
    
    this.player.money -= newPrice;
    this.gameState.inventory.push(product);
    
    this.player.checkSkillLevel += 1;
    this.gameState.meetingScheduled = null;
    this.saveGame();

    return { 
      success: true, 
      discount: discountPercent,
      finalPrice: newPrice,
    };
  }

  // ========== ТОРГ С NPC ==========

  negotiatePrice(product, buyerOffer) {
    const minThreshold = product.price * 0.8; // 80% от цены
    const maxThreshold = product.price * 1.2; // 120% от цены

    if (buyerOffer >= minThreshold && buyerOffer <= maxThreshold) {
      return { success: true, agreedPrice: buyerOffer };
    } else if (buyerOffer < minThreshold) {
      const counterOffer = minThreshold + Math.random() * (product.price - minThreshold);
      return { 
        success: false, 
        counterOffer: counterOffer,
        message: `Продавец предлагает ${Math.round(counterOffer)} руб.`,
      };
    } else {
      const counterOffer = product.price + Math.random() * (maxThreshold - product.price);
      return { 
        success: false, 
        counterOffer: counterOffer,
        message: `Продавец предлагает ${Math.round(counterOffer)} руб.`,
      };
    }
  }

  // ========== МЕХАНИКА ПРОДАЖИ ==========

  sellItemToNPC(item) {
    // NPC выбирает способ получения: 50/50 доставка или самовывоз
    const method = Math.random() > 0.5 ? 'delivery' : 'pickup';

    if (method === 'delivery') {
      // При доставке адрес фиксируется, NPC автоматически оформляет
      return this.autoCompleteSale(item);
    } else {
      // При самовывозе назначаем встречу
      const place = this.meetupPlaces[Math.floor(Math.random() * this.meetupPlaces.length)];
      const date = new Date();
      date.setDate(date.getDate() + 1);
      
      return {
        method: 'pickup',
        place: place,
        date: date,
        time: `${10 + Math.floor(Math.random() * 8)}:00`,
        needsSchedule: true,
      };
    }
  }

  autoCompleteSale(item) {
    // NPC проверяет товар (80% шанс найти дефект)
    const checkResult = Math.random() < 0.8;
    const hasDefect = item.hiddenDefect && checkResult;

    if (hasDefect) {
      // Развилка: требовать скидку или потерять деньги
      return {
        success: false,
        hasDefect: true,
        defect: item.hiddenDefect,
        options: {
          makeDiscount: () => {
            // Цена снижается до уровня реплики или на 15-20%
            const discount = item.isOriginal ? 0.6 : 0.15 + Math.random() * 0.05;
            const finalPrice = item.price * (1 - discount);
            this.player.money += finalPrice;
            return { price: finalPrice, discount };
          },
          getRobbed: () => {
            // Грабят на 15-40% от баланса
            const robberyAmount = this.player.money * (0.15 + Math.random() * 0.25);
            this.player.money -= robberyAmount;
            return { robberyAmount, message: 'Вас ограбили!' };
          },
        },
      };
    } else {
      // Стандартная продажа
      this.player.money += item.price;
      return {
        success: true,
        price: item.price,
        message: 'Товар успешно продан!',
      };
    }
  }

  completeNPCPickupMeeting(item, playerAction) {
    // Когда игрок приходит в назначенное время
    const now = new Date();
    const meeting = this.gameState.meetingScheduled;

    // Проверка опозданий отменяет сделку
    if (now.getTime() > meeting.date.getTime() + 3600000) {
      return { cancelled: true, reason: 'Вы опоздали, продавец уехал' };
    }

    // 10-секундная загрузка "Продавец проверяет товар"
    const checkResult = Math.random() < 0.8;
    const hasDefect = item.hiddenDefect && checkResult;

    if (!hasDefect) {
      this.player.money += item.price;
      return {
        success: true,
        price: item.price,
        message: 'Товар успешно продан!',
      };
    } else {
      // Развилка: скидка или грабёж
      return {
        defectFound: true,
        defect: item.hiddenDefect,
        options: {
          makeDiscount: () => {
            const discount = 0.15 + Math.random() * 0.05;
            const finalPrice = item.price * (1 - discount);
            this.player.money += finalPrice;
            return { price: finalPrice };
          },
          getRobbed: () => {
            const robberyAmount = this.player.money * (0.15 + Math.random() * 0.4);
            this.player.money -= robberyAmount;
            return { robberyAmount };
          },
        },
      };
    }
  }

  // ========== UI ОБНОВЛЕНИЕ ==========

  updateUI() {
    // Обновление интерфейса (интеграция с DOM)
    const balanceEl = document.getElementById('player-balance');
    if (balanceEl) {
      balanceEl.textContent = `${Math.round(this.player.money)} ₽`;
    }

    const skillEl = document.getElementById('player-skill');
    if (skillEl) {
      skillEl.textContent = `Уровень: ${this.player.checkSkillLevel}`;
    }

    this.saveGame();
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

  getProductById(id) {
    return this.marketplace.products.find(p => p.id === id);
  }

  addToCart(product) {
    this.gameState.cart.push(product);
    this.saveGame();
  }

  removeFromCart(productId) {
    this.gameState.cart = this.gameState.cart.filter(p => p.id !== productId);
    this.saveGame();
  }

  checkout() {
    const totalPrice = this.gameState.cart.reduce((sum, p) => sum + p.price, 0);
    if (this.player.money >= totalPrice) {
      this.player.money -= totalPrice;
      this.gameState.inventory.push(...this.gameState.cart);
      this.gameState.cart = [];
      this.saveGame();
      return { success: true, message: 'Покупка завершена!' };
    } else {
      return { success: false, message: 'Недостаточно средств!' };
    }
  }

  getInventory() {
    return this.gameState.inventory;
  }

  getCart() {
    return this.gameState.cart;
  }

  getCurrentBalance() {
    return this.player.money;
  }

  getCheckSkillLevel() {
    return this.player.checkSkillLevel;
  }
}

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ И ЭКСПОРТ
// ============================================================================

let gameInstance = null;

function initGame() {
  gameInstance = new PerecupGame();
  return gameInstance;
}

function getGameInstance() {
  if (!gameInstance) {
    gameInstance = new PerecupGame();
  }
  return gameInstance;
}

// Для использования в других модулях (если требуется)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerecupGame, initGame, getGameInstance };
}
