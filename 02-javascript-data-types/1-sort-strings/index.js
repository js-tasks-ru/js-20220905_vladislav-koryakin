/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sorted = [...arr];
  sorted.sort((a, b) => {
    if (a[0] !== b[0] && a[0].toLowerCase() === b[0].toLowerCase()) {
      if (a[0] > b[0]) {return 1;}
      if (a[0] < b[0]) {return -1;}
      return 0;
    }
    if (a.codePointAt(0) < 128 && b.codePointAt(0) > 128) {return 1;}
    if (a.codePointAt(0) > 128 && b.codePointAt(0) < 128) {return -1;}
    return a.localeCompare(b);
  });
  if (param === 'desc') {sorted.reverse();}
  return sorted;
}