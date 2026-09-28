/**
 * SIKKER — Modern UI Utility System
 * Built according to Modern Web Guidance:
 * - Persistent Stackable Toast Notifications
 * - Robust Accessible Dropdowns & Modals
 * - Header Account State & Counter Sync
 */

(function () {
    "use strict";

    // -------------------------------------------------------------
    // Path Depth Helper
    // -------------------------------------------------------------
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

    // -------------------------------------------------------------
    // Modern Toast Notification System (persistent-toast-notifications)
    // -------------------------------------------------------------
    let toastContainer = null;

    function getToastContainer() {
        if (!toastContainer || !document.body.contains(toastContainer)) {
            toastContainer = document.createElement("div");
            toastContainer.id = "sikker-toast-container";
            toastContainer.className = "sikker-toast-container";
            toastContainer.setAttribute("aria-live", "polite");
            toastContainer.setAttribute("aria-atomic", "true");
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    function showToast(message, type = "success", duration = 3200) {
        const container = getToastContainer();
        const toast = document.createElement("div");
        toast.className = `sikker-toast sikker-toast-${type}`;
        toast.setAttribute("role", "status");

        const icons = {
            success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
            error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
            warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
        };

        toast.innerHTML = `
            <span class="sikker-toast-icon">${icons[type] || icons.info}</span>
            <span class="sikker-toast-message">${message}</span>
            <button type="button" class="sikker-toast-close" aria-label="Dismiss notification">&times;</button>
        `;

        const closeBtn = toast.querySelector(".sikker-toast-close");
        let timeoutId;

        const dismiss = () => {
            clearTimeout(timeoutId);
            toast.classList.add("sikker-toast-hiding");
            toast.addEventListener("animationend", () => {
                if (toast.parentElement) toast.parentElement.removeChild(toast);
            }, { once: true });
        };

        closeBtn.addEventListener("click", dismiss);
        timeoutId = setTimeout(dismiss, duration);

        container.appendChild(toast);
    }

    // -------------------------------------------------------------
    // Universal Dropdown System
    // -------------------------------------------------------------
    function initDropdowns() {
        const dropdowns = document.querySelectorAll(".nav-dropdown");

        dropdowns.forEach((dropdown) => {
            if (dropdown.dataset.dropdownInitialized) return;
            dropdown.dataset.dropdownInitialized = "true";

            const toggleBtn = dropdown.querySelector("button, a.dropdown-toggle, .nav-dropdown-button");
            if (!toggleBtn) return;

            toggleBtn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();

                dropdowns.forEach((other) => {
                    if (other !== dropdown) {
                        other.classList.remove("active");
                        const otherBtn = other.querySelector("button, a, .nav-dropdown-button");
                        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
                    }
                });

                const isOpen = dropdown.classList.toggle("active");
                toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        });

        // Close on outside click
        document.addEventListener("click", function (e) {
            if (!e.target.closest(".nav-dropdown")) {
                dropdowns.forEach((dropdown) => {
                    dropdown.classList.remove("active");
                    const btn = dropdown.querySelector("button, a, .nav-dropdown-button");
                    if (btn) btn.setAttribute("aria-expanded", "false");
                });
            }
        });

        // Close on Escape key
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") {
                dropdowns.forEach((dropdown) => {
                    dropdown.classList.remove("active");
                    const btn = dropdown.querySelector("button, a, .nav-dropdown-button");
                    if (btn) btn.setAttribute("aria-expanded", "false");
                });
            }
        });
    }

    // -------------------------------------------------------------
    // Header Account Link Synchronization
    // -------------------------------------------------------------
    function syncAccountHeader() {
        const accountLinks = document.querySelectorAll("a[href*='login.html'], a[href*='profile.html'], a[aria-label='Account']");
        const isLoggedIn = window.SIKKERAccount && window.SIKKERAccount.isLoggedIn && window.SIKKERAccount.isLoggedIn();
        const root = getRootPrefix();

        accountLinks.forEach(link => {
            if (isLoggedIn) {
                const user = window.SIKKERAccount.getCurrentAccount();
                const firstName = user && user.name ? user.name.split(" ")[0] : "Account";
                link.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> ${firstName}</span>`;
                link.href = `${root}pages/account/profile.html`;
                link.title = `Signed in as ${user ? user.name : 'User'}`;
            } else {
                link.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Account</span>`;
                link.href = `${root}pages/account/login.html`;
                link.title = "Login or Register";
            }
        });
    }

    // -------------------------------------------------------------
    // Wishlist Button Handlers
    // -------------------------------------------------------------
    function initWishlistNavigation() {
        const root = getRootPrefix();
        document.querySelectorAll(".wishlist-button, #wishlist-header-btn, a[href*='wishlist.html']").forEach(btn => {
            if (btn.tagName === "BUTTON") {
                btn.addEventListener("click", (e) => {
                    e.preventDefault();
                    window.location.href = `${root}pages/wishlist.html`;
                });
            }
        });
    }

    // -------------------------------------------------------------
    // Format BDT Currency
    // -------------------------------------------------------------
    function formatBDT(amount) {
        return `৳${Number(amount || 0).toLocaleString("en-BD")}`;
    }

    // -------------------------------------------------------------
    // Header Scroll Elevation & Glassmorphism
    // -------------------------------------------------------------
    function initHeaderScrollEffect() {
        const header = document.querySelector(".site-header");
        if (!header) return;

        const checkScroll = () => {
            if (window.scrollY > 20) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        };

        window.addEventListener("scroll", checkScroll, { passive: true });
        checkScroll();
    }

    // -------------------------------------------------------------
    // Smooth Page Navigation Transitions
    // -------------------------------------------------------------
    function initSmoothPageTransitions() {
        document.addEventListener("click", (e) => {
            const link = e.target.closest("a[href]");
            if (!link) return;

            // Don't intercept if modifier keys are pressed or opened in new tab
            if (link.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

            const href = link.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("javascript:") || 
                href.startsWith("tel:") || href.startsWith("mailto:")) {
                return;
            }

            // Don't intercept cart links that trigger drawer
            if (link.closest("#cart-button, .cart-button, a[aria-label*='cart']")) return;

            try {
                const targetUrl = new URL(link.href, window.location.origin);
                if (targetUrl.origin === window.location.origin && 
                    (targetUrl.pathname !== window.location.pathname || targetUrl.search !== window.location.search)) {
                    
                    if (!document.startViewTransition) {
                        e.preventDefault();
                        document.body.classList.add("page-leaving");
                        setTimeout(() => {
                            window.location.href = link.href;
                        }, 140);
                    }
                }
            } catch (err) {}
        });
    }

    // -------------------------------------------------------------
    // Apple Design Bento Interactive Controls (Why SIKKER)
    // -------------------------------------------------------------
    function initWhySikkerInteractive() {
        const thermalBtns = document.querySelectorAll("[data-thermal-mode]");
        const interiorEl = document.getElementById("metric-interior");
        const exteriorEl = document.getElementById("metric-exterior");
        const coasterEl = document.getElementById("metric-coaster");

        thermalBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                thermalBtns.forEach(b => {
                    b.classList.remove("active");
                    b.setAttribute("aria-selected", "false");
                });
                btn.classList.add("active");
                btn.setAttribute("aria-selected", "true");

                const mode = btn.dataset.thermalMode;
                if (interiorEl && exteriorEl && coasterEl) {
                    interiorEl.style.opacity = "0.2";
                    exteriorEl.style.opacity = "0.2";
                    coasterEl.style.opacity = "0.2";

                    setTimeout(() => {
                        if (mode === "hot") {
                            interiorEl.textContent = "+95°C";
                            exteriorEl.textContent = "26°C Cool";
                            exteriorEl.className = "metric-value highlight";
                            coasterEl.textContent = "Not Required";
                        } else {
                            interiorEl.textContent = "-5°C";
                            exteriorEl.textContent = "0% Condensation";
                            exteriorEl.className = "metric-value highlight";
                            coasterEl.textContent = "100% Dry Desk";
                        }
                        interiorEl.style.opacity = "1";
                        exteriorEl.style.opacity = "1";
                        coasterEl.style.opacity = "1";
                    }, 120);
                }
            });
        });

        // Material Explorer Switcher
        const matPills = document.querySelectorAll("[data-material]");
        const weightEl = document.getElementById("spec-weight");
        const textureEl = document.getElementById("spec-texture");
        const ritualEl = document.getElementById("spec-ritual");

        const materialData = {
            stoneware: {
                weight: "320g Grounded",
                texture: "Matte Earth Glaze",
                ritual: "Morning Pour-Over & Chai"
            },
            glass: {
                weight: "180g Ultra-Light",
                texture: "Optical Clarity",
                ritual: "Espresso & Green Tea"
            },
            porcelain: {
                weight: "240g Balanced",
                texture: "Silky Vitreous Glaze",
                ritual: "Afternoon Earl Grey & Latte"
            }
        };

        matPills.forEach(pill => {
            pill.addEventListener("click", () => {
                matPills.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");

                const mat = pill.dataset.material;
                const data = materialData[mat];
                if (data && weightEl && textureEl && ritualEl) {
                    weightEl.style.opacity = "0.2";
                    textureEl.style.opacity = "0.2";
                    ritualEl.style.opacity = "0.2";

                    setTimeout(() => {
                        weightEl.textContent = data.weight;
                        textureEl.textContent = data.texture;
                        ritualEl.textContent = data.ritual;
                        weightEl.style.opacity = "1";
                        textureEl.style.opacity = "1";
                        ritualEl.style.opacity = "1";
                    }, 120);
                }
            });
        });
    }

    // -------------------------------------------------------------
    // Cart Icon Synchronization & Harmonization
    // -------------------------------------------------------------
    function initCartIcons() {
        const cartBtns = document.querySelectorAll(".cart-button, #cart-button, a.cart-button, button.cart-button");
        const cartSvg = `<svg class="cart-svg-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;

        cartBtns.forEach(btn => {
            if (!btn.querySelector(".cart-svg-icon")) {
                const countEl = btn.querySelector(".cart-count, #cart-count");
                const currentCount = countEl ? countEl.textContent.trim() : "0";
                const countId = countEl && countEl.id ? ` id="${countEl.id}"` : "";

                btn.innerHTML = `${cartSvg} <span class="cart-label">Cart</span> <span class="cart-count"${countId}>${currentCount}</span>`;
            }
        });
    }

    // -------------------------------------------------------------
    // Luxury Floating WhatsApp Widget System
    // -------------------------------------------------------------
    function initFloatingWhatsApp() {
        const waSvg = `<svg class="whatsapp-icon-svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
        const targetUrl = "https://wa.me/8801571096243?text=Hi%20SIKKER%20Team!%20I'm%20interested%20in%20your%20luxury%20drinkware.";

        // Find existing floating button specifically (not inline contact form buttons)
        let waBtn = document.getElementById("sikker-floating-whatsapp") || 
                    document.querySelector("a.whatsapp-button:not(.contact-whatsapp-button)");

        if (!waBtn) {
            waBtn = document.createElement("a");
            waBtn.id = "sikker-floating-whatsapp";
            waBtn.className = "whatsapp-button";
            document.body.appendChild(waBtn);
        } else {
            // Guarantee direct child of document.body to ensure true viewport-fixed position during scroll
            if (waBtn.parentElement !== document.body) {
                document.body.appendChild(waBtn);
            }
        }

        waBtn.href = targetUrl;
        waBtn.target = "_blank";
        waBtn.rel = "noopener noreferrer";
        waBtn.setAttribute("aria-label", "Contact SIKKER Support on WhatsApp");

        waBtn.innerHTML = `
            ${waSvg}
            <span class="wa-label">
                <span class="whatsapp-online-dot"></span>
                <span>WhatsApp</span>
            </span>
            <span class="wa-tooltip">Chat with SIKKER • Instant Reply</span>
        `;

        // Also harmonize any contact page WhatsApp buttons (.contact-whatsapp-button)
        document.querySelectorAll(".contact-whatsapp-button").forEach(btn => {
            if (!btn.querySelector(".whatsapp-icon-svg")) {
                const text = btn.textContent.trim() || 'Chat on WhatsApp';
                btn.innerHTML = `${waSvg} <span>${text}</span>`;
            }
        });

        // Harmonize footer WhatsApp contact mentions
        document.querySelectorAll(".footer-contact-info p").forEach(p => {
            if (p.textContent.includes("WhatsApp") && !p.querySelector(".footer-whatsapp-link")) {
                p.innerHTML = `<a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="footer-whatsapp-link">${waSvg} <span>WhatsApp: 01571096243</span></a>`;
            }
        });
    }

    // -------------------------------------------------------------
    // Auto Initialization on DOMContentLoaded
    // -------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        initCartIcons();
        initFloatingWhatsApp();
        initDropdowns();
        syncAccountHeader();
        initWishlistNavigation();
        initHeaderScrollEffect();
        initSmoothPageTransitions();
        initWhySikkerInteractive();
    });

    // Expose to window
    window.SIKKERUI = {
        showToast,
        initDropdowns,
        syncAccountHeader,
        formatBDT,
        getRootPrefix,
        initWhySikkerInteractive,
        initCartIcons,
        initFloatingWhatsApp
    };
})();
