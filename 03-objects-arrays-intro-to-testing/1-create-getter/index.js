/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let props = path.split('.');

  return function getValue(object) {
    return (props.length > 1 && object.hasOwnProperty(props[0])) 
      ? getValue(object[props.shift()]) 
      : object[props.shift()];
  };
}