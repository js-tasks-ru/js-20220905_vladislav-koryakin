/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {

  if (size <= 0) {return '';}
  if (!size) {return string.split('').join('');}

  let newChars = [];
  let length = 0;

  for (const key in string) {
    if (string[key - 1] === string[key]) {
      length++;
      if (length <= size) {
        newChars.push(string[key]);
      }
    } else {
      length = 1;
      if (length <= size) {
        newChars.push(string[key]);
      }
    }
  }

  return newChars.join('');
}