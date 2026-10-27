const { isValidRecipeImage } = require('./server');

test.each(['https://example.com/recipe.jpg', '/images/recipes/caponata.jpg', '', null, undefined])('allows existing image value %s when editing a recipe', image => {
  expect(isValidRecipeImage(image)).toBe(true);
});
test.each(['javascript:alert(1)', '//example.com/image.jpg', '/images/../../server.js', '<img src=x>', 123])('rejects unsafe or invalid image value %s', image => {
  expect(isValidRecipeImage(image)).toBe(false);
});
