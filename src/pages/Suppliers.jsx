import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Toolbar from '../components/ui/Toolbar';
import { suppliers } from '../data/businessData';

export default function Suppliers() {
  return (
    <div className="page">
      <PageHeader eyebrow="Procurement" title="Suppliers" description="Manage supplier contact details and supplied product counts." actions={<Button icon="plus">Add supplier</Button>} />
      <Toolbar searchPlaceholder="Search suppliers..." filters={['Top suppliers', 'Recently contacted']} />
      <section className="card">
        <DataTable columns={['Supplier Name', 'Email', 'Phone', 'Products Supplied']} rows={suppliers} actions />
      </section>
      <EmptyState title="No suppliers yet" description="Keep supplier records organized by adding your first supplier." action="Add supplier" />
    </div>
  );
}
