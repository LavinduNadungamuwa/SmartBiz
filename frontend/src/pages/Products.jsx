import { useState } from 'react';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Toolbar from '../components/ui/Toolbar';
import { useBusinessData } from '../api/resources';
import { createProduct, updateProduct, deleteProduct } from '../api/useProducts';
import { currency, indexById, number, productStatus } from '../utils/formatters';

export default function Products() {
  const { data, loading, error, reload } = useBusinessData();

  // Search & Filter State
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    category: '',
    stockQuantity: '',
    unitPrice: '',
    supplierId: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading) return <LoadingState message="Loading products..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const supplierById = indexById(data.suppliers || []);

  // Filter & Search Logic
  const filteredProducts = (data.products || []).filter((product) => {
    // Search matching
    const query = searchValue.toLowerCase().trim();
    if (query) {
      const supplierName = supplierById[product.supplierId]?.supplierName || '';
      const matchesSearch =
        product.productName?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        supplierName.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter chip matching
    if (activeFilter === 'In stock') {
      return Number(product.stockQuantity || 0) > 10;
    }
    if (activeFilter === 'Low stock') {
      return Number(product.stockQuantity || 0) > 0 && Number(product.stockQuantity || 0) <= 10;
    }
    if (activeFilter === 'Out of stock') {
      return Number(product.stockQuantity || 0) <= 0;
    }

    return true;
  });

  // Paginated selection
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Modal actions
  const openCreateModal = () => {
    setFormData({ productName: '', category: '', stockQuantity: '', unitPrice: '', supplierId: '' });
    setFormErrors({});
    setSubmitError('');
    setModalMode('create');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedProduct(null);
  };

  const handleEdit = (index) => {
    const product = paginatedProducts[index];
    if (!product) return;
    setSelectedProduct(product);
    setFormData({
      productName: product.productName || '',
      category: product.category || '',
      stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '',
      unitPrice: product.unitPrice !== undefined ? String(product.unitPrice) : '',
      supplierId: product.supplierId !== undefined ? String(product.supplierId) : '',
    });
    setFormErrors({});
    setSubmitError('');
    setModalMode('edit');
  };

  const handleView = (index) => {
    const product = paginatedProducts[index];
    if (!product) return;
    setSelectedProduct(product);
    setModalMode('view');
  };

  const handleDelete = async (index) => {
    const product = paginatedProducts[index];
    if (!product) return;

    if (window.confirm(`Are you sure you want to delete product "${product.productName}"?`)) {
      try {
        await deleteProduct(product.id);
        reload();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete product.');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.productName.trim()) errors.productName = 'Product Name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    
    if (formData.stockQuantity === '' || formData.stockQuantity === undefined || formData.stockQuantity === null) {
      errors.stockQuantity = 'Stock Quantity is required';
    } else {
      const stock = Number(formData.stockQuantity);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        errors.stockQuantity = 'Stock Quantity must be a non-negative integer';
      }
    }

    if (formData.unitPrice === '' || formData.unitPrice === undefined || formData.unitPrice === null) {
      errors.unitPrice = 'Unit Price is required';
    } else {
      const price = Number(formData.unitPrice);
      if (isNaN(price) || price <= 0) {
        errors.unitPrice = 'Unit Price must be greater than zero';
      }
    }

    if (!formData.supplierId) {
      errors.supplierId = 'Supplier is required';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    const payload = {
      productName: formData.productName.trim(),
      category: formData.category.trim(),
      stockQuantity: parseInt(formData.stockQuantity, 10),
      unitPrice: parseFloat(formData.unitPrice),
      supplierId: parseInt(formData.supplierId, 10),
    };

    try {
      if (modalMode === 'create') {
        await createProduct(payload);
      } else if (modalMode === 'edit') {
        await updateProduct(selectedProduct.id, payload);
      }
      reload();
      closeModal();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Failed to save product. Please try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const rows = paginatedProducts.map((product) => [
    product.productName,
    product.category || '-',
    number(product.stockQuantity),
    currency(product.unitPrice),
    supplierById[product.supplierId]?.supplierName || `Supplier #${product.supplierId || '-'}`,
    productStatus(product.stockQuantity),
  ]);

  const lowStockProductsCount = (data.products || []).filter((product) => Number(product.stockQuantity || 0) > 0 && Number(product.stockQuantity || 0) <= 10).length;
  const outOfStockProductsCount = (data.products || []).filter((product) => Number(product.stockQuantity || 0) <= 0).length;
  const inStockProductsCount = (data.products || []).length - lowStockProductsCount - outOfStockProductsCount;

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader
        eyebrow="Inventory"
        title="Products"
        description="Live product and inventory records from smartbiz_db."
        actions={<Button icon="plus" onClick={openCreateModal}>Add product</Button>}
      />
      
      <section className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        <StatCard label="In Stock" value={number(inStockProductsCount)} growth="Live" icon="products" />
        <StatCard label="Low Stock" value={number(lowStockProductsCount)} growth="Needs review" trend="down" icon="expenses" />
        <StatCard label="Out of Stock" value={number(outOfStockProductsCount)} growth="Needs reorder" trend="down" icon="suppliers" />
      </section>

      <Toolbar
        searchPlaceholder="Search products..."
        filters={['In stock', 'Low stock', 'Out of stock']}
        searchValue={searchValue}
        onSearchChange={(val) => {
          setSearchValue(val);
          setCurrentPage(1);
        }}
        activeFilter={activeFilter}
        onFilterClick={(filter) => {
          setActiveFilter(filter);
          setCurrentPage(1);
        }}
      />

      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5">
        {rows.length ? (
          <>
            <DataTable
              columns={['Product Name', 'Category', 'Stock Quantity', 'Unit Price', 'Supplier', 'Status']}
              rows={rows}
              actions
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
            <div className="flex items-center justify-end gap-3 pt-4 text-[var(--muted)]">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="h-[34px] px-3 border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[9px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages} ({filteredProducts.length} products)</span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="h-[34px] px-3 border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[9px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            title="No products yet"
            description="Product records from the database will appear here."
            action="Add product"
            onAction={openCreateModal}
          />
        )}
      </section>

      {/* CREATE & EDIT MODAL */}
      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">{modalMode === 'create' ? 'Add New Product' : 'Edit Product'}</h3>
              <button className="bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 overflow-y-auto">
                {submitError && (
                  <div className="text-[var(--red)] bg-[var(--red-soft)] py-[10px] px-[14px] rounded-[8px] mb-4 text-[14px]">
                    {submitError}
                  </div>
                )}
                <div className="grid gap-[18px]">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="productName" className="text-[13px] font-semibold text-[var(--text)]">Product Name *</label>
                    <input
                      type="text"
                      id="productName"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.productName ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                      value={formData.productName}
                      onChange={(e) => {
                        setFormData({ ...formData, productName: e.target.value });
                        setFormErrors({ ...formErrors, productName: '' });
                      }}
                      placeholder="e.g. Wireless Mouse"
                      required
                    />
                    {formErrors.productName && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.productName}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="category" className="text-[13px] font-semibold text-[var(--text)]">Category *</label>
                    <input
                      type="text"
                      id="category"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.category ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value });
                        setFormErrors({ ...formErrors, category: '' });
                      }}
                      placeholder="e.g. Electronics"
                      required
                    />
                    {formErrors.category && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.category}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="stockQuantity" className="text-[13px] font-semibold text-[var(--text)]">Stock Quantity *</label>
                      <input
                        type="number"
                        id="stockQuantity"
                        min="0"
                        step="1"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.stockQuantity ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.stockQuantity}
                        onChange={(e) => {
                          setFormData({ ...formData, stockQuantity: e.target.value });
                          setFormErrors({ ...formErrors, stockQuantity: '' });
                        }}
                        placeholder="e.g. 50"
                        required
                      />
                      {formErrors.stockQuantity && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.stockQuantity}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="unitPrice" className="text-[13px] font-semibold text-[var(--text)]">Unit Price ($) *</label>
                      <input
                        type="number"
                        id="unitPrice"
                        min="0.01"
                        step="0.01"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.unitPrice ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.unitPrice}
                        onChange={(e) => {
                          setFormData({ ...formData, unitPrice: e.target.value });
                          setFormErrors({ ...formErrors, unitPrice: '' });
                        }}
                        placeholder="e.g. 29.99"
                        required
                      />
                      {formErrors.unitPrice && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.unitPrice}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="supplierId" className="text-[13px] font-semibold text-[var(--text)]">Supplier *</label>
                    <select
                      id="supplierId"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.supplierId ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                      value={formData.supplierId}
                      onChange={(e) => {
                        setFormData({ ...formData, supplierId: e.target.value });
                        setFormErrors({ ...formErrors, supplierId: '' });
                      }}
                      required
                    >
                      <option value="">Select a supplier</option>
                      {(data.suppliers || []).map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.supplierName}
                        </option>
                      ))}
                    </select>
                    {formErrors.supplierId && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.supplierId}</span>}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalMode === 'view' && selectedProduct && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">Product Details</h3>
              <button className="bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid gap-5">
              <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
                <div className="w-14 h-14 rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center text-[20px] font-extrabold">
                  {selectedProduct.productName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="m-0 text-[18px] font-bold">{selectedProduct.productName}</h4>
                  <span className="text-[var(--muted)] text-[13px]">Product ID: #{selectedProduct.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Category</label>
                  <strong>{selectedProduct.category || '-'}</strong>
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Supplier</label>
                  <strong>{supplierById[selectedProduct.supplierId]?.supplierName || `Supplier #${selectedProduct.supplierId || '-'}`}</strong>
                </div>
              </div>

              <div className="bg-[var(--app-bg)] p-4 rounded-xl grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Unit Price</label>
                  <strong className="text-[18px] text-[var(--blue)]">{currency(selectedProduct.unitPrice)}</strong>
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Stock Quantity</label>
                  <strong className="text-[18px]">{number(selectedProduct.stockQuantity)} units</strong>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
              <Button variant="ghost" onClick={closeModal}>Close</Button>
              <Button variant="primary" icon="edit" onClick={() => {
                const product = selectedProduct;
                setSelectedProduct(product);
                setFormData({
                  productName: product.productName || '',
                  category: product.category || '',
                  stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '',
                  unitPrice: product.unitPrice !== undefined ? String(product.unitPrice) : '',
                  supplierId: product.supplierId !== undefined ? String(product.supplierId) : '',
                });
                setFormErrors({});
                setSubmitError('');
                setModalMode('edit');
              }}>Edit Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
