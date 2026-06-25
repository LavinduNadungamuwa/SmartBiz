import { useState } from 'react';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import Toolbar from '../components/ui/Toolbar';
import { useBusinessData } from '../api/resources';
import { createCustomer, updateCustomer, deleteCustomer } from '../api/useCustomers';
import { currency, date } from '../utils/formatters';

export default function Customers() {
  const { data, loading, error, reload } = useBusinessData();

  // Search & Filter State
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading) return <LoadingState message="Loading customers..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  // Helper: Compute Sales analytics for a customer
  const getCustomerStats = (customerId) => {
    const customerSales = (data.sales || []).filter((s) => s.customerId === customerId);
    const totalPurchases = customerSales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const sorted = [...customerSales].sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate));
    const lastPurchase = sorted.length ? date(sorted[0].saleDate) : '-';
    return { totalPurchases, lastPurchase, salesCount: customerSales.length };
  };

  // Filter & Search Logic
  const filteredCustomers = (data.customers || []).filter((customer) => {
    const stats = getCustomerStats(customer.id);

    const query = searchValue.toLowerCase().trim();
    if (query) {
      const matchesSearch =
        customer.fullName?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.address?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    if (activeFilter === 'Active') return stats.salesCount > 0;
    if (activeFilter === 'High value') return stats.totalPurchases >= 500;
    if (activeFilter === 'Recent purchase') {
      if (stats.lastPurchase === '-') return false;
      const diffDays = Math.ceil(Math.abs(new Date() - new Date(stats.lastPurchase)) / 86400000);
      return diffDays <= 30;
    }
    return true;
  });

  // Paginated selection
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Modal helpers
  const openCreateModal = () => {
    setFormData({ fullName: '', email: '', phone: '', address: '' });
    setFormErrors({});
    setSubmitError('');
    setModalMode('create');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCustomer(null);
  };

  const handleEdit = (index) => {
    const customer = paginatedCustomers[index];
    if (!customer) return;
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setFormErrors({});
    setSubmitError('');
    setModalMode('edit');
  };

  const handleView = (index) => {
    const customer = paginatedCustomers[index];
    if (!customer) return;
    setSelectedCustomer(customer);
    setModalMode('view');
  };

  const handleDelete = async (index) => {
    const customer = paginatedCustomers[index];
    if (!customer) return;
    if (window.confirm(`Are you sure you want to delete customer "${customer.fullName}"?`)) {
      try {
        await deleteCustomer(customer.id);
        reload();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete customer.');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
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
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }

    setSubmitLoading(true);
    setSubmitError('');
    try {
      if (modalMode === 'create') {
        await createCustomer(formData);
      } else if (modalMode === 'edit') {
        await updateCustomer(selectedCustomer.id, formData);
      }
      reload();
      closeModal();
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to save customer. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const rows = paginatedCustomers.map((customer) => {
    const stats = getCustomerStats(customer.id);
    return [
      customer.fullName,
      customer.email,
      customer.phone,
      currency(stats.totalPurchases),
      stats.lastPurchase,
    ];
  });

  /* ── Close icon SVG (reused in both modals) ──────────────────────────── */
  const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  return (
    <div className="page flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Live customer records from smartbiz_db."
        actions={<Button icon="plus" onClick={openCreateModal}>Add customer</Button>}
      />

      <Toolbar
        searchPlaceholder="Search customers..."
        filters={['Active', 'High value', 'Recent purchase']}
        searchValue={searchValue}
        onSearchChange={(val) => { setSearchValue(val); setCurrentPage(1); }}
        activeFilter={activeFilter}
        onFilterClick={(filter) => { setActiveFilter(filter); setCurrentPage(1); }}
      />

      <section className="card bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5">
        {rows.length ? (
          <>
            <DataTable
              columns={['Name', 'Email', 'Phone', 'Total Purchases', 'Last Purchase']}
              rows={rows}
              actions
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
            <div className="pagination flex items-center justify-end gap-3 pt-4 text-[var(--muted)]">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="h-[34px] px-3 border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[9px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages} ({filteredCustomers.length} customers)</span>
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
            title="No customers yet"
            description="Customer records from the database will appear here."
            action="Add customer"
            onAction={openCreateModal}
          />
        )}
      </section>

      {/* ── CREATE / EDIT MODAL ─────────────────────────────────────────── */}
      {modalMode && modalMode !== 'view' && (
        <div className="modal-overlay fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="modal-container bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">{modalMode === 'create' ? 'Add New Customer' : 'Edit Customer'}</h3>
              <button className="modal-close bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body p-6 overflow-y-auto text-[var(--text)]">
                {submitError && (
                  <div className="mb-4 px-[14px] py-[10px] rounded-lg text-sm text-[var(--red)] bg-[var(--red-soft)]">
                    {submitError}
                  </div>
                )}
                <div className="form-grid grid gap-[18px]">
                  <div className="form-field flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-[13px] font-semibold text-[var(--text)]">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.fullName ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                      value={formData.fullName}
                      onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); setFormErrors({ ...formErrors, fullName: '' }); }}
                      placeholder="e.g. John Doe"
                      required
                    />
                    {formErrors.fullName && <span className="error-msg text-[12px] text-[var(--red)] mt-0.5">{formErrors.fullName}</span>}
                  </div>

                  <div className="form-row-2 grid grid-cols-2 gap-4">
                    <div className="form-field flex flex-col gap-1.5">
                      <label htmlFor="email" className="text-[13px] font-semibold text-[var(--text)]">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.email ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }}
                        placeholder="e.g. john@example.com"
                        required
                      />
                      {formErrors.email && <span className="error-msg text-[12px] text-[var(--red)] mt-0.5">{formErrors.email}</span>}
                    </div>

                    <div className="form-field flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-[13px] font-semibold text-[var(--text)]">Phone Number *</label>
                      <input
                        type="text"
                        id="phone"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.phone ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.phone}
                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setFormErrors({ ...formErrors, phone: '' }); }}
                        placeholder="e.g. +94 77 123 4567"
                        required
                      />
                      {formErrors.phone && <span className="error-msg text-[12px] text-[var(--red)] mt-0.5">{formErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-field flex flex-col gap-1.5">
                    <label htmlFor="address" className="text-[13px] font-semibold text-[var(--text)]">Address</label>
                    <textarea
                      id="address"
                      rows="3"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 123 Main St, Colombo"
                      className="px-3 py-2 border border-[var(--border)] rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save Customer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ──────────────────────────────────────────────────── */}
      {modalMode === 'view' && selectedCustomer && (
        <div className="modal-overlay fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="modal-container bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">Customer Profile</h3>
              <button className="modal-close bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body p-6 overflow-y-auto grid gap-5 text-[var(--text)]">
              {/* Avatar + name row */}
              <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] text-xl font-extrabold shrink-0">
                  {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="m-0 text-lg font-bold text-[var(--text)]">{selectedCustomer.fullName}</h4>
                  <span className="text-[var(--muted)] text-[13px]">Customer ID: #{selectedCustomer.id}</span>
                </div>
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--muted)] font-semibold uppercase mb-1">Email</label>
                  <strong className="break-all">{selectedCustomer.email}</strong>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] font-semibold uppercase mb-1">Phone</label>
                  <strong>{selectedCustomer.phone}</strong>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs text-[var(--muted)] font-semibold uppercase mb-1">Address</label>
                <p className="m-0 text-[var(--text)]">{selectedCustomer.address || 'No address provided'}</p>
              </div>

              {/* Purchase stats */}
              <div className="grid grid-cols-2 gap-4 mt-2 p-4 rounded-xl bg-[var(--app-bg)]">
                <div>
                  <label className="block text-xs text-[var(--muted)] font-semibold uppercase mb-1">Total Purchases</label>
                  <strong className="text-lg text-[var(--blue)]">{currency(getCustomerStats(selectedCustomer.id).totalPurchases)}</strong>
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] font-semibold uppercase mb-1">Last Purchase</label>
                  <strong className="text-lg">{getCustomerStats(selectedCustomer.id).lastPurchase}</strong>
                </div>
              </div>
            </div>

            <div className="modal-footer flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
              <Button variant="ghost" onClick={closeModal}>Close</Button>
              <Button
                variant="primary"
                icon="edit"
                onClick={() => {
                  const customer = selectedCustomer;
                  setSelectedCustomer(customer);
                  setFormData({
                    fullName: customer.fullName || '',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    address: customer.address || '',
                  });
                  setFormErrors({});
                  setSubmitError('');
                  setModalMode('edit');
                }}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
