(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) module.exports = factory(require('./unit-conversion.js'));
    else root.ShoppingUnits = factory(root.UnitConversion);
})(typeof self !== 'undefined' ? self : this, function (conversion) {
    function mergeCompatibleUnits(list, defs) {
        const groups = new Map();
        for (const [key, item] of Object.entries(list)) {
            const name = item.originalName.toLowerCase().trim();
            const unit = item.units.toLowerCase().trim();
            const info = conversion.UNIT_INFO[unit];
            const slug = conversion.findSlugByName(name, defs);
            const knownDensity = Object.prototype.hasOwnProperty.call(conversion.DENSITY, slug);
            const family = info ? (knownDensity ? 'measured' : info.type) : unit;
            const groupKey = JSON.stringify([name, family]);
            if (!groups.has(groupKey)) groups.set(groupKey, []);
            groups.get(groupKey).push({ key, item, unit, slug });
        }
        const result = {};
        for (const entries of groups.values()) {
            const first = entries[0];
            const merged = { ...first.item, recipes: new Set(first.item.recipes || []) };
            for (const entry of entries.slice(1)) {
                const qty = conversion.convertQty(entry.item.quantity, entry.unit, first.unit, first.slug);
                if (qty === null) { result[entry.key] = entry.item; continue; }
                merged.quantity += qty;
                for (const recipe of entry.item.recipes || []) merged.recipes.add(recipe);
            }
            result[first.key] = merged;
        }
        return result;
    }
    return { mergeCompatibleUnits };
});
