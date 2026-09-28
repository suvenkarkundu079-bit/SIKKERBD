// =========================================
// SIKKER — Modern Interactive Product Card
// =========================================

(function () {
    "use strict";

    function getRootPrefix() {
        const path = window.location.pathname.toLowerCase().replace(/\\/g, "/");
        if (/\/pages\/collections\/[^\/]+\//.test(path) || 
            path.includes("/pages/collections/classic-ceramic/") ||
            path.includes("/pages/collections/borosilicate-glass/") || 
            path.includes("/pages/collections/double-wall-glass/") ||
            path.includes("/pages/collections/premium-porcelain/") || 
            path.includes("/pages/collections/artisan-stoneware/") ||
            path.includes("/pages/collections/statement-mugs/") || 
            path.includes("/pages/collections/travel-tumbler/")) {
            return "../../../";
        } else if (path.includes("/pages/collections/") || 
                   path.includes("/pages/account/") || 
                   path.includes("/pages/orders/") || 
                   path.includes("/pages/legal/") || 
                   path.includes("/pages/support/") || 
                   path.includes("/pages/product/")) {
            return "../../";
        } else if (path.includes("/pages/")) {
            return "../";
        }
        return "";
    }

    function getRelativeProductPrefix() {
        const root = getRootPrefix();
        return `${root}pages/product/product.html`;
    }

    function getRelativeImagePrefix() {
        return getRootPrefix();
    }

    function createProductCard(product) {
        if (!product) return "";

        const productUrl = `${getRelativeProductPrefix()}?id=${product.id}`;
        const imgPrefix = getRelativeImagePrefix();

        let rawImg = product.image || "";
        if (rawImg.startsWith("/")) rawImg = rawImg.substring(1);
        let imageSrc = "";
        if (rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
            imageSrc = rawImg;
        } else {
            imageSrc = rawImg ? `${imgPrefix}${rawImg}` : `${imgPrefix}images/placeholder.jpg`;
        }
        const fallbackSrc = `${imgPrefix}images/placeholder.jpg`;

        const isWishlisted = window.SIKKERWishlist && typeof window.SIKKERWishlist.isInWishlist === "function" 
            ? window.SIKKERWishlist.isInWishlist(product.id) 
            : false;

        const hasDiscount = product.originalPrice && Number(product.originalPrice) > Number(product.price);
        const discountPct = hasDiscount ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        let badgeHtml = "";
        if (product.bestSeller) {
            badgeHtml = `<span class="product-badge badge-bestseller">Best Seller</span>`;
        } else if (hasDiscount) {
            badgeHtml = `<span class="product-badge badge-sale">Save ${discountPct}%</span>`;
        } else if (product.featured) {
            badgeHtml = `<span class="product-badge badge-featured">Featured</span>`;
        }

        const ratingVal = product.rating || 4.8;
        const reviewCount = product.reviewCount || 16;

        return `
            <article class="sikker-product-card" data-product-id="${product.id}">
                <div class="product-card-media">
                    <a href="${productUrl}" class="product-card-img-link" aria-label="${product.name}">
                        <img 
                            src="${imageSrc}" 
                            alt="${product.name}" 
                            class="product-card-img" 
                            loading="lazy"
                            onerror="this.onerror=null; this.src='${fallbackSrc}';"
                        >
                    </a>

                    ${badgeHtml ? `<div class="product-card-badges">${badgeHtml}</div>` : ""}

                    <button 
                        type="button" 
                        class="product-card-wishlist ${isWishlisted ? 'active' : ''}" 
                        data-wishlist-id="${product.id}"
                        aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
                        title="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
                    >
                        ${isWishlisted ? '♥' : '♡'}
                    </button>

                    <div class="product-card-quick-actions">
                        <button 
                            type="button" 
                            class="product-card-quick-add" 
                            data-quick-add-id="${product.id}"
                            aria-label="Quick add ${product.name} to cart"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            <span>Quick Add</span>
                        </button>
                    </div>
                </div>

                <div class="product-card-body">
                    <div class="product-card-meta">
                        <span class="product-card-category">${product.category || 'Drinkware'}</span>
                        <div class="product-card-rating" title="${ratingVal} out of 5 stars">
                            <span class="rating-stars">★★★★★</span>
                            <span class="rating-number">${ratingVal}</span>
                            <span class="rating-count">(${reviewCount})</span>
                        </div>
                    </div>

                    <h3 class="product-card-title">
                        <a href="${productUrl}">${product.name}</a>
                    </h3>

                    ${product.size ? `<span class="product-card-size">${product.size}</span>` : ""}

                    <div class="product-card-pricing">
                        <span class="price-current">৳${Number(product.price).toLocaleString("en-BD")}</span>
                        ${hasDiscount ? `<span class="price-original">৳${Number(product.originalPrice).toLocaleString("en-BD")}</span>` : ""}
                    </div>
                </div>
            </article>
        `;
    }

    function wireProductCardEvents(container) {
        if (!container) return;

        // Quick Add to Cart Buttons
        container.querySelectorAll(".product-card-quick-add").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productId = btn.dataset.quickAddId;
                if (!productId) return;

                let product = null;
                if (window.SIKKERProducts) {
                    const products = await window.SIKKERProducts.loadProducts();
                    product = window.SIKKERProducts.getProductById(products, productId);
                }

                if (product && window.SIKKERCart) {
                    const originalHtml = btn.innerHTML;
                    btn.classList.add("adding");
                    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Added!`;

                    window.SIKKERCart.addToCart(product, 1);

                    if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function") {
                        window.SIKKERUI.showToast(`Added "${product.name}" to cart!`, "success");
                    }

                    setTimeout(() => {
                        btn.classList.remove("adding");
                        btn.innerHTML = originalHtml;
                    }, 1200);

                    // Open cart drawer after quick add
                    setTimeout(() => {
                        window.SIKKERCart.openCartDrawer();
                    }, 300);
                }
            });
        });

        // Wishlist Toggle Buttons
        container.querySelectorAll(".product-card-wishlist").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const productId = btn.dataset.wishlistId;
                if (!productId || !window.SIKKERWishlist) return;

                let product = null;
                if (window.SIKKERProducts) {
                    const products = await window.SIKKERProducts.loadProducts();
                    product = window.SIKKERProducts.getProductById(products, productId);
                }

                if (!product) return;

                if (window.SIKKERWishlist.isInWishlist(productId)) {
                    window.SIKKERWishlist.removeFromWishlist(productId);
                    btn.classList.remove("active");
                    btn.textContent = "♡";
                    btn.title = "Add to wishlist";
                    if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function") {
                        window.SIKKERUI.showToast(`Removed from wishlist.`, "info");
                    }
                } else {
                    window.SIKKERWishlist.addToWishlist(product);
                    btn.classList.add("active");
                    btn.textContent = "♥";
                    btn.title = "Remove from wishlist";
                    if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function") {
                        window.SIKKERUI.showToast(`Added "${product.name}" to wishlist!`, "success");
                    }
                }
            });
        });
    }

    function renderProductCards(products, container) {
        if (!container) return;

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = `
                <div class="products-empty-state">
                    <p class="products-empty-title">No products found</p>
                    <p class="products-empty-subtitle">Try exploring another category or check back soon.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => createProductCard(product)).join("");
        wireProductCardEvents(container);
    }

    window.SIKKERProductCard = {
        createProductCard,
        renderProductCards,
        wireProductCardEvents
    };

    window.createProductCard = createProductCard;
    window.renderProductCards = renderProductCards;
})();