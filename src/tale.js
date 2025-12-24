function kolobok(name) {
  const result = {
    'дедушка': 'Я от дедушки ушёл',
    'заяц': 'Я от зайца ушёл',
    'лиса': 'Меня съели'
  };

  return result[name];
};
console.log(kolobok('дедушка'));
console.log(kolobok('заяц'));
console.log(kolobok('лиса'));

function newYear(character) {
  const textDed = 'Дед Мороз!';
  const textSneg = 'Снегурочка!';
    if (character === 'Дед Мороз')
      return `${textDed} ${textDed} ${textDed}`
    else character === 'Снегурочка'
      return `${textSneg} ${textSneg} ${textSneg}`
};
console.log(newYear('Дед Мороз'));
console.log(newYear('Снегурочка'));
