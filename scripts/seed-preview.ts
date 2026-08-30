async function seed() {
  const base = 'http://localhost:4000/api/v1';

  console.log('Seeding initial demo business...');
  // 1. Register
  const regRes = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@apex.com',
      password: 'Password123!',
      firstName: 'Admin',
      lastName: 'Owner',
      businessName: 'Apex Superstore Demo',
      currency: 'USD',
      country: 'US',
    }),
  });
  const regData = await regRes.json();
  const cookies = regRes.headers.get('set-cookie') || '';
  const tenantId = regData.data.tenant.id;

  const authHeaders = {
    'Content-Type': 'application/json',
    'X-Tenant-ID': tenantId,
    'Cookie': cookies,
  };

  // 2. Location
  const locRes = await fetch(`${base}/inventory/locations`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Downtown Main Flagship',
      code: 'MAIN-01',
      type: 'STORE',
      isDefault: true,
    }),
  });
  const locData = await locRes.json();
  const locId = locData.data._id || locData.data.id;

  // 3. Products
  const products = [
    { name: 'Colombian Dark Roast Coffee 500g', sku: 'SKU-COF-01', sellingPrice: 18.50, costPrice: 9.00, barcode: '7501234567890', category: 'Beverages' },
    { name: 'Organic Matcha Green Tea 100g', sku: 'SKU-TEA-02', sellingPrice: 24.00, costPrice: 12.00, barcode: '7501234567891', category: 'Beverages' },
    { name: 'Artisan Sourdough Loaf 750g', sku: 'SKU-BAK-03', sellingPrice: 6.50, costPrice: 2.20, barcode: '7501234567892', category: 'Bakery' },
    { name: 'Stainless Steel Insulated Tumbler', sku: 'SKU-MERCH-04', sellingPrice: 28.00, costPrice: 11.50, barcode: '7501234567893', category: 'Merchandise' },
  ];

  const createdProds = [];
  for (const p of products) {
    const pRes = await fetch(`${base}/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: p.name,
        sku: p.sku,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        categoryName: p.category,
        taxRatePercent: 8.0,
        isTaxable: true,
        trackInventory: true,
        barcodes: [{ barcode: p.barcode, symbology: 'EAN13', isPrimary: true }],
      }),
    });
    const pData = await pRes.json();
    const pid = pData.data._id || pData.data.id;
    createdProds.push({ ...p, id: pid });

    // Opening stock
    await fetch(`${base}/inventory/movements`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        locationId: locId,
        productId: pid,
        transactionType: 'OPENING_BALANCE',
        quantityDelta: 75,
        costPerUnit: p.costPrice,
        notes: 'Initial opening balance',
      }),
    });
  }

  // 4. Customers
  const custRes = await fetch(`${base}/customers`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      displayName: 'Starlight Bistro & Lounge',
      email: 'claire@starlightbistro.com',
      phone: '+1-555-4422',
      roles: ['CUSTOMER'],
      customerDetails: { creditLimit: 2000, paymentTermsDays: 30 },
    }),
  });
  const custData = await custRes.json();
  const custId = custData.data._id;

  // 5. Suppliers
  await fetch(`${base}/suppliers`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      displayName: 'Bean Import Co LLC',
      email: 'orders@beanimport.com',
      phone: '+1-555-8899',
      roles: ['SUPPLIER'],
    }),
  });

  // 6. POS Checkout
  await fetch(`${base}/pos/checkout`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      locationId: locId,
      customerId: custId,
      customerName: 'Starlight Bistro & Lounge',
      items: [
        { productId: createdProds[0].id, quantity: 3, unitPrice: 18.50, taxRatePercent: 8.0 },
        { productId: createdProds[1].id, quantity: 2, unitPrice: 24.00, taxRatePercent: 8.0 },
      ],
      payments: [{ amount: 111.78, paymentMethod: 'CASH', tenderedAmount: 120.0, changeAmount: 8.22 }],
      notes: 'Demo register sale',
    }),
  });

  // 7. Expenses
  await fetch(`${base}/money/expenses`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      category: 'Utilities',
      amount: 145.00,
      paymentMethod: 'CARD',
      notes: 'Store electricity & heating bill',
    }),
  });

  console.log('✅ Demo business successfully initialized with catalog, stock, customer, sale, and expenses!');
}

seed();
