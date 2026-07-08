import { useState } from 'react';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import Toolbar from '../components/ui/Toolbar';
import StatCard from '../components/ui/StatCard';
import { useBusinessData } from '../api/resources';
import { createSupplier, updateSupplier, deleteSupplier } from '../api/useSuppliers';
import { number } from '../utils/formatters';

export default function Suppliers() {
  const { data, loading, error, reload } = useBusinessData();

  // Search & Filter State
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplierName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading) return <LoadingState message="Loading suppliers..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  // Filter & Search Logic
  const filteredSuppliers = (data.suppliers || []).filter((supplier) => {
    const suppliedProducts = (data.products || []).filter((p) => p.supplierId === supplier.id);

    // Search matching
    const query = searchValue.toLowerCase().trim();
    if (query) {
      const matchesSearch =
        supplier.supplierName?.toLowerCase().includes(query) ||
        supplier.email?.toLowerCase().includes(query) ||
        supplier.phone?.toLowerCase().includes(query) ||
        supplier.address?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter chip matching
    if (activeFilter === 'Active partnerships') {
      return suppliedProducts.length > 0;
    }
    if (activeFilter === 'No products') {
      return suppliedProducts.length === 0;
    }

    return true;
  });

  // Paginated selection
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage) || 1;
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Modal actions
  const openCreateModal = () => {
    setFormData({ supplierName: '', email: '', phone: '', address: '' });
    setFormErrors({});
    setSubmitError('');
    setModalMode('create');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedSupplier(null);
  };

  const handleEdit = (index) => {
    const supplier = paginatedSuppliers[index];
    if (!supplier) return;
    setSelectedSupplier(supplier);
    setFormData({
      supplierName: supplier.supplierName || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setFormErrors({});
    setSubmitError('');
    setModalMode('edit');
  };

  const handleView = (index) => {
    const supplier = paginatedSuppliers[index];
    if (!supplier) return;
    setSelectedSupplier(supplier);
    setModalMode('view');
  };

  const handleDelete = async (index) => {
    const supplier = paginatedSuppliers[index];
    if (!supplier) return;

    if (window.confirm(`Are you sure you want to delete supplier "${supplier.supplierName}"?`)) {
      try {
        await deleteSupplier(supplier.id);
        reload();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete supplier.');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.supplierName.trim()) errors.supplierName = 'Supplier Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
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
      supplierName: formData.supplierName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    };

    try {
      if (modalMode === 'create') {
        await createSupplier(payload);
      } else if (modalMode === 'edit') {
        await updateSupplier(selectedSupplier.id, payload);
      }
      reload();
      closeModal();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Failed to save supplier. Please try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const rows = paginatedSuppliers.map((supplier) => [
    supplier.supplierName,
    supplier.email,
    supplier.phone,
    String((data.products || []).filter((product) => product.supplierId === supplier.id).length),
  ]);

  const totalSuppliersCount = (data.suppliers || []).length;
  const activePartnershipsCount = (data.suppliers || []).filter((s) => (data.products || []).some((p) => p.supplierId === s.id)).length;
  const totalSuppliedItemsCount = (data.products || []).filter((p) => p.supplierId !== null && p.supplierId !== undefined).length;

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader
        eyebrow="Procurement"
        title="Suppliers"
        description="Live supplier records from smartbiz_db."
        actions={<Button icon="plus" onClick={openCreateModal}>Add supplier</Button>}
      />

      <section className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        <StatCard label="Total Suppliers" value={number(totalSuppliersCount)} growth="Live" icon="suppliers" />
        <StatCard label="Active Partnerships" value={number(activePartnershipsCount)} growth="Supplying products" icon="sales" />
        <StatCard label="Supplied Items" value={number(totalSuppliedItemsCount)} growth="Total inventory varieties" icon="products" />
      </section>

      <Toolbar
        searchPlaceholder="Search suppliers..."
        filters={['Active partnerships', 'No products']}
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

      <section className="bg-surface border border-border rounded-radius shadow-shadow p-5">
        {rows.length ? (
          <>
            <DataTable
              columns={['Supplier Name', 'Email', 'Phone', 'Products Supplied']}
              rows={rows}
              actions
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
            <div className="flex items-center justify-end gap-3 pt-4 text-muted">
              <button 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
                className="h-[34px] px-3 border border-border bg-surface text-text rounded-[9px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages} ({filteredSuppliers.length} suppliers)</span>
              <button 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
                className="h-[34px] px-3 border border-border bg-surface text-text rounded-[9px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <EmptyState
            title="No suppliers yet"
            description="Supplier records from the database will appear here."
            action="Add supplier"
            onAction={openCreateModal}
          />
        )}
      </section>

      {/* CREATE & EDIT MODAL */}
      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-surface border border-border rounded-radius shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-border">
              <h3 className="m-0 text-[18px] font-bold text-text">{modalMode === 'create' ? 'Add New Supplier' : 'Edit Supplier'}</h3>
              <button className="bg-transparent border-0 text-muted cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-surface-soft hover:text-text" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 overflow-y-auto">
                {submitError && (
                  <div className="text-red bg-red-soft py-[10px] px-[14px] rounded-[8px] mb-4 text-[14px]">
                    {submitError}
                  </div>
                )}
                <div className="grid gap-[18px]">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="supplierName" className="text-[13px] font-semibold text-text">Supplier Name *</label>
                    <input
                      type="text"
                      id="supplierName"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-surface text-text outline-none transition-all duration-200 focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.supplierName ? 'border-red' : 'border-border'}`}
                      value={formData.supplierName}
                      onChange={(e) => {
                        setFormData({ ...formData, supplierName: e.target.value });
                        setFormErrors({ ...formErrors, supplierName: '' });
                      }}
                      placeholder="e.g. Acme Corp"
                      required
                    />
                    {formErrors.supplierName && <span className="text-[12px] text-red mt-0.5">{formErrors.supplierName}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-[13px] font-semibold text-text">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-surface text-text outline-none transition-all duration-200 focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.email ? 'border-red' : 'border-border'}`}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setFormErrors({ ...formErrors, email: '' });
                        }}
                        placeholder="e.g. supplier@example.com"
                        required
                      />
                      {formErrors.email && <span className="text-[12px] text-red mt-0.5">{formErrors.email}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-[13px] font-semibold text-text">Phone Number *</label>
                      <input
                        type="text"
                        id="phone"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-surface text-text outline-none transition-all duration-200 focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.phone ? 'border-red' : 'border-border'}`}
                        value={formData.phone}
                        onChange={(e) => {
                          setFormData({ ...formData, phone: e.target.value });
                          setFormErrors({ ...formErrors, phone: '' });
                        }}
                        placeholder="e.g. +94 77 123 4567"
                        required
                      />
                      {formErrors.phone && <span className="text-[12px] text-red mt-0.5">{formErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="address" className="text-[13px] font-semibold text-text">Address</label>
                    <textarea
                      id="address"
                      rows="3"
                      className="py-2 px-3 border rounded-[10px] text-[14px] bg-surface text-text outline-none transition-all duration-200 focus:border-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] border-border"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 456 Industrial Zone, Colombo"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 py-[18px] px-6 bg-surface-soft border-t border-border">
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save Supplier'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalMode === 'view' && selectedSupplier && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-surface border border-border rounded-radius shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-border">
              <h3 className="m-0 text-[18px] font-bold text-text">Supplier Profile</h3>
              <button className="bg-transparent border-0 text-muted cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-surface-soft hover:text-text" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid gap-5">
              <div className="flex items-center gap-4 pb-4 border-b border-border">
                <div className="w-14 h-14 rounded-full bg-blue-soft text-blue flex items-center justify-center text-[20px] font-extrabold">
                  {selectedSupplier.supplierName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="m-0 text-[18px] font-bold">{selectedSupplier.supplierName}</h4>
                  <span className="text-muted text-[13px]">Supplier ID: #{selectedSupplier.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-muted font-semibold uppercase mb-1">Email</label>
                  <strong className="break-all">{selectedSupplier.email}</strong>
                </div>
                <div>
                  <label className="block text-[12px] text-muted font-semibold uppercase mb-1">Phone</label>
                  <strong>{selectedSupplier.phone}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-muted font-semibold uppercase mb-1">Address</label>
                <p className="m-0 text-text">{selectedSupplier.address || 'No address provided'}</p>
              </div>

              {/* LIST OF PRODUCTS SUPPLIED */}
              <div className="mt-2 border-t border-border pt-4">
                <label className="block text-[12px] text-muted font-semibold uppercase mb-2">
                  Products Supplied ({(data.products || []).filter((p) => p.supplierId === selectedSupplier.id).length})
                </label>
                {(() => {
                  const suppliedProducts = (data.products || []).filter((p) => p.supplierId === selectedSupplier.id);
                  if (suppliedProducts.length > 0) {
                    return (
                      <div className="grid gap-2 max-h-[150px] overflow-y-auto pr-1">
                        {suppliedProducts.map((p) => (
                          <div key={p.id} className="flex justify-between items-center bg-surface-soft py-2 px-3 rounded-lg text-[13px]">
                            <span className="font-semibold">{p.productName}</span>
                            <span className="text-muted">{p.category} | {number(p.stockQuantity)} units</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return <span className="text-muted text-[13px]">No products supplied by this supplier.</span>;
                })()}
              </div>
            </div>
            <div className="flex justify-end gap-3 py-[18px] px-6 bg-surface-soft border-t border-border">
              <Button variant="ghost" onClick={closeModal}>Close</Button>
              <Button variant="primary" icon="edit" onClick={() => {
                const supplier = selectedSupplier;
                setSelectedSupplier(supplier);
                setFormData({
                  supplierName: supplier.supplierName || '',
                  email: supplier.email || '',
                  phone: supplier.phone || '',
                  address: supplier.address || '',
                });
                setFormErrors({});
                setSubmitError('');
                setModalMode('edit');
              }}>Edit Profile</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


