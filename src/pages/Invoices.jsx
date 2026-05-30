import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Toolbar from '../components/ui/Toolbar';
import { invoices } from '../data/businessData';

export default function Invoices() {
  return (
    <div className="page">
      <PageHeader eyebrow="Billing" title="Invoices" description="Create, send, track, download, and print customer invoices." actions={<Button icon="plus">Create invoice</Button>} />
      <Toolbar searchPlaceholder="Search invoices..." filters={['Paid', 'Pending', 'Overdue']} />
      <section className="card">
        <DataTable columns={['Invoice Number', 'Customer', 'Amount', 'Issue Date', 'Due Date', 'Status']} rows={invoices} actions="invoice" />
      </section>
      <EmptyState title="No invoices yet" description="Create invoices to track payments and due dates." action="Create invoice" />
    </div>
  );
}
