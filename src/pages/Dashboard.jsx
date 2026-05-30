import { AreaChart, BarChart, ChartCard, HorizontalBarChart, LineChart } from '../components/charts';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import {
  aiInsights,
  expenseSeries,
  healthMetrics,
  inventoryAlerts,
  kpis,
  recentInvoices,
  recentSales,
  revenueSeries,
  salesSeries,
  topProducts,
} from '../data/businessData';

export default function Dashboard() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Dashboard"
        title="Business overview"
        description="Monitor revenue, inventory, sales, invoices, and AI-powered recommendations from one workspace."
      />

      <section className="kpi-grid">
        {kpis.map((kpi) => <StatCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="dashboard-grid three">
        <ChartCard title="Revenue Overview" subtitle="Monthly revenue performance">
          <LineChart data={revenueSeries} />
        </ChartCard>
        <ChartCard title="Revenue vs Expenses" subtitle="Comparative monthly view">
          <BarChart revenue={revenueSeries} expenses={expenseSeries} />
        </ChartCard>
        <ChartCard title="Sales Performance" subtitle="Sales trend over time">
          <AreaChart data={salesSeries} />
        </ChartCard>
      </section>

      <section className="health-grid">
        {healthMetrics.map((metric) => (
          <article className="health-card" key={metric.label}>
            <span className={`health-dot ${metric.status}`} />
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid two">
        <section className="card">
          <div className="card-header">
            <h2>Recent Sales</h2>
          </div>
          <DataTable
            columns={['Invoice Number', 'Customer', 'Amount', 'Date', 'Status']}
            rows={recentSales.map((sale) => [sale.invoice, sale.customer, sale.amount, sale.date, sale.status])}
          />
        </section>
        <section className="card">
          <div className="card-header">
            <h2>Recent Invoices</h2>
          </div>
          <DataTable
            columns={['Invoice Number', 'Customer', 'Total', 'Due Date', 'Status']}
            rows={recentInvoices.map((invoice) => [invoice.invoice, invoice.customer, invoice.total, invoice.due, invoice.status])}
          />
        </section>
      </section>

      <section className="dashboard-grid three bottom">
        <section className="card">
          <div className="card-header">
            <h2>Inventory Alerts</h2>
            <p>Stock issues requiring attention</p>
          </div>
          <div className="alert-list">
            {inventoryAlerts.map((alert) => (
              <div className={`inventory-alert ${alert.severity}`} key={alert.name}>
                <div>
                  <strong>{alert.name}</strong>
                  <span>{alert.detail}</span>
                </div>
                <StatusBadge>{alert.severity === 'danger' ? 'Out of Stock' : 'Low Stock'}</StatusBadge>
              </div>
            ))}
          </div>
        </section>
        <ChartCard title="Top Selling Products" subtitle="Best sellers by contribution">
          <HorizontalBarChart data={topProducts} />
        </ChartCard>
        <section className="card ai-card">
          <div className="ai-orb">AI</div>
          <div className="card-header">
            <h2>AI Insights</h2>
            <p>Smart recommendations for this week</p>
          </div>
          <div className="insight-list">
            {aiInsights.map((insight) => <p key={insight}>{insight}</p>)}
          </div>
        </section>
      </section>
    </div>
  );
}
