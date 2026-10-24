# Creative Mum Chaos website starter

A responsive, static storefront with product customisation fields, a shopping bag, pickup/postage selection, and a Stripe-hosted card checkout endpoint.

## Important before launch

This is a starter build, not yet a live shop. Product prices are placeholders and must be confirmed. Postage prices/rates are not calculated yet. Artwork file selection is only local in the browser and is NOT uploaded or attached to orders; have customers email artwork after ordering until a secure upload service is added. The checkout function records order details in Stripe Checkout Session metadata, but you should add Stripe webhooks and an order-management workflow before relying on it for fulfilment. Check Australian consumer law, privacy, refund, shipping and returns information before launch.

## Deploy with a free hosting tier

1. Create a GitHub account/repository and upload the contents of this folder (not the ZIP itself).
2. Import the repository into Vercel. The free tier may be suitable for a small starter site; review current provider terms/limits.
3. In Vercel project settings, add environment variables:
   - `STRIPE_SECRET_KEY` = your Stripe **test** secret key first (never put this in index.html or share it in chat).
   - `SITE_URL` = the deployed HTTPS URL, e.g. your Vercel project URL.
4. Deploy and test with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC, while using Stripe test mode only.
5. Only after product prices, postage, order notifications, policies and test orders are verified, add the live Stripe secret key in the hosting environment. Do not accept live payments until ready.
6. Connect `creativemumchaos.com.au` after registering it with an eligible registrar and updating DNS as instructed by the host. The domain usually costs annually; availability is not checked here.

## Update products

Product display details are in `index.html` in the `products` array. The server-side prices are separately defined in `api/create-checkout-session.js` in cents (e.g. `$18.00` = `1800`). Keep those two lists in sync. Never trust a price sent from the browser.

## Contact

The contact form opens the customer's email app addressed to `Creativesmumchaos@gmail.com`.
