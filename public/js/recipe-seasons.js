// Generated from Seasons.csv by python3 scripts/build-season-map.py.
// Filter lookup only: no season fields or badges are added to recipe objects.
(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) module.exports = factory();
    else root.RecipeSeasons = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
    const byRecipeId = {
    "caponata": [
        "Summer",
        "Fall"
    ],
    "summer-corn-and-peach-salad": [
        "Spring",
        "Summer"
    ],
    "mushroom-croquettes": [
        "Fall",
        "Winter"
    ],
    "gnocchi-and-cauliflower-casserole": [
        "Fall",
        "Winter"
    ],
    "mini-artichoke-lasagnas": [
        "Spring",
        "Fall",
        "Winter"
    ],
    "charred-broccoli-with-onions": [
        "Spring",
        "Fall",
        "Winter"
    ],
    "baked-farro-with-summer-vegetables-by-smitten-kitchen": [
        "Summer"
    ],
    "baked-mediterranean-veggies": [
        "Spring",
        "Summer"
    ],
    "broccoli-farro-salad-by-smitten-kitchen": [
        "Spring",
        "Fall"
    ],
    "burrito-bowls": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ],
    "caprese-sandwiches": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ],
    "chickpea-and-carrot-curry": [
        "Fall",
        "Winter"
    ],
    "creamy-mushroom-pasta-by-bon-appetit": [
        "Fall",
        "Winter"
    ],
    "enchilada-bake": [
        "Fall",
        "Winter"
    ],
    "haricots-verts-with-minty-tahini-by-ottolenghi": [
        "Spring",
        "Summer"
    ],
    "mango-coconut-salad": [
        "Spring",
        "Summer"
    ],
    "marry-me-beans": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ],
    "mushroom-buratta-pizza-by-good-eggs": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ],
    "mushroom-ravioli": [
        "Fall",
        "Winter"
    ],
    "one-pot-farro-with-tomato-by-smitten-kitchen": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ],
    "pea-fritters": [
        "Spring"
    ],
    "rice-salad-ottolength": [
        "Fall",
        "Winter"
    ],
    "peach-panzanella-with-burrata-and-mint-by-good-eggs": [
        "Summer"
    ],
    "quinoa-spaghetti-with-broccoli": [
        "Spring",
        "Fall",
        "Winter"
    ],
    "roast-butternut-squash-and-red-onion-with-zaatar-tahini-by-ottolenghi": [
        "Fall",
        "Winter"
    ],
    "roasted-tomatoes-with-garlic-by-smitten-kitchen": [
        "Summer",
        "Fall"
    ],
    "roasted-yams-and-chickpeas-with-yogurt-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "shakshuka-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "simple-cauliflower-tacos-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "simple-eggplant-parmesan": [
        "Summer",
        "Fall",
        "Winter"
    ],
    "skillet-pasta-with-5-cheeses-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "spaghetti-aglio-e-olio-by-bon-appetit": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ],
    "sweet-potato-pita-pocket": [
        "Fall",
        "Winter"
    ],
    "ricotta-gnocchi": [
        "Spring",
        "Fall",
        "Winter"
    ],
    "veggie-jumble": [
        "Summer",
        "Fall"
    ],
    "three-bean-chili-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "souffled-macaroni-cheese-by-delia-smith": [
        "Fall",
        "Winter"
    ],
    "apple-and-cheddar-crisp-salad-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "crispy-black-bean-tacos-with-feta-and-slaw-by-smitten-kitchen": [
        "Fall",
        "Winter"
    ],
    "charred-brussels-sprouts-with-olive-oil-and-lemon-by-ottolenghi": [
        "Fall",
        "Winter"
    ],
    "dutch-oven-bread-by-the-cookie-rookie": [
        "Spring",
        "Summer",
        "Fall",
        "Winter"
    ]
};
    function matches(recipeId, selected) {
        if (!selected || selected.length === 0) return true;
        const seasons = byRecipeId[recipeId] || [];
        return selected.some(season => seasons.includes(season));
    }
    return { SEASONS, byRecipeId, matches };
});
