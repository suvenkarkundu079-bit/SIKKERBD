// =========================================
// SIKKER — Coupon System
// =========================================

const COUPON_DATA_URL =
    "/data/coupons/coupons.json";


/*
 * -----------------------------------------
 * Load Coupons
 * -----------------------------------------
 */

async function loadCoupons() {

    try {

        const response =
            await fetch(COUPON_DATA_URL);


        if (!response.ok) {

            throw new Error(
                "Could not load coupon data."
            );

        }


        const data =
            await response.json();


        return data.coupons || [];


    } catch (error) {

        console.error(
            "SIKKER Coupon System Error:",
            error
        );


        return [];

    }

}


/*
 * -----------------------------------------
 * Find Coupon
 * -----------------------------------------
 */

function findCoupon(
    coupons,
    code
) {

    if (
        !Array.isArray(coupons) ||
        !code
    ) {
        return null;
    }


    const normalizedCode =
        String(code)
            .trim()
            .toUpperCase();


    return coupons.find(
        coupon =>
            String(coupon.code)
                .toUpperCase() === normalizedCode
    ) || null;

}


/*
 * -----------------------------------------
 * Validate Coupon
 * -----------------------------------------
 */

function validateCoupon(
    coupon
) {

    if (!coupon) {

        return {

            valid: false,

            message: "Invalid coupon code."

        };

    }


    if (!coupon.enabled) {

        return {

            valid: false,

            message: "This coupon is currently unavailable."

        };

    }


    const value =
        Number(coupon.value);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return {

            valid: false,

            message: "This coupon is invalid."

        };

    }


    if (
        coupon.type !== "percentage" &&
        coupon.type !== "fixed"
    ) {

        return {

            valid: false,

            message: "This coupon is invalid."

        };

    }


    return {

        valid: true,

        message: "Coupon applied successfully."

    };

}


/*
 * -----------------------------------------
 * Calculate Coupon Discount
 * -----------------------------------------
 */

function calculateCouponDiscount(
    subtotal,
    coupon
) {

    const validation =
        validateCoupon(coupon);


    if (!validation.valid) {

        return {

            discount: 0,

            finalSubtotal:
                Number(subtotal) || 0

        };

    }


    subtotal =
        Math.max(
            Number(subtotal) || 0,
            0
        );


    let discount = 0;


    if (
        coupon.type === "percentage"
    ) {

        discount =
            subtotal *
            (Number(coupon.value) / 100);

    }


    if (
        coupon.type === "fixed"
    ) {

        discount =
            Number(coupon.value);

    }


    discount =
        Math.min(
            Math.max(discount, 0),
            subtotal
        );


    return {

        discount,

        finalSubtotal:
            subtotal - discount

    };

}


/*
 * -----------------------------------------
 * Public API
 * -----------------------------------------
 */

window.SIKKERCoupons = {

    loadCoupons,

    findCoupon,

    validateCoupon,

    calculateCouponDiscount

};