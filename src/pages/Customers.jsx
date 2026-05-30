import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Toolbar from '../components/ui/Toolbar';
import { customers } from '../data/businessData';

export default function Customers() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Search, filter, and manage customer purchase history."
        actions={<Button icon="plus">Add customer</Button>}
      />
      <Toolbar searchPlaceholder="Search customers..." filters={['Active', 'High value', 'Recent purchase']} />
      <section className="card">
        <DataTable columns={['Name', 'Email', 'Phone', 'Total Purchases', 'Last Purchase']} rows={customers} actions />
        <div className="pagination"><button>Previous</button><span>Page 1 of 8</span><button>Next</button></div>
      </section>
      <EmptyState title="No customers yet" description="When your customer list is empty, invite or add your first customer here." action="Add customer" />
    </div>
  );
}
