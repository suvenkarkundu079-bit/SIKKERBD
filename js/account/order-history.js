// =========================================
// SIKKER — Account Order History
// =========================================

const SIKKER_ORDERS_KEY = "sikkerOrders";

function getAllOrders() {
    try {
        const savedOrders =
            localStorage.getItem(SIKKER_ORDERS_KEY);

        if (!savedOrders) return [];

        const orders = JSON.parse(savedOrders);

        return Array.isArray(orders)
            ? orders
            : [];

    } catch (error) {
        console.error(
            "SIKKER Order History Error:",
            error
        );

        return [];
    }
}

function getMyOrders() {
    if (
        !window.SIKKERAccount ||
        !window.SIKKERAccount.isLoggedIn()
    ) {
        return [];
    }

    const account =
        window.SIKKERAccount.getCurrentAccount();

    if (!account) return [];

    const whatsapp =
        String(account.whatsapp || "").trim();

    if (!whatsapp) return [];

    return getAllOrders()
        .filter(order =>
            String(order.accountId || "").trim() === whatsapp
        )
        .reverse();
}

function formatOrderPrice(price) {
    return `৳${Number(price || 0).toLocaleString("en-BD")}`;
}

function renderMyOrders() {

    const container =
        document.getElementById("my-orders-list");

    if (!container) return;

    const orders =
        getMyOrders();

    if (orders.length === 0) {

        container.innerHTML = `
            <div class="account-orders-empty">

                <h3>
                    No orders yet.
                </h3>

                <p>
                    Your orders will appear here after you place an order.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        orders.map(order => {

            const itemCount =
                (order.items || []).reduce(
                    (total, item) =>
                        total + Number(item.quantity || 0),
                    0
                );

            return `
                <article
                    class="account-order-item">

                    <div class="account-order-main">

                        <div>
                            <span>
                                Order
                            </span>

                            <strong>
                                ${order.orderNumber}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Status
                            </span>

                            <strong>
                                ${order.status || "Pending"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Items
                            </span>

                            <strong>
                                ${itemCount}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Total
                            </span>

                            <strong>
                                ${formatOrderPrice(order.total)}
                            </strong>
                        </div>

                    </div>

                    <a
                        href="../orders/order-status.html?order=${encodeURIComponent(order.orderNumber)}"
                        class="secondary-button account-order-view"
                    >
                        View Order
                    </a>

                </article>
            `;

        }).join("");
}

window.SIKKEROrderHistory = {
    getAllOrders,
    getMyOrders,
    renderMyOrders
};