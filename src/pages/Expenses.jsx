import { ChartCard, PieChart } from '../components/charts';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Toolbar from '../components/ui/Toolbar';
import { expenses } from '../data/businessData';

export default function Expenses() {
  return (
    <div className="page">
      <PageHeader eyebrow="Finance" title="Expenses" description="Capture expenses, monitor categories, and identify cost trends." actions={<Button icon="plus">Add expense</Button>} />
      <section className="summary-grid">
        <StatCard label="Monthly Expenses" value="$42,810" growth="+4.2%" trend="down" icon="expenses" />
        <StatCard label="Largest Category" value="Inventory" growth="$22,140" icon="products" />
        <StatCard label="Pending Review" value="12" growth="Receipts" trend="down" icon="reports" />
      </section>
      <section className="dashboard-grid two">
        <ChartCard title="Expense Breakdown" subtitle="Spend distribution by category">
          <PieChart />
        </ChartCard>
        <section className="card">
          <div className="card-header">
            <h2>Expense Analytics</h2>
            <p>Cost control indicators</p>
          </div>
          <div className="metric-list">
            <div><span>Inventory spend</span><strong>$22,140</strong></div>
            <div><span>Operations spend</span><strong>$9,480</strong></div>
            <div><span>Marketing spend</span><strong>$6,320</strong></div>
            <div><span>Travel spend</span><strong>$4,870</strong></div>
          </div>
        </section>
      </section>
      <Toolbar searchPlaceholder="Search expenses..." filters={['Category', 'Payment method', 'This month']} />
      <section className="card">
        <DataTable columns={['Category', 'Description', 'Amount', 'Date', 'Payment Method']} rows={expenses} />
      </section>
    </div>
  );
}
