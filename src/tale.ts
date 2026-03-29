function kolobok(name: 'дедушка' | 'заяц' | 'лиса'): string {
  const result = {
    дедушка: 'Я от дедушки ушёл',
    заяц: 'Я от зайца ушёл',
    лиса: 'Меня съели',
  } as const;

  return result[name];
}

function newYear(character: 'Дед Мороз' | 'Снегурочка'): string {
  if (character === 'Дед Мороз') {
    return 'Дед Мороз! Дед Мороз! Дед Мороз!';
  } else {
    return 'Снегурочка! Снегурочка! Снегурочка!';
  }
}
