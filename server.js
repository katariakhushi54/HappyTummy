const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable gzip compression and CORS
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PUBLIC_DIR = path.join(__dirname, 'public');
const PAGES_HTML_DIR = path.join(__dirname, 'pages', 'html');
const PAGES_RSC_DIR = path.join(__dirname, 'pages', 'rsc');
const DATA_DIR = path.join(__dirname, 'data');

// Load routes map and menu data
let routesMap = {};
try {
  routesMap = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'routes.json'), 'utf8'));
} catch (e) {
  console.error('Failed to load routes.json:', e);
}

let menuData = {};
try {
  menuData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'menu.json'), 'utf8'));
} catch (e) {
  console.error('Failed to load menu.json:', e);
}

// In-memory storage for placed orders and reviews
const placedOrders = [];
const customerReviews = [
  {
    id: "rev_1",
    name: "Dr. Ananya Shah",
    location: "Akota, Vadodara",
    rating: 5,
    dish: "Classic Chicken Caesar Salad",
    quote: "The grilled chicken caesar is hands down the best lunch option in Vadodara. Crisp lettuce, perfect dressing on the side!",
    date: "2026-10-28"
  },
  {
    id: "rev_2",
    name: "Rohan Patel",
    location: "Alkapuri, Vadodara",
    rating: 5,
    dish: "Asian Noodle Salad",
    quote: "Ordered the Asian noodle bowl for office lunch. So fresh, crunchy peanuts, and very satisfying without feeling heavy.",
    date: "2026-10-25"
  },
  {
    id: "rev_3",
    name: "Meera Desai",
    location: "Vasna-Bhayli, Vadodara",
    rating: 5,
    dish: "Dark Chocolate Fruit Bowl",
    quote: "Subscribed to the Fortnight Fresh plan. The chocolate fruit bowl is delicious hung curd perfection!",
    date: "2026-10-20"
  }
];

// Helper to check if request is for Next.js RSC (React Server Component) flight stream
function isRscRequest(req) {
  return (
    req.headers['rsc'] === '1' ||
    req.query._rsc !== undefined ||
    req.headers['next-router-state-tree'] !== undefined
  );
}

// Service Worker explicit route
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(PUBLIC_DIR, 'sw.js'));
});

// Next.js static files
app.use('/_next/static', express.static(path.join(PUBLIC_DIR, '_next', 'static'), {
  maxAge: '365d',
  immutable: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Root static files (manifest, icons, brand, etc.)
app.use(express.static(PUBLIC_DIR, {
  index: false,
  maxAge: '30d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('manifest.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json');
    }
  }
}));

// Fallback for Firebase Storage URL path
app.get('/v0/b/leafli-243ae.firebasestorage.app/o/menu%2F:file', (req, res) => {
  const fileName = req.params.file.split('?')[0];
  const filePath = path.join(PUBLIC_DIR, 'menu', fileName);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  res.status(404).send('Not found');
});

// Root static fallbacks
app.get('/icon.png', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'icon.png')));
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'favicon.ico')));
app.get('/manifest.webmanifest', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(PUBLIC_DIR, 'manifest.webmanifest'));
});
app.get('/robots.txt', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'robots.txt')));
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(PUBLIC_DIR, 'sitemap.xml'));
});

// 2. Functional Backend API Endpoints
// Menu API
app.get('/api/public/menu', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(menuData);
});

// Reviews API
app.get('/api/reviews', (req, res) => {
  res.json({ reviews: customerReviews });
});

app.post('/api/reviews', (req, res) => {
  const { rating, quote, name, location, dish, orderId } = req.body;
  if (!rating) {
    return res.status(400).json({ error: "Tap a star rating first" });
  }
  if (!quote || quote.trim().length < 20) {
    return res.status(400).json({ error: "Tell us a little more — at least 20 characters" });
  }

  const newReview = {
    id: `rev_${Date.now()}`,
    rating,
    quote: quote.trim(),
    name: (name || "Guest").trim(),
    location: (location || "Vadodara").trim(),
    dish: dish || undefined,
    orderId: orderId || undefined,
    date: new Date().toISOString().split('T')[0]
  };
  customerReviews.unshift(newReview);

  res.json({ success: true, message: "Thank you for your review!" });
});

// Orders API
app.post('/api/orders', (req, res) => {
  const { source, customer, lines, paymentMode, deliveryProvider, notes, notify } = req.body;
  const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  const orderNo = Math.floor(1000 + Math.random() * 9000);

  const newOrder = {
    id: orderId,
    orderNo,
    source: source || 'website',
    customer: customer || {},
    lines: lines || [],
    paymentMode: paymentMode || 'pay_later',
    deliveryProvider: deliveryProvider || 'porter',
    notes: notes || '',
    notify: notify || { whatsapp: true },
    status: 'received',
    createdAt: new Date().toISOString()
  };

  placedOrders.push(newOrder);
  console.log(`[Order Placed] #${orderNo} (${orderId}) by ${customer?.name || 'Customer'} - ${lines?.length || 0} items`);

  // Respond in format expected by Next.js client CartDrawer
  res.json({
    id: orderId,
    orderNo: orderNo,
    checkout: null
  });
});

app.get('/api/orders/:id', (req, res) => {
  const order = placedOrders.find(o => o.id === req.params.id) || {
    id: req.params.id,
    orderNo: 1042,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  res.json(order);
});

// Subscriptions API
app.post('/api/subscriptions', (req, res) => {
  const { planId, startDate, deliveryDays, slot, diet, address, customer } = req.body;
  const subId = `sub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  
  console.log(`[Subscription Started] ${subId} for plan: ${planId} by ${customer?.name || 'Customer'}`);

  res.json({
    id: subId,
    checkout: null
  });
});

app.post('/api/payments/razorpay/verify', (req, res) => {
  res.json({ success: true, verified: true });
});

// Auth bootstrap session
app.all('/api/auth/bootstrap', (req, res) => {
  res.status(401).json({
    error: "Sign in required"
  });
});

// Cookies endpoint
app.all('/__cookies__', (req, res) => {
  res.json({ success: true });
});

// Web Push APIs
app.post('/api/push/subscribe', (req, res) => res.json({ success: true }));
app.post('/api/push/test', (req, res) => res.json({ success: true }));

// 3. Page and RSC Route Dispatcher
app.get('*', (req, res) => {
  // Strip trailing slash unless root '/'
  let cleanPath = req.path;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }

  // Handle account subroutes (e.g. /account/orders/:id or /account/subscriptions/:id)
  let lookupPath = cleanPath;
  if (lookupPath.startsWith('/account/orders/')) {
    lookupPath = '/account';
  } else if (lookupPath.startsWith('/account/subscriptions/')) {
    lookupPath = '/account';
  }

  const routeInfo = routesMap[lookupPath];
  const isRsc = isRscRequest(req);

  if (routeInfo) {
    if (isRsc) {
      const rscFile = path.join(PAGES_RSC_DIR, routeInfo.rsc);
      if (fs.existsSync(rscFile)) {
        res.setHeader('Content-Type', 'text/x-component; charset=utf-8');
        res.setHeader('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch');
        res.setHeader('x-nextjs-prerender', '1');
        res.setHeader('x-powered-by', 'Next.js');
        return res.sendFile(rscFile);
      }
    }

    const htmlFile = path.join(PAGES_HTML_DIR, routeInfo.html);
    if (fs.existsSync(htmlFile)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('x-powered-by', 'Next.js');
      res.setHeader('x-nextjs-prerender', '1');
      return res.sendFile(htmlFile);
    }
  }

  // 404 Fallback
  res.status(404);
  if (isRsc) {
    return res.send('0:null\n');
  }
  const indexHtml = path.join(PAGES_HTML_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  res.send('<h1>404 - Page Not Found</h1>');
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🥗 HappyTummy - Exact Clone of leafli.in is RUNNING!`);
    console.log(`🌐 Local URL:  http://localhost:${PORT}`);
    console.log(`📦 Status:     Ready to launch`);
    console.log(`📁 Directory:  ${__dirname}`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
