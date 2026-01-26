// Recipe data - edit this file to add/modify recipes
const recipeData = {
  "ingredientDefs": {
    "apples": {
      "name": "Apples",
      "units": "count",
      "section": "Produce"
    },
    "arugula": {
      "name": "Arugula",
      "units": "count",
      "section": "Produce"
    },
    "asparagus": {
      "name": "Asparagus",
      "units": "oz",
      "section": "Produce"
    },
    "avocado": {
      "name": "Avocado",
      "units": "count",
      "section": "Produce"
    },
    "baby-spinach": {
      "name": "Baby spinach",
      "units": "cups",
      "section": "Produce"
    },
    "baguette": {
      "name": "Baguette",
      "units": "count",
      "section": "Bread"
    },
    "basmati-rice": {
      "name": "Basmati rice",
      "units": "cup",
      "section": "Cooking"
    },
    "berries-kiwi-goldenberries-[lunchbox]": {
      "name": "Berries, kiwi, goldenberries [lunchbox]",
      "units": "package",
      "section": "Produce"
    },
    "broccoli-rabe": {
      "name": "Broccoli rabe",
      "units": "lbs",
      "section": "Produce"
    },
    "broccolini": {
      "name": "Broccolini",
      "units": "lbs",
      "section": "Produce"
    },
    "buratta": {
      "name": "Buratta",
      "units": "balls",
      "section": "Cheese section"
    },
    "butter": {
      "name": "Butter",
      "units": "tbsp",
      "section": "Dairy"
    },
    "butternut-squash": {
      "name": "Butternut squash",
      "units": "count",
      "section": "Produce"
    },
    "canned-black-beans": {
      "name": "Canned black beans",
      "units": "count",
      "section": "Cooking"
    },
    "canned-corn": {
      "name": "Canned corn",
      "units": "count",
      "section": "Cooking"
    },
    "carrots": {
      "name": "Carrots",
      "units": "count",
      "section": "Produce"
    },
    "cauliflower": {
      "name": "Cauliflower",
      "units": "count",
      "section": "Produce"
    },
    "celery": {
      "name": "Celery",
      "units": "count",
      "section": "Produce"
    },
    "cereal-[essentials]": {
      "name": "Cereal [essentials]",
      "units": "box",
      "section": "Cooking"
    },
    "cheddar-cheese": {
      "name": "Cheddar cheese",
      "units": "count",
      "section": "Cheese section"
    },
    "cherry-tomato": {
      "name": "Cherry Tomato",
      "units": "ounces",
      "section": "Produce"
    },
    "chickpeas": {
      "name": "Chickpeas",
      "units": "oz can",
      "section": "Cooking"
    },
    "chives": {
      "name": "Chives",
      "units": "bunch",
      "section": "Produce"
    },
    "chopped-tomatoes": {
      "name": "Chopped tomatoes",
      "units": "oz can",
      "section": "Cooking"
    },
    "cilantro": {
      "name": "Cilantro",
      "units": "count",
      "section": "Produce"
    },
    "corn-on-cob": {
      "name": "Corn on cob",
      "units": "count",
      "section": "Produce"
    },
    "crackers": {
      "name": "Crackers",
      "units": "count",
      "section": "Snacks"
    },
    "cream-cheese-[essentials]": {
      "name": "Cream cheese [essentials]",
      "units": "container",
      "section": "Cheese section"
    },
    "crushed-tomatoes": {
      "name": "Crushed tomatoes",
      "units": "oz can",
      "section": "Cooking"
    },
    "crusty-bread": {
      "name": "Crusty bread",
      "units": "count",
      "section": "Bread"
    },
    "cucumber": {
      "name": "Cucumber",
      "units": "count",
      "section": "Produce"
    },
    "cucumbers-[lunchbox]": {
      "name": "Cucumbers [lunchbox]",
      "units": "package",
      "section": "Produce"
    },
    "cumin": {
      "name": "Cumin",
      "units": "tsp",
      "section": "Cooking"
    },
    "daddy-bread-bagels-green-bread...-[essentials]": {
      "name": "Daddy bread, bagels, green bread... [essentials]",
      "units": "packet",
      "section": "Bread"
    },
    "diced-tomatoes": {
      "name": "Diced tomatoes",
      "units": "can",
      "section": "Cooking"
    },
    "dried-basil": {
      "name": "Dried basil",
      "units": "tbsp",
      "section": "Cooking"
    },
    "dried-mint": {
      "name": "Dried mint",
      "units": "tsp",
      "section": "Cooking"
    },
    "dried-sour-cherries": {
      "name": "Dried sour cherries",
      "units": "cup",
      "section": "Cooking"
    },
    "dumplings-impossible-nuggets-other-gems-[essentials]": {
      "name": "Dumplings, impossible nuggets, other gems [essentials]",
      "units": "box",
      "section": "Frozen"
    },
    "eggplant": {
      "name": "Eggplant",
      "units": "lbs",
      "section": "Produce"
    },
    "eggs": {
      "name": "Eggs",
      "units": "count",
      "section": "Cheese section"
    },
    "enchilada-sauce": {
      "name": "Enchilada sauce",
      "units": "count",
      "section": "Cooking"
    },
    "farro": {
      "name": "Farro",
      "units": "cup",
      "section": "Cooking"
    },
    "feta---goat-cheese": {
      "name": "Feta / goat cheese",
      "units": "cups",
      "section": "Cheese section"
    },
    "flour": {
      "name": "Flour",
      "units": "cup",
      "section": "Cooking"
    },
    "fresh-basil": {
      "name": "Fresh basil",
      "units": "bunch",
      "section": "Produce"
    },
    "fresh-ginger": {
      "name": "Fresh ginger",
      "units": "tbsp",
      "section": "Produce"
    },
    "fresh-mint": {
      "name": "Fresh mint",
      "units": "bunch",
      "section": "Produce"
    },
    "frozen-peas": {
      "name": "Frozen Peas",
      "units": "cups",
      "section": "Frozen"
    },
    "garlic": {
      "name": "Garlic",
      "units": "cloves",
      "section": "Produce"
    },
    "gogurts-[lunchbox]": {
      "name": "Gogurts [lunchbox]",
      "units": "box",
      "section": "Dairy"
    },
    "grape-tomatoes": {
      "name": "Grape tomatoes",
      "units": "oz",
      "section": "Produce"
    },
    "grapes": {
      "name": "Grapes",
      "units": "count",
      "section": "Produce"
    },
    "greek-yogurt": {
      "name": "Greek yogurt",
      "units": "count",
      "section": "Dairy"
    },
    "green-beans": {
      "name": "Green beans",
      "units": "lb",
      "section": "Produce"
    },
    "grilling-cheese": {
      "name": "Grilling cheese",
      "units": "oz",
      "section": "Cheese section"
    },
    "gruyere-or-gouda": {
      "name": "Gruyere or gouda",
      "units": "oz",
      "section": "Cheese section"
    },
    "gummy-apricots-[essentials]": {
      "name": "Gummy apricots [essentials]",
      "units": "bottle",
      "section": "Nuts"
    },
    "half-and-half": {
      "name": "Half & half",
      "units": "cups",
      "section": "Dairy"
    },
    "harissa-powder": {
      "name": "Harissa powder",
      "units": "tbsp",
      "section": "Cooking"
    },
    "hazelnuts": {
      "name": "Hazelnuts",
      "units": "count",
      "section": "Nuts"
    },
    "hazelnuts-pine-nuts-[essentials]": {
      "name": "Hazelnuts, pine nuts [essentials]",
      "units": "bottle",
      "section": "Nuts"
    },
    "heavy-cream": {
      "name": "Heavy cream",
      "units": "tbsp",
      "section": "Dairy"
    },
    "hot-dog-buns": {
      "name": "Hot dog buns",
      "units": "count",
      "section": "Bread"
    },
    "hummus": {
      "name": "Hummus",
      "units": "oz",
      "section": "Cheese section"
    },
    "israeli-couscous": {
      "name": "Israeli couscous",
      "units": "cups",
      "section": "Cooking"
    },
    "jasmine-rice": {
      "name": "Jasmine rice",
      "units": "cup",
      "section": "Cooking"
    },
    "kale": {
      "name": "Kale",
      "units": "lbs",
      "section": "Produce"
    },
    "kidney-beans": {
      "name": "Kidney beans",
      "units": "count",
      "section": "Cooking"
    },
    "lemon": {
      "name": "Lemon",
      "units": "count",
      "section": "Produce"
    },
    "lime": {
      "name": "Lime",
      "units": "count",
      "section": "Produce"
    },
    "mangoes-peaches-honeycrisp-apples-[essentials]": {
      "name": "Mangoes, Peaches, Honeycrisp apples [essentials]",
      "units": "Bag",
      "section": "Produce"
    },
    "maple-syrup": {
      "name": "Maple syrup",
      "units": "tsp",
      "section": "Cooking"
    },
    "mayonnaise": {
      "name": "Mayonnaise",
      "units": "count",
      "section": "Cooking"
    },
    "mexican-cheese": {
      "name": "Mexican cheese",
      "units": "cups",
      "section": "Cheese section"
    },
    "milk-half-and-half-[essentials]": {
      "name": "Milk, half & half [essentials]",
      "units": "carton",
      "section": "Dairy"
    },
    "mini-ice-creams-[essentials]": {
      "name": "Mini ice creams [essentials]",
      "units": "box",
      "section": "Frozen"
    },
    "shredded-mozzarella": {
      "name": "Shredded mozzarella",
      "units": "oz",
      "section": "Cheese section"
    },
    "fresh-mozzarella": {
      "name": "Fresh mozzarella",
      "units": "oz",
      "section": "Cheese section"
    },
    "mushroom-ravioli": {
      "name": "Mushroom ravioli",
      "units": "cube",
      "section": "Cheese section"
    },
    "mushrooms": {
      "name": "Mushrooms",
      "units": "oz",
      "section": "Produce"
    },
    "olive-oil": {
      "name": "Olive oil",
      "units": "tsp",
      "section": "Cooking"
    },
    "onion": {
      "name": "Onion",
      "units": "count",
      "section": "Produce"
    },
    "oregano": {
      "name": "Oregano",
      "units": "tsp",
      "section": "Cooking"
    },
    "panko": {
      "name": "Panko",
      "units": "count",
      "section": "Cooking"
    },
    "paprika": {
      "name": "Paprika",
      "units": "tbsp",
      "section": "Cooking"
    },
    "parmesan": {
      "name": "Parmesan",
      "units": "oz",
      "section": "Cheese section"
    },
    "pasta": {
      "name": "Pasta",
      "units": "lb",
      "section": "Cooking"
    },
    "pasta-shells": {
      "name": "Pasta shells",
      "units": "lb",
      "section": "Cooking"
    },
    "peaches": {
      "name": "Peaches",
      "units": "count",
      "section": "Produce"
    },
    "pine-nuts": {
      "name": "Pine nuts",
      "units": "oz",
      "section": "Nuts"
    },
    "pistachios": {
      "name": "Pistachios",
      "units": "cups",
      "section": "Nuts"
    },
    "pita": {
      "name": "Pita",
      "units": "pack",
      "section": "Bread"
    },
    "pizza-dough": {
      "name": "Pizza dough",
      "units": "count",
      "section": "Cheese section"
    },
    "plum-tomatoes": {
      "name": "Plum tomatoes",
      "units": "count",
      "section": "Produce"
    },
    "pouring-olive-oil-[essentials]": {
      "name": "Pouring olive oil [essentials]",
      "units": "bottle",
      "section": "Cooking"
    },
    "quinoa": {
      "name": "Quinoa",
      "units": "cup",
      "section": "Cooking"
    },
    "red-onion": {
      "name": "Red onion",
      "units": "count",
      "section": "Produce"
    },
    "ricotta": {
      "name": "Ricotta",
      "units": "cups",
      "section": "Cheese section"
    },
    "roma-tomatoes": {
      "name": "Roma tomatoes",
      "units": "count",
      "section": "Produce"
    },
    "scallions": {
      "name": "Scallions",
      "units": "count",
      "section": "Produce"
    },
    "seaweed-[lunchbox]": {
      "name": "Seaweed [lunchbox]",
      "units": "package",
      "section": "Snacks"
    },
    "semi-pearled-farro": {
      "name": "Semi pearled farro",
      "units": "cups",
      "section": "Cooking"
    },
    "shallots": {
      "name": "Shallots",
      "units": "count",
      "section": "Produce"
    },
    "sliced-almonds": {
      "name": "Sliced almonds",
      "units": "oz",
      "section": "Nuts"
    },
    "sour-cream": {
      "name": "Sour cream",
      "units": "tbsp",
      "section": "Dairy"
    },
    "spaghetti": {
      "name": "Spaghetti",
      "units": "oz",
      "section": "Cooking"
    },
    "sparkling-water-[essentials]": {
      "name": "Sparkling water [essentials]",
      "units": "case",
      "section": "Cooking"
    },
    "sticky-apricots-[lunchbox]": {
      "name": "Sticky apricots [lunchbox]",
      "units": "box",
      "section": "Nuts"
    },
    "string-cheese-[lunchbox]": {
      "name": "String cheese [lunchbox]",
      "units": "package",
      "section": "Cheese section"
    },
    "sun-dried-tomatoes": {
      "name": "Sun-dried tomatoes in oil",
      "units": "cup",
      "section": "Cooking"
    },
    "sweet-potatoes": {
      "name": "Sweet potatoes",
      "units": "count",
      "section": "Produce"
    },
    "tahini": {
      "name": "Tahini",
      "units": "tbsp",
      "section": "Cooking"
    },
    "thyme": {
      "name": "Thyme",
      "units": "count",
      "section": "Produce"
    },
    "tofu-[lunchbox]": {
      "name": "Tofu [lunchbox]",
      "units": "package",
      "section": "Cheese section"
    },
    "tomato-paste": {
      "name": "Tomato paste",
      "units": "tbsp",
      "section": "Cooking"
    },
    "tomato-sauce": {
      "name": "Tomato sauce",
      "units": "can",
      "section": "Cooking"
    },
    "tortilla-chips": {
      "name": "Tortilla chips",
      "units": "count",
      "section": "Snacks"
    },
    "tortillas": {
      "name": "Tortillas",
      "units": "count",
      "section": "Bread"
    },
    "turtle-gummies-[essentials]": {
      "name": "Turtle gummies [essentials]",
      "units": "bag",
      "section": "Frozen"
    },
    "veggie-sausage": {
      "name": "Veggie sausage",
      "units": "count",
      "section": "Dairy"
    },
    "veggie-stock": {
      "name": "Veggie stock",
      "units": "cubes",
      "section": "Cooking"
    },
    "walnuts-or-other": {
      "name": "Walnuts or other",
      "units": "cup",
      "section": "Nuts"
    },
    "white-beans": {
      "name": "White beans",
      "units": "cans",
      "section": "Cooking"
    },
    "white-onion": {
      "name": "White onion",
      "units": "count",
      "section": "Produce"
    },
    "white-wine": {
      "name": "White wine",
      "units": "cups",
      "section": "Other"
    },
    "white-wine-vinegar": {
      "name": "White wine vinegar",
      "units": "tbsp",
      "section": "Cooking"
    },
    "whole-milk": {
      "name": "Whole milk",
      "units": "count",
      "section": "Dairy"
    },
    "whole-tomatoes": {
      "name": "Whole tomatoes",
      "units": "oz can",
      "section": "Cooking"
    },
    "wild-rice": {
      "name": "Wild rice",
      "units": "cup",
      "section": "Cooking"
    },
    "yellow-onion": {
      "name": "Yellow onion",
      "units": "count",
      "section": "Produce"
    },
    "zaatar": {
      "name": "Za'atar",
      "units": "count",
      "section": "Cooking"
    },
    "zucchini": {
      "name": "Zucchini",
      "units": "count",
      "section": "Produce"
    }
  },
  "recipes": [
    {
      "id": "baked-farro-with-summer-vegetables-by-smitten-kitchen",
      "name": "Baked farro with summer vegetables by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2021/08/baked-farro-with-summer-vegetables/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2021/08/baked-farro-with-summer-vegetables-scaled.jpg?resize=1536%2C1024&ssl=1",
      "ingredients": [
        { "id": "corn-on-cob", "qty": 2 },
        { "id": "zucchini", "qty": 4 },
        { "id": "onion", "qty": 1 },
        { "id": "oregano", "qty": 1 },
        { "id": "garlic", "qty": 2 },
        { "id": "roma-tomatoes", "qty": 4 },
        { "id": "tomato-paste", "qty": 1 },
        { "id": "white-wine", "qty": 0.25 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "farro", "qty": 1 },
        { "id": "fresh-mozzarella", "qty": 6 },
        { "id": "parmesan", "qty": 2 }
      ]
    },
    {
      "id": "baked-mediterranean-veggies",
      "name": "Baked mediterranean veggies by Hello Fresh",
      "url": "https://www.hellofresh.com/recipes/mediterranean-baked-veggies-5a958ac730006c32be67bfd2",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/5a958ac730006c32be67bfd2-1f072c43.jpg",
      "ingredients": [
        { "id": "feta---goat-cheese", "qty": 0.5 },
        { "id": "garlic", "qty": 2 },
        { "id": "grape-tomatoes", "qty": 4 },
        { "id": "thyme", "qty": 1 },
        { "id": "asparagus", "qty": 8 },
        { "id": "scallions", "qty": 2 },
        { "id": "israeli-couscous", "qty": 0.75 },
        { "id": "sliced-almonds", "qty": 1 },
        { "id": "veggie-stock", "qty": 2 }
      ]
    },
    {
      "id": "broccoli-farro-salad-by-smitten-kitchen",
      "name": "Broccoli farro salad by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2017/05/broccoli-rubble-farro-salad/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2017/05/broccoli-rubble-farro-salad.jpg?fit=750%2C500&ssl=1",
      "ingredients": [
        { "id": "parmesan", "qty": 4 },
        { "id": "semi-pearled-farro", "qty": 1 },
        { "id": "broccolini", "qty": 1 },
        { "id": "garlic", "qty": 2 },
        { "id": "lemon", "qty": 1 }
      ]
    },
    {
      "id": "burrito-bowls",
      "name": "Burrito bowls by Hello Fresh",
      "url": "https://www.hellofresh.com/recipes/veggie-burrito-bowls-5bc0bfaaae08b5032c3a6bf2",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/5e5ea67325ed1a2b107a3598-296940aa.jpg",
      "ingredients": [
        { "id": "mexican-cheese", "qty": 0.5 },
        { "id": "tortilla-chips", "qty": 1 },
        { "id": "canned-black-beans", "qty": 1 },
        { "id": "canned-corn", "qty": 1 },
        { "id": "jasmine-rice", "qty": 0.5 },
        { "id": "sour-cream", "qty": 4 },
        { "id": "avocado", "qty": 1 },
        { "id": "cilantro", "qty": 1 },
        { "id": "grape-tomatoes", "qty": 4 },
        { "id": "lime", "qty": 1 },
        { "id": "yellow-onion", "qty": 1 }
      ]
    },
    {
      "id": "caprese-sandwiches",
      "name": "Caprese sandwiches by MoniLew",
      "image": "https://cdn.loveandlemons.com/wp-content/uploads/2020/06/caprese-sandwich-1.jpg",
      "ingredients": [
        { "id": "olive-oil", "qty": 3 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "plum-tomatoes", "qty": 1 },
        { "id": "fresh-mozzarella", "qty": 1 },
        { "id": "baguette", "qty": 0.5 }
      ]
    },
    {
      "id": "chickpea-and-carrot-curry",
      "name": "Chickpea and carrot curry by Williams Sonoma",
      "url": "https://www.williams-sonoma.com/recipe/chickpea--spinach-and-carrot-curry.html",
      "image": "https://assets.wsimgs.com/wsimgs/rk/images/dp/recipe/202508/0012/img74l.jpg",
      "ingredients": [
        { "id": "jasmine-rice", "qty": 0.5 },
        { "id": "cumin", "qty": 2 },
        { "id": "carrots", "qty": 2 },
        { "id": "yellow-onion", "qty": 0.5 },
        { "id": "chopped-tomatoes", "qty": 28 },
        { "id": "chickpeas", "qty": 15 },
        { "id": "baby-spinach", "qty": 2 },
        { "id": "garlic", "qty": 3 },
        { "id": "fresh-ginger", "qty": 2 }
      ]
    },
    {
      "id": "creamy-mushroom-pasta-by-bon-appetit",
      "name": "Creamy mushroom pasta by Bon Appetit",
      "url": "https://www.bonappetit.com/test-kitchen/inside-our-kitchen/article/brown-butter-mushroom-orecchiette",
      "image": "https://assets.bonappetit.com/photos/5d4ddd602c815a00080f9771/1:1/w_2240,c_limit/BA-0919-Creamy-Pasta-Crispy-Mushroom-Playbook.jpg",
      "ingredients": [
        { "id": "parmesan", "qty": 3 },
        { "id": "mushrooms", "qty": 4 },
        { "id": "yellow-onion", "qty": 0.5 },
        { "id": "pasta", "qty": 1 },
        { "id": "heavy-cream", "qty": 4 },
        { "id": "chives", "qty": 1 }
      ]
    },
    {
      "id": "enchilada-bake",
      "name": "Enchilada bake by HelloFresh",
      "url": "https://www.hellofresh.com/recipes/one-pan-rice-bean-enchilada-bake-614b499eebe91d735a1d62a9",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/one-pan-rice-bean-enchilada-bake-a73f6f46.jpg",
      "ingredients": [
        { "id": "mexican-cheese", "qty": 0.5 },
        { "id": "tortilla-chips", "qty": 1 },
        { "id": "sour-cream", "qty": 2 },
        { "id": "avocado", "qty": 1 },
        { "id": "cilantro", "qty": 1 },
        { "id": "lime", "qty": 2 },
        { "id": "scallions", "qty": 2 },
        { "id": "kidney-beans", "qty": 1 },
        { "id": "enchilada-sauce", "qty": 1 }
      ]
    },
    {
      "id": "grazing-platter",
      "name": "Grazing platter by MoniLew",
      "image": "https://www.chefnotrequired.com/wp-content/uploads/2019/12/grazing-board-blog-hero.jpg",
      "ingredients": [
        { "id": "cheddar-cheese", "qty": 1 },
        { "id": "hummus", "qty": 8 },
        { "id": "pita", "qty": 1 },
        { "id": "crackers", "qty": 1 },
        { "id": "apples", "qty": 1 },
        { "id": "grape-tomatoes", "qty": 1 },
        { "id": "grapes", "qty": 1 }
      ]
    },
    {
      "id": "haricots-verts-with-minty-tahini-by-ottolenghi",
      "name": "Haricots verts with minty tahini by Ottolenghi",
      "url": "https://www.bonappetit.com/recipe/haricots-verts-and-freekeh-with-minty-tahini-dressing",
      "image": "https://assets.bonappetit.com/photos/57ad3b1653e63daf11a4dd26/1:1/w_2240,c_limit/haricots-verts-and-freekeh-with-minty-tahini-dressing.jpg",
      "ingredients": [
        { "id": "hazelnuts", "qty": 0.25 },
        { "id": "semi-pearled-farro", "qty": 0.25 },
        { "id": "olive-oil", "qty": 1 },
        { "id": "green-beans", "qty": 1 },
        { "id": "tahini", "qty": 2 },
        { "id": "dried-mint", "qty": 0.5 },
        { "id": "garlic", "qty": 1 },
        { "id": "lemon", "qty": 1 },
        { "id": "maple-syrup", "qty": 0.5 }
      ]
    },
    {
      "id": "kale-salad",
      "name": "Kale salad by MoniLew",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2013/08/kale-salad-with-pecorino-and-walnuts.jpg?fit=750%2C500&ssl=1",
      "ingredients": [
        { "id": "feta---goat-cheese", "qty": 1 },
        { "id": "hazelnuts", "qty": 1 },
        { "id": "olive-oil", "qty": 1 },
        { "id": "avocado", "qty": 1 },
        { "id": "garlic", "qty": 1 },
        { "id": "kale", "qty": 1 },
        { "id": "pine-nuts", "qty": 1 }
      ]
    },
    {
      "id": "lunchbox",
      "name": "Lunchbox by MoniLew",
      "image": "https://holleygrainger.com/wp-content/uploads/2019/08/blt-skewer-lunchbox.jpg",
      "ingredients": [
        { "id": "string-cheese-[lunchbox]", "qty": 1 },
        { "id": "tofu-[lunchbox]", "qty": 1 },
        { "id": "cucumbers-[lunchbox]", "qty": 1 },
        { "id": "berries-kiwi-goldenberries-[lunchbox]", "qty": 1 },
        { "id": "seaweed-[lunchbox]", "qty": 1 },
        { "id": "gogurts-[lunchbox]", "qty": 1 },
        { "id": "sticky-apricots-[lunchbox]", "qty": 1 }
      ]
    },
    {
      "id": "margherita-pizza",
      "name": "Margherita pizza by MoniLew",
      "image": "https://ooni.com/cdn/shop/articles/20220211142347-margherita-9920_ba86be55-674e-4f35-8094-2067ab41a671.jpg?v=1737104576&width=2048",
      "ingredients": [
        { "id": "pizza-dough", "qty": 1 },
        { "id": "tomato-sauce", "qty": 1 },
        { "id": "buratta", "qty": 1 },
        { "id": "fresh-basil", "qty": 1 }
      ]
    },
    {
      "id": "marry-me-beans",
      "name": "Marry Me Beans by NYT Cooking",
      "url": "https://cooking.nytimes.com/recipes/1025325-creamy-spicy-tomato-beans-and-greens",
      "image": "https://static01.nyt.com/images/2024/04/24/multimedia/aw-tomato-beansrex-mwfq/aw-tomato-beansrex-mwfq-threeByTwoMediumAt2X.jpg?quality=75&auto=webp",
      "ingredients": [
        { "id": "panko", "qty": 2/3 },
        { "id": "garlic", "qty": 4 },
        { "id": "yellow-onion", "qty": 1 },
        { "id": "oregano", "qty": .5 },
        { "id": "tomato-paste", "qty": 5 },
        { "id": "sun-dried-tomatoes", "qty": .5 },
        { "id": "veggie-stock", "qty": 1 },
        { "id": "white-beans", "qty": 2 },
        { "id": "arugula", "qty": 1 },
        { "id": "lemon", "qty": 1 },
        { "id": "half-and-half", "qty": 1 },
        { "id": "parmesan", "qty": 2/3 },
        { "id": "crusty-bread", "qty": 1 }
      ]
    },
    {
      "id": "minestrone-soup",
      "name": "Minestrone soup by McCaitlin",
      "image": "https://i0.wp.com/fortheloveofgourmet.com/wp-content/uploads/2025/01/IMG_2256-scaled.jpg?resize=1365%2C2048&ssl=1",
      "ingredients": [
        { "id": "parmesan", "qty": 1 },
        { "id": "veggie-stock", "qty": 1 },
        { "id": "dried-basil", "qty": 1 },
        { "id": "garlic", "qty": 1 },
        { "id": "yellow-onion", "qty": 1 },
        { "id": "kidney-beans", "qty": 1 },
        { "id": "white-beans", "qty": 1 },
        { "id": "celery", "qty": 1 },
        { "id": "carrots", "qty": 1 },
        { "id": "panko", "qty": 1 },
        { "id": "diced-tomatoes", "qty": 1 }
      ]
    },
    {
      "id": "mushroom-buratta-pizza-by-good-eggs",
      "name": "Mushroom buratta pizza by Good Eggs",
      "url": "https://www.goodeggs.com/sfbay/bundlessfbay/mushroom-pizza-with-burrata-arugula/5b58e54d9c68f5000ff4e2ad",
      "image": "https://goodeggs4.imgix.net/da949f17-33ce-4864-bc35-76ae05d5c10a.jpg?w=840&h=525&fm=jpg&q=80&fit=crop",
      "ingredients": [
        { "id": "pizza-dough", "qty": 1 },
        { "id": "buratta", "qty": 1 },
        { "id": "arugula", "qty": 1 },
        { "id": "garlic", "qty": 1 },
        { "id": "mushrooms", "qty": 10 },
        { "id": "shallots", "qty": 2 },
        { "id": "lemon", "qty": 1 }
      ]
    },
    {
      "id": "mushroom-ravioli",
      "name": "Mushroom ravioli by Hello Fresh",
      "url": "https://www.hellofresh.com/recipes/creamiest-mushroom-ravioli-5aaac3ac30006c55e74b0644",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/5aaac3ac30006c55e74b0644-3b4a0509.jpg",
      "ingredients": [
        { "id": "parmesan", "qty": 1 },
        { "id": "veggie-stock", "qty": 1 },
        { "id": "mushroom-ravioli", "qty": 1 },
        { "id": "garlic", "qty": 1 },
        { "id": "sour-cream", "qty": 4 },
        { "id": "grape-tomatoes", "qty": 4 },
        { "id": "mushrooms", "qty": 10 },
        { "id": "shallots", "qty": 1 },
        { "id": "zucchini", "qty": 1 }
      ]
    },
    {
      "id": "one-pot-farro-with-tomato-by-smitten-kitchen",
      "name": "One pot farro with tomato by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2013/07/one-pan-farro-with-tomatoes/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2013/07/one-pan-farro-with-tomatoes.jpg?fit=750%2C500&ssl=1",
      "ingredients": [
        { "id": "parmesan", "qty": 1 },
        { "id": "olive-oil", "qty": 1 },
        { "id": "semi-pearled-farro", "qty": 1 },
        { "id": "garlic", "qty": 2 },
        { "id": "grape-tomatoes", "qty": 9 },
        { "id": "white-onion", "qty": 0.5 },
        { "id": "fresh-basil", "qty": 1 }
      ]
    },
    {
      "id": "pantry-essentials",
      "name": "Pantry essentials by MoniLew",
      "image": "https://simply-delicious-food.com/wp-content/uploads/2020/03/53DE1AE8-4DB2-4821-A11E-39B69931503E-2.jpg",
      "ingredients": [
        { "id": "pouring-olive-oil-[essentials]", "qty": 1 },
        { "id": "hazelnuts-pine-nuts-[essentials]", "qty": 1 },
        { "id": "gummy-apricots-[essentials]", "qty": 1 },
        { "id": "daddy-bread-bagels-green-bread...-[essentials]", "qty": 1 },
        { "id": "cream-cheese-[essentials]", "qty": 1 },
        { "id": "mangoes-peaches-honeycrisp-apples-[essentials]", "qty": 1 },
        { "id": "sparkling-water-[essentials]", "qty": 1 },
        { "id": "turtle-gummies-[essentials]", "qty": 1 },
        { "id": "mini-ice-creams-[essentials]", "qty": 1 },
        { "id": "cereal-[essentials]", "qty": 1 },
        { "id": "milk-half-and-half-[essentials]", "qty": 1 },
        { "id": "dumplings-impossible-nuggets-other-gems-[essentials]", "qty": 1 }
      ]
    },
    {
      "id": "pea-fritters",
      "name": "Pea, Feta and Mint Fritters by Smitten Kitchen",
      "image": "https://dishingupthedirt.com/wp-content/uploads/2021/03/010819_DUTD2_PeaFrittersAmity.jpg",
      "ingredients": [
        { "id": "frozen-peas", "qty": 2 },
        { "id": "eggs", "qty": 3 },
        { "id": "lemon", "qty": 1 },
        { "id": "fresh-mint", "qty": 1 },
        { "id": "feta---goat-cheese", "qty": 1 },
        { "id": "flour", "qty": 2/3 },
        { "id": "greek-yogurt", "qty": 3/4 }
      ]
    },

    {
      "id": "rice-salad-ottolength",
      "name": "Rice Salad With Nuts and Sour Cherries by Ottolenghi",
      "image": "https://www.seriouseats.com/thmb/d7VNXc_D79vv4oyWfVNbsjpJTZs=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2014__10__20141003-plenty-more-rice-salad-jonathan-lovekin-fa3c48fdf0154d1a9c6db11533115502.jpg",
      "url": "https://www.seriouseats.com/rice-salad-with-nuts-and-sour-cherries-from-plenty-more",
      "ingredients": [
        { "id": "wild-rice", "qty": 1 },
        { "id": "basmati-rice", "qty": 1.25 },
        { "id": "quinoa", "qty": 2/3 },
        { "id": "sliced-almonds", "qty": 3 },
        { "id": "pine nuts", "qty": 3 },
        { "id": "yellow-onion", "qty": 2 },
        { "id": "fresh-basil", "qty": 2/3 },
        { "id": "arugula", "qty": 1 },
        { "id": "dried-sour-cherries", "qty": 2/3 },
        { "id": "lemon", "qty": 2 },
        { "id": "garlic", "qty": 2 }
      ]
    },

    {
      "id": "peach-panzanella-with-burrata-and-mint-by-good-eggs",
      "name": "Peach panzanella with burrata & mint by Good Eggs",
      "url": "https://www.goodeggs.com/bundlessfbay/peach-panzanella-with-burrata-mint/5cd5c7e536ac96000eceb455",
      "image": "https://goodeggs4.imgix.net/c2470fe2-bb40-4f1e-93f6-8681eaaea4c4.jpg?w=840&h=525&fm=jpg&q=80&fit=crop",
      "ingredients": [
        { "id": "cherry-tomato", "qty": 8 },
        { "id": "buratta", "qty": 1 },
        { "id": "fresh-mint", "qty": 1 },
        { "id": "peaches", "qty": 1 },
        { "id": "baguette", "qty": 0.5 },
        { "id": "pine-nuts", "qty": 2 }
      ]
    },
    {
      "id": "quinoa-spaghetti-with-broccoli",
      "name": "Quinoa spaghetti with broccoli  by Williams Sonoma",
      "url": "https://www.williams-sonoma.com/recipe/quinoa-spaghetti-with-broccoli-rabe--feta-and-mint.html",
      "image": "https://assets.wsimgs.com/wsimgs/rk/images/dp/recipe/202512/0003/img460l.jpg",
      "ingredients": [
        { "id": "feta---goat-cheese", "qty": 1 },
        { "id": "olive-oil", "qty": 12 },
        { "id": "broccoli-rabe", "qty": 1 },
        { "id": "garlic", "qty": 6 },
        { "id": "fresh-mint", "qty": 1 },
        { "id": "spaghetti", "qty": 12 },
        { "id": "walnuts-or-other", "qty": 1 }
      ]
    },
    {
      "id": "roast-butternut-squash-and-red-onion-with-zaatar-tahini-by-ottolenghi",
      "name": "Roasted butternut squash and red onion with za'atar tahini by Ottolenghi",
      "url": "https://ottolenghi.co.uk/recipes/roast-butternut-squash-and-red-onion-with-tahini-and-za-atar",
      "image": "https://i.guim.co.uk/img/static/sys-images/Guardian/Pix/pictures/2011/12/8/1323360137075/Roasted-butternut-squash--007.jpg?width=620&dpr=2&s=none&crop=none",
      "ingredients": [
        { "id": "tahini", "qty": 1 },
        { "id": "red-onion", "qty": 2 },
        { "id": "butternut-squash", "qty": 1 },
        { "id": "zaatar", "qty": 1 }
      ]
    },
    {
      "id": "roasted-tomatoes-with-garlic-by-smitten-kitchen",
      "name": "Roasted tomatoes with garlic by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2008/08/slow-roasted-tomatoes/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2008/08/slow-roasted-tomatoes1.jpg?resize=1536%2C1025&ssl=1",
      "ingredients": [
        { "id": "olive-oil", "qty": 4 },
        { "id": "garlic", "qty": 12 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "plum-tomatoes", "qty": 2 }
      ]
    },
    {
      "id": "roasted-yams-and-chickpeas-with-yogurt-by-smitten-kitchen",
      "name": "Roasted yams and chickpeas with yogurt by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2016/02/roasted-yams-and-chickpeas-with-yogurt/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2016/02/roasted-yams-and-chickpeas-with-yogurt1.jpg?fit=640%2C427&ssl=1",
      "ingredients": [
        { "id": "greek-yogurt", "qty": 1 },
        { "id": "sweet-potatoes", "qty": 3 },
        { "id": "chickpeas", "qty": 15 },
        { "id": "garlic", "qty": 1 },
        { "id": "lemon", "qty": 1 }
      ]
    },
    {
      "id": "sausage-dogs",
      "name": "Sausage dogs by MoniLew",
      "image": "https://www.connoisseurusveg.com/wp-content/uploads/2023/08/portobello-mushroom-hot-dogs-fb-sq.jpg",
      "ingredients": [
        { "id": "cheddar-cheese", "qty": 1 },
        { "id": "hot-dog-buns", "qty": 1 },
        { "id": "veggie-sausage", "qty": 1 },
        { "id": "mushrooms", "qty": 8 },
        { "id": "hummus", "qty": 8 },
        { "id": "onion", "qty": 1 }
      ]
    },
    {
      "id": "shakshuka-by-smitten-kitchen",
      "name": "Shakshuka by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2010/04/shakshuka/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2010/04/shakshuka-1-scaled.jpg?resize=1536%2C1021&ssl=1",
      "ingredients": [
        { "id": "feta---goat-cheese", "qty": 0.5 },
        { "id": "whole-tomatoes", "qty": 28 },
        { "id": "cumin", "qty": 1 },
        { "id": "olive-oil", "qty": 4 },
        { "id": "paprika", "qty": 1 },
        { "id": "eggs", "qty": 6 },
        { "id": "garlic", "qty": 5 },
        { "id": "yellow-onion", "qty": 1 },
        { "id": "pita", "qty": 1 }
      ]
    },
    {
      "id": "simple-cauliflower-tacos-by-smitten-kitchen",
      "name": "Simple cauliflower tacos by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2020/10/simple-cauliflower-tacos/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2020/10/simple-cauliflower-tacos-scaled.jpg?resize=1536%2C1024&ssl=1",
      "ingredients": [
        { "id": "cilantro", "qty": 1 },
        { "id": "lime", "qty": 1 },
        { "id": "red-onion", "qty": 1 },
        { "id": "cauliflower", "qty": 1 },
        { "id": "tortillas", "qty": 1 }
      ]
    },

    {
      "id": "simple-eggplant-parmesan",
      "name": "Simple eggplant parmesan by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2023/09/simple-eggplant-parmesan/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2023/09/simple-eggplant-parmesan-12-scaled.jpg?resize=1536%2C1024&ssl=1",
      "ingredients": [
        { "id": "eggplant", "qty": 2 },
        { "id": "yellow-onion", "qty": 1 },
        { "id": "garlic", "qty": 3 },
        { "id": "whole-tomatoes", "qty": 1 },
        { "id": "oregano", "qty": 1 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "parmesan", "qty": 1/2 },
        { "id": "shredded-mozzarella", "qty": 8 }
      ]
    },
    {
      "id": "skillet-pasta-with-5-cheeses-by-smitten-kitchen",
      "name": "Skillet pasta with 5 cheeses by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2016/10/skillet-baked-pasta-with-five-cheeses/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2016/10/skillet-baked-pasta-with-five-cheeses.jpg?fit=750%2C500&ssl=1",
      "ingredients": [
        { "id": "ricotta", "qty": 0.5 },
        { "id": "whole-milk", "qty": 1 },
        { "id": "shredded-mozzarella", "qty": 3 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "scallions", "qty": 2 },
        { "id": "parmesan", "qty": 3 },
        { "id": "crushed-tomatoes", "qty": 28 },
        { "id": "gruyere-or-gouda", "qty": 3 },
        { "id": "pasta-shells", "qty": 1 }
      ]
    },
    {
      "id": "spaghetti-aglio-e-olio-by-bon-appetit",
      "name": "Spaghetti aglio e olio by Bon Appetit",
      "url": "https://www.bonappetit.com/recipe/spaghetti-aglio-e-olio-with-lots-of-kale",
      "image": "https://assets.bonappetit.com/photos/58700a2f725909250df59f9c/master/w_1280,c_limit/spaghetti-aglio-e-olio-with-lots-of-kale.jpg",
      "ingredients": [
        { "id": "parmesan", "qty": 1 },
        { "id": "olive-oil", "qty": 12 },
        { "id": "garlic", "qty": 5 },
        { "id": "spaghetti", "qty": 12 },
        { "id": "kale", "qty": 1.5 }
      ]
    },
    {
      "id": "sweet-potato-pita-pocket",
      "name": "Sweet potato pita pocket by Hello Fresh",
      "url": "https://www.hellofresh.com/recipes/harissa-sweet-potato-pitas-58b99736d56afa17de02ce53",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/5c3cb170c445fa2277482006-cabc7683.jpg",
      "ingredients": [
        { "id": "pita", "qty": 1 },
        { "id": "mayonnaise", "qty": 1 },
        { "id": "avocado", "qty": 1 },
        { "id": "cucumber", "qty": 1 },
        { "id": "garlic", "qty": 1 },
        { "id": "sweet-potatoes", "qty": 2 },
        { "id": "pine-nuts", "qty": 1 },
        { "id": "white-wine-vinegar", "qty": 2 },
        { "id": "harissa-powder", "qty": 1 }
      ]
    },
    {
      "id": "ricotta-gnocchi",
      "name": "Toasted Ricotta Gnocchi with Pistachio Pesto by Smitten Kitchen",
      "url": "https://houseandhome.com/recipe/toasted-ricotta-gnocchi-with-pistachio-pesto/",
      "image": "https://houseandhome.com/wp-content/uploads/2023/05/Toasted-Ricotta-Gnocchi-with-Pistachio-Pesto_HH_Apr23_58.jpg",
      "ingredients": [
        { "id": "ricotta", "qty": 2 },
        { "id": "eggs", "qty": 1 },
        { "id": "parmesan", "qty": .5 },
        { "id": "flour", "qty": 1 },
        { "id": "pistachios", "qty": .5 },
        { "id": "garlic", "qty": 2 },
        { "id": "arugula", "qty": 1 }
      ]
    },
    {
      "id": "veggie-jumble",
      "name": "Veggie jumble by Hello Fresh",
      "url": "https://www.hellofresh.com/recipes/w19-r8-58d3c741d56afa563047ade3",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/grilled-cheese-and-veggie-jumble-46f11c36.jpg",
      "ingredients": [
        { "id": "grilling-cheese", "qty": 4 },
        { "id": "cilantro", "qty": 1 },
        { "id": "garlic", "qty": 1 },
        { "id": "avocado", "qty": 1 },
        { "id": "grape-tomatoes", "qty": 4 },
        { "id": "lemon", "qty": 1 },
        { "id": "red-onion", "qty": 1 },
        { "id": "sweet-potatoes", "qty": 2 },
        { "id": "cumin", "qty": 1 }
      ]
    }
  ]
};
