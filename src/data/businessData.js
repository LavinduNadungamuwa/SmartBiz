export const kpis = [
  { label: 'Total Revenue', value: '$128,420', growth: '+12.5%', trend: 'up', icon: 'revenue' },
  { label: 'Total Expenses', value: '$42,810', growth: '+4.2%', trend: 'up', icon: 'expenses' },
  { label: 'Net Profit', value: '$85,610', growth: '+18.7%', trend: 'up', icon: 'profit' },
  { label: 'Total Customers', value: '1,248', growth: '+8.1%', trend: 'up', icon: 'customers' },
  { label: 'Total Products', value: '384', growth: '+3.4%', trend: 'up', icon: 'products' },
  { label: 'Total Suppliers', value: '72', growth: '+2.6%', trend: 'up', icon: 'suppliers' },
  { label: 'Total Sales', value: '3,892', growth: '+15.3%', trend: 'up', icon: 'sales' },
  { label: 'Total Invoices', value: '1,036', growth: '-1.8%', trend: 'down', icon: 'invoices' },
];

export const revenueSeries = [18, 28, 24, 42, 38, 54, 61, 58, 74, 82, 88, 96];
export const expenseSeries = [12, 18, 20, 24, 23, 31, 35, 33, 38, 41, 45, 48];
export const salesSeries = [32, 42, 37, 52, 63, 58, 72, 81, 76, 91, 88, 104];

export const topProducts = [
  { label: 'Premium Coffee Beans', value: 92 },
  { label: 'Office Desk Lamp', value: 78 },
  { label: 'Thermal Printer Paper', value: 64 },
  { label: 'Invoice Binder Kit', value: 52 },
  { label: 'POS Barcode Scanner', value: 44 },
];

export const healthMetrics = [
  { label: 'Profit Margin', value: '31.4%', note: 'Healthy operating margin', status: 'good' },
  { label: 'Revenue Growth', value: '+12.5%', note: 'Above 6 month average', status: 'good' },
  { label: 'Expense Growth', value: '+4.2%', note: 'Controlled cost increase', status: 'watch' },
  { label: 'Customer Growth', value: '+8.1%', note: 'New repeat buyers rising', status: 'good' },
];

export const recentSales = [
  { invoice: 'INV-1048', customer: 'Evergreen Stores', amount: '$4,850', date: 'May 29, 2026', status: 'Paid' },
  { invoice: 'INV-1047', customer: 'Urban Nest Co.', amount: '$2,140', date: 'May 28, 2026', status: 'Pending' },
  { invoice: 'INV-1046', customer: 'Lanka Retail Hub', amount: '$7,320', date: 'May 27, 2026', status: 'Paid' },
  { invoice: 'INV-1045', customer: 'Northline Traders', amount: '$1,980', date: 'May 26, 2026', status: 'Overdue' },
];

export const recentInvoices = [
  { invoice: 'INV-1048', customer: 'Evergreen Stores', total: '$4,850', due: 'Jun 12, 2026', status: 'Paid' },
  { invoice: 'INV-1047', customer: 'Urban Nest Co.', total: '$2,140', due: 'Jun 10, 2026', status: 'Pending' },
  { invoice: 'INV-1045', customer: 'Northline Traders', total: '$1,980', due: 'May 30, 2026', status: 'Overdue' },
  { invoice: 'INV-1044', customer: 'Ceylon Office Mart', total: '$3,670', due: 'Jun 04, 2026', status: 'Pending' },
];

export const inventoryAlerts = [
  { name: 'Thermal Printer Paper', detail: '8 units left', severity: 'warning' },
  { name: 'POS Barcode Scanner', detail: 'Out of stock', severity: 'danger' },
  { name: 'Premium Coffee Beans', detail: 'Reorder 120 units', severity: 'warning' },
];

export const aiInsights = [
  'Revenue increased 12.5% compared to last month.',
  'POS Barcode Scanner stock is out and should be reordered today.',
  'Evergreen Stores is your top customer this month.',
  'Travel expenses rose unusually during the last 7 days.',
];

export const customers = [
  ['Amara Perera', 'amara@evergreen.lk', '+94 77 224 1188', '$14,820', 'May 29, 2026'],
  ['Noah Wijesinghe', 'noah@urbannest.com', '+94 71 530 6021', '$8,430', 'May 28, 2026'],
  ['Maya Fernando', 'maya@northline.lk', '+94 76 842 1900', '$6,120', 'May 24, 2026'],
  ['Ravi Silva', 'ravi@ceylonmart.lk', '+94 72 993 2210', '$4,760', 'May 21, 2026'],
  ['Ishara De Alwis', 'ishara@retailhub.lk', '+94 75 118 4429', '$12,980', 'May 18, 2026'],
];

export const products = [
  ['Premium Coffee Beans', 'Food & Beverage', '148', '$18.00', 'Ceylon Agro Supply', 'In Stock'],
  ['Thermal Printer Paper', 'Office Supplies', '8', '$4.50', 'PrintPro Lanka', 'Low Stock'],
  ['POS Barcode Scanner', 'Hardware', '0', '$129.00', 'TechSource Ltd.', 'Out of Stock'],
  ['Office Desk Lamp', 'Workspace', '42', '$36.00', 'Modern Office Co.', 'In Stock'],
  ['Invoice Binder Kit', 'Stationery', '24', '$12.00', 'Paperline Supply', 'In Stock'],
];

export const suppliers = [
  ['Ceylon Agro Supply', 'sales@ceylonagro.lk', '+94 11 440 2201', '18'],
  ['PrintPro Lanka', 'orders@printpro.lk', '+94 11 552 0080', '12'],
  ['TechSource Ltd.', 'hello@techsource.lk', '+94 77 765 1200', '26'],
  ['Modern Office Co.', 'support@modernoffice.lk', '+94 71 345 9301', '9'],
];

export const sales = [
  ['SALE-8841', 'Evergreen Stores', 'Premium Coffee Beans, Desk Lamp', '$4,850', 'May 29, 2026', 'Completed'],
  ['SALE-8840', 'Urban Nest Co.', 'Invoice Binder Kit', '$2,140', 'May 28, 2026', 'Processing'],
  ['SALE-8839', 'Lanka Retail Hub', 'Barcode Scanner', '$7,320', 'May 27, 2026', 'Completed'],
  ['SALE-8838', 'Northline Traders', 'Printer Paper', '$1,980', 'May 26, 2026', 'Refunded'],
];

export const invoices = [
  ['INV-1048', 'Evergreen Stores', '$4,850', 'May 29, 2026', 'Jun 12, 2026', 'Paid'],
  ['INV-1047', 'Urban Nest Co.', '$2,140', 'May 28, 2026', 'Jun 10, 2026', 'Pending'],
  ['INV-1045', 'Northline Traders', '$1,980', 'May 19, 2026', 'May 30, 2026', 'Overdue'],
  ['INV-1044', 'Ceylon Office Mart', '$3,670', 'May 18, 2026', 'Jun 04, 2026', 'Pending'],
];

export const expenses = [
  ['Inventory', 'Restock coffee beans', '$2,820', 'May 29, 2026', 'Bank transfer'],
  ['Operations', 'Warehouse utilities', '$740', 'May 27, 2026', 'Credit card'],
  ['Marketing', 'Social campaign', '$1,250', 'May 25, 2026', 'Credit card'],
  ['Travel', 'Supplier visit', '$430', 'May 23, 2026', 'Cash'],
];
