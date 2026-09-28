// =========================================
// SIKKER — Wishlist System
// =========================================

(function () {
    "use strict";

    const GUEST_WISHLIST_KEY = "sikkerWishlist";

    function isLoggedIn() {
        return window.SIKKERAccount && typeof window.SIKKERAccount.isLoggedIn === "function" && window.SIKKERAccount.isLoggedIn();
    }

    function getActiveWishlist() {
        if (isLoggedIn() && typeof window.SIKKERAccount.getAccountWishlist === "function") {
            return window.SIKKERAccount.getAccountWishlist();
        }
        try {
            const data = localStorage.getItem(GUEST_WISHLIST_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveWishlist(items) {
        const clean = Array.isArray(items) ? items : [];
        if (isLoggedIn() && typeof window.SIKKERAccount.saveAccountWishlist === "function") {
            window.SIKKERAccount.saveAccountWishlist(clean);
        } else {
            try {
                localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(clean));
            } catch (e) {}
        }
        updateWishlistCount();
    }

    function isInWishlist(productId) {
        if (!productId) return false;
        return getActiveWishlist().some(item => String(item.productId) === String(productId));
    }

    function addToWishlist(product) {
        if (!product || !product.id) return false;
        if (isInWishlist(product.id)) return false;

        const list = getActiveWishlist();
        list.push({
            productId: product.id,
            name: product.name,
            category: product.category || "Drinkware",
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            image: product.image,
            size: product.size || "",
            addedAt: new Date().toISOString()
        });

        saveWishlist(list);
        return true;
    }

    function removeFromWishlist(productId) {
        if (!productId) return;
        const list = getActiveWishlist();
        const index = list.findIndex(item => String(item.productId) === String(productId));
        if (index !== -1) {
            list.splice(index, 1);
            saveWishlist(list);
        }
    }

    function clearWishlist() {
        saveWishlist([]);
    }

    function getWishlist() {
        return getActiveWishlist();
    }

    function getWishlistCount() {
        return getActiveWishlist().length;
    }

    function isWishlistEmpty() {
        return getActiveWishlist().length === 0;
    }

    function updateWishlistCount() {
        const count = getWishlistCount();
        document.querySelectorAll("#wishlist-count, .wishlist-count, .wishlist-badge").forEach(el => {
            el.textContent = count;
            el.classList.remove("bump");
            void el.offsetWidth;
            el.classList.add("bump");
        });

        // Also update any wishlist heart icons with counter
        document.querySelectorAll(".wishlist-button, a[aria-label='Wishlist']").forEach(btn => {
            const hasBadge = btn.querySelector(".wishlist-count");
            if (count > 0 && !hasBadge && btn.textContent.trim().startsWith("♡")) {
                btn.innerHTML = `♡ <span class="wishlist-count bump" style="font-size:11px;background:#e05929;color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;margin-left:4px;">${count}</span>`;
            } else if (hasBadge) {
                hasBadge.textContent = count;
                hasBadge.style.display = count > 0 ? "inline-flex" : "none";
                hasBadge.classList.remove("bump");
                void hasBadge.offsetWidth;
                hasBadge.classList.add("bump");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        updateWishlistCount();
    });

    window.SIKKERWishlist = {
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        getWishlist,
        getWishlistCount,
        isWishlistEmpty,
        updateWishlistCount
    };

    window.addToWishlist = addToWishlist;
    window.removeFromWishlist = removeFromWishlist;
})();