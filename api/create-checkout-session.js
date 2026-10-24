const Stripe = require('stripe');

// IMPORTANT: Keep prices on the server. Update these starter prices before launch.
const CATALOG = {
  mug: { name: 'Personalised Coffee Mug', amount: 1800 },
  glasscup: { name: 'Glass Coffee Cup', amount: 2200 },
  latte: { name: 'Insulated Latte Cup', amount: 2800 },
  tumbler: { name: 'Personalised Tumbler', amount: 3000 },
  plastic: { name: 'Plastic Tumbler', amount: 1600 },
  tee: { name: 'Custom T-shirt', amount: 2500 },
  tote: { name: 'Personalised Tote Bag', amount: 1800 },
  hat: { name: 'Trucker Hat', amount: 2400 },
  stubby: { name: 'Stubby Cooler', amount: 1000 },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'Stripe is not connected yet. Add STRIPE_SECRET_KEY in your hosting environment settings.' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { customer, fulfilment, address, notes, items } = req.body || {};
    if (!customer?.name || !customer?.email || !Array.isArray(items) || items.length < 1 || items.length > 30) {
      return res.status(400).json({ error: 'Please provide your name, email and at least one item.' });
    }
    if (!['postage', 'pickup'].includes(fulfilment)) return res.status(400).json({ error: 'Choose postage or local pickup.' });
    if (fulfilment === 'postage' && (!address?.line1 || !address?.suburb || !address?.postcode)) return res.status(400).json({ error: 'Please complete your delivery address.' });
    const line_items = items.map(item => {
      const p = CATALOG[item.id];
      if (!p) throw new Error('One of the selected products is unavailable.');
      return { price_data: { currency: 'aud', unit_amount: p.amount, product_data: { name: p.name, description: customSummary(item.custom) } }, quantity: 1 };
    });
    const base = process.env.SITE_URL;
    if (!base || !/^https:\/\//i.test(base)) return res.status(503).json({ error: 'Add SITE_URL as your deployed HTTPS website address in hosting settings.' });
    const metadata = {
      customer_name: String(customer.name).slice(0, 200),
      fulfilment,
      order_notes: String(notes || '').slice(0, 450),
      customisations: JSON.stringify(items.map(i => ({ product: CATALOG[i.id]?.name, custom: safeCustom(i.custom) }))).slice(0, 450),
      delivery_address: fulfilment === 'postage' ? `${address.line1}, ${address.suburb}, ${address.state || ''} ${address.postcode}, Australia`.slice(0, 450) : 'Local pickup: Gleneagle QLD',
    };
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', payment_method_types: ['card'], line_items,
      customer_email: String(customer.email).slice(0, 250), metadata,
      billing_address_collection: 'required',
      ...(fulfilment === 'postage' ? { shipping_address_collection: { allowed_countries: ['AU'] } } : {}),
      success_url: `${base.replace(/\/$/, '')}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base.replace(/\/$/, '')}/?payment=cancelled`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(400).json({ error: 'We could not start checkout. Please try again or email Creativesmumchaos@gmail.com.' });
  }
};
function safeCustom(c = {}) { return { wording: String(c.wording || '').slice(0, 180), colour: String(c.colour || '').slice(0, 60), size: String(c.size || '').slice(0, 20), notes: String(c.notes || '').slice(0, 300), artwork_filename: String(c.file || '').slice(0, 150) }; }
function customSummary(c = {}) { const x = safeCustom(c); return [x.wording && `Wording: ${x.wording}`, x.colour && `Colour: ${x.colour}`, x.size && `Size: ${x.size}`, x.notes && `Notes: ${x.notes}`].filter(Boolean).join(' | ').slice(0, 450) || 'Made-to-order item'; }
