// =========================================
// SIKKER — Collection Page System
// =========================================

async function renderCollectionPage() {

    const grid =
        document.getElementById("collection-products-grid");

    if (!grid) return;

    const path =
        window.location.pathname;

    const parts =
        path.split("/").filter(Boolean);

    const collectionIndex =
        parts.indexOf("collections");

    if (collectionIndex === -1) return;

    const collectionId =
        parts[collectionIndex + 1];

    if (!collectionId) return;

    const products =
        await window.SIKKERProducts.loadProducts();

    const collectionProducts =
        window.SIKKERProducts.getProductsByCollection(
            products,
            collectionId
        );

    const availableProducts =
        collectionProducts;

    window.SIKKERProductCard.renderProductCards(
        availableProducts,
        grid
    );

}


document.addEventListener(
    "DOMContentLoaded",
    renderCollectionPage
);