// =========================================
// SIKKER — Master Application Controller
// =========================================

document.addEventListener("DOMContentLoaded", async () => {
    "use strict";

    // 1. Populate Dynamic Product Grids on Homepage if present
    const featuredGrid = document.getElementById("featured-products-grid");
    const newArrivalsGrid = document.getElementById("new-arrivals-grid");
    const bestSellersGrid = document.getElementById("best-sellers-grid");

    if (window.SIKKERProducts && (featuredGrid || newArrivalsGrid || bestSellersGrid)) {
        try {
            const products = await window.SIKKERProducts.loadProducts();

            const renderGrid = (items, container) => {
                if (!container) return;
                if (window.SIKKERProductCard && typeof window.SIKKERProductCard.renderProductCards === "function") {
                    window.SIKKERProductCard.renderProductCards(items, container);
                }
            };

            if (featuredGrid) {
                const featured = window.SIKKERProducts.getFeaturedProducts ? window.SIKKERProducts.getFeaturedProducts(products, 4) : products.slice(0, 4);
                renderGrid(featured, featuredGrid);
            }

            if (newArrivalsGrid) {
                const newArrivals = window.SIKKERProducts.getNewArrivals ? window.SIKKERProducts.getNewArrivals(products, 4) : products.slice(4, 8);
                renderGrid(newArrivals, newArrivalsGrid);
            }

            if (bestSellersGrid) {
                const bestSellers = window.SIKKERProducts.getBestSellers ? window.SIKKERProducts.getBestSellers(products, 4) : products.slice(8, 12);
                renderGrid(bestSellers, bestSellersGrid);
            }

        } catch (error) {
            console.error("SIKKER product loading error:", error);
        }
    }

    // 2. Newsletter Subscription Feedback
    document.querySelectorAll(".footer-newsletter-form").forEach(form => {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = form.querySelector("input[type='email']");
            if (input && input.value) {
                if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function") {
                    window.SIKKERUI.showToast(`Thank you for subscribing! A 10% welcome coupon (SIKKER10) is yours.`, "success");
                }
                input.value = "";
            }
        });
    });

    // 3. Universal Wishlist Navigation Handler
    const wishlistBtns = document.querySelectorAll(".wishlist-button, #wishlist-header-btn");
    wishlistBtns.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const path = window.location.pathname.toLowerCase();
            if (path.includes("/pages/collections/")) {
                window.location.href = "../../wishlist.html";
            } else if (path.includes("/pages/support/") || path.includes("/pages/account/") || path.includes("/pages/legal/") || path.includes("/pages/orders/") || path.includes("/pages/product/")) {
                window.location.href = "../wishlist.html";
            } else if (path.includes("/pages/")) {
                window.location.href = "wishlist.html";
            } else {
                window.location.href = "pages/wishlist.html";
            }
        });
    });

    // 4. Synchronize Header Counters on page load
    if (window.SIKKERCart && typeof window.SIKKERCart.updateCartCount === "function") {
        window.SIKKERCart.updateCartCount();
    }
    if (window.SIKKERWishlist && typeof window.SIKKERWishlist.updateWishlistCount === "function") {
        window.SIKKERWishlist.updateWishlistCount();
    }
    if (window.SIKKERUI && typeof window.SIKKERUI.syncAccountHeader === "function") {
        window.SIKKERUI.syncAccountHeader();
    }
});