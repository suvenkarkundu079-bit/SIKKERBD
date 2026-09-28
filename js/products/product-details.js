const PRODUCT_DETAILS_CONTAINER_ID = "product-details";

function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function productPrice(price) {
    return `৳${Number(price).toLocaleString("en-BD")}`;
}

function renderProductDetails(product) {
    const container =
        document.getElementById(PRODUCT_DETAILS_CONTAINER_ID);

    if (!container) return;

    if (!product) {
        container.innerHTML = `
            <div class="product-not-found">
                <h2>Product Not Found</h2>
                <p>The product you are looking for is unavailable.</p>
                <a href="../../index.html">
                    Continue Shopping
                </a>
            </div>
        `;
        return;
    }

    const stock = Number(product.stock);
    const isAvailable = stock > 0;

    container.innerHTML = `
        <div class="product-details-image">
            <img
                src="../../${product.image}"
                alt="${product.name}">
        </div>

        <div class="product-details-info">

            <h1 class="product-details-name">
                ${product.name}
            </h1>

            <div class="product-details-price">
                ${productPrice(product.price)}
            </div>

            <p class="product-details-description">
                ${product.description || ""}
            </p>

            <div class="product-details-size">
                <strong>Size:</strong>
                ${product.size || "Standard"}
            </div>

            <div class="product-details-stock ${
                isAvailable
                    ? "in-stock"
                    : "out-of-stock"
            }">
                ${
                    isAvailable
                        ? `In Stock (${stock} available)`
                        : "Out of Stock"
                }
            </div>

            ${
                isAvailable
                    ? `
                        <div class="product-quantity">

                            <button
                                type="button"
                                class="quantity-minus">
                                −
                            </button>

                            <span class="quantity-value">
                                1
                            </span>

                            <button
                                type="button"
                                class="quantity-plus">
                                +
                            </button>

                        </div>

                        <button
                            type="button"
                            class="product-add-to-cart">
                            Add to Cart
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="product-add-to-cart"
                            disabled>
                            Out of Stock
                        </button>
                    `
            }

        </div>
    `;

    if (!isAvailable) return;

    connectQuantityControls(
        container,
        product
    );

    connectAddToCart(
        container,
        product
    );
}

function connectQuantityControls(
    container,
    product
) {
    const minusButton =
        container.querySelector(".quantity-minus");

    const plusButton =
        container.querySelector(".quantity-plus");

    const quantityValue =
        container.querySelector(".quantity-value");

    if (
        !minusButton ||
        !plusButton ||
        !quantityValue
    ) {
        return;
    }

    let quantity = 1;

    const stock = Number(product.stock);

    function updateQuantity() {
        quantityValue.textContent = quantity;
    }

    minusButton.addEventListener(
        "click",
        () => {
            if (quantity > 1) {
                quantity--;
                updateQuantity();
            }
        }
    );

    plusButton.addEventListener(
        "click",
        () => {
            if (quantity < stock) {
                quantity++;
                updateQuantity();
            }
        }
    );
}

function connectAddToCart(
    container,
    product
) {
    const button =
        container.querySelector(
            ".product-add-to-cart"
        );

    const quantityValue =
        container.querySelector(
            ".quantity-value"
        );

    if (!button) return;

    button.addEventListener(
        "click",
        () => {
            if (
                !window.SIKKERCart ||
                Number(product.stock) <= 0
            ) {
                return;
            }

            const quantity =
                quantityValue
                    ? Number(quantityValue.textContent)
                    : 1;

            const added =
                window.SIKKERCart.addToCart(
                    product,
                    quantity
                );

            if (added) {
                window.SIKKERCart.updateCartCount();

                button.textContent =
                    "Added to Cart";

                setTimeout(() => {
                    button.textContent =
                        "Add to Cart";
                }, 1200);
            }
        }
    );
}

async function loadProductDetails() {
    const productId =
        getProductIdFromUrl();

    const container =
        document.getElementById(
            PRODUCT_DETAILS_CONTAINER_ID
        );

    if (!container) return;

    if (!productId) {
        renderProductDetails(null);
        return;
    }

    if (!window.SIKKERProducts) {
        container.innerHTML = `
            <p class="products-empty">
                Product system unavailable.
            </p>
        `;
        return;
    }

    const products =
        await window.SIKKERProducts.loadProducts();

    const product =
        window.SIKKERProducts.getProductById(
            products,
            productId
        );

    renderProductDetails(product);
}

document.addEventListener(
    "DOMContentLoaded",
    loadProductDetails
);

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (window.SIKKERCart) {
            window.SIKKERCart.updateCartCount();
        }
    }
);