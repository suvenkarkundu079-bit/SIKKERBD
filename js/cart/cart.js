// =========================================
// SIKKER — Modern Cart & Drawer System
// =========================================

(function () {
    "use strict";

    const GUEST_CART_KEY = "sikkerGuestCart";
    const APPLIED_COUPON_KEY = "sikkerAppliedCoupon";
    const FREE_DELIVERY_THRESHOLD = 1250;

    // Available fallback coupons
    const FALLBACK_COUPONS = [
        { code: "SIKKER10", type: "percentage", value: 10, minOrder: 500, description: "10% off on all drinkware items", enabled: true },
        { code: "SIKKER100", type: "fixed", value: 100, minOrder: 800, description: "৳100 flat discount on orders over ৳800", enabled: true },
        { code: "WELCOME50", type: "fixed", value: 50, minOrder: 400, description: "৳50 off your first purchase", enabled: true },
        { code: "FREESHIP", type: "shipping", value: 100, minOrder: 0, description: "Free nationwide courier delivery", enabled: true }
    ];

    function loadGuestCart() {
        try {
            const data = sessionStorage.getItem(GUEST_CART_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    let guestCart = loadGuestCart();

    function isLoggedIn() {
        return window.SIKKERAccount && typeof window.SIKKERAccount.isLoggedIn === "function" && window.SIKKERAccount.isLoggedIn();
    }

    function getActiveCart() {
        if (isLoggedIn()) {
            return window.SIKKERAccount.getAccountCart();
        }
        return guestCart;
    }

    function saveCart(cart) {
        const cleanCart = Array.isArray(cart) ? cart : [];
        if (isLoggedIn()) {
            window.SIKKERAccount.saveAccountCart(cleanCart);
        } else {
            guestCart = cleanCart;
            try {
                sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
            } catch (e) {}
        }
        updateCartCount();
    }

    function findCartItem(productId) {
        return getActiveCart().find(item => String(item.productId) === String(productId));
    }

    function addToCart(product, quantity = 1) {
        if (!product || !product.id) return false;

        const qty = Math.max(1, parseInt(quantity, 10) || 1);
        const maxStock = Number(product.stock) || 50;
        const cart = getActiveCart();
        const existing = cart.find(item => String(item.productId) === String(product.id));

        if (existing) {
            existing.quantity = Math.min(Number(existing.quantity) + qty, maxStock);
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                category: product.category || "Drinkware",
                price: Number(product.price),
                originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
                image: product.image,
                localImage: product.localImage || product.image,
                size: product.size || "",
                quantity: Math.min(qty, maxStock)
            });
        }

        saveCart(cart);
        renderCartDrawer();
        refreshCartPage();
        return true;
    }

    function removeFromCart(productId) {
        const cart = getActiveCart();
        const index = cart.findIndex(item => String(item.productId) === String(productId));

        if (index !== -1) {
            const removed = cart.splice(index, 1)[0];
            saveCart(cart);
            renderCartDrawer();
            refreshCartPage();
            if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function" && removed) {
                window.SIKKERUI.showToast(`Removed "${removed.name}" from cart`, "info");
            }
        }
    }

    function updateCartQuantity(productId, quantity, maxStock = null) {
        const cart = getActiveCart();
        const item = cart.find(i => String(i.productId) === String(productId));
        if (!item) return;

        const newQty = parseInt(quantity, 10);
        if (isNaN(newQty) || newQty <= 0) {
            removeFromCart(productId);
            return;
        }

        const limit = maxStock !== null ? Number(maxStock) : 50;
        item.quantity = Math.min(newQty, limit);
        saveCart(cart);
        renderCartDrawer();
        refreshCartPage();
    }

    function getCart() {
        return getActiveCart();
    }

    function getCartItemCount() {
        return getActiveCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    }

    function getCartSubtotal() {
        return getActiveCart().reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
    }

    function clearCart() {
        saveCart([]);
        clearAppliedCoupon();
        renderCartDrawer();
        refreshCartPage();
    }

    function updateCartCount() {
        const count = getCartItemCount();
        document.querySelectorAll("#cart-count, .cart-count").forEach(el => {
            el.textContent = count;
            el.setAttribute("aria-label", `${count} items in cart`);
            el.style.display = count > 0 ? "inline-flex" : "inline-flex";
            el.classList.remove("bump");
            void el.offsetWidth;
            el.classList.add("bump");
        });
    }

    // -----------------------------------------
    // Coupon Management
    // -----------------------------------------
    function getAppliedCoupon() {
        try {
            const data = sessionStorage.getItem(APPLIED_COUPON_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    function applyCoupon(couponCode) {
        if (!couponCode) return { success: false, message: "Please enter a coupon code." };

        const code = couponCode.trim().toUpperCase();
        const coupon = FALLBACK_COUPONS.find(c => c.code === code && c.enabled);

        if (!coupon) {
            return { success: false, message: `Coupon code "${code}" is invalid or expired.` };
        }

        const subtotal = getCartSubtotal();
        if (coupon.minOrder && subtotal < coupon.minOrder) {
            return { success: false, message: `This coupon requires a minimum subtotal of ৳${coupon.minOrder}.` };
        }

        sessionStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(coupon));
        renderCartDrawer();
        refreshCartPage();

        if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function") {
            window.SIKKERUI.showToast(`Coupon "${coupon.code}" applied successfully!`, "success");
        }

        return { success: true, message: `Coupon "${coupon.code}" applied!`, coupon };
    }

    function clearAppliedCoupon() {
        sessionStorage.removeItem(APPLIED_COUPON_KEY);
        renderCartDrawer();
        refreshCartPage();
    }

    function calculateDiscount(subtotal) {
        const coupon = getAppliedCoupon();
        if (!coupon) return 0;

        if (coupon.type === "percentage") {
            return Math.round((subtotal * coupon.value) / 100);
        } else if (coupon.type === "fixed") {
            return Math.min(coupon.value, subtotal);
        }
        return 0;
    }

    // -----------------------------------------
    // Path Helpers for Drawer
    // -----------------------------------------
    function getPrefix() {
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

    // -----------------------------------------
    // Cart Drawer HTML & Animation
    // -----------------------------------------
    function createCartDrawer() {
        let drawer = document.getElementById("sikker-cart-drawer");
        if (!drawer) {
            drawer = document.createElement("aside");
            drawer.id = "sikker-cart-drawer";
            drawer.className = "sikker-cart-drawer";
            drawer.setAttribute("aria-hidden", "true");
            document.body.appendChild(drawer);
        }

        if (drawer.querySelector(".cart-drawer-panel")) {
            return drawer;
        }

        const prefix = getPrefix();

        drawer.innerHTML = `
            <div class="cart-drawer-overlay" id="cart-drawer-overlay" aria-hidden="true"></div>
            <div class="cart-drawer-panel" role="dialog" aria-modal="true" aria-label="Shopping Cart">
                <div class="cart-drawer-header">
                    <div class="cart-drawer-title-wrap">
                        <h2>Your Shopping Bag</h2>
                        <span class="cart-drawer-items-count">(<span class="cart-count">0</span>)</span>
                    </div>
                    <button type="button" id="cart-drawer-close" class="cart-drawer-close" aria-label="Close cart">&times;</button>
                </div>

                <div class="cart-drawer-delivery-meter" id="cart-drawer-meter">
                    <div class="meter-text" id="meter-text">Loading delivery info...</div>
                    <div class="meter-bar-track">
                        <div class="meter-bar-fill" id="meter-bar-fill" style="width: 0%"></div>
                    </div>
                </div>

                <div id="cart-drawer-items" class="cart-drawer-items"></div>

                <div class="cart-drawer-footer">
                    <div class="cart-drawer-subtotal">
                        <span>Subtotal</span>
                        <strong id="cart-drawer-subtotal">৳0</strong>
                    </div>
                    <p class="cart-drawer-tax-note">Taxes and nationwide delivery calculated at checkout.</p>
                    <div class="cart-drawer-actions">
                        <a href="${prefix}pages/cart.html" class="cart-drawer-view-cart">View Bag</a>
                        <a href="${prefix}pages/checkout.html" class="cart-drawer-checkout">Checkout &rarr;</a>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("cart-drawer-close").addEventListener("click", closeCartDrawer);
        document.getElementById("cart-drawer-overlay").addEventListener("click", closeCartDrawer);

        // Escape key listener for drawer
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && drawer.classList.contains("open")) {
                closeCartDrawer();
            }
        });

        renderCartDrawer();
    }

    function renderCartDrawer() {
        const container = document.getElementById("cart-drawer-items");
        const subtotalEl = document.getElementById("cart-drawer-subtotal");
        const meterTextEl = document.getElementById("meter-text");
        const meterFillEl = document.getElementById("meter-bar-fill");

        if (!container || !subtotalEl) return;

        const cart = getActiveCart();
        const subtotal = getCartSubtotal();
        const prefix = getPrefix();

        // Update Delivery Progress Meter
        if (meterTextEl && meterFillEl) {
            if (subtotal >= FREE_DELIVERY_THRESHOLD) {
                meterTextEl.innerHTML = `🎉 <strong>Congratulations!</strong> You've unlocked <strong>Free Nationwide Delivery</strong>.`;
                meterFillEl.style.width = "100%";
                meterFillEl.style.backgroundColor = "#166534";
            } else {
                const diff = FREE_DELIVERY_THRESHOLD - subtotal;
                const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
                meterTextEl.innerHTML = `Add <strong>৳${diff.toLocaleString("en-BD")}</strong> more for <strong>Free Delivery</strong>`;
                meterFillEl.style.width = `${pct}%`;
                meterFillEl.style.backgroundColor = "#e05929";
            }
        }

        subtotalEl.textContent = `৳${subtotal.toLocaleString("en-BD")}`;

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="cart-drawer-empty">
                    <div class="empty-cart-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8c8275" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    </div>
                    <h3>Your bag is empty</h3>
                    <p>Discover our handpicked collection of ceramic mugs and borosilicate glassware.</p>
                    <a href="${prefix}pages/collections/index.html" class="cart-drawer-browse-btn" onclick="SIKKERCart.closeCartDrawer()">
                        Start Exploring
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = cart.map(item => {
            let rawImg = item.image || "";
            let fallbackRaw = item.localImage || (item.image && !item.image.startsWith("http") ? item.image : "images/placeholder.jpg");
            if (fallbackRaw.startsWith("/")) fallbackRaw = fallbackRaw.substring(1);
            const fallbackSrc = `${prefix}${fallbackRaw}`;

            let imgSrc = "";
            if (rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
                imgSrc = rawImg;
            } else {
                if (rawImg.startsWith("/")) rawImg = rawImg.substring(1);
                imgSrc = rawImg ? `${prefix}${rawImg}` : fallbackSrc;
            }

            return `
                <article class="cart-drawer-item" data-drawer-product-id="${item.productId}">
                    <div class="drawer-item-img-wrap">
                        <img src="${imgSrc}" alt="${item.name}" class="drawer-item-img" onerror="this.onerror=null; this.src='${fallbackSrc}';">
                    </div>
                    <div class="drawer-item-info">
                        <div class="drawer-item-header">
                            <h4 class="drawer-item-title">${item.name}</h4>
                            <button type="button" class="drawer-item-remove" data-remove-id="${item.productId}" aria-label="Remove ${item.name}">&times;</button>
                        </div>
                        ${item.size ? `<span class="drawer-item-meta">${item.size}</span>` : ""}
                        <div class="drawer-item-bottom">
                            <div class="drawer-qty-stepper">
                                <button type="button" class="drawer-qty-btn drawer-minus" data-qty-id="${item.productId}" aria-label="Decrease quantity">−</button>
                                <span class="drawer-qty-val">${item.quantity}</span>
                                <button type="button" class="drawer-qty-btn drawer-plus" data-qty-id="${item.productId}" aria-label="Increase quantity">+</button>
                            </div>
                            <span class="drawer-item-price">৳${(Number(item.price) * Number(item.quantity)).toLocaleString("en-BD")}</span>
                        </div>
                    </div>
                </article>
            `;
        }).join("");

        wireDrawerButtons();
    }

    function wireDrawerButtons() {
        document.querySelectorAll(".drawer-minus").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.qtyId;
                const item = findCartItem(id);
                if (item) {
                    updateCartQuantity(id, Number(item.quantity) - 1);
                }
            });
        });

        document.querySelectorAll(".drawer-plus").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.qtyId;
                const item = findCartItem(id);
                if (item) {
                    let stock = 50;
                    if (window.SIKKERProducts) {
                        const products = await window.SIKKERProducts.loadProducts();
                        const prod = window.SIKKERProducts.getProductById(products, id);
                        if (prod) stock = prod.stock;
                    }
                    updateCartQuantity(id, Number(item.quantity) + 1, stock);
                }
            });
        });

        document.querySelectorAll(".drawer-item-remove").forEach(btn => {
            btn.addEventListener("click", () => {
                const itemEl = btn.closest(".cart-drawer-item");
                if (itemEl) {
                    itemEl.classList.add("removing");
                    setTimeout(() => {
                        removeFromCart(btn.dataset.removeId);
                    }, 240);
                } else {
                    removeFromCart(btn.dataset.removeId);
                }
            });
        });
    }

    function openCartDrawer() {
        const drawer = createCartDrawer();
        renderCartDrawer();
        if (drawer) {
            drawer.setAttribute("aria-hidden", "false");
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    drawer.classList.add("open");
                    document.body.classList.add("cart-drawer-open");
                });
            });
        }
    }

    function closeCartDrawer() {
        const drawer = document.getElementById("sikker-cart-drawer");
        if (drawer) {
            drawer.classList.remove("open");
            drawer.setAttribute("aria-hidden", "true");
            document.body.classList.remove("cart-drawer-open");
        }
    }

    function refreshCartPage() {
        if (typeof window.renderSIKKERCartPage === "function") {
            window.renderSIKKERCartPage();
        }
    }

    // Global Click Delegation for Cart Buttons
    document.addEventListener("click", (e) => {
        const cartTrigger = e.target.closest("#cart-button, .cart-button, a[href*='cart.html'][aria-label*='cart']");
        // Only open drawer if it's a button or explicit drawer trigger, not direct navigation if on cart page
        if (cartTrigger) {
            const isCartPage = window.location.pathname.toLowerCase().endsWith("cart.html");
            if (!isCartPage) {
                e.preventDefault();
                openCartDrawer();
            }
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        createCartDrawer();
        updateCartCount();
    });

    window.SIKKERCart = {
        findCartItem,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCart,
        getCartItemCount,
        getCartSubtotal,
        clearCart,
        updateCartCount,
        getAppliedCoupon,
        applyCoupon,
        clearAppliedCoupon,
        calculateDiscount,
        openCartDrawer,
        closeCartDrawer,
        renderCartDrawer
    };

    window.addToCart = addToCart;
    window.removeFromCart = removeFromCart;
    window.updateCartQuantity = updateCartQuantity;
    window.openCartDrawer = openCartDrawer;
    window.closeCartDrawer = closeCartDrawer;
})();