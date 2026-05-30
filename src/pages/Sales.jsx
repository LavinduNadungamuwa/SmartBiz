import { AreaChart, ChartCard } from '../components/charts';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Toolbar from '../components/ui/Toolbar';
import { sales, salesSeries } from '../data/businessData';

export default function Sales() {
  return (
    <div className="page">
      <PageHeader eyebrow="Sales" title="Sales history" description="Record new sales and monitor order activity." actions={<Button icon="plus">Record new sale</Button>} />
      <section className="summary-grid">
        <StatCard label="Today Sales" value="$8,940" growth="+11.2%" icon="sales" />
        <StatCard label="Orders" value="146" growth="+8.9%" icon="invoices" />
        <StatCard label="Average Sale" value="$612" growth="+4.1%" icon="profit" />
      </section>
      <ChartCard title="Sales Analytics" subtitle="Daily sales movement">
        <AreaChart data={salesSeries} />
      </ChartCard>
      <Toolbar searchPlaceholder="Search sales..." filters={['Completed', 'Processing', 'Refunded']} />
      <section className="card">
        <DataTable columns={['Sale ID', 'Customer', 'Products', 'Total Amount', 'Date', 'Status']} rows={sales} actions />
      </section>
      <EmptyState title="No sales yet" description="Record your first sale to begin tracking performance." action="Record sale" />
    </div>
  );
}
