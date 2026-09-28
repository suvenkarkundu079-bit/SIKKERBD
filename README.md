# SIKKER

SIKKER is a responsive, browser-based e-commerce storefront for premium tea and coffee drinkware in Bangladesh. The site presents ceramic mugs, glassware, porcelain, stoneware, statement mugs, and travel tumblers with product browsing, search, collections, reviews, wishlist, cart, coupons, checkout, account, and order-status flows.

This project is built with plain HTML, CSS, and JavaScript. It has no build step, package manager, backend, or external runtime dependency.

## Features

- Responsive storefront homepage with featured products, new arrivals, best sellers, and interactive product education sections
- Product catalog loaded from JSON with an embedded JavaScript fallback
- Collection pages for each drinkware category
- Product details, image galleries, ratings, reviews, search, sorting, and filtering
- Shopping cart drawer and cart page with quantity controls and coupon support
- Wishlist and account flows backed by browser storage
- Checkout, order confirmation, and order-status pages for the front-end experience
- Newsletter feedback, toast notifications, dropdown navigation, and WhatsApp contact links
- Local assets for product photography, banners, logos, icons, and fonts

## Run Locally

Because the site loads JSON with `fetch()`, use a local HTTP server instead of opening `index.html` directly with the `file://` protocol. The product module has a fallback dataset, but a server is required for the complete data-driven experience.

### Option 1: VS Code Live Server

1. Open the project folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html` and choose **Open with Live Server**.

### Option 2: Python

From the project root:

```bash
python -m http.server 8000
```

Open <http://localhost:8000> in a browser.

### Option 3: Node.js

If a static server is already available in your environment, run it from the project root and open the URL it prints. No `npm install` step is needed for this repository.

## Project Structure

```text
.
├── index.html                 # Homepage and main storefront entry point
├── assets/                    # Fonts, icons, logos, banners, and UI assets
├── images/                    # Product, category, banner, review, and team images
├── components/                # Reusable HTML fragments and page sections
├── pages/                     # Storefront, account, checkout, support, legal, and order pages
├── css/
│   ├── main.css               # Shared layout, typography, navigation, and component styles
│   ├── cart.css               # Cart drawer and cart page styles
│   └── product-details.css    # Product detail page styles
├── data/
│   ├── products/products.json  # Primary product catalog
│   ├── collections/            # Collection metadata
│   ├── combos/                 # Combo product data
│   ├── coupons/                # Coupon data
│   ├── reviews/                # Review data
│   └── site/                   # Site-level data
└── js/
	├── core/                  # Application startup and shared control flow
	├── products/              # Catalog, cards, collections, details, and reviews
	├── cart/                  # Cart and coupon behavior
	├── account/               # Account, order history, and wishlist behavior
	├── orders/                # Order-related behavior
	└── ui/                    # Shared UI helpers and notifications
```

## Main Routes

- `/index.html` - Homepage
- `/pages/collections/index.html` - All collections
- `/pages/collections/<collection>/index.html` - Individual collection pages
- `/pages/product/product.html` - Product details
- `/pages/search.html` - Product search
- `/pages/combo.html` - Product combos
- `/pages/cart.html` - Cart
- `/pages/checkout.html` - Checkout
- `/pages/wishlist.html` - Wishlist
- `/pages/account/` - Login, registration, password recovery, and profile pages
- `/pages/orders/` - Order confirmation and status pages
- `/pages/support/` - Contact and FAQ pages
- `/pages/legal/` - Privacy, refund, shipping, and terms pages

## Data And State

Product records are maintained in `data/products/products.json`. Each product uses fields such as `id`, `name`, `category`, `price`, `originalPrice`, `image`, `collectionSlug`, `rating`, `stock`, `featured`, and `bestSeller`.

The catalog module in `js/products/products.js` requests the JSON file using a path based on the current page depth. It also contains `EMBEDDED_PRODUCTS` as a fallback for offline or `file://` use. When changing products, keep the JSON catalog and the embedded fallback synchronized.

Browser-only state is stored locally:

- Guest cart: `sessionStorage` key `sikkerGuestCart`
- Applied coupon: `sessionStorage` key `sikkerAppliedCoupon`
- Account, wishlist, and order data: managed by the account module in browser storage

This is a front-end demonstration. Cart, account, checkout, payment, and order information are not connected to a production server or payment provider.

## Development Notes

- Preserve the relative paths used by pages at different directory depths.
- Add new products to the JSON catalog and the embedded fallback when offline behavior matters.
- Product images should use paths relative to the project root, matching the existing `images/products/` structure.
- Pages generally load shared behavior through script tags rather than a bundler. Keep script ordering intact when adding dependencies.
- Test both the homepage and nested pages when changing path helpers in the product, cart, or account modules.

## Browser Support

The site targets current desktop and mobile browsers with JavaScript enabled. It uses modern browser APIs including `fetch`, `sessionStorage`, `localStorage`, template literals, and `IntersectionObserver`-style progressive enhancement where applicable.

## License

No license file is currently included. Add the appropriate license before distributing the project outside its intended use.
