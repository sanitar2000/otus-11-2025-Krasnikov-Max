/**
 * Проверка имени пользователя
 * @param name - имя пользователя
 * @returns {boolean} - валидное имя или нет
 */
export const nameIsValid = (name?: string): boolean => {
  return typeof name === 'string' && name.length >= 2 && /^[a-z]+$/.test(name);
};

/**
 * Удаление пробелов из строки
 * @param text - входная строка
 * @returns {string} - строка без пробелов
 */
export const fullTrim = (text?: string | null): string => {
  return (text ?? '').replace(/\s+/g, '');
};

// Интерфейс для товара в корзине
export interface CartItem {
  quantity: number;
  name?: string;
  price: number;
}

/**
 * Подсчёт суммы заказа
 * @param items - массив товаров
 * @param discount - скидка в процентах (0-99)
 * @returns {number} - итоговая сумма
 * @throws Вернёт ошибку, если скидка не число и больше 99 или меньше 0
 *
 * @example getTotal([{ price: 10, quantity: 10 }]) // 100
 * @example getTotal([{ price: 10, quantity: 1 }]) // 10
 * @example getTotal([{ price: 10, quantity: 1 }, { price: 10, quantity: 9 }]) // 100
 * @example getTotal([{ price: 10, quantity: 10 }], 10) // 90
 * @example getTotal([{ price: 10, quantity: 10 }], 100) // throws error
 */
export const getTotal = (items: CartItem[] = [], discount = 0): number => {
  if (typeof discount !== 'number') {
    throw new Error('Скидка должна быть числом');
  }
  if (discount < 0 || discount >= 100) {
    throw new Error('Процент скидки должен быть от 0 до 99');
  }

  const total = items.reduce((acc, { price, quantity }) => acc + price * quantity, 0);
  return total * (1 - discount / 100);
};
