/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let direction = {
    desc: -1,
    asc: 1,
  };
  
  return [...arr].sort((a, b) => {
    return direction[param] * a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'});
  });
}