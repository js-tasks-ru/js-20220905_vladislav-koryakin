/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let props = path.split('.');

  return obj => {
    let result = obj;

    const getValue = (index) => {
      if (index === props.length || result === undefined) {
        return result;
      }

      result = result[props[index]];

      return getValue(index + 1);
    };

    return getValue(0);
  };
}
/* 
const getter = createGetter('path.here');

console.log(getter({
  path: {
    here: 'i'
  }
})); */