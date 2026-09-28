// =========================================
// SIKKER — Multi-Account & Auth System
// =========================================

(function () {
    "use strict";

    const ACCOUNTS_STORAGE_KEY = "sikkerAccounts";
    const CURRENT_USER_KEY = "sikkerCurrentUser";
    const LOGGED_IN_KEY = "sikkerLoggedIn";

    // -----------------------------------------
    // Seed Demo Accounts if not yet initialized
    // -----------------------------------------
    function initSeedAccounts() {
        try {
            const existing = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            if (!existing) {
                const demoAccounts = [
                    {
                        id: "acc-demo-001",
                        name: "Demo Customer",
                        whatsapp: "01712345678",
                        password: "password123",
                        email: "demo@sikker.com.bd",
                        address: "Flat 4B, House 12, Road 7, Dhanmondi, Dhaka-1205",
                        createdAt: "2026-09-01T10:00:00",
                        cart: [],
                        wishlist: [],
                        orders: [
                            {
                                orderId: "SIKKER-98214",
                                date: "2026-09-24T14:32:00",
                                status: "Delivered",
                                items: [
                                    {
                                        productId: "tumbler-001",
                                        name: "Eco Ceramic Splash-Proof Travel Mug",
                                        price: 750,
                                        quantity: 1,
                                        image: "images/products/travel-tumbler/travel-tumbler-1.jpg"
                                    },
                                    {
                                        productId: "boro-001",
                                        name: "Borosilicate Glass Cup & Saucer",
                                        price: 590,
                                        quantity: 1,
                                        image: "images/products/borosilicate-glass/borosilicate-1.jpg"
                                    }
                                ],
                                subtotal: 1340,
                                delivery: 0,
                                discount: 0,
                                total: 1340,
                                shipping: {
                                    name: "Demo Customer",
                                    phone: "01712345678",
                                    address: "Flat 4B, House 12, Road 7, Dhanmondi, Dhaka",
                                    city: "Dhaka"
                                },
                                payment: {
                                    method: "cod",
                                    status: "Paid on Delivery"
                                }
                            }
                        ]
                    }
                ];
                localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(demoAccounts));
            }
        } catch (e) {
            console.error("SIKKER Seed Accounts Error:", e);
        }
    }

    initSeedAccounts();

    function getAllAccounts() {
        try {
            const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveAllAccounts(accounts) {
        try {
            localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
        } catch (e) {
            console.error("Failed to save accounts:", e);
        }
    }

    function isLoggedIn() {
        return localStorage.getItem(LOGGED_IN_KEY) === "true";
    }

    function setLoginStatus(status) {
        localStorage.setItem(LOGGED_IN_KEY, status ? "true" : "false");
        if (window.SIKKERUI && typeof window.SIKKERUI.syncAccountHeader === "function") {
            window.SIKKERUI.syncAccountHeader();
        }
    }

    function getCurrentAccount() {
        if (!isLoggedIn()) return null;
        try {
            const userPhone = localStorage.getItem(CURRENT_USER_KEY);
            if (!userPhone) return null;
            const accounts = getAllAccounts();
            return accounts.find(a => a.whatsapp === userPhone) || null;
        } catch (e) {
            return null;
        }
    }

    function saveAccount(account) {
        if (!account || !account.whatsapp) return false;
        const accounts = getAllAccounts();
        const index = accounts.findIndex(a => a.whatsapp === account.whatsapp);
        if (index !== -1) {
            accounts[index] = account;
        } else {
            accounts.push(account);
        }
        saveAllAccounts(accounts);
        return true;
    }

    function registerAccount({ name, whatsapp, password, email = "", address = "" }) {
        if (!name || !whatsapp || !password) {
            return { success: false, message: "Please fill in all required fields." };
        }

        const cleanPhone = whatsapp.trim().replace(/[^0-9]/g, "");
        if (cleanPhone.length < 10) {
            return { success: false, message: "Please enter a valid 11-digit WhatsApp phone number." };
        }

        const accounts = getAllAccounts();
        if (accounts.some(a => a.whatsapp === cleanPhone)) {
            return { success: false, message: "An account with this WhatsApp number already exists." };
        }

        const newAccount = {
            id: `acc-${Date.now()}`,
            name: name.trim(),
            whatsapp: cleanPhone,
            password: password,
            email: email.trim(),
            address: address.trim(),
            createdAt: new Date().toISOString(),
            cart: [],
            wishlist: [],
            orders: []
        };

        accounts.push(newAccount);
        saveAllAccounts(accounts);

        // Automatically log in
        localStorage.setItem(CURRENT_USER_KEY, cleanPhone);
        setLoginStatus(true);

        return { success: true, message: "Account created successfully!", account: newAccount };
    }

    function loginAccount(whatsapp, password) {
        if (!whatsapp || !password) {
            return { success: false, message: "Please enter both WhatsApp number and password." };
        }

        const cleanPhone = whatsapp.trim().replace(/[^0-9]/g, "");
        const accounts = getAllAccounts();
        const account = accounts.find(a => a.whatsapp === cleanPhone);

        if (!account) {
            return { success: false, message: "No account found with this WhatsApp number. Please register first." };
        }

        if (account.password !== password) {
            return { success: false, message: "Incorrect password. Please try again." };
        }

        localStorage.setItem(CURRENT_USER_KEY, cleanPhone);
        setLoginStatus(true);

        return { success: true, message: "Login successful!", account };
    }

    function logoutAccount() {
        localStorage.removeItem(CURRENT_USER_KEY);
        setLoginStatus(false);
        if (window.SIKKERUI && typeof window.SIKKERUI.showToast === "function") {
            window.SIKKERUI.showToast("Logged out successfully.", "info");
        }
        return true;
    }

    function updateAccountProfile({ name, email, address }) {
        const user = getCurrentAccount();
        if (!user) return false;

        if (name) user.name = name.trim();
        if (email !== undefined) user.email = email.trim();
        if (address !== undefined) user.address = address.trim();

        const success = saveAccount(user);
        if (success && window.SIKKERUI && typeof window.SIKKERUI.syncAccountHeader === "function") {
            window.SIKKERUI.syncAccountHeader();
        }
        return success;
    }

    function resetAccountPassword(whatsapp, newPassword) {
        const cleanPhone = whatsapp.trim().replace(/[^0-9]/g, "");
        const accounts = getAllAccounts();
        const account = accounts.find(a => a.whatsapp === cleanPhone);

        if (!account) {
            return { success: false, message: "No account found with this WhatsApp number." };
        }

        account.password = newPassword;
        saveAllAccounts(accounts);
        return { success: true, message: "Password reset successfully. Please login with your new password." };
    }

    function addOrderToAccount(order) {
        const user = getCurrentAccount();
        if (!user) {
            // Save to guest orders
            try {
                const guestOrders = JSON.parse(localStorage.getItem("sikkerGuestOrders") || "[]");
                guestOrders.unshift(order);
                localStorage.setItem("sikkerGuestOrders", JSON.stringify(guestOrders));
            } catch (e) {}
            return;
        }

        if (!Array.isArray(user.orders)) {
            user.orders = [];
        }
        user.orders.unshift(order);
        saveAccount(user);
    }

    function getAccountOrders() {
        const user = getCurrentAccount();
        if (user && Array.isArray(user.orders)) {
            return user.orders;
        }
        try {
            return JSON.parse(localStorage.getItem("sikkerGuestOrders") || "[]");
        } catch (e) {
            return [];
        }
    }

    function getAccountCart() {
        const user = getCurrentAccount();
        return (user && Array.isArray(user.cart)) ? user.cart : [];
    }

    function saveAccountCart(cart) {
        const user = getCurrentAccount();
        if (!user) return false;
        user.cart = Array.isArray(cart) ? cart : [];
        return saveAccount(user);
    }

    function getAccountWishlist() {
        const user = getCurrentAccount();
        return (user && Array.isArray(user.wishlist)) ? user.wishlist : [];
    }

    function saveAccountWishlist(wishlist) {
        const user = getCurrentAccount();
        if (!user) return false;
        user.wishlist = Array.isArray(wishlist) ? wishlist : [];
        return saveAccount(user);
    }

    // Export both globally and inside namespace for compatibility
    window.SIKKERAccount = {
        getAllAccounts,
        getCurrentAccount,
        saveAccount,
        isLoggedIn,
        setLoginStatus,
        registerAccount,
        loginAccount,
        logoutAccount,
        logout: logoutAccount,
        updateAccountProfile,
        resetAccountPassword,
        addOrderToAccount,
        getAccountOrders,
        getAccountCart,
        saveAccountCart,
        getAccountWishlist,
        saveAccountWishlist
    };

    window.registerAccount = registerAccount;
    window.loginAccount = loginAccount;
    window.logoutAccount = logoutAccount;
    window.getCurrentAccount = getCurrentAccount;
    window.updateAccountProfile = updateAccountProfile;
    window.resetAccountPassword = resetAccountPassword;

})();