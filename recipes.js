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
    "balsamic-vinegar": {
      "name": "Balsamic Vinegar",
      "units": "tbsp",
      "section": "Cooking"
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
    "coconut": {
      "name": "Coconut flakes",
      "units": "oz",
      "section": "Nuts"
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
    "mango": {
      "name": "Mango",
      "units": "count",
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
    "peanuts": {
      "name": "Peanuts",
      "units": "oz",
      "section": "Nuts"
    },
    "peanut-oil": {
      "name": "Peanut oil",
      "units": "oz",
      "section": "Cooking"
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
    "red-pepper": {
      "name": "Red bell pepper",
      "units": "count",
      "section": "Produce"
    },
    "red-rice": {
      "name": "Red rice",
      "units": "oz",
      "section": "Cooking"
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
    "salt": {
      "name": "Salt",
      "units": "tsp",
      "section": "Cooking"
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
    },
    "chili-powder": {
      "name": "Chili powder",
      "units": "tbsp",
      "section": "Cooking"
    },
    "beer": {
      "name": "Beer",
      "units": "bottles",
      "section": "Other"
    },
    "mixed-dried-beans": {
      "name": "Mixed dried beans",
      "units": "cups",
      "section": "Cooking"
    },
    "macaroni": {
      "name": "Macaroni",
      "units": "oz",
      "section": "Cooking"
    },
    "mascarpone": {
      "name": "Mascarpone",
      "units": "oz",
      "section": "Cheese section"
    },
    "nutmeg": {
      "name": "Nutmeg",
      "units": "whole",
      "section": "Cooking"
    },
    "apple-cider-vinegar": {
      "name": "Apple cider vinegar",
      "units": "tbsp",
      "section": "Cooking"
    },
    "dijon-mustard": {
      "name": "Dijon mustard",
      "units": "tsp",
      "section": "Cooking"
    },
    "powdered-sugar": {
      "name": "Powdered sugar",
      "units": "tbsp",
      "section": "Cooking"
    },
    "cayenne": {
      "name": "Cayenne",
      "units": "tsp",
      "section": "Cooking"
    },
    "cabbage": {
      "name": "Cabbage or coleslaw mix",
      "units": "count",
      "section": "Produce"
    },
    "hot-sauce": {
      "name": "Hot sauce",
      "units": "count",
      "section": "Cooking"
    },
    "brussels-sprouts": {
      "name": "Brussels sprouts",
      "units": "lbs",
      "section": "Produce"
    },
    "green-chili": {
      "name": "Green chili",
      "units": "count",
      "section": "Produce"
    },
    "tarragon": {
      "name": "Tarragon",
      "units": "bunch",
      "section": "Produce"
    },
    "dill": {
      "name": "Dill",
      "units": "bunch",
      "section": "Produce"
    },
    "parsley": {
      "name": "Parsley",
      "units": "bunch",
      "section": "Produce"
    },
    "preserved-lemon": {
      "name": "Preserved lemon",
      "units": "count",
      "section": "Cooking"
    },
    "active-dry-yeast": {
      "name": "Active dry yeast",
      "units": "tsp",
      "section": "Cooking"
    },
    "fresh-rosemary": {
      "name": "Fresh rosemary",
      "units": "bunch",
      "section": "Produce"
    },
    "red-wine-vinegar": {
      "name": "Red wine vinegar",
      "units": "tbsp",
      "section": "Cooking"
    },
    "capers": {
      "name": "Capers",
      "units": "tbsp",
      "section": "Cooking"
    },
    "honey": {
      "name": "Honey",
      "units": "tbsp",
      "section": "Cooking"
    },
    "orange-bell-pepper": {
      "name": "Orange bell pepper",
      "units": "count",
      "section": "Produce"
    },
    "russet-potato": {
      "name": "Russet potato",
      "units": "count",
      "section": "Produce"
    },
    "breadcrumbs": {
      "name": "Breadcrumbs",
      "units": "cup",
      "section": "Cooking"
    },
    "gnocchi": {
      "name": "Gnocchi",
      "units": "package",
      "section": "Cooking"
    },
    "marinara-sauce": {
      "name": "Marinara sauce",
      "units": "cup",
      "section": "Cooking"
    },
    "marinated-artichoke-hearts": {
      "name": "Marinated artichoke hearts",
      "units": "tbsp",
      "section": "Cooking"
    },
    "no-boil-lasagna-noodles": {
      "name": "No-boil lasagna noodles",
      "units": "strips",
      "section": "Cooking"
    },
    "broccoli": {
      "name": "Broccoli",
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
      "activeTime": "30 min",
      "totalTime": "1 hr",
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
      "totalTime": "30 min",
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
      "activeTime": "20 min",
      "totalTime": "30 min",
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
      "totalTime": "35 min",
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
      "name": "Caprese sandwiches by Tastefully Grace",
      "url": "https://tastefullygrace.com/caprese-sandwich/#caprese-sandwich-ingredients",
      "image": "https://tastefullygrace.com/wp-content/uploads/2023/08/Caprese-Sandwich-Recipe.jpg",
      "totalTime": "10 min",
      "ingredients": [
        { "id": "olive-oil", "qty": 3 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "plum-tomatoes", "qty": 1 },
        { "id": "fresh-mozzarella", "qty": 1 },
        { "id": "baguette", "qty": 0.5 },
        { "id": "balsamic-vinegar", "qty": 1 }
      ]
    },
    {
      "id": "chickpea-and-carrot-curry",
      "name": "Chickpea and carrot curry by Williams Sonoma",
      "url": "https://www.williams-sonoma.com/recipe/chickpea--spinach-and-carrot-curry.html",
      "image": "https://assets.wsimgs.com/wsimgs/rk/images/dp/recipe/202508/0012/img74l.jpg",
      "activeTime": "10 min",
      "totalTime": "40 min",
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
      "totalTime": "25 min",
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
      "totalTime": "50 min",
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
      "id": "haricots-verts-with-minty-tahini-by-ottolenghi",
      "name": "Haricots verts with minty tahini by Ottolenghi",
      "url": "https://www.bonappetit.com/recipe/haricots-verts-and-freekeh-with-minty-tahini-dressing",
      "image": "https://assets.bonappetit.com/photos/57ad3b1653e63daf11a4dd26/1:1/w_2240,c_limit/haricots-verts-and-freekeh-with-minty-tahini-dressing.jpg",
      "activeTime": "15 min",
      "totalTime": "30 min",
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
      "id": "mango-coconut-salad",
      "name": "Mango and Coconut Rice Salad by Ottolenghi",
      "url": "https://www.theguardian.com/lifeandstyle/2009/may/30/yotam-ottolenghi-vegetarian-rice-salad",
      "image": "https://i.guim.co.uk/img/static/sys-images/Lifeandhealth/Pix/pictures/2009/5/29/1243593740045/Yotam-Ottolenghis-mango-a-001.jpg?width=620&dpr=2&s=none&crop=none",
      "activeTime": "15 min",
      "totalTime": "50 min",
      "ingredients": [
        { "id": "jasmine-rice", "qty": 1 },
        { "id": "butter", "qty": 1 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "red-rice", "qty": 1 },
        { "id": "red-pepper", "qty": 1 },
        { "id": "fresh-mint", "qty": 1 },
        { "id": "cilantro", "qty": 1 },
        { "id": "scallions", "qty": 2 },
        { "id": "lemon", "qty": 1 },
        { "id": "mango", "qty": 2 },
        { "id": "peanuts", "qty": 2 },
        { "id": "coconut", "qty": 2 },
        { "id": "peanut-oil", "qty": 1 },
        { "id": "shallots", "qty": 1 }
      ]
    },
    {
      "id": "marry-me-beans",
      "name": "Marry Me Beans by NYT Cooking",
      "url": "https://cooking.nytimes.com/recipes/1025325-creamy-spicy-tomato-beans-and-greens",
      "image": "https://static01.nyt.com/images/2024/04/24/multimedia/aw-tomato-beansrex-mwfq/aw-tomato-beansrex-mwfq-threeByTwoMediumAt2X.jpg?quality=75&auto=webp",
      "activeTime": "20 min",
      "totalTime": "40 min",
      "ingredients": [
        { "id": "panko", "qty": 0.6666666666666666 },
        { "id": "garlic", "qty": 4 },
        { "id": "yellow-onion", "qty": 1 },
        { "id": "oregano", "qty": 0.5 },
        { "id": "tomato-paste", "qty": 5 },
        { "id": "sun-dried-tomatoes", "qty": 0.5 },
        { "id": "veggie-stock", "qty": 1 },
        { "id": "white-beans", "qty": 2 },
        { "id": "arugula", "qty": 1 },
        { "id": "lemon", "qty": 1 },
        { "id": "half-and-half", "qty": 1 },
        { "id": "parmesan", "qty": 0.6666666666666666 },
        { "id": "crusty-bread", "qty": 1 }
      ]
    },
    {
      "id": "mushroom-buratta-pizza-by-good-eggs",
      "name": "Mushroom buratta pizza by Good Eggs",
      "url": "https://www.goodeggs.com/sfbay/bundlessfbay/mushroom-pizza-with-burrata-arugula/5b58e54d9c68f5000ff4e2ad",
      "image": "/images/recipes/mushroom-buratta-pizza.jpg",
      "activeTime": "15 min",
      "totalTime": "25 min",
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
      "totalTime": "30 min",
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
      "activeTime": "10 min",
      "totalTime": "25 min",
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
      "id": "pea-fritters",
      "name": "Pea, Feta and Mint Fritters by Smitten Kitchen",
      "image": "/images/recipes/pea-feta-mint-fritters.jpg",
      "totalTime": "30 min",
      "ingredients": [
        { "id": "frozen-peas", "qty": 2 },
        { "id": "eggs", "qty": 3 },
        { "id": "lemon", "qty": 1 },
        { "id": "fresh-mint", "qty": 1 },
        { "id": "feta---goat-cheese", "qty": 1 },
        { "id": "flour", "qty": 0.6666666666666666 },
        { "id": "greek-yogurt", "qty": 0.75 }
      ]
    },
    {
      "id": "rice-salad-ottolength",
      "name": "Rice Salad With Nuts and Sour Cherries by Ottolenghi",
      "image": "https://www.seriouseats.com/thmb/d7VNXc_D79vv4oyWfVNbsjpJTZs=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/__opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2014__10__20141003-plenty-more-rice-salad-jonathan-lovekin-fa3c48fdf0154d1a9c6db11533115502.jpg",
      "url": "https://www.seriouseats.com/rice-salad-with-nuts-and-sour-cherries-from-plenty-more",
      "activeTime": "25 min",
      "totalTime": "45 min",
      "ingredients": [
        { "id": "wild-rice", "qty": 1 },
        { "id": "basmati-rice", "qty": 1.25 },
        { "id": "quinoa", "qty": 0.6666666666666666 },
        { "id": "sliced-almonds", "qty": 3 },
        { "id": "pine nuts", "qty": 3 },
        { "id": "yellow-onion", "qty": 2 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "arugula", "qty": 1 },
        { "id": "dried-sour-cherries", "qty": 0.6666666666666666 },
        { "id": "lemon", "qty": 2 },
        { "id": "garlic", "qty": 2 }
      ]
    },
    {
      "id": "peach-panzanella-with-burrata-and-mint-by-good-eggs",
      "name": "Peach panzanella with burrata & mint by Good Eggs",
      "url": "https://www.goodeggs.com/bundlessfbay/peach-panzanella-with-burrata-mint/5cd5c7e536ac96000eceb455",
      "image": "/images/recipes/peach-panzanella-burrata-mint.jpg",
      "totalTime": "10 min",
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
      "activeTime": "10 min",
      "totalTime": "20 min",
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
      "activeTime": "25 min",
      "totalTime": "50 min",
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
      "activeTime": "10 min",
      "totalTime": "3 hr",
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
      "activeTime": "25 min",
      "totalTime": "50 min",
      "ingredients": [
        { "id": "greek-yogurt", "qty": 1 },
        { "id": "sweet-potatoes", "qty": 3 },
        { "id": "chickpeas", "qty": 15 },
        { "id": "garlic", "qty": 1 },
        { "id": "lemon", "qty": 1 }
      ]
    },
    {
      "id": "shakshuka-by-smitten-kitchen",
      "name": "Shakshuka by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2010/04/shakshuka/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2010/04/shakshuka-1-scaled.jpg?resize=1536%2C1021&ssl=1",
      "activeTime": "30 min",
      "totalTime": "45 min",
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
      "totalTime": "40 min",
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
      "activeTime": "20 min",
      "totalTime": "2 hr",
      "ingredients": [
        { "id": "eggplant", "qty": 2 },
        { "id": "yellow-onion", "qty": 1 },
        { "id": "garlic", "qty": 3 },
        { "id": "whole-tomatoes", "qty": 1 },
        { "id": "oregano", "qty": 1 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "parmesan", "qty": 0.5 },
        { "id": "shredded-mozzarella", "qty": 8 }
      ]
    },
    {
      "id": "skillet-pasta-with-5-cheeses-by-smitten-kitchen",
      "name": "Skillet pasta with 5 cheeses by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2016/10/skillet-baked-pasta-with-five-cheeses/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2016/10/skillet-baked-pasta-with-five-cheeses.jpg?fit=750%2C500&ssl=1",
      "totalTime": "30 min",
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
      "totalTime": "25 min",
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
      "totalTime": "30 min",
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
      "totalTime": "1 hr",
      "ingredients": [
        { "id": "ricotta", "qty": 2 },
        { "id": "eggs", "qty": 1 },
        { "id": "parmesan", "qty": 0.5 },
        { "id": "flour", "qty": 1 },
        { "id": "pistachios", "qty": 0.5 },
        { "id": "garlic", "qty": 2 },
        { "id": "arugula", "qty": 1 }
      ]
    },
    {
      "id": "veggie-jumble",
      "name": "Veggie jumble by Hello Fresh",
      "url": "https://www.hellofresh.com/recipes/w19-r8-58d3c741d56afa563047ade3",
      "image": "https://img.hellofresh.com/c_fit,f_auto,fl_lossy,h_1100,q_50,w_2600/hellofresh_s3/image/grilled-cheese-and-veggie-jumble-46f11c36.jpg",
      "totalTime": "35 min",
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
    },
    {
      "id": "three-bean-chili-by-smitten-kitchen",
      "name": "Three-Bean Chili by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2014/04/three-bean-chili/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads//2014/04/three-bean-chili.jpg",
      "activeTime": "20 min",
      "totalTime": "30 min",
      "ingredients": [
        { "id": "olive-oil", "qty": 1 },
        { "id": "yellow onion", "qty": 1 },
        { "id": "garlic", "qty": 3 },
        { "id": "chili-powder", "qty": 2 },
        { "id": "cumin", "qty": 2 },
        { "id": "oregano", "qty": 1 },
        { "id": "crushed-tomatoes", "qty": 28 },
        { "id": "canned beans", "qty": 2 },
        { "id": "lime", "qty": 1 },
        { "id": "sour-cream", "qty": 1 },
        { "id": "cilantro", "qty": 1 },
        { "id": "tortilla-chips", "qty": 1 }
      ]
    },
    {
      "id": "souffled-macaroni-cheese-by-delia-smith",
      "name": "Souffled Macaroni Cheese by Delia Smith",
      "url": "https://www.deliaonline.com/recipes/type-of-dish/pasta-recipes/souffled-macaroni-cheese",
      "image": "https://www.deliaonline.com/sites/default/files/styles/3_by_2/public/quick_media/htc-souffled-macaroni-cheese.jpg",
      "activeTime": "30 min",
      "totalTime": "40 min",
      "ingredients": [
        { "id": "macaroni", "qty": 6 },
        { "id": "eggs", "qty": 2 },
        { "id": "mascarpone", "qty": 3 },
        { "id": "gruyere-or-gouda", "qty": 2 },
        { "id": "parmesan", "qty": 2 },
        { "id": "butter", "qty": 1 },
        { "id": "yellow onion", "qty": 1 },
        { "id": "flour", "qty": 1 },
        { "id": "whole-milk", "qty": 10 },
        { "id": "nutmeg", "qty": 0.25 }
      ]
    },
    {
      "id": "apple-and-cheddar-crisp-salad-by-smitten-kitchen",
      "name": "Apple and cheddar crisp salad by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2022/10/apple-and-cheddar-crisp-salad/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2022/10/apple-and-cheddar-crisp-salad-14-scaled.jpg?fit=1200%2C800&quality=89&ssl=1",
      "totalTime": "30 min",
      "ingredients": [
        { "id": "shallots", "qty": 1 },
        { "id": "apple-cider-vinegar", "qty": 3 },
        { "id": "dijon-mustard", "qty": 0.5 },
        { "id": "mayonnaise", "qty": 1 },
        { "id": "olive-oil", "qty": 18 },
        { "id": "cheddar-cheese", "qty": 1 },
        { "id": "sliced-almonds", "qty": 3 },
        { "id": "powdered-sugar", "qty": 2 },
        { "id": "cayenne", "qty": 0.25 },
        { "id": "kale", "qty": 0.5 },
        { "id": "apples", "qty": 1 }
      ]
    },
    {
      "id": "crispy-black-bean-tacos-with-feta-and-slaw-by-smitten-kitchen",
      "name": "Crispy black bean tacos with feta and slaw by Smitten Kitchen",
      "url": "https://smittenkitchen.com/2009/02/crispy-black-bean-tacos-with-feta-and-slaw/",
      "image": "https://i0.wp.com/smittenkitchen.com/wp-content/uploads/2009/02/crisp-black-bean-tacos-3-scaled.jpg?fit=1200%2C800&quality=89&ssl=1",
      "totalTime": "20 min",
      "ingredients": [
        { "id": "canned-black-beans", "qty": 1 },
        { "id": "cumin", "qty": 1 },
        { "id": "olive-oil", "qty": 5 },
        { "id": "lime", "qty": 1 },
        { "id": "cabbage", "qty": 1 },
        { "id": "scallions", "qty": 2 },
        { "id": "cilantro", "qty": 1 },
        { "id": "tortillas", "qty": 4 },
        { "id": "feta---goat-cheese", "qty": 0.5 },
        { "id": "hot-sauce", "qty": 1 }
      ]
    },
    {
      "id": "charred-brussels-sprouts-with-olive-oil-and-lemon-by-ottolenghi",
      "name": "Charred brussels sprouts with olive oil and lemon by Ottolenghi",
      "url": "https://ottolenghi.co.uk/pages/recipes/charred-brussels-sprouts-olive-oil-lemon",
      "image": "https://ottolenghi.co.uk/cdn/shop/files/Charred_brussels_sprouts_with_olive_oil_and_lemon.jpg?v=1716838408",
      "activeTime": "30 min",
      "totalTime": "1 hr 25 min",
      "ingredients": [
        { "id": "brussels-sprouts", "qty": 2 },
        { "id": "garlic", "qty": 12 },
        { "id": "green-chili", "qty": 1 },
        { "id": "olive-oil", "qty": 30 },
        { "id": "onion", "qty": 2 },
        { "id": "veggie-stock", "qty": 1 },
        { "id": "lemon", "qty": 2 },
        { "id": "tarragon", "qty": 1 },
        { "id": "dill", "qty": 1 },
        { "id": "parsley", "qty": 1 },
        { "id": "preserved-lemon", "qty": 2 }
      ]
    },
    {
      "id": "dutch-oven-bread-by-the-cookie-rookie",
      "name": "No knead dutch oven bread by The Cookie Rookie",
      "url": "https://www.thecookierookie.com/dutch-oven-bread/",
      "image": "/images/recipes/no-knead-dutch-oven-bread.jpg",
      "activeTime": "20 min",
      "totalTime": "13 hr 10 min",
      "ingredients": [
        { "id": "flour", "qty": 3 },
        { "id": "active-dry-yeast", "qty": 0.5 },
        { "id": "salt", "qty": 1.75 },
        { "id": "fresh-rosemary", "qty": 1 }
      ]
    },
    {
      "id": "caponata",
      "name": "Caponata by The Forest Feast",
      "url": "/recipes/caponata",
      "image": "/images/recipes/caponata.jpg",
      "servings": "Serves 6–8 as an appetizer",
      "activeTime": "30 min",
      "totalTime": "45 min",
      "displayIngredients": [
        "1 eggplant, cut into ½-in (12-mm) cubes",
        "1 onion, cut into ½-in (12-mm) cubes",
        "4 cloves garlic, minced",
        "¼ cup (60 ml) olive oil, plus more as needed",
        "Salt & pepper",
        "3 Roma tomatoes, diced",
        "3 Tbsp red wine vinegar",
        "2 Tbsp capers",
        "1 Tbsp honey",
        "Pine nuts, to garnish",
        "Fresh basil, to garnish"
      ],
      "steps": [
        "Cut the eggplant and onion into ½-in (12-mm) cubes.",
        "Put the cubes in a big skillet along with the minced garlic, a generous amount of olive oil (start with ¼ cup / 60 ml), and a pinch of salt and pepper.",
        "Cook for 15–20 minutes on medium heat, stirring often. Then add the diced Roma tomatoes, red wine vinegar, capers, honey, and a bit more salt and pepper. Cook for another 10 minutes, stirring often.",
        "Transfer to a bowl and garnish with pine nuts and basil."
      ],
      "ingredients": [
        { "id": "eggplant", "qty": 1 },
        { "id": "onion", "qty": 1 },
        { "id": "garlic", "qty": 4 },
        { "id": "roma-tomatoes", "qty": 3 },
        { "id": "red-wine-vinegar", "qty": 3 },
        { "id": "capers", "qty": 2 },
        { "id": "honey", "qty": 1 },
        { "id": "pine-nuts", "qty": 1 },
        { "id": "fresh-basil", "qty": 1 }
      ]
    },
    {
      "id": "summer-corn-and-peach-salad",
      "name": "Summer Corn & Peach Salad by The Forest Feast",
      "url": "/recipes/summer-corn-and-peach-salad",
      "image": "/images/recipes/summer-corn-and-peach-salad.jpg",
      "totalTime": "15 min",
      "displayIngredients": [
        "2 peaches, cut into small cubes",
        "2 ears of corn, kernels cut off",
        "1 cup (145 g) yellow cherry tomatoes, halved",
        "1 small orange bell pepper, diced",
        "¼ red onion, diced",
        "2 Tbsp basil, chopped",
        "2 Tbsp mint, chopped",
        "1 Tbsp olive oil",
        "2 tsp red wine vinegar",
        "2 Tbsp Parmesan, grated (to serve)",
        "Black pepper (to serve)"
      ],
      "steps": [
        "Toss the peaches, corn kernels, cherry tomatoes, orange bell pepper, red onion, basil, mint, olive oil, and red wine vinegar together in a bowl.",
        "Serve in a bowl or on a platter topped with grated Parmesan and a sprinkling of black pepper."
      ],
      "ingredients": [
        { "id": "peaches", "qty": 2 },
        { "id": "corn-on-cob", "qty": 2 },
        { "id": "cherry-tomato", "qty": 5 },
        { "id": "orange-bell-pepper", "qty": 1 },
        { "id": "red-onion", "qty": 0.25 },
        { "id": "fresh-basil", "qty": 1 },
        { "id": "fresh-mint", "qty": 1 },
        { "id": "parmesan", "qty": 1 }
      ]
    },
    {
      "id": "mushroom-croquettes",
      "name": "Mushroom Croquettes by The Forest Feast",
      "url": "/recipes/mushroom-croquettes",
      "image": "/images/recipes/mushroom-croquettes.jpg",
      "totalTime": "40 min",
      "displayIngredients": [
        "1 Russet potato, peeled & cubed",
        "1 sweet potato, peeled & cubed",
        "½ red onion, diced",
        "6 cremini mushrooms, diced",
        "Olive oil",
        "Salt & pepper",
        "About 2 eggs, beaten",
        "About 1 cup (100 g) breadcrumbs",
        "Greek yogurt + hot sauce (or another dipping sauce), to serve"
      ],
      "steps": [
        "Peel, cube & boil the Russet and sweet potato in water for about 10 minutes, or until soft.",
        "Dice & sauté the red onion and cremini mushrooms with olive oil & salt over medium heat, about 5 minutes.",
        "Mash the potatoes with a fork, then stir in the cooked onion-mushroom mixture, plus salt & pepper. Allow to cool a bit, then roll into 1-Tbsp balls.",
        "Dip each ball first in beaten egg (you'll need about 2), then in breadcrumbs (you'll need about 1 cup / 100 g).",
        "Fry the balls in a pan with a thin layer of olive oil on medium heat, turning a few times, until browned & crispy.",
        "Enjoy right away with a dipping sauce — simply mix Greek yogurt with hot sauce, or choose your own."
      ],
      "ingredients": [
        { "id": "russet-potato", "qty": 1 },
        { "id": "sweet-potatoes", "qty": 1 },
        { "id": "red-onion", "qty": 0.5 },
        { "id": "mushrooms", "qty": 4 },
        { "id": "eggs", "qty": 2 },
        { "id": "breadcrumbs", "qty": 1 },
        { "id": "greek-yogurt", "qty": 1 },
        { "id": "hot-sauce", "qty": 1 }
      ]
    },
    {
      "id": "gnocchi-and-cauliflower-casserole",
      "name": "Gnocchi + Cauliflower Casserole by The Forest Feast",
      "url": "/recipes/gnocchi-and-cauliflower-casserole",
      "image": "/images/recipes/gnocchi-and-cauliflower-casserole.jpg",
      "totalTime": "25 min",
      "displayIngredients": [
        "1 small head cauliflower, cut into florets (about 4 cups / 530 g)",
        "17-oz (480 g) package gnocchi",
        "1 cup (100 g) Parmesan, grated",
        "2 Tbsp butter",
        "2 tsp olive oil",
        "Salt & black pepper"
      ],
      "steps": [
        "In a big pot of water, boil the cauliflower for 3 minutes, then throw in the gnocchi. Cook for 2 more minutes, or until the gnocchi floats, then turn the burner off & strain everything.",
        "Put the cauliflower & gnocchi back in the hot pot & stir in ¾ cup (70 g) of the Parmesan plus the butter, olive oil, several grinds of black pepper & a couple pinches of salt.",
        "Spread the mixture into an 8×8-in (20×20-cm) casserole dish. Sprinkle the remaining ¼ cup (30 g) Parmesan on top, plus a bit more salt & pepper.",
        "Broil for 3 minutes, or until the top is golden. Serve hot."
      ],
      "ingredients": [
        { "id": "cauliflower", "qty": 1 },
        { "id": "gnocchi", "qty": 1 },
        { "id": "parmesan", "qty": 4 },
        { "id": "butter", "qty": 2 }
      ]
    },
    {
      "id": "mini-artichoke-lasagnas",
      "name": "Mini Artichoke Lasagnas by The Forest Feast",
      "url": "/recipes/mini-artichoke-lasagnas",
      "image": "/images/recipes/mini-artichoke-lasagnas.jpg",
      "servings": "Makes 4",
      "activeTime": "15 min",
      "totalTime": "45 min",
      "displayIngredients": [
        "1 cup (240 ml) marinara sauce",
        "6 oz (170 g) fresh mozzarella, sliced",
        "4 Tbsp marinated artichoke hearts, chopped",
        "4 strips no-boil lasagna noodles, broken into pieces",
        "½ cup (50 g) Parmesan, grated",
        "Fresh basil, salt & pepper, to serve"
      ],
      "steps": [
        "Put a spoonful of marinara in the bottom of each of 4 (3½-in / 9-cm) ramekins, then layer all other ingredients except the Parmesan, which goes on top. Try to give each ramekin 3 layers of noodles, and always make sure some sauce is covering the noodles.",
        "Bake at 375°F (190°C) for 25–30 minutes.",
        "Cool a bit before serving, and top each with fresh basil, salt & pepper."
      ],
      "ingredients": [
        { "id": "marinara-sauce", "qty": 1 },
        { "id": "fresh-mozzarella", "qty": 6 },
        { "id": "marinated-artichoke-hearts", "qty": 4 },
        { "id": "no-boil-lasagna-noodles", "qty": 4 },
        { "id": "parmesan", "qty": 2 }
      ]
    },
    {
      "id": "charred-broccoli-with-onions",
      "name": "Charred Broccoli with Onions by The Forest Feast",
      "url": "/recipes/charred-broccoli-with-onions",
      "image": "/images/recipes/charred-broccoli-with-onions.jpg",
      "totalTime": "35 min",
      "displayIngredients": [
        "2 heads broccoli, broken into florets",
        "1 large red onion, sliced into medium pieces",
        "Olive oil, to drizzle generously (at least 2 Tbsp)",
        "Red pepper flakes (about ¼ tsp)",
        "2 cloves garlic, minced",
        "Salt & pepper, to taste"
      ],
      "steps": [
        "On a baking sheet, combine the broccoli florets and sliced red onion. Drizzle generously with olive oil (at least 2 Tbsp), then sprinkle with red pepper flakes (about ¼ tsp), minced garlic, and a few pinches of salt & pepper.",
        "Bake at 425°F (220°C) for 25 minutes, tossing once, until some edges are blackened & crispy.",
        "Enjoy right away, as the florets lose crispiness as they cool."
      ],
      "ingredients": [
        { "id": "broccoli", "qty": 2 },
        { "id": "red-onion", "qty": 1 },
        { "id": "garlic", "qty": 2 }
      ]
    }
  ]
};
