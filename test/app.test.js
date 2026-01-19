const { nameIsValid } = require('../src/app') // Проверка имени пользователя

describe('nameIsValid function', () => {
//Тест 1
  test('возвращает true для корректного имени (строчные латинские буквы, длина ≥ 2)', () => {
    expect(nameIsValid('anna')).toBe(true)
    expect(nameIsValid('max')).toBe(true)
    expect(nameIsValid('alex')).toBe(true)
  })
//Тест 2
  test('возвращает false для имён короче 2 символов', () => {
    expect(nameIsValid('')).toBe(false)
    expect(nameIsValid('a')).toBe(false)
  })
//Тест 3
  test('возвращает false для некорректных данных', () => {
    // Заглавные буквы
    expect(nameIsValid('Anna')).toBe(false)

    // Цифры
    expect(nameIsValid('ann3')).toBe(false)

    // Спецсимволы и разделители
    expect(nameIsValid('an-na')).toBe(false)
    expect(nameIsValid('an_na')).toBe(false)
    expect(nameIsValid('an.na')).toBe(false)

    // Пробелы
    expect(nameIsValid('an na')).toBe(false)
    expect(nameIsValid(' anna')).toBe(false)
    expect(nameIsValid('anna ')).toBe(false)

    // Кириллица
    expect(nameIsValid('анна')).toBe(false)

    // Нестроковые типы
    expect(nameIsValid(123)).toBe(false)
    expect(nameIsValid(null)).toBe(false)
    expect(nameIsValid(undefined)).toBe(false)
    expect(nameIsValid({})).toBe(false)
    expect(nameIsValid([])).toBe(false)
    expect(nameIsValid(true)).toBe(false)

    // Крайние случаи
    expect(nameIsValid(' ')).toBe(false) // пробел
    expect(nameIsValid('\t')).toBe(false) // табуляция
    expect(nameIsValid('\n')).toBe(false) // перевод строки
  })
})

const { fullTrim } = require('../src/app') // Удаление пробелов из строки

describe('fullTrim', () => {
//Тест 1  
  test('удаляет обычные пробелы из строки', () => {
    expect(fullTrim('привет мир')).toBe('приветмир')
    expect(fullTrim('  начало   середина   конец  ')).toBe('началосерединаконец')
  })
//Тест 2
  test('удаляет все виды пробельных символов (табуляция, перевод строки, неразрывный пробел и т. п.)', () => {
    expect(fullTrim('текст\twith\t табуляцией')).toBe('текстwithтабуляцией')
    expect(fullTrim('строка\nwith\n переносом')).toBe('строкаwithпереносом')
    expect(fullTrim('слова\fwith\f вертикальной табуляцией')).toBe('словаwithвертикальнойтабуляцией')
    expect(fullTrim('текст with неразрывным пробелом')).toBe('текстwithнеразрывнымпробелом') // \u00A0 — неразрывный пробел
    expect(fullTrim('смешанные \t\n\f символы')).toBe('смешанныесимволы')
  })
//Тест 3
  test('корректно обрабатывает крайние случаи (пустая строка, null, undefined, строки без пробелов)', () => {
    expect(fullTrim('')).toBe('')
    expect(fullTrim(null)).toBe('')
    expect(fullTrim(undefined)).toBe('')
    expect(fullTrim('безпробелов')).toBe('безпробелов')
    expect(fullTrim('   ')).toBe('')
    expect(fullTrim('\t\n\f ')).toBe('')
  })
})

const { getTotal } = require('../src/app') // Подсчёт суммы заказа

describe('getTotal', () => {
  // Тест 1: Базовый расчёт (используем toBeCloseTo для чисел)
  test.each([
    [[{ price: 10, quantity: 5 }], 0, 50, 'без скидки'],
    [[{ price: 10, quantity: 5 }], 10, 45, 'скидка 10%'],
    [[{ price: 10, quantity: 5 },{ price: 20, quantity: 2 }],0,90,'два товара, без скидки'],
    [[{ price: 10, quantity: 5 },{ price: 20, quantity: 2 }],20,72,'два товара, скидка 20%'],
    [[{ price: 10, quantity: 1 }], 99, 0.1, 'максимальная скидка (99%)']
  ])('считает сумму для %s со скидкой %i%% → ожидает %p (%s)', (items, discount, expected) => {
    const result = getTotal(items, discount)
    expect(result).toBeCloseTo(expected, 2) // Точность до 2 знаков
  })

  // Тест 2: Валидация скидки
  test.each([
    ['10', 'Скидка должна быть числом'],
    [null, 'Скидка должна быть числом'],
    [-1, 'Процент скидки должен быть от 0 до 99'],
    [100, 'Процент скидки должен быть от 0 до 99'],
    [150, 'Процент скидки должен быть от 0 до 99']
  ])('выбрасывает ошибку для скидки %p: "%s"', (discount, expectedMessage) => {
    const items = [{ price: 10, quantity: 1 }]
    expect(() => getTotal(items, discount)).toThrow(expectedMessage)
  })

  // Тест 3: Крайние случаи
  test.each([
    [[], 0, 0, 'пустой список товаров'],
    [[], 50, 0, 'пустой список + скидка'],
    [[{ price: 10, quantity: 0 }], 0, 0, 'товар с quantity=0'],
    [[{ price: 10, quantity: 0 },{ price: 20, quantity: 0 }], 20, 0,'несколько товаров с quantity=0'],
    [[{ price: 0, quantity: 10 }], 0, 0, 'цена товара = 0']
  ])('обрабатывает %s со скидкой %i%% → ожидает %i (%s)', (items, discount, expected) => {
    const result = getTotal(items, discount)
    expect(result).toBe(expected)
  })
})
