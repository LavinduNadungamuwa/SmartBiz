import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Toolbar from '../components/ui/Toolbar';
import { products } from '../data/businessData';

export default function Products() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Inventory"
        title="Products"
        description="Track stock levels, suppliers, categories, and product availability."
        actions={<Button icon="plus">Add product</Button>}
      />
      <section className="summary-grid">
        <StatCard label="In Stock" value="214" growth="+6.2%" icon="products" />
        <StatCard label="Low Stock" value="18" growth="+2 alerts" trend="down" icon="expenses" />
        <StatCard label="Out of Stock" value="5" growth="Needs reorder" trend="down" icon="suppliers" />
      </section>
      <Toolbar searchPlaceholder="Search products..." filters={['Category', 'Supplier', 'Stock status']} viewToggle />
      <section className="card">
        <DataTable columns={['Product Name', 'Category', 'Stock Quantity', 'Unit Price', 'Supplier', 'Status']} rows={products} actions />
      </section>
      <EmptyState title="No products yet" description="Add products to start tracking stock, suppliers, and prices." action="Add product" />
    </div>
  );
}
