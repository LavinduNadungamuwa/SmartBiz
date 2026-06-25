import { AreaChart, BarChart, ChartCard, HorizontalBarChart, LineChart } from '../components/charts';
import DataTable from '../components/ui/DataTable';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import { useBusinessData } from '../api/resources';
import { currency, date, indexById, lastMonthsSeries, number, percent, productStatus, status } from '../utils/formatters';

export default function Dashboard() {
  const { data, loading, error, reload } = useBusinessData();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const { summary, customers, products, suppliers, sales, invoices, expenses } = data;
  const revenue = lastMonthsSeries(sales, 'saleDate', 'totalAmount');
  const expenseTrend = lastMonthsSeries(expenses, 'expenseDate', 'amount');
  const customerById = indexById(customers);
  const netProfit = Number(summary.netProfit || 0);
  const totalRevenue = Number(summary.totalRevenue || 0);
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const lowStock = products.filter((product) => Number(product.stockQuantity || 0) <= 10);

  const kpis = [
    { label: 'Total Revenue', value: currency(summary.totalRevenue), growth: 'Live', icon: 'revenue' },
    { label: 'Total Expenses', value: currency(summary.totalExpenses), growth: 'Live', icon: 'expenses' },
    { label: 'Net Profit', value: currency(summary.netProfit), growth: margin >= 0 ? percent(margin) : 'Loss', trend: margin >= 0 ? 'up' : 'down', icon: 'profit' },
    { label: 'Total Customers', value: number(summary.totalCustomers), growth: 'Live', icon: 'customers' },
    { label: 'Total Products', value: number(summary.totalProducts), growth: `${lowStock.length} alerts`, trend: lowStock.length ? 'down' : 'up', icon: 'products' },
    { label: 'Total Suppliers', value: number(suppliers.length), growth: 'Live', icon: 'suppliers' },
    { label: 'Total Sales', value: number(summary.totalSales), growth: 'Live', icon: 'sales' },
    { label: 'Total Invoices', value: number(summary.totalInvoices), growth: 'Live', icon: 'invoices' },
  ];

  const healthMetrics = [
    { label: 'Profit Margin', value: percent(margin), note: 'Calculated from revenue and expenses', status: margin >= 20 ? 'good' : 'watch' },
    { label: 'Revenue Growth', value: currency(revenue.raw.at(-1)), note: 'Current month revenue', status: 'good' },
    { label: 'Expense Growth', value: currency(expenseTrend.raw.at(-1)), note: 'Current month expenses', status: 'watch' },
    { label: 'Customer Growth', value: number(customers.length), note: 'Active customer records', status: 'good' },
  ];

  const topProducts = products
    .map((product) => ({ label: product.productName, value: Math.max(5, Math.min(100, Number(product.stockQuantity || 0))) }))
    .slice(0, 5);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Dashboard"
        title="Business overview"
        description="Live metrics from smartbiz_db through the SmartBiz backend."
      />

      {/* KPI stat cards — 4-col grid, collapses to 2 then 1 */}
      <section className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {kpis.map((kpi) => <StatCard key={kpi.label} trend="up" {...kpi} />)}
      </section>

      {/* Charts row — 3 col */}
      <section className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-1">
        <ChartCard title="Sales Performance" subtitle="Sales trend over time">
          <AreaChart data={revenue.values} labels={revenue.labels} />
        </ChartCard>
        <ChartCard title="Expense Overview" subtitle="Monthly business expenses">
          <LineChart data={expenseTrend.values} labels={expenseTrend.labels} />
        </ChartCard>
        <ChartCard title="Revenue vs Expenses" subtitle="Live sales and expense totals">
          <BarChart revenue={revenue.raw} expenses={expenseTrend.raw} labels={revenue.labels} />
        </ChartCard>
      </section>

      {/* Health metrics row — 4 col */}
      <section className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {healthMetrics.map((metric) => (
          <article
            key={metric.label}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-[18px]"
          >
            <span
              className={[
                'block w-2.5 h-2.5 rounded-full',
                metric.status === 'good' ? 'bg-[var(--green)]' : 'bg-[var(--orange)]',
              ].join(' ')}
            />
            <p className="text-[var(--muted)] mt-[10px] mb-1">{metric.label}</p>
            <strong className="text-2xl">{metric.value}</strong>
            <small className="block text-[var(--muted)] mt-1.5">{metric.note}</small>
          </article>
        ))}
      </section>

      {/* Recent Sales + Recent Invoices — 2 col */}
      <section className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
        <section className="card">
          <div className="card-header">
            <h2>Recent Sales</h2>
          </div>
          <DataTable
            columns={['Sale ID', 'Customer', 'Amount', 'Date', 'Status']}
            rows={[...sales]
              .sort((a, b) => {
                const da = new Date(a.saleDate || 0).getTime();
                const db = new Date(b.saleDate || 0).getTime();
                return db - da || (b.id || 0) - (a.id || 0);
              })
              .slice(0, 5)
              .map((sale) => [
                `SALE-${sale.id}`,
                customerById[sale.customerId]?.fullName || `Customer #${sale.customerId || '-'}`,
                currency(sale.totalAmount),
                date(sale.saleDate),
                status(sale.status),
              ])
            }
          />
        </section>
        <section className="card">
          <div className="card-header">
            <h2>Recent Invoices</h2>
          </div>
          <DataTable
            columns={['Invoice Number', 'Sale', 'Total', 'Issue Date', 'Status']}
            rows={[...invoices]
              .sort((a, b) => {
                const da = new Date(a.issueDate || 0).getTime();
                const db = new Date(b.issueDate || 0).getTime();
                return db - da || (b.id || 0) - (a.id || 0);
              })
              .slice(0, 5)
              .map((invoice) => [
                invoice.invoiceNumber || `INV-${invoice.id}`,
                `Sale #${invoice.saleId || '-'}`,
                currency(invoice.totalAmount),
                date(invoice.issueDate),
                status(invoice.status),
              ])
            }
          />
        </section>
      </section>

      {/* Bottom row — 3 col, stretch-aligned */}
      <section className="grid grid-cols-3 gap-4 items-stretch max-[1180px]:grid-cols-1">
        {/* Inventory Alerts */}
        <section className="card">
          <div className="card-header">
            <h2>Inventory Alerts</h2>
            <p>Live stock issues requiring attention</p>
          </div>
          <div className="grid gap-3">
            {lowStock.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className={[
                  'flex justify-between items-center gap-3 p-3 rounded-xl border border-[var(--border)]',
                  Number(product.stockQuantity || 0) <= 0
                    ? 'bg-[var(--red-soft)]'
                    : 'bg-[var(--orange-soft)]',
                ].join(' ')}
              >
                <div>
                  <strong className="block">{product.productName}</strong>
                  <span className="block text-[var(--muted)] text-[13px] mt-[3px]">
                    {number(product.stockQuantity)} units available
                  </span>
                </div>
                <StatusBadge>{productStatus(product.stockQuantity)}</StatusBadge>
              </div>
            ))}
            {!lowStock.length && <p className="muted-note">No low-stock products right now.</p>}
          </div>
        </section>

        {/* Top Product Stock horizontal bar chart */}
        <ChartCard title="Top Product Stock" subtitle="Current inventory levels">
          <HorizontalBarChart data={topProducts} />
        </ChartCard>

        {/* AI Insights mini card */}
        <section className="card ai-card">
          <div className="ai-orb">AI</div>
          <div className="card-header">
            <h2>AI Insights</h2>
            <p>Recommendations from current database records</p>
          </div>
          <div className="grid gap-3">
            <p className="m-0 p-3 text-[#344054] bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
              {`Revenue currently totals ${currency(summary.totalRevenue)} with ${number(summary.totalSales)} recorded sales.`}
            </p>
            <p className="m-0 p-3 text-[#344054] bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
              {lowStock.length ? `${lowStock.length} products need stock attention.` : 'Inventory levels look stable.'}
            </p>
            <p className="m-0 p-3 text-[#344054] bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
              {invoices.some((invoice) => status(invoice.status) === 'Overdue') ? 'Overdue invoices need follow-up.' : 'No overdue invoice status found.'}
            </p>
            <p className="m-0 p-3 text-[#344054] bg-[var(--surface-soft)] border border-[var(--border)] rounded-xl">
              {expenses.length ? `Expense records total ${currency(summary.totalExpenses)}.` : 'No expenses have been recorded yet.'}
            </p>
          </div>
        </section>
      </section>
    </div>
  );
}
