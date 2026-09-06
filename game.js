// ============================================================================
// ПЕРЕКУП В РОССИИ - Полная игровая логика (game.js)
// ============================================================================

class PerecupGame {
  constructor() {
    this.player = {
      money: 10000,
      name: 'Игрок',
      checkSkillLevel: 0,
      cardInfo: null,
      city: 'Москва',
    };

    this.gameState = {
      currentScreen: 'marketplace',
      selectedProduct: null,
      meetingScheduled: null,
      cart: [],
      inventory: [],
      myListings: [],
      soldItems: [],
    };

    this.marketplace = {
      products: [],
    };

    this.npcs = {
      buyers: [],
    };

    this.cities = [
      'Москва',
      'Санкт-Петербург',
      'Екатеринбург',
      'Новосибирск',
      'Казань',
      'Челябинск',
      'Омск',
      'Самара',
    ];

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
    localStorage.removeItem('perec_game_save');
    sessionStorage.clear();

    this.player = {
      money: 10000,
      name: 'Игрок',
      checkSkillLevel: 0,
      cardInfo: null,
      city: 'Москва',
    };

    this.gameState = {
      currentScreen: 'marketplace',
      selectedProduct: null,
      meetingScheduled: null,
      cart: [],
      inventory: [],
      myListings: [],
      soldItems: [],
    };

    this.marketplace = { products: [] };
    this.npcs = { buyers: [] };

    this.generateMarketplace();
    this.updateUI();
  }

  // ========== ВАЛИДАЦИЯ И МАСКИ ==========

  formatDateOfBirth(input) {
    // Удаляем все нецифровые символы
    const digits = input.replace(/\D/g, '');
    
    // Проверяем длину
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '.' + digits.slice(2);
    return digits.slice(0, 2) + '.' + digits.slice(2, 4) + '.' + digits.slice(4, 8);
  }

  validateDateOfBirth(dateStr) {
    const parts = dateStr.split('.');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > new Date().getFullYear() - 18) return false;

    return true;
  }

  createCardInfo(name, cardNumber, expiryDate, cvv, dateOfBirth) {
    if (!this.validateDateOfBirth(dateOfBirth)) {
      return { success: false, message: 'Неверная дата рождения' };
    }

    this.player.cardInfo = {
      name,
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryDate,
      cvv,
      dateOfBirth,
      createdAt: new Date(),
    };

    this.saveGame();
    return { success: true, message: 'Карта успешно оформлена!' };
  }

  // ========== ГЕНЕРАЦИЯ ТОВАРОВ ==========

  generateMarketplace() {
    const products = [];

    // Айфоны
    for (let i = 0; i < 8; i++) {
      const isOriginal = Math.random() > 0.4;
      const hasHiddenDefect = Math.random() < 0.7;
      products.push({
        id: `iphone-${i}`,
        name: `iPhone 13 ${isOriginal ? '(Оригинал)' : '(Реплика)'}`,
        price: isOriginal ? 35000 + Math.random() * 5000 : 8000 + Math.random() * 3000,
        type: 'phone',
        category: 'Смартфоны',
        isOriginal: isOriginal,
        visibleCondition: '9/10',
        hiddenDefect: hasHiddenDefect ? 'Восстановленный корпус' : null,
        canCheckOriginality: true,
        canCheckCondition: true,
      });
    }

    // Наушники
    for (let i = 0; i < 6; i++) {
      const isOriginal = Math.random() > 0.5;
      const hasHiddenDefect = Math.random() < 0.7;
      products.push({
        id: `earbuds-${i}`,
        name: `AirPods Pro ${isOriginal ? '(Оригинал)' : '(Реплика)'}`,
        price: isOriginal ? 25000 : 2500 + Math.random() * 2000,
        type: 'earbuds',
        category: 'Наушники',
        isOriginal: isOriginal,
        visibleCondition: '8/10',
        hiddenDefect: hasHiddenDefect ? 'Плохая работа батареи' : null,
        canCheckOriginality: true,
        canCheckCondition: true,
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
        category: 'Зарядки',
        isOriginal: isOriginal,
        visibleCondition: 'Отличное',
        hiddenDefect: hasHiddenDefect ? 'Медленная зарядка' : null,
        canCheckOriginality: true,
        canCheckCondition: true,
      });
    }

    // Одежда
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
        category: 'Одежда',
        isOriginal: isOriginal,
        visibleCondition: 'Новое',
        hiddenDefect: hasHiddenDefect ? 'Неправильная отделка швов' : null,
        canCheckOriginality: true,
        canCheckCondition: true,
      });
    }

    // Машины - НЕ могут быть репликами, проверяется только состояние
    for (let i = 0; i < 4; i++) {
      const hasHiddenDefect = Math.random() < 0.7;
      products.push({
        id: `car-${i}`,
        name: `BMW 320 ${2020 + i}`,
        price: 2500000 + Math.random() * 500000,
        type: 'car',
        category: 'Автомобили',
        isOriginal: true,
        visibleMileage: 15000 + Math.random() * 30000,
        hiddenDefect: hasHiddenDefect ? `Скрученный пробег: +${50000 + Math.random() * 100000} км` : null,
        canCheckOriginality: false,
        canCheckCondition: true,
      });
    }

    this.marketplace.products = products;
  }

  // ========== ДОСТАВКА ==========

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

  getCheckActionsForProduct(product) {
    // Динамические кнопки проверки в зависимости от типа товара
    const actions = [];

    // Для машин проверяется только состояние
    if (product.type === 'car') {
      actions.push({
        name: 'Проверить состояние',
        type: 'condition',
        icon: '🔧',
        description: 'Пробег, состояние кузова',
      });
    } else {
      // Для остальных товаров
      if (product.canCheckOriginality) {
        actions.push({
          name: 'Проверить оригинальность',
          type: 'authenticity',
          icon: '✓',
          description: 'Оригинал или реплика',
        });
      }

      if (product.canCheckCondition) {
        actions.push({
          name: 'Проверить состояние',
          type: 'condition',
          icon: '🔍',
          description: 'Внешний вид и функциональность',
        });
      }
    }

    return actions;
  }

  performCheck(product, checkType) {
    const baseChance = 50;
    const skillBonus = this.player.checkSkillLevel;
    const detectionChance = baseChance + skillBonus;

    const random = Math.random() * 100;
    const isDefectFound = random < detectionChance && product.hiddenDefect;

    const checkTexts = {
      authenticity: [
        'Проверяем серийный номер...',
        'Анализируем материалы...',
        'Сравниваем с оригиналом...',
        'Проверяем документацию...',
        'Завершаем проверку...',
      ],
      condition: [
        'Проверяем корпус...',
        'Тестируем функции...',
        'Смотрим состояние...',
        'Анализируем детали...',
        'Завершаем проверку...',
      ],
    };

    return {
      isLoading: true,
      duration: 5000,
      checkTexts: checkTexts[checkType] || checkTexts.condition,
      result: isDefectFound ? 'defect' : 'ok',
      defect: isDefectFound ? product.hiddenDefect : null,
      checkType: checkType,
    };
  }

  completeBuy(product) {
    this.player.money -= product.price;
    
    // Добавляем товар в инвентарь, скрытые дефекты видны
    const inventoryItem = {
      ...product,
      boughtAt: new Date(),
      discovered: {
        defects: [], // Дефекты, обнаруженные игроком
        real: product.hiddenDefect, // Реальный скрытый дефект
      },
      canRepair: product.hiddenDefect && !product.isOriginal ? false : true, // Нельзя починить обман по подлинности
    };

    this.gameState.inventory.push(inventoryItem);
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

  requestDiscount(product, defectFound) {
    const discountPercent = defectFound ? 25 : 15;
    const newPrice = product.price * (1 - discountPercent / 100);

    this.player.money -= newPrice;
    this.gameState.inventory.push({
      ...product,
      boughtAt: new Date(),
      discovered: {
        defects: defectFound ? [product.hiddenDefect] : [],
        real: product.hiddenDefect,
      },
      finalPrice: newPrice,
    });

    this.player.checkSkillLevel += 1;
    this.gameState.meetingScheduled = null;
    this.saveGame();

    return { success: true, discount: discountPercent, finalPrice: newPrice };
  }

  // ========== ТОРГ С NPC ==========

  negotiatePrice(product, buyerOffer) {
    const minThreshold = product.price * 0.8;
    const maxThreshold = product.price * 1.2;

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

  // ========== МЕХАНИКА ИНВЕНТАРЯ И РЕМОНТА ==========

  getInventoryWithDetails() {
    return this.gameState.inventory.map(item => ({
      ...item,
      displayedDefects: item.discovered ? item.discovered.real : item.hiddenDefect,
      repairCost: this.calculateRepairCost(item),
      canRepair: this.canRepairItem(item),
    }));
  }

  canRepairItem(item) {
    // Нельзя починить обман по подлинности
    if (item.discovered && item.discovered.real && item.discovered.real.includes('Восстановленный')) {
      return false; // Это не подлинный товар
    }

    // Можно починить проблемы с состоянием (если были обнаружены или видны)
    return item.hiddenDefect && !item.isOriginal !== true;
  }

  calculateRepairCost(item) {
    const basePrice = item.price * 0.1; // 10% от цены товара
    return Math.round(basePrice);
  }

  repairItem(itemId) {
    const item = this.gameState.inventory.find(i => i.id === itemId);
    if (!item) return { success: false, message: 'Товар не найден' };

    if (!this.canRepairItem(item)) {
      return { success: false, message: 'Этот товар невозможно починить' };
    }

    const cost = this.calculateRepairCost(item);
    if (this.player.money < cost) {
      return { success: false, message: 'Недостаточно средств' };
    }

    this.player.money -= cost;
    item.hiddenDefect = null;
    item.discovered.real = null;
    this.saveGame();

    return { success: true, message: `Товар отремонтирован! Потрачено: ${cost} ₽` };
  }

  // ========== СОЗДАНИЕ СОБСТВЕННОГО ОБЪЯВЛЕНИЯ ==========

  createListing(baseProduct, customSpecs) {
    // Проверяем, что характеристики не ухудшены
    const validation = this.validateCustomSpecs(baseProduct, customSpecs);
    if (!validation.valid) {
      return { success: false, message: validation.message, isScam: false };
    }

    // Проверяем, является ли это обманом
    const isScam =
      customSpecs.isOriginal === false && baseProduct.isOriginal === true;

    const listing = {
      id: `listing-${Date.now()}`,
      ...baseProduct,
      customPrice: customSpecs.price,
      customIsOriginal: customSpecs.isOriginal,
      customCondition: customSpecs.condition,
      isScam: isScam,
      createdAt: new Date(),
      isPlayerListing: true,
    };

    this.gameState.myListings.push(listing);
    this.saveGame();

    return {
      success: true,
      message: isScam ? '⚠️ Объявление содержит обман!' : 'Объявление опубликовано!',
      isScam: isScam,
      listing: listing,
    };
  }

  validateCustomSpecs(baseProduct, customSpecs) {
    // Нельзя ухудшать характеристики
    if (
      customSpecs.isOriginal === true &&
      baseProduct.isOriginal === false
    ) {
      // Можно улучшить репику до оригинала - это обман, но разрешено
      return { valid: true };
    }

    if (
      customSpecs.isOriginal === false &&
      baseProduct.isOriginal === true
    ) {
      // Нельзя ухудшить оригинал до реплики - невозможно
      return {
        valid: false,
        message: 'Нельзя выставить оригинальный товар как реплику',
      };
    }

    if (customSpecs.condition < baseProduct.condition) {
      return {
        valid: false,
        message: 'Нельзя описать товар в худшем состоянии, чем он есть',
      };
    }

    return { valid: true };
  }

  // ========== МЕХАНИКА ПРОДАЖИ ==========

  sellItemToNPC(item) {
    const method = Math.random() > 0.5 ? 'delivery' : 'pickup';

    if (method === 'delivery') {
      return this.autoCompleteSale(item);
    } else {
      const place = this.meetupPlaces[
        Math.floor(Math.random() * this.meetupPlaces.length)
      ];
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
    const checkResult = Math.random() < 0.8;
    const hasDefect = item.hiddenDefect && checkResult;

    if (hasDefect) {
      return {
        success: false,
        hasDefect: true,
        defect: item.hiddenDefect,
        options: {
          makeDiscount: () => {
            const discount = item.isOriginal ? 0.6 : 0.15 + Math.random() * 0.05;
            const finalPrice = item.price * (1 - discount);
            this.player.money += finalPrice;
            return { price: finalPrice, discount };
          },
          getRobbed: () => {
            const robberyAmount = this.player.money * (0.15 + Math.random() * 0.25);
            this.player.money -= robberyAmount;
            return { robberyAmount, message: 'Вас ограбили!' };
          },
        },
      };
    } else {
      this.player.money += item.price;
      return {
        success: true,
        price: item.price,
        message: 'Товар успешно продан!',
      };
    }
  }

  completeNPCPickupMeeting(item, playerAction) {
    const now = new Date();
    const meeting = this.gameState.meetingScheduled;

    if (now.getTime() > meeting.date.getTime() + 3600000) {
      return { cancelled: true, reason: 'Вы опоздали, продавец уехал' };
    }

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
      this.gameState.inventory.push(
        ...this.gameState.cart.map(p => ({
          ...p,
          boughtAt: new Date(),
          discovered: { defects: [], real: p.hiddenDefect },
        }))
      );
      this.gameState.cart = [];
      this.saveGame();
      return { success: true, message: 'Покупка завершена!' };
    } else {
      return { success: false, message: 'Недостаточно средств!' };
    }
  }

  getInventory() {
    return this.getInventoryWithDetails();
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

  getCities() {
    return this.cities;
  }

  setCity(city) {
    if (this.cities.includes(city)) {
      this.player.city = city;
      this.saveGame();
      return true;
    }
    return false;
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PerecupGame, initGame, getGameInstance };
}
