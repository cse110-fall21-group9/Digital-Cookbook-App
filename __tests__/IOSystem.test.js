const IOSystem = require('../assets/scripts/IOSystem');

test('One item key', () => {
  let obj = {name: 'recipe test 1'};
  let idx = 'recipe test 1';
  IOSystem.indexRecipe(idx, obj);
  expect(IOSystem.recipesDict[idx]).toBe(obj);
});

test('One item length', () => {
  let obj = {name: 'recipe test 1'};
  let idx = 'recipe test 1';
  IOSystem.indexRecipe(idx, obj);
  expect(Object.keys(IOSystem.recipesDict).length).toBe(1);
});
