// Seed data used by the mock database until the Express/MongoDB backend is connected.
// Contact numbers, prices and policies are PLACEHOLDERS — the owner must confirm them.

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const daysAhead = (n) => {
  const d = new Date(Date.now() + n * 86400000);
  return d.toISOString().slice(0, 10);
};

export const seedSettings = {
  businessName: 'Mystic Blooms',
  tagline: 'Handmade chenille-stem flowers that bloom forever',
  logoUrl: '',
  currency: 'PKR',
  storeStatus: 'open', // open | closed | preorder
  leadTimeDays: 14,
  dailyCapacity: 5,
  blockedDates: [],
  minOrderValue: 1000,
  freeDeliveryOver: 0,
  orderPrefix: 'MB',
  contact: {
    whatsapp: '923000000000',
    phone: '+92 300 0000000',
    email: 'hello@mysticblooms.pk',
    instagram: 'https://www.instagram.com/mystic.blooms_',
    address: 'Rawalpindi, Pakistan',
    hours: 'Mon – Sat, 11:00 AM – 8:00 PM',
    responseTime: 'We usually reply within a few hours.',
  },
  deliveryZones: [
    { city: 'Rawalpindi', fee: 250, days: '1–2' },
    { city: 'Islamabad', fee: 300, days: '1–2' },
    { city: 'Lahore', fee: 450, days: '2–4' },
    { city: 'Karachi', fee: 550, days: '3–5' },
    { city: 'Peshawar', fee: 450, days: '2–4' },
    { city: 'Faisalabad', fee: 450, days: '2–4' },
    { city: 'Multan', fee: 500, days: '3–5' },
    { city: 'Other', fee: 600, days: '3–6' },
  ],
  paymentMethods: [
    { id: 'cod', label: 'Cash on Delivery', enabled: true, instructions: 'Pay the rider in cash when your flowers arrive.' },
    { id: 'bank', label: 'Bank Transfer', enabled: true, instructions: 'Account Title: Mystic Blooms\nBank: (to be confirmed)\nIBAN: PK00 XXXX 0000 0000 0000 0000' },
    { id: 'easypaisa', label: 'Easypaisa', enabled: true, instructions: 'Send to Easypaisa: 0300 0000000 (Mystic Blooms)' },
    { id: 'jazzcash', label: 'JazzCash', enabled: true, instructions: 'Send to JazzCash: 0300 0000000 (Mystic Blooms)' },
  ],
  orderStatuses: ['New', 'Confirmed', 'In Preparation', 'Ready', 'Dispatched', 'Delivered', 'Cancelled'],
  notifications: {
    adminEmail: 'hello@mysticblooms.pk',
    orderConfirmation: 'Hi {name}, thank you for your order {orderNumber}! We will confirm it shortly.',
    statusUpdate: 'Hi {name}, your order {orderNumber} is now {status}.',
  },
};

export const seedCms = {
  announcement: {
    enabled: true,
    text: '🌸 Please book at least 2 weeks in advance • Nationwide delivery across Pakistan 🌸',
  },
  hero: {
    eyebrow: "Rawalpindi's chenille-stem flower studio",
    heading: 'Flowers that never wilt, made by hand with love',
    subheading:
      'Bouquets, baskets and keepsakes twisted stem by stem from soft chenille — made to order and delivered anywhere in Pakistan.',
    image: '',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
  },
  about: {
    title: 'Our Story',
    story:
      'Mystic Blooms began with a handful of fuzzy chenille stems and a wish to make flowers that last forever. Every petal is shaped, twisted and arranged by hand in our small studio in Rawalpindi.\n\nBecause each piece is handmade, no two bouquets are exactly alike. We take bookings around two weeks ahead so that every order gets the time and care it deserves.',
    process: [
      { title: 'You choose', text: 'Pick a design or tell us your idea, colours and occasion.' },
      { title: 'We craft', text: 'Each stem is shaped by hand — petals, leaves and wrapping.' },
      { title: 'We deliver', text: 'Packed carefully and sent to your door anywhere in Pakistan.' },
    ],
    image: '',
  },
  faqs: [
    { q: 'How far in advance should I order?', a: 'We recommend booking at least 2 weeks in advance because every piece is handmade. Checkout only shows dates we can prepare in time.' },
    { q: 'Do you deliver outside Rawalpindi?', a: 'Yes! We deliver nationwide across Pakistan. Delivery fees depend on your city and are shown at checkout.' },
    { q: 'Do chenille flowers need water or care?', a: 'No water needed. Keep them away from direct sunlight and moisture, and gently dust them with a soft brush.' },
    { q: 'Can I request a custom design?', a: 'Absolutely. Use our Custom Order form to share colours, budget, occasion and reference photos and we will send you a quote.' },
    { q: 'Which payment methods do you accept?', a: 'Cash on Delivery, Bank Transfer, Easypaisa and JazzCash. For transfers, share your transaction reference at checkout.' },
    { q: 'Can I send flowers as a gift?', a: 'Yes. At checkout tick "This is a gift", add the recipient details and a message card. We can hide prices on the packing slip.' },
  ],
  testimonials: [
    { name: 'Ayesha K.', city: 'Islamabad', rating: 5, text: 'The bouquet was even prettier than the pictures. My mother still keeps it on her table!' },
    { name: 'Hamza R.', city: 'Lahore', rating: 5, text: 'Ordered an anniversary basket — beautifully packed and delivered right on time.' },
    { name: 'Sana M.', city: 'Rawalpindi', rating: 5, text: 'So soft and detailed. You can really feel the love that went into every petal.' },
  ],
  policies: {
    delivery: {
      title: 'Delivery & Shipping Policy',
      content:
        'We deliver nationwide across Pakistan through trusted courier partners.\n\n• Rawalpindi & Islamabad: 1–2 working days after dispatch.\n• Other cities: 2–6 working days after dispatch.\n\nDelivery charges are calculated by city and shown before you place your order.\n\nIf the recipient is unavailable, the courier will attempt re-delivery. Additional charges may apply for a third attempt or address changes after dispatch.',
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      content:
        'Because every product is handmade to order, cancellations are accepted free of charge only before we start preparing your order (status: New or Confirmed).\n\nOrders already in preparation cannot be cancelled. If your parcel arrives damaged, please message us within 24 hours with photos and we will repair or replace it.\n\nRefunds for approved cases are processed to the original payment method within 7 working days.',
    },
    privacy: {
      title: 'Privacy Policy',
      content:
        'We only collect the information needed to process and deliver your order: name, phone number, email (optional), and delivery address.\n\nWe never store card numbers or payment credentials. Your details are only shared with the courier for delivery.\n\nYou may request correction or deletion of your data at any time by contacting us.',
    },
    terms: {
      title: 'Terms & Conditions',
      content:
        'By placing an order you agree to our booking lead time, delivery and refund policies.\n\nProduct photos are representative; since every item is handmade, small variations in shade and shape are natural.\n\nPrices are listed in Pakistani Rupees (PKR) and may change without notice. The price at the time of your order is honoured.',
    },
    'custom-orders': {
      title: 'Custom Order Policy',
      content:
        'Custom designs are quoted individually based on size, stem count and complexity.\n\nAn advance payment may be required to confirm a custom order. Custom pieces need at least 2 weeks of preparation time.\n\nOnce production begins, design changes may affect the price and delivery date.',
    },
  },
};

export const seedCategories = [
  { _id: 'cat-bouquets', name: 'Bouquets', slug: 'bouquets', description: 'Hand-wrapped bouquets for every occasion.', image: '', order: 1, active: true },
  { _id: 'cat-stems', name: 'Single Stems', slug: 'single-stems', description: 'A single everlasting bloom — simple and sweet.', image: '', order: 2, active: true },
  { _id: 'cat-baskets', name: 'Flower Baskets', slug: 'flower-baskets', description: 'Baskets bursting with colourful chenille flowers.', image: '', order: 3, active: true },
  { _id: 'cat-gifts', name: 'Gift Arrangements', slug: 'gift-arrangements', description: 'Gift boxes, keepsakes and little extras.', image: '', order: 4, active: true },
  { _id: 'cat-custom', name: 'Custom Orders', slug: 'custom-orders', description: 'Your idea, your colours — made just for you.', image: '', order: 5, active: true },
];

const sizeOption = (s, m, l) => ({
  name: 'Size',
  required: true,
  values: [
    { label: 'Small', priceAdjustment: s },
    { label: 'Medium', priceAdjustment: m },
    { label: 'Large', priceAdjustment: l },
  ],
});

const wrappingOption = {
  name: 'Wrapping',
  required: false,
  values: [
    { label: 'Classic Kraft', priceAdjustment: 0 },
    { label: 'Pastel Paper', priceAdjustment: 150 },
    { label: 'Luxury Black', priceAdjustment: 300 },
  ],
};

const fullPersonalisation = { recipientName: true, messageCard: true, colourPreference: true, specialInstructions: true };

export const seedProducts = [
  {
    _id: 'p-1', name: 'Midnight Rose Bouquet', slug: 'midnight-rose-bouquet', category: 'cat-bouquets',
    description: 'Deep crimson and blush chenille roses wrapped in matte black paper. A dramatic, everlasting statement bouquet.',
    images: [], color: '#8e2c48', price: 4500, salePrice: null, sku: 'MB-BQ-001', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: true, bestseller: true, isNew: false,
    status: 'published', available: true, tags: ['roses', 'romantic'], colors: ['Red', 'Pink'], occasions: ['Anniversary', 'Valentine'],
    options: [sizeOption(0, 1500, 3000), wrappingOption], personalisation: fullPersonalisation,
    careInstructions: 'Keep away from water and direct sunlight. Dust gently with a soft brush.',
    seoTitle: 'Midnight Rose Chenille Bouquet', seoDescription: 'Handmade crimson chenille rose bouquet.', sold: 34, createdAt: daysAgo(60),
  },
  {
    _id: 'p-2', name: 'Blush Peony Bouquet', slug: 'blush-peony-bouquet', category: 'cat-bouquets',
    description: 'Fluffy blush-pink peonies with soft green leaves, finished with a satin ribbon.',
    images: [], color: '#e89bb3', price: 3800, salePrice: 3400, sku: 'MB-BQ-002', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: true, bestseller: true, isNew: false,
    status: 'published', available: true, tags: ['peony'], colors: ['Pink'], occasions: ['Birthday', 'Mother\'s Day'],
    options: [sizeOption(0, 1200, 2500), wrappingOption], personalisation: fullPersonalisation,
    careInstructions: 'No water needed. Store in a dry place.', seoTitle: '', seoDescription: '', sold: 28, createdAt: daysAgo(45),
  },
  {
    _id: 'p-3', name: 'Lavender Dreams Bouquet', slug: 'lavender-dreams-bouquet', category: 'cat-bouquets',
    description: 'Lilac and white tulips with tiny baby-breath accents. Calm, dreamy and pastel.',
    images: [], color: '#9b7fc2', price: 3500, salePrice: null, sku: 'MB-BQ-003', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: false, bestseller: false, isNew: true,
    status: 'published', available: true, tags: ['tulip', 'pastel'], colors: ['Purple', 'White'], occasions: ['Birthday', 'Graduation'],
    options: [sizeOption(0, 1200, 2500), wrappingOption], personalisation: fullPersonalisation,
    careInstructions: 'Keep away from moisture.', seoTitle: '', seoDescription: '', sold: 9, createdAt: daysAgo(6),
  },
  {
    _id: 'p-4', name: 'Single Red Rose', slug: 'single-red-rose', category: 'cat-stems',
    description: 'One perfect chenille rose with a leafy stem — the sweetest forever gift.',
    images: [], color: '#c0304f', price: 650, salePrice: null, sku: 'MB-SS-001', type: 'ready-made',
    stock: 18, lowStockThreshold: 5, leadTimeDays: 3, featured: true, bestseller: true, isNew: false,
    status: 'published', available: true, tags: ['rose'], colors: ['Red'], occasions: ['Valentine', 'Anniversary'],
    options: [], personalisation: { recipientName: false, messageCard: true, colourPreference: false, specialInstructions: true },
    careInstructions: 'Dust gently.', seoTitle: '', seoDescription: '', sold: 62, createdAt: daysAgo(90),
  },
  {
    _id: 'p-5', name: 'Sunflower Stem', slug: 'sunflower-stem', category: 'cat-stems',
    description: 'A bright, cheerful chenille sunflower to light up any desk.',
    images: [], color: '#e5a823', price: 700, salePrice: null, sku: 'MB-SS-002', type: 'ready-made',
    stock: 4, lowStockThreshold: 5, leadTimeDays: 3, featured: false, bestseller: false, isNew: true,
    status: 'published', available: true, tags: ['sunflower'], colors: ['Yellow'], occasions: ['Friendship', 'Get Well'],
    options: [], personalisation: { recipientName: false, messageCard: true, colourPreference: false, specialInstructions: true },
    careInstructions: 'Dust gently.', seoTitle: '', seoDescription: '', sold: 21, createdAt: daysAgo(10),
  },
  {
    _id: 'p-6', name: 'Tulip Trio', slug: 'tulip-trio', category: 'cat-stems',
    description: 'Three tulip stems in the colours of your choice, tied with twine.',
    images: [], color: '#f08a7e', price: 1600, salePrice: null, sku: 'MB-SS-003', type: 'ready-made',
    stock: 9, lowStockThreshold: 3, leadTimeDays: 3, featured: false, bestseller: false, isNew: false,
    status: 'published', available: true, tags: ['tulip'], colors: ['Pink', 'Orange', 'White'], occasions: ['Birthday', 'Friendship'],
    options: [{ name: 'Colour Mix', required: true, values: [{ label: 'Pastel', priceAdjustment: 0 }, { label: 'Bright', priceAdjustment: 0 }, { label: 'All White', priceAdjustment: 0 }] }],
    personalisation: { recipientName: false, messageCard: true, colourPreference: false, specialInstructions: true },
    careInstructions: 'Dust gently.', seoTitle: '', seoDescription: '', sold: 14, createdAt: daysAgo(30),
  },
  {
    _id: 'p-7', name: 'Rainbow Flower Basket', slug: 'rainbow-flower-basket', category: 'cat-baskets',
    description: 'A woven basket overflowing with multicoloured chenille blooms — joy in a basket.',
    images: [], color: '#4fa3c7', price: 6500, salePrice: null, sku: 'MB-FB-001', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: true, bestseller: true, isNew: false,
    status: 'published', available: true, tags: ['basket', 'colourful'], colors: ['Multicolour'], occasions: ['Birthday', 'Congratulations'],
    options: [sizeOption(0, 2000, 4000)], personalisation: fullPersonalisation,
    careInstructions: 'Keep the basket dry.', seoTitle: '', seoDescription: '', sold: 19, createdAt: daysAgo(50),
  },
  {
    _id: 'p-8', name: 'Pastel Garden Basket', slug: 'pastel-garden-basket', category: 'cat-baskets',
    description: 'Soft pastel roses, daisies and lilies arranged in a white wicker basket.',
    images: [], color: '#b6d7a8', price: 5800, salePrice: null, sku: 'MB-FB-002', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: false, bestseller: false, isNew: true,
    status: 'published', available: true, tags: ['basket', 'pastel'], colors: ['Pink', 'White', 'Green'], occasions: ['Mother\'s Day', 'Wedding'],
    options: [sizeOption(0, 1800, 3500)], personalisation: fullPersonalisation,
    careInstructions: 'Keep the basket dry.', seoTitle: '', seoDescription: '', sold: 7, createdAt: daysAgo(4),
  },
  {
    _id: 'p-9', name: 'Bloom Gift Box', slug: 'bloom-gift-box', category: 'cat-gifts',
    description: 'A keepsake box with a mini bouquet, a chocolate bar and a handwritten card.',
    images: [], color: '#d77fa1', price: 4200, salePrice: null, sku: 'MB-GA-001', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 10, featured: true, bestseller: false, isNew: false,
    status: 'published', available: true, tags: ['gift box'], colors: ['Pink'], occasions: ['Birthday', 'Eid', 'Anniversary'],
    options: [{ name: 'Add-on', required: false, values: [{ label: 'None', priceAdjustment: 0 }, { label: 'Teddy Bear', priceAdjustment: 800 }, { label: 'Scented Candle', priceAdjustment: 600 }] }],
    personalisation: fullPersonalisation,
    careInstructions: 'Store chocolates in a cool place.', seoTitle: '', seoDescription: '', sold: 16, createdAt: daysAgo(25),
  },
  {
    _id: 'p-10', name: 'Eid Mubarak Hamper', slug: 'eid-mubarak-hamper', category: 'cat-gifts',
    description: 'Festive hamper with a gold-and-white chenille arrangement and Eid greeting card.',
    images: [], color: '#c9a24a', price: 7500, salePrice: null, sku: 'MB-GA-002', type: 'made-to-order',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: false, bestseller: false, isNew: false,
    status: 'published', available: true, tags: ['eid', 'seasonal'], colors: ['Gold', 'White'], occasions: ['Eid'],
    options: [], personalisation: fullPersonalisation,
    careInstructions: 'Keep dry.', seoTitle: '', seoDescription: '', sold: 5, createdAt: daysAgo(35),
  },
  {
    _id: 'p-11', name: 'Design Your Own Bouquet', slug: 'design-your-own-bouquet', category: 'cat-custom',
    description: 'Tell us your colours, flowers and budget — we will craft a one-of-a-kind bouquet and send you a quote.',
    images: [], color: '#6c4a7d', price: 3000, salePrice: null, sku: 'MB-CU-001', type: 'custom',
    stock: null, lowStockThreshold: 0, leadTimeDays: 14, featured: false, bestseller: false, isNew: false,
    status: 'published', available: true, tags: ['custom'], colors: ['Multicolour'], occasions: ['Any'],
    options: [], personalisation: fullPersonalisation,
    careInstructions: '', seoTitle: '', seoDescription: '', sold: 0, createdAt: daysAgo(80),
  },
  {
    _id: 'p-12', name: 'Daisy Desk Pot', slug: 'daisy-desk-pot', category: 'cat-gifts',
    description: 'A tiny terracotta pot with white chenille daisies — perfect for a desk or shelf.',
    images: [], color: '#f3f0e6', price: 1200, salePrice: null, sku: 'MB-GA-003', type: 'ready-made',
    stock: 0, lowStockThreshold: 3, leadTimeDays: 3, featured: false, bestseller: false, isNew: false,
    status: 'published', available: true, tags: ['daisy', 'pot'], colors: ['White', 'Yellow'], occasions: ['Friendship'],
    options: [], personalisation: { recipientName: false, messageCard: true, colourPreference: false, specialInstructions: false },
    careInstructions: 'Dust gently.', seoTitle: '', seoDescription: '', sold: 11, createdAt: daysAgo(70),
  },
];

export const seedUsers = [
  { _id: 'u-admin', name: 'Mystic Blooms Owner', email: 'admin@mysticblooms.pk', phone: '03000000000', password: 'admin123', role: 'admin', addresses: [], createdAt: daysAgo(120) },
  { _id: 'u-staff', name: 'Studio Staff', email: 'staff@mysticblooms.pk', phone: '03000000001', password: 'staff123', role: 'staff', addresses: [], createdAt: daysAgo(100) },
  {
    _id: 'u-1', name: 'Ayesha Khan', email: 'ayesha@example.com', phone: '03001234567', password: 'password', role: 'customer',
    addresses: [{ _id: 'a-1', label: 'Home', address: 'House 12, Street 4, F-7/2', city: 'Islamabad', postalCode: '44000', isDefault: true }],
    createdAt: daysAgo(40),
  },
];

const snap = (p, qty, options = {}, extra = 0) => ({
  productId: p._id, name: p.name, sku: p.sku, color: p.color, image: p.images[0] || '',
  options, unitPrice: (p.salePrice || p.price) + extra, quantity: qty, lineTotal: ((p.salePrice || p.price) + extra) * qty,
  personalisation: {},
});

export const seedOrders = [
  {
    _id: 'o-1', orderNumber: 'MB-10001', createdAt: daysAgo(12), customerId: 'u-1',
    customer: { name: 'Ayesha Khan', phone: '03001234567', email: 'ayesha@example.com' },
    shipping: { address: 'House 12, Street 4, F-7/2', city: 'Islamabad', postalCode: '44000', notes: 'Call before arriving' },
    recipient: { isGift: false },
    requestedDate: daysAhead(2),
    items: [snap(seedProducts[0], 1, { Size: 'Medium', Wrapping: 'Luxury Black' }, 1800)],
    subtotal: 6300, discount: 0, couponCode: '', deliveryFee: 300, total: 6600,
    payment: { method: 'bank', status: 'Paid', reference: 'TRX-889201' },
    status: 'In Preparation',
    statusHistory: [
      { status: 'New', at: daysAgo(12), note: 'Order placed' },
      { status: 'Confirmed', at: daysAgo(11), note: 'Payment verified' },
      { status: 'In Preparation', at: daysAgo(3), note: '' },
    ],
    adminNotes: [], courier: { name: '', tracking: '', dispatchDate: '' },
  },
  {
    _id: 'o-2', orderNumber: 'MB-10002', createdAt: daysAgo(5), customerId: null,
    customer: { name: 'Bilal Ahmed', phone: '03211234567', email: '' },
    shipping: { address: 'Flat 3B, Gulberg III', city: 'Lahore', postalCode: '54000', notes: '' },
    recipient: { isGift: true, name: 'Maryam', phone: '03331234567', message: 'Happy Birthday! ❤️', hidePrices: true },
    requestedDate: daysAhead(9),
    items: [snap(seedProducts[6], 1, { Size: 'Small' }), snap(seedProducts[3], 2)],
    subtotal: 7800, discount: 0, couponCode: '', deliveryFee: 450, total: 8250,
    payment: { method: 'cod', status: 'Unpaid', reference: '' },
    status: 'Confirmed',
    statusHistory: [
      { status: 'New', at: daysAgo(5), note: 'Order placed' },
      { status: 'Confirmed', at: daysAgo(4), note: '' },
    ],
    adminNotes: [], courier: { name: '', tracking: '', dispatchDate: '' },
  },
  {
    _id: 'o-3', orderNumber: 'MB-10003', createdAt: daysAgo(1), customerId: null,
    customer: { name: 'Fatima Noor', phone: '03451234567', email: 'fatima@example.com' },
    shipping: { address: 'Street 9, Bahria Town Phase 4', city: 'Rawalpindi', postalCode: '46000', notes: '' },
    recipient: { isGift: false },
    requestedDate: daysAhead(14),
    items: [snap(seedProducts[1], 1, { Size: 'Small', Wrapping: 'Pastel Paper' }, 150)],
    subtotal: 3550, discount: 355, couponCode: 'BLOOM10', deliveryFee: 250, total: 3445,
    payment: { method: 'easypaisa', status: 'Awaiting Verification', reference: 'EP-55120' },
    status: 'New',
    statusHistory: [{ status: 'New', at: daysAgo(1), note: 'Order placed' }],
    adminNotes: [], courier: { name: '', tracking: '', dispatchDate: '' },
  },
  {
    _id: 'o-4', orderNumber: 'MB-10000', createdAt: daysAgo(25), customerId: 'u-1',
    customer: { name: 'Ayesha Khan', phone: '03001234567', email: 'ayesha@example.com' },
    shipping: { address: 'House 12, Street 4, F-7/2', city: 'Islamabad', postalCode: '44000', notes: '' },
    recipient: { isGift: false },
    requestedDate: daysAhead(-10),
    items: [snap(seedProducts[8], 1, { 'Add-on': 'Teddy Bear' }, 800)],
    subtotal: 5000, discount: 0, couponCode: '', deliveryFee: 300, total: 5300,
    payment: { method: 'cod', status: 'Paid', reference: '' },
    status: 'Delivered',
    statusHistory: [
      { status: 'New', at: daysAgo(25), note: 'Order placed' },
      { status: 'Confirmed', at: daysAgo(24), note: '' },
      { status: 'In Preparation', at: daysAgo(20), note: '' },
      { status: 'Ready', at: daysAgo(13), note: '' },
      { status: 'Dispatched', at: daysAgo(12), note: 'TCS #77120034' },
      { status: 'Delivered', at: daysAgo(10), note: '' },
    ],
    adminNotes: [], courier: { name: 'TCS', tracking: '77120034', dispatchDate: daysAhead(-12) },
  },
];

export const seedCoupons = [
  { _id: 'c-1', code: 'BLOOM10', type: 'percent', value: 10, minOrder: 2000, startDate: '', endDate: '', usageLimit: 100, used: 1, active: true, freeDelivery: false },
  { _id: 'c-2', code: 'FREESHIP', type: 'fixed', value: 0, minOrder: 5000, startDate: '', endDate: '', usageLimit: 50, used: 0, active: true, freeDelivery: true },
];

export const seedReviews = [
  { _id: 'r-1', productId: 'p-1', orderId: 'o-4', name: 'Ayesha K.', rating: 5, comment: 'Absolutely gorgeous, looks just like real roses!', status: 'approved', createdAt: daysAgo(9) },
  { _id: 'r-2', productId: 'p-4', orderId: null, name: 'Usman', rating: 4, comment: 'Lovely little gift, my wife loved it.', status: 'approved', createdAt: daysAgo(20) },
  { _id: 'r-3', productId: 'p-9', orderId: 'o-4', name: 'Ayesha K.', rating: 5, comment: 'Teddy + bouquet combo was so cute.', status: 'pending', createdAt: daysAgo(8) },
];

export const seedEnquiries = [
  { _id: 'e-1', type: 'custom', name: 'Zara Ali', phone: '03121234567', email: 'zara@example.com', occasion: 'Wedding', colours: 'Ivory, sage green', budget: '15,000 – 20,000', size: 'Large', deliveryDate: daysAhead(25), message: 'Bridal bouquet with matching boutonniere.', referenceImage: '', status: 'new', createdAt: daysAgo(2) },
  { _id: 'e-2', type: 'contact', name: 'Omar', phone: '03011234567', email: '', subject: 'Bulk order', message: 'Can you make 30 single stems for a corporate event?', status: 'new', createdAt: daysAgo(1) },
];

export const seedInventoryLog = [
  { _id: 'iv-1', productId: 'p-5', change: -3, reason: 'Sold', stockAfter: 4, at: daysAgo(3) },
  { _id: 'iv-2', productId: 'p-4', change: 10, reason: 'Restock', stockAfter: 18, at: daysAgo(7) },
];
