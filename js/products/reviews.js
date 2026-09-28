// =========================================
// SIKKER — Review System
// =========================================

const REVIEW_DATA_URL =
    "/data/reviews/reviews.json";

const REVIEW_STORAGE_KEY =
    "sikkerReviews";


let sikkerReviews = [];


/*
 * -----------------------------------------
 * Load Reviews
 * -----------------------------------------
 */

async function loadReviews() {

    try {

        const savedReviews =
            localStorage.getItem(
                REVIEW_STORAGE_KEY
            );


        if (savedReviews) {

            const parsedReviews =
                JSON.parse(savedReviews);


            if (
                Array.isArray(parsedReviews)
            ) {

                sikkerReviews =
                    parsedReviews;

                return sikkerReviews;

            }

        }


        const response =
            await fetch(
                REVIEW_DATA_URL
            );


        if (!response.ok) {

            throw new Error(
                "Could not load review data."
            );

        }


        const data =
            await response.json();


        sikkerReviews =
            Array.isArray(data.reviews)
                ? data.reviews
                : [];


        return sikkerReviews;


    } catch (error) {

        console.error(
            "SIKKER Review System Error:",
            error
        );


        sikkerReviews = [];

        return sikkerReviews;

    }

}


/*
 * -----------------------------------------
 * Save Reviews
 * -----------------------------------------
 */

function saveReviews() {

    localStorage.setItem(
        REVIEW_STORAGE_KEY,
        JSON.stringify(
            sikkerReviews
        )
    );

}


/*
 * -----------------------------------------
 * Get Product Reviews
 * -----------------------------------------
 */

function getProductReviews(
    productId
) {

    return sikkerReviews.filter(
        review =>
            review.productId === productId
    );

}


/*
 * -----------------------------------------
 * Get Review By ID
 * -----------------------------------------
 */

function getReviewById(
    reviewId
) {

    return (
        sikkerReviews.find(
            review =>
                review.id === reviewId
        ) || null
    );

}


/*
 * -----------------------------------------
 * Add Review
 * -----------------------------------------
 */

function addReview(
    review
) {

    if (!review) {
        return false;
    }


    const rating =
        Number(review.rating);


    if (
        !review.productId ||
        !review.accountId ||
        rating < 1 ||
        rating > 5
    ) {

        return false;

    }


    const newReview = {

        id:
            `review-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        productId:
            review.productId,

        accountId:
            review.accountId,

        customerName:
            review.customerName ||
            "Customer",

        rating,

        text:
            String(
                review.text || ""
            ),

        photos:
            Array.isArray(review.photos)
                ? review.photos
                : [],

        createdAt:
            new Date().toISOString(),

        updatedAt:
            null

    };


    sikkerReviews.push(
        newReview
    );


    saveReviews();


    return newReview;

}


/*
 * -----------------------------------------
 * Update Review
 * -----------------------------------------
 */

function updateReview(
    reviewId,
    changes
) {

    const review =
        getReviewById(
            reviewId
        );


    if (!review) {
        return false;
    }


    if (
        changes.rating !== undefined
    ) {

        const rating =
            Number(
                changes.rating
            );


        if (
            rating < 1 ||
            rating > 5
        ) {

            return false;

        }


        review.rating =
            rating;

    }


    if (
        changes.text !== undefined
    ) {

        review.text =
            String(
                changes.text
            );

    }


    if (
        changes.photos !== undefined
    ) {

        review.photos =
            Array.isArray(
                changes.photos
            )
                ? changes.photos
                : [];

    }


    review.updatedAt =
        new Date().toISOString();


    saveReviews();


    return true;

}


/*
 * -----------------------------------------
 * Delete Review
 * -----------------------------------------
 */

function deleteReview(
    reviewId
) {

    const index =
        sikkerReviews.findIndex(
            review =>
                review.id === reviewId
        );


    if (index === -1) {
        return false;
    }


    sikkerReviews.splice(
        index,
        1
    );


    saveReviews();


    return true;

}


/*
 * -----------------------------------------
 * Calculate Product Rating
 * -----------------------------------------
 */

function calculateProductRating(
    productId
) {

    const reviews =
        getProductReviews(
            productId
        );


    if (
        reviews.length === 0
    ) {

        return {

            rating: 0,

            reviewCount: 0

        };

    }


    const total =
        reviews.reduce(
            (
                sum,
                review
            ) =>
                sum +
                Number(
                    review.rating
                ),
            0
        );


    return {

        rating:
            Number(
                (
                    total /
                    reviews.length
                ).toFixed(1)
            ),

        reviewCount:
            reviews.length

    };

}


/*
 * -----------------------------------------
 * Public API
 * -----------------------------------------
 */

window.SIKKERReviews = {

    loadReviews,

    saveReviews,

    getProductReviews,

    getReviewById,

    addReview,

    updateReview,

    deleteReview,

    calculateProductRating

};