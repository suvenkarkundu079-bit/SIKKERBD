function getReviewProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function getCurrentAccountId() {
    if (
        !window.SIKKERAccount ||
        !window.SIKKERAccount.isLoggedIn()
    ) {
        return null;
    }

    const account =
        window.SIKKERAccount.getCurrentAccount();

    if (!account) return null;

    return account.whatsapp || account.id || null;
}

function escapeReviewText(text) {
    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createStars(rating) {
    const value = Number(rating) || 0;

    return `
        <span class="review-stars" aria-label="${value} out of 5 stars">
            ${[1, 2, 3, 4, 5]
                .map(star =>
                    `<span>${star <= value ? "★" : "☆"}</span>`
                )
                .join("")}
        </span>
    `;
}

function renderReviewForm(productId, container) {
    const accountId = getCurrentAccountId();

    if (!accountId) {
        container.innerHTML = `
            <div class="review-login-message">
                <p>Please log in to write a review.</p>
                <a href="/pages/account/login.html">
                    Log In
                </a>
            </div>
        `;
        return;
    }

    const existingReview =
        window.SIKKERReviews
            .getProductReviews(productId)
            .find(review =>
                review.accountId === accountId
            );

    if (existingReview) {
        container.innerHTML = `
            <div class="review-form">
                <h3>Your Review</h3>

                <div class="review-existing-stars">
                    ${createStars(existingReview.rating)}
                </div>

                <p class="review-existing-text">
                    ${escapeReviewText(existingReview.text)}
                </p>

                <div class="review-form-actions">
                    <button
                        type="button"
                        class="review-edit-btn"
                        data-review-id="${existingReview.id}">
                        Edit Review
                    </button>

                    <button
                        type="button"
                        class="review-delete-btn"
                        data-review-id="${existingReview.id}">
                        Delete Review
                    </button>
                </div>
            </div>
        `;

        connectExistingReviewButtons(
            productId,
            container
        );

        return;
    }

    container.innerHTML = `
        <form class="review-form" id="sikker-review-form">

            <h3>Write a Review</h3>

            <label for="review-rating">
                Rating
            </label>

            <select id="review-rating" required>
                <option value="">Select rating</option>
                <option value="5">★★★★★ — Excellent</option>
                <option value="4">★★★★☆ — Very Good</option>
                <option value="3">★★★☆☆ — Good</option>
                <option value="2">★★☆☆☆ — Fair</option>
                <option value="1">★☆☆☆☆ — Poor</option>
            </select>

            <label for="review-text">
                Your Review
            </label>

            <textarea
                id="review-text"
                rows="5"
                placeholder="Write your review"
                required></textarea>

            <button
                type="submit">
                Submit Review
            </button>

            <p
                id="review-form-message"
                class="review-form-message">
            </p>

        </form>
    `;

    const form =
        container.querySelector("#sikker-review-form");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const rating =
            Number(
                document.getElementById(
                    "review-rating"
                ).value
            );

        const text =
            document.getElementById(
                "review-text"
            ).value.trim();

        const account =
            window.SIKKERAccount.getCurrentAccount();

        if (!account) return;

        const result =
            window.SIKKERReviews.addReview({
                productId,
                accountId,
                customerName:
                    account.name || "Customer",
                rating,
                text,
                photos: []
            });

        const message =
            document.getElementById(
                "review-form-message"
            );

        if (!result) {
            message.textContent =
                "Could not submit your review.";
            return;
        }

        message.textContent =
            "Your review has been submitted.";

        renderReviews(productId, container.parentElement);
    });
}

function connectExistingReviewButtons(
    productId,
    container
) {
    const editButton =
        container.querySelector(
            ".review-edit-btn"
        );

    const deleteButton =
        container.querySelector(
            ".review-delete-btn"
        );

    if (editButton) {
        editButton.addEventListener(
            "click",
            () => {
                renderEditReviewForm(
                    productId,
                    container,
                    editButton.dataset.reviewId
                );
            }
        );
    }

    if (deleteButton) {
        deleteButton.addEventListener(
            "click",
            () => {
                const reviewId =
                    deleteButton.dataset.reviewId;

                const confirmed =
                    window.confirm(
                        "Delete your review?"
                    );

                if (!confirmed) return;

                const deleted =
                    window.SIKKERReviews
                        .deleteReview(reviewId);

                if (deleted) {
                    renderReviews(
                        productId,
                        container.parentElement
                    );
                }
            }
        );
    }
}

function renderEditReviewForm(
    productId,
    container,
    reviewId
) {
    const review =
        window.SIKKERReviews
            .getReviewById(reviewId);

    if (!review) return;

    container.innerHTML = `
        <form
            class="review-form"
            id="sikker-review-edit-form">

            <h3>Edit Your Review</h3>

            <label for="edit-review-rating">
                Rating
            </label>

            <select
                id="edit-review-rating"
                required>

                ${[5, 4, 3, 2, 1]
                    .map(rating => `
                        <option
                            value="${rating}"
                            ${Number(review.rating) === rating
                                ? "selected"
                                : ""}>
                            ${"★".repeat(rating)}
                            ${"☆".repeat(5 - rating)}
                        </option>
                    `)
                    .join("")}
            </select>

            <label for="edit-review-text">
                Your Review
            </label>

            <textarea
                id="edit-review-text"
                rows="5"
                required>${escapeReviewText(
                    review.text
                )}</textarea>

            <button type="submit">
                Save Changes
            </button>

        </form>
    `;

    const form =
        container.querySelector(
            "#sikker-review-edit-form"
        );

    form.addEventListener("submit", event => {
        event.preventDefault();

        const rating =
            Number(
                document.getElementById(
                    "edit-review-rating"
                ).value
            );

        const text =
            document.getElementById(
                "edit-review-text"
            ).value.trim();

        const updated =
            window.SIKKERReviews.updateReview(
                reviewId,
                {
                    rating,
                    text
                }
            );

        if (!updated) return;

        renderReviews(
            productId,
            container.parentElement
        );
    });
}

function renderReviewList(
    productId,
    container
) {
    const reviews =
        window.SIKKERReviews
            .getProductReviews(productId);

    if (reviews.length === 0) {
        container.innerHTML = `
            <p class="reviews-empty">
                No reviews yet.
            </p>
        `;
        return;
    }

    container.innerHTML = reviews
        .map(review => `
            <article
                class="review-item"
                data-review-id="${review.id}">

                <div class="review-item-header">
                    <strong>
                        ${escapeReviewText(
                            review.customerName
                        )}
                    </strong>

                    ${createStars(
                        review.rating
                    )}
                </div>

                <p class="review-item-text">
                    ${escapeReviewText(
                        review.text
                    )}
                </p>

                <small class="review-item-date">
                    ${new Date(
                        review.createdAt
                    ).toLocaleDateString("en-BD")}
                </small>

            </article>
        `)
        .join("");
}

function renderReviews(
    productId,
    section
) {
    if (!window.SIKKERReviews) return;

    const summary =
        window.SIKKERReviews
            .calculateProductRating(productId);

    section.innerHTML = `
        <section class="sikker-reviews">

            <div class="reviews-heading">
                <h2>Customer Reviews</h2>

                <div class="reviews-summary">
                    ${
                        summary.reviewCount > 0
                            ? `
                                ${createStars(
                                    summary.rating
                                )}
                                <span>
                                    ${summary.rating}
                                    ·
                                    ${summary.reviewCount}
                                    ${
                                        summary.reviewCount === 1
                                            ? "review"
                                            : "reviews"
                                    }
                                </span>
                              `
                            : `
                                <span>
                                    No ratings yet
                                </span>
                              `
                    }
                </div>
            </div>

            <div
                class="reviews-list"
                id="sikker-reviews-list">
            </div>

            <div
                class="review-form-container"
                id="sikker-review-form-container">
            </div>

        </section>
    `;

    const list =
        section.querySelector(
            "#sikker-reviews-list"
        );

    const formContainer =
        section.querySelector(
            "#sikker-review-form-container"
        );

    renderReviewList(
        productId,
        list
    );

    renderReviewForm(
        productId,
        formContainer
    );
}

async function initializeReviewsUI() {
    if (!window.SIKKERReviews) return;

    const productId =
        getReviewProductId();

    if (!productId) return;

    await window.SIKKERReviews.loadReviews();

    const main =
        document.querySelector("main");

    if (!main) return;

    const existingSection =
        document.querySelector(
            ".sikker-reviews"
        );

    if (existingSection) return;

    const section =
        document.createElement("div");

    section.className =
        "sikker-reviews-wrapper";

    main.appendChild(section);

    renderReviews(
        productId,
        section
    );
}

document.addEventListener(
    "DOMContentLoaded",
    initializeReviewsUI
);

window.SIKKERReviewsUI = {
    initializeReviewsUI,
    renderReviews
};