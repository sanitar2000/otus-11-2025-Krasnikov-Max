// test/app.test.ts
import { nameIsValid, fullTrim, getTotal, CartItem } from '../src/app';

describe('nameIsValid function', () => {
  test('возвращает true для корректного имени (строчные латинские буквы, длина ≥ 2)', () => {
    expect(nameIsValid('anna')).toBe(true);
    expect(nameIsValid('max')).toBe(true);
    expect(nameIsValid('alex')).toBe(true);
  });

  test('возвращает false для имён короче 2 символов', () => {
    expect(nameIsValid('')).toBe(false);
    expect(nameIsValid('a')).toBe(false);
  });

  test('возвращает false для некорректных данных', () => {
    // Заглавные буквы
    expect(nameIsValid('Anna')).toBe(false);

    // Цифры
    expect(nameIsValid('ann3')).toBe(false);

    // Спецсимволы и разделители
    expect(nameIsValid('an-na')).toBe(false);
    expect(nameIsValid('an_na')).toBe(false);
    expect(nameIsValid('an.na')).toBe(false);

    // Пробелы
    expect(nameIsValid('an na')).toBe(false);
    expect(nameIsValid(' anna')).toBe(false);
    expect(nameIsValid('anna ')).toBe(false);

    // Кириллица
    expect(nameIsValid('анна')).toBe(false);

    // Нестроковые типы
    expect(nameIsValid(undefined)).toBe(false);
    expect(nameIsValid(null as unknown as string)).toBe(false);
    expect(nameIsValid(123 as unknown as string)).toBe(false);

    // Крайние случаи
    expect(nameIsValid(' ')).toBe(false);
    expect(nameIsValid('\t')).toBe(false);
    expect(nameIsValid('\n')).toBe(false);
  });
});

describe('fullTrim', () => {
  test('удаляет обычные пробелы из строки', () => {
    expect(fullTrim('привет мир')).toBe('приветмир');
    expect(fullTrim('  начало   середина   конец  ')).toBe('началосерединаконец');
  });

  test('удаляет все виды пробельных символов', () => {
    expect(fullTrim('текст\twith\t табуляцией')).toBe('текстwithтабуляцией');
    expect(fullTrim('строка\nwith\n переносом')).toBe('строкаwithпереносом');
    expect(fullTrim('слова\fwith\f вертикальной табуляцией')).toBe(
      'словаwithвертикальнойтабуляцией'
    );
    expect(fullTrim('смешанные \t\n\f символы')).toBe('смешанныесимволы');
  });

  test('корректно обрабатывает крайние случаи', () => {
    expect(fullTrim('')).toBe('');
    expect(fullTrim(null)).toBe('');
    expect(fullTrim(undefined)).toBe('');
    expect(fullTrim('безпробелов')).toBe('безпробелов');
    expect(fullTrim('   ')).toBe('');
    expect(fullTrim('\t\n\f ')).toBe('');
  });
});

describe('getTotal', () => {
  describe('базовые расчёты', () => {
    test('считает сумму без скидки', () => {
      const items: CartItem[] = [{ price: 10, quantity: 5 }];
      expect(getTotal(items, 0)).toBe(50);
    });

    test('считает сумму со скидкой 10%', () => {
      const items: CartItem[] = [{ price: 10, quantity: 5 }];
      expect(getTotal(items, 10)).toBe(45);
    });

    test('считает сумму для двух товаров без скидки', () => {
      const items: CartItem[] = [
        { price: 10, quantity: 5 },
        { price: 20, quantity: 2 },
      ];
      expect(getTotal(items, 0)).toBe(90);
    });

    test('считает сумму для двух товаров со скидкой 20%', () => {
      const items: CartItem[] = [
        { price: 10, quantity: 5 },
        { price: 20, quantity: 2 },
      ];
      expect(getTotal(items, 20)).toBe(72);
    });

    test('считает сумму с максимальной скидкой 99%', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(getTotal(items, 99)).toBeCloseTo(0.1, 2);
    });
  });

  describe('валидация скидки', () => {
    test('выбрасывает ошибку для строки вместо числа', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(() => getTotal(items, '10' as any)).toThrow('Скидка должна быть числом');
    });

    test('выбрасывает ошибку для null', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(() => getTotal(items, null as any)).toThrow('Скидка должна быть числом');
    });

    test('выбрасывает ошибку для undefined', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(() => getTotal(items, undefined as any)).toThrow('Скидка должна быть числом');
    });

    test('выбрасывает ошибку для отрицательной скидки', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(() => getTotal(items, -1)).toThrow('Процент скидки должен быть от 0 до 99');
    });

    test('выбрасывает ошибку для скидки 100%', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(() => getTotal(items, 100)).toThrow('Процент скидки должен быть от 0 до 99');
    });

    test('выбрасывает ошибку для скидки больше 99%', () => {
      const items: CartItem[] = [{ price: 10, quantity: 1 }];
      expect(() => getTotal(items, 150)).toThrow('Процент скидки должен быть от 0 до 99');
    });
  });

  describe('крайние случаи', () => {
    test('пустой список товаров', () => {
      const items: CartItem[] = [];
      expect(getTotal(items, 0)).toBe(0);
    });

    test('пустой список товаров со скидкой', () => {
      const items: CartItem[] = [];
      expect(getTotal(items, 50)).toBe(0);
    });

    test('товар с нулевым количеством', () => {
      const items: CartItem[] = [{ price: 10, quantity: 0 }];
      expect(getTotal(items, 0)).toBe(0);
    });

    test('несколько товаров с нулевым количеством', () => {
      const items: CartItem[] = [
        { price: 10, quantity: 0 },
        { price: 20, quantity: 0 },
      ];
      expect(getTotal(items, 20)).toBe(0);
    });

    test('товар с нулевой ценой', () => {
      const items: CartItem[] = [{ price: 0, quantity: 10 }];
      expect(getTotal(items, 0)).toBe(0);
    });

    test('товар с name (игнорируется при расчёте)', () => {
      const items: CartItem[] = [
        { price: 10, quantity: 5, name: 'item1' },
        { price: 20, quantity: 2, name: 'item2' },
      ];
      expect(getTotal(items, 0)).toBe(90);
    });
  });
});
