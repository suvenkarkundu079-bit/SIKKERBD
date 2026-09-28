// =========================================
// SIKKER — Enhanced Combo Engine
// =========================================

(function () {
    "use strict";

    const COMBO_DISCOUNT_RATE = 0.15;

    // Embedded reliable fallback combos
    const FALLBACK_COMBOS = [
        {
            id: "combo-01",
            name: "The Morning Ritual Duo",
            tagline: "Handcrafted Ceramic & Borosilicate Saucer",
            description: "Pair our signature handmade ceramic mug with an ultra-clear borosilicate saucer cup for the ultimate morning brew.",
            image: "images/products/classic-ceramic/ceramic-1.jpg",
            products: ["ceramic-001", "boro-001"],
            originalPrice: 1100,
            comboPrice: 920,
            savings: 180,
            badge: "Popular Bundle"
        },
        {
            id: "combo-02",
            name: "Double Wall Barista Pair",
            tagline: "Thermal Optical Glassware Set",
            description: "Includes one Cappuccino Double Wall Cup and one Tall Latte Double Wall Glass. Keep hands cool and drinks piping hot.",
            image: "images/products/double-wall-glass/double-wall-1.jpg",
            products: ["dwg-001", "dwg-002"],
            originalPrice: 1100,
            comboPrice: 950,
            savings: 150,
            badge: "Barista Pick"
        },
        {
            id: "combo-03",
            name: "Commuter & Desk Essentials",
            tagline: "Eco Splash-Proof Tumbler + Mood Mug",
            description: "Stay caffeinated on your morning commute with our Splash-Proof Tumbler and enjoy quiet focus at your desk with our Mood Mug.",
            image: "images/products/travel-tumbler/travel-tumbler-1.jpg",
            products: ["tumbler-001", "stmt-001"],
            originalPrice: 1200,
            comboPrice: 990,
            savings: 210,
            badge: "Best Value"
        },
        {
            id: "combo-04",
            name: "Royal High Tea Porcelain Duo",
            tagline: "Fine Bone China Elegance",
            description: "Elevate afternoon tea with the Nordic Pastel Porcelain Set and Royal White Bone China Cappuccino Cup.",
            image: "images/products/premium-porcelain/porcelain-1.jpg",
            products: ["porcelain-001", "porcelain-002"],
            originalPrice: 1400,
            comboPrice: 1190,
            savings: 210,
            badge: "Luxury Gift"
        },
        {
            id: "combo-05",
            name: "Artisan Stoneware & Tea Set",
            tagline: "Heavy-Duty Reactive Glaze + Teak Saucer",
            description: "Earth-toned textured stoneware mug paired with a heat-resistant teak saucer tea cup.",
            image: "images/products/artisan-stoneware/artisan-1.jpg",
            products: ["artisan-001", "boro-007"],
            originalPrice: 1850,
            comboPrice: 1550,
            savings: 300,
            badge: "Connoisseur Choice"
        },
        {
            id: "combo-06",
            name: "The Introvert's Coffee Sanctuary",
            tagline: "Statement Mood Mug + Double Wall Glass",
            description: "For slow weekends and uninterrupted coffee thinking. Includes our 'Cute But Overthinker' Mug and Insulated Double Wall Cup.",
            image: "images/products/statement-mugs/statement-mugs-1.jpg",
            products: ["stmt-001", "dwg-001"],
            originalPrice: 970,
            comboPrice: 820,
            savings: 150,
            badge: "Top Rated"
        }
    ];

    function getDataPath() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes("/pages/collections/") || path.includes("/pages/account/") || 
            path.includes("/pages/orders/") || path.includes("/pages/legal/") || 
            path.includes("/pages/support/") || path.includes("/pages/product/")) {
            return "../../data/combos/combo.json";
        } else if (path.includes("/pages/")) {
            return "../data/combos/combo.json";
        }
        return "data/combos/combo.json";
    }

    async function loadCombos() {
        try {
            const url = getDataPath();
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.combos) && data.combos.length > 0) {
                    return data.combos;
                }
            }
        } catch (error) {
            console.warn("Combo fetch fallback to embedded data:", error.message);
        }
        return FALLBACK_COMBOS;
    }

    function calculateComboPrice(products) {
        if (!Array.isArray(products) || products.length === 0) {
            return {
                originalTotal: 0,
                discountedPrice: 0
            };
        }

        const originalTotal = products.reduce((total, product) => {
            return total + Number(product.price || 0);
        }, 0);

        const discountedTotal = originalTotal * (1 - COMBO_DISCOUNT_RATE);
        const roundedPrice = Math.round(discountedTotal / 10) * 10;

        return {
            originalTotal,
            discountedPrice: roundedPrice
        };
    }

    function getComboProducts(combo, products) {
        if (!combo || !Array.isArray(combo.products) || !Array.isArray(products)) {
            return [];
        }

        return combo.products
            .map(productId => products.find(product => product.id === productId))
            .filter(Boolean);
    }

    function isComboAvailable(comboProducts) {
        if (!Array.isArray(comboProducts) || comboProducts.length === 0) {
            return false;
        }
        return comboProducts.every(product => Number(product.stock) > 0);
    }

    function prepareCombo(combo, products) {
        const comboProducts = getComboProducts(combo, products);

        if (!isComboAvailable(comboProducts)) {
            return {
                ...combo,
                available: false,
                products: comboProducts,
                originalTotal: combo.originalPrice || 0,
                finalPrice: combo.comboPrice || 0
            };
        }

        const price = calculateComboPrice(comboProducts);
        const originalTotal = combo.originalPrice || price.originalTotal;
        const finalPrice = combo.comboPrice || price.discountedPrice;

        return {
            ...combo,
            available: true,
            products: comboProducts,
            originalTotal,
            finalPrice
        };
    }

    function prepareCombos(combos, products) {
        if (!Array.isArray(combos) || !Array.isArray(products)) {
            return [];
        }

        return combos.map(combo => prepareCombo(combo, products));
    }

    function getAvailableCombos(combos, products) {
        return prepareCombos(combos, products).filter(combo => combo.available);
    }

    window.SIKKERCombos = {
        loadCombos,
        calculateComboPrice,
        getComboProducts,
        isComboAvailable,
        prepareCombo,
        prepareCombos,
        getAvailableCombos,
        FALLBACK_COMBOS
    };
})();