import { BarChart, ChartCard, LineChart } from '../components/charts';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { expenseSeries, revenueSeries } from '../data/businessData';

const reportTypes = ['Sales Report', 'Revenue Report', 'Expense Report', 'Inventory Report', 'Customer Report'];

export default function Reports() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Reports"
        title="Reporting dashboard"
        description="Generate professional reports with summaries, charts, and export options."
        actions={(
          <>
            <Button variant="secondary" icon="download">Export PDF</Button>
            <Button variant="secondary" icon="download">Export Excel</Button>
            <Button icon="download">Download report</Button>
          </>
        )}
      />
      <div className="report-toolbar">
        <label>From <input type="date" defaultValue="2026-05-01" /></label>
        <label>To <input type="date" defaultValue="2026-05-31" /></label>
      </div>
      <section className="report-type-grid">
        {reportTypes.map((type) => <button key={type} type="button">{type}</button>)}
      </section>
      <section className="summary-grid">
        <StatCard label="Revenue" value="$128,420" growth="+12.5%" icon="revenue" />
        <StatCard label="Expenses" value="$42,810" growth="+4.2%" icon="expenses" />
        <StatCard label="Customers" value="1,248" growth="+8.1%" icon="customers" />
      </section>
      <section className="dashboard-grid two">
        <ChartCard title="Revenue Report" subtitle="Monthly revenue trend">
          <LineChart data={revenueSeries} />
        </ChartCard>
        <ChartCard title="Revenue and Expense Report" subtitle="Comparison by month">
          <BarChart revenue={revenueSeries} expenses={expenseSeries} />
        </ChartCard>
      </section>
    </div>
  );
}
