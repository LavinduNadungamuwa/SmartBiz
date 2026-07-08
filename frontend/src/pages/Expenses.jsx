import { useState } from 'react';
import Icon from '../components/ui/Icon';
import { ChartCard, PieChart } from '../components/charts';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Toolbar from '../components/ui/Toolbar';
import { useBusinessData } from '../api/resources';
import { currency, date } from '../utils/formatters';
import useAuth from '../store/useAuth';
import { createExpense, updateExpense, deleteExpense } from '../api/useExpenses';

export default function Expenses() {
  const { data, loading, error, reload } = useBusinessData();
  const { isAdmin } = useAuth();

  // Search & Filter State
  const [searchValue, setSearchValue] = useState('');
  const [activeFilter, setActiveFilter] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    category: '',
    amount: '',
    expenseDate: '',
    paymentMethod: 'CASH',
  });
  const [customCategory, setCustomCategory] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (loading) return <LoadingState message="Loading expenses..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const expensesList = data.expenses || [];
  const totalExpenses = expensesList.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const categoryTotals = expensesList.reduce((lookup, expense) => {
    const cat = expense.category || 'Uncategorized';
    lookup[cat] = (lookup[cat] || 0) + Number(expense.amount || 0);
    return lookup;
  }, {});
  const largestCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const pieChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // Filter & Search Logic
  const filteredExpenses = expensesList.filter((expense) => {
    // Search matching
    const query = searchValue.toLowerCase().trim();
    if (query) {
      const matchesSearch =
        expense.category?.toLowerCase().includes(query) ||
        expense.title?.toLowerCase().includes(query) ||
        expense.notes?.toLowerCase().includes(query) ||
        expense.paymentMethod?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter chip matching
    if (activeFilter === 'This month') {
      if (!expense.expenseDate) return false;
      const expDate = new Date(expense.expenseDate);
      const now = new Date();
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }
    if (activeFilter) {
      return expense.category?.toLowerCase() === activeFilter.toLowerCase();
    }

    return true;
  });

  // Paginated selection
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Modal actions
  const openCreateModal = () => {
    setFormData({
      title: '',
      notes: '',
      category: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
    });
    setCustomCategory('');
    setFormErrors({});
    setSubmitError('');
    setModalMode('create');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedExpense(null);
  };

  const handleEdit = (index) => {
    const expense = paginatedExpenses[index];
    if (!expense) return;
    setSelectedExpense(expense);

    const standardCategories = ['Inventory', 'Operations', 'Marketing', 'Travel', 'Software', 'Rent', 'Utilities'];
    const isStandard = standardCategories.includes(expense.category);

    setFormData({
      title: expense.title || expense.notes || '',
      notes: expense.notes || '',
      category: isStandard ? expense.category : (expense.category ? 'Other' : ''),
      amount: expense.amount !== undefined ? String(expense.amount) : '',
      expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : '',
      paymentMethod: expense.paymentMethod || 'CASH',
    });
    setCustomCategory(isStandard ? '' : (expense.category || ''));
    setFormErrors({});
    setSubmitError('');
    setModalMode('edit');
  };

  const handleView = (index) => {
    const expense = paginatedExpenses[index];
    if (!expense) return;
    setSelectedExpense(expense);
    setModalMode('view');
  };

  const handleDelete = async (index) => {
    const expense = paginatedExpenses[index];
    if (!expense) return;

    if (!isAdmin) {
      alert('Access Denied: Only Admins can delete expenses.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete this expense of ${currency(expense.amount)}?`)) {
      try {
        await deleteExpense(expense.id);
        reload();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete expense.');
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Description / Title is required';
    if (!formData.category) {
      errors.category = 'Category is required';
    } else if (formData.category === 'Other' && !customCategory.trim()) {
      errors.category = 'Please specify custom category';
    }

    if (formData.amount === '' || formData.amount === undefined || formData.amount === null) {
      errors.amount = 'Amount is required';
    } else {
      const price = Number(formData.amount);
      if (isNaN(price) || price <= 0) {
        errors.amount = 'Amount must be greater than zero';
      }
    }
    if (!formData.expenseDate) errors.expenseDate = 'Date is required';
    if (!formData.paymentMethod) errors.paymentMethod = 'Payment Method is required';

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
      title: formData.title.trim(),
      notes: formData.notes.trim(),
      category: formData.category === 'Other' ? customCategory.trim() : formData.category.trim(),
      amount: parseFloat(formData.amount),
      expenseDate: `${formData.expenseDate}T00:00:00`,
      paymentMethod: formData.paymentMethod,
    };

    try {
      if (modalMode === 'create') {
        await createExpense(payload);
      } else if (modalMode === 'edit') {
        await updateExpense(selectedExpense.id, payload);
      }
      reload();
      closeModal();
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || err.message || 'Failed to save expense. Please try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const rows = paginatedExpenses.map((expense) => [
    expense.category || '-',
    expense.title || expense.notes || '-',
    currency(expense.amount),
    date(expense.expenseDate),
    expense.paymentMethod || '-',
  ]);

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description="Live expense records from smartbiz_db."
        actions={<Button icon="plus" onClick={openCreateModal}>Add expense</Button>}
      />
      <section className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        <StatCard label="Total Expenses" value={currency(totalExpenses)} growth="Live" trend="down" icon="expenses" />
        <StatCard label="Largest Category" value={largestCategory} growth="Live" icon="products" />
        <StatCard label="Expense Records" value={String(expensesList.length)} growth="Live" icon="reports" />
      </section>
      <section className="grid grid-cols-2 gap-4 max-[1180px]:grid-cols-1">
        <ChartCard title="Expense Breakdown" subtitle="Spend distribution by category">
          <PieChart data={pieChartData} />
        </ChartCard>
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5">
          <div className="flex justify-between gap-4 mb-[18px]">
            <h2 className="m-0 text-[17px] font-bold text-[var(--text)]">Expense Analytics</h2>
            <p className="m-0 mt-1.5 text-[var(--muted)] leading-[1.55]">Category totals from the database</p>
          </div>
          <div className="grid gap-3">
            {Object.entries(categoryTotals).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center p-[13px] bg-[var(--surface-soft)] rounded-[12px] text-[var(--text)]">
                <span className="text-[var(--muted)]">{category}</span>
                <strong>{currency(amount)}</strong>
              </div>
            ))}
            {!Object.keys(categoryTotals).length && <p className="text-[var(--muted)] m-0">No expense categories recorded yet.</p>}
          </div>
        </section>
      </section>
      <Toolbar
        searchPlaceholder="Search expenses..."
        filters={['This month', 'Inventory', 'Operations', 'Marketing', 'Travel']}
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
              columns={['Category', 'Description', 'Amount', 'Date', 'Payment Method']}
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
              <span>Page {currentPage} of {totalPages} ({filteredExpenses.length} expenses)</span>
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
            title="No expenses yet"
            description="Expense records from the database will appear here."
            action="Add expense"
            onAction={openCreateModal}
          />
        )}
      </section>

      {/* CREATE & EDIT MODAL */}
      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">{modalMode === 'create' ? 'Add New Expense' : 'Edit Expense'}</h3>
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
                    <label htmlFor="title" className="text-[13px] font-semibold text-[var(--text)]">Description / Title *</label>
                    <input
                      type="text"
                      id="title"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.title ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        setFormErrors({ ...formErrors, title: '' });
                      }}
                      placeholder="e.g. Office Stationery / Server hosting"
                      required
                    />
                    {formErrors.title && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.title}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="category" className="text-[13px] font-semibold text-[var(--text)]">Category *</label>
                      <select
                        id="category"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.category ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.category}
                        onChange={(e) => {
                          setFormData({ ...formData, category: e.target.value });
                          setFormErrors({ ...formErrors, category: '' });
                        }}
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Operations">Operations</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Travel">Travel</option>
                        <option value="Software">Software</option>
                        <option value="Rent">Rent</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Other">Other (Custom)</option>
                      </select>
                      {formErrors.category && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.category}</span>}
                    </div>

                    {formData.category === 'Other' && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="customCategory" className="text-[13px] font-semibold text-[var(--text)]">Specify Category *</label>
                        <input
                          type="text"
                          id="customCategory"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="e.g. Consultancy"
                          className="h-[40px] px-3 border border-[var(--border)] rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="amount" className="text-[13px] font-semibold text-[var(--text)]">Amount ($) *</label>
                      <input
                        type="number"
                        id="amount"
                        min="0.01"
                        step="0.01"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.amount ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.amount}
                        onChange={(e) => {
                          setFormData({ ...formData, amount: e.target.value });
                          setFormErrors({ ...formErrors, amount: '' });
                        }}
                        placeholder="e.g. 150.00"
                        required
                      />
                      {formErrors.amount && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.amount}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="expenseDate" className="text-[13px] font-semibold text-[var(--text)]">Date *</label>
                      <input
                        type="date"
                        id="expenseDate"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.expenseDate ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.expenseDate}
                        onChange={(e) => {
                          setFormData({ ...formData, expenseDate: e.target.value });
                          setFormErrors({ ...formErrors, expenseDate: '' });
                        }}
                        required
                      />
                      {formErrors.expenseDate && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.expenseDate}</span>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentMethod" className="text-[13px] font-semibold text-[var(--text)]">Payment Method *</label>
                    <select
                      id="paymentMethod"
                      className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.paymentMethod ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                      value={formData.paymentMethod}
                      onChange={(e) => {
                        setFormData({ ...formData, paymentMethod: e.target.value });
                        setFormErrors({ ...formErrors, paymentMethod: '' });
                      }}
                      required
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                    {formErrors.paymentMethod && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.paymentMethod}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="notes" className="text-[13px] font-semibold text-[var(--text)]">Notes / Additional Details</label>
                    <textarea
                      id="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter extra details here..."
                      className="px-3 py-2 border border-[var(--border)] rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modalMode === 'view' && selectedExpense && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(540px,94vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">Expense Details</h3>
              <button className="bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto grid gap-5">
              <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
                <div className="w-14 h-14 rounded-xl bg-[var(--red-soft)] text-[var(--red)] flex items-center justify-center text-[20px] font-extrabold">
                  $
                </div>
                <div>
                  <h4 className="m-0 text-[18px] font-bold">{selectedExpense.title || selectedExpense.notes || 'Expense'}</h4>
                  <span className="text-[var(--muted)] text-[13px]">Expense ID: #{selectedExpense.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Category</label>
                  <strong>{selectedExpense.category || '-'}</strong>
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Payment Method</label>
                  <strong>{selectedExpense.paymentMethod || '-'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Expense Date</label>
                  <strong>{date(selectedExpense.expenseDate)}</strong>
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Recorded At</label>
                  <strong>{date(selectedExpense.createdAt)}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Amount</label>
                  <strong className="text-[var(--red)]">
                    {currency(selectedExpense.amount)}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[var(--muted)] font-semibold uppercase mb-1">Notes</label>
                <p className="m-0 text-[var(--text)]">{selectedExpense.notes || 'No extra notes.'}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
              <Button variant="ghost" onClick={closeModal}>Close</Button>
              <Button variant="primary" icon="edit" onClick={() => {
                const expense = selectedExpense;
                setSelectedExpense(expense);

                const standardCategories = ['Inventory', 'Operations', 'Marketing', 'Travel', 'Software', 'Rent', 'Utilities'];
                const isStandard = standardCategories.includes(expense.category);

                setFormData({
                  title: expense.title || expense.notes || '',
                  notes: expense.notes || '',
                  category: isStandard ? expense.category : (expense.category ? 'Other' : ''),
                  amount: expense.amount !== undefined ? String(expense.amount) : '',
                  expenseDate: expense.expenseDate ? expense.expenseDate.split('T')[0] : '',
                  paymentMethod: expense.paymentMethod || 'CASH',
                });
                setCustomCategory(isStandard ? '' : (expense.category || ''));
                setFormErrors({});
                setSubmitError('');
                setModalMode('edit');
              }}>Edit Expense</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
