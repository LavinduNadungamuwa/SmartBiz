import { useState } from 'react';
import Icon from '../components/ui/Icon';
import { AreaChart, ChartCard } from '../components/charts';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Toolbar from '../components/ui/Toolbar';
import { useBusinessData } from '../api/resources';
import { createSale, updateSale, deleteSale, getSaleById, getSaleItems } from '../api/useSales';
import { currency, date, indexById, lastMonthsSeries, number, status } from '../utils/formatters';
import useAuth from '../store/useAuth';

export default function Sales() {
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
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    invoiceNumber: '',
    saleDate: '',
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    discount: '0',
    notes: '',
    items: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [viewLoading, setViewLoading] = useState(false);
  const [viewSaleItems, setViewSaleItems] = useState([]);
  const [originalQuantities, setOriginalQuantities] = useState({});

  if (loading) return <LoadingState message="Loading sales..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  console.log("Sales Data:", data.sales);

  const customerById = indexById(data.customers || []);
  const productById = indexById(data.products || []);

  // Filter & Search Logic
  const filteredSales = (data.sales || []).filter((sale) => {
    const customer = customerById[sale.customerId];
    const customerName = customer?.fullName || '';
    const productNames = sale.products || '';

    // Search matching
    const query = searchValue.toLowerCase().trim();
    if (query) {
      const matchesSearch =
        `sale-${sale.id}`.includes(query) ||
        sale.invoiceNumber?.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        productNames.toLowerCase().includes(query) ||
        sale.status?.toLowerCase().includes(query) ||
        sale.paymentMethod?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter chip matching
    if (activeFilter === 'Completed') {
      return sale.status?.toUpperCase() === 'COMPLETED';
    }
    if (activeFilter === 'Pending') {
      return sale.status?.toUpperCase() === 'PENDING';
    }
    if (activeFilter === 'Refunded') {
      return sale.status?.toUpperCase() === 'REFUNDED';
    }

    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Modal actions
  const openCreateModal = () => {
    setOriginalQuantities({});
    setFormData({
      customerId: '',
      invoiceNumber: `SALE-${Date.now().toString().slice(-6)}`,
      saleDate: new Date().toISOString().split('T')[0],
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      discount: '0',
      notes: '',
      items: [{ productId: '', quantity: 1, unitPrice: '' }],
    });
    setFormErrors({});
    setSubmitError('');
    setModalMode('create');
  };

  const closeModal = () => {
    setOriginalQuantities({});
    setModalMode(null);
    setSelectedSale(null);
    setViewSaleItems([]);
  };

  const handleEdit = async (index) => {
    const sale = paginatedSales[index];
    if (!sale) return;

    try {
      const [saleRes, itemsRes] = await Promise.all([
        getSaleById(sale.id),
        getSaleItems(),
      ]);

      const fullSale = saleRes.data;
      const allItems = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const saleItems = allItems.filter(
        (item) =>
          item.saleId === sale.id ||
          item.sale?.id === sale.id ||
          item.sale_id === sale.id
      );

      // Save original quantities mapping for stock validations
      const orgQtyMap = {};
      saleItems.forEach((item) => {
        const prodId = item.productId ?? item.product_id ?? item.product?.id ?? item.product?.productId;
        const qty = item.quantity ?? item.qty ?? 1;
        if (prodId) {
          orgQtyMap[prodId] = (orgQtyMap[prodId] || 0) + qty;
        }
      });
      setOriginalQuantities(orgQtyMap);

      setSelectedSale(fullSale);

      setFormData({
        customerId: fullSale.customerId !== undefined ? String(fullSale.customerId) : '',
        invoiceNumber: String(fullSale.invoiceNumber || `SALE-${fullSale.id}`), // Cast to safe String
        saleDate: fullSale.saleDate ? new Date(fullSale.saleDate).toISOString().split('T')[0] : '',
        status: fullSale.status || 'COMPLETED',
        paymentMethod: fullSale.paymentMethod || 'CASH',
        discount: fullSale.discount !== undefined ? String(fullSale.discount) : '0',
        notes: fullSale.notes || '',

        items: saleItems.map((item) => {
          const productId = item.productId ?? item.product_id ?? item.product?.id ?? item.product?.productId;
          const quantity = item.quantity ?? item.qty ?? 1;
          const unitPrice = item.unitPrice ?? item.unit_price ?? item.price ?? '';

          return {
            id: item.id, // <-- CRITICAL: Maintain row entity mapping
            productId: productId !== undefined ? String(productId) : '',
            productName: item.productName || item.product?.productName || item.product?.name || productById[productId]?.productName || `Product #${productId}`,
            quantity: quantity,
            unitPrice: unitPrice !== undefined ? String(unitPrice) : '',
          };
        }),
      });

      setFormErrors({});
      setSubmitError('');
      setModalMode('edit');

    } catch (err) {
      console.error("Error fetching sale details for edit:", err);
      alert("Could not load sale items. Please try again.");
    }
  };
  const handleView = async (index) => {
    const sale = paginatedSales[index];
    if (!sale) return;
    setSelectedSale(sale);
    setViewSaleItems([]);
    setModalMode('view');
    setViewLoading(true);
    try {
      const [saleRes, itemsRes] = await Promise.all([
        getSaleById(sale.id),
        getSaleItems(),
      ]);
      setSelectedSale(saleRes.data);
      console.log('[handleView] saleRes.data:', saleRes.data);
      console.log('[handleView] initial sale from list:', sale);
      // Filter items belonging to this sale; field may be saleId or sale.id
      const allItems = Array.isArray(itemsRes.data) ? itemsRes.data : [];
      const filtered = allItems.filter(
        (item) =>
          item.saleId === sale.id ||
          item.sale?.id === sale.id ||
          item.sale_id === sale.id
      );
      setViewSaleItems(filtered);
    } catch {
      // fall back gracefully — modal stays open with basic sale info
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (index) => {
    const sale = paginatedSales[index];
    if (!sale) return;

    if (!isAdmin) {
      alert('Only ADMIN users are authorized to delete sales records.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete sale "${sale.invoiceNumber || `SALE-${sale.id}`}"?`)) {
      try {
        await deleteSale(sale.id);
        reload();
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to delete sale.');
      }
    }
  };

  // Dynamic Item Row Handlers
  const handleItemChange = (index, field, value) => {
    // High-level declarative update preventing object mutation
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        // If the product is changed, automatically pull the database base price
        if (field === 'productId') {
          const prod = productById[value];
          updatedItem.unitPrice = prod ? String(prod.unitPrice || '') : '';
          updatedItem.productName = prod ? prod.productName : '';
        }
        return updatedItem;
      }
      return item;
    });

    setFormData({ ...formData, items: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: '' }],
    });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Calculations
  const calculatedSubtotal = formData.items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unitPrice || 0);
    return sum + qty * price;
  }, 0);

  const calculatedTotal = calculatedSubtotal - Number(formData.discount || 0);


  const validateForm = () => {
    const errors = {};
    if (!formData.customerId) errors.customerId = 'Customer is required';

    if (modalMode === 'create' && (!formData.invoiceNumber || !formData.invoiceNumber.trim())) {
      errors.invoiceNumber = 'Invoice Number is required';
    }

    if (!formData.saleDate) errors.saleDate = 'Sale Date is required';

    // Sum requested quantities per product to validate against total available stock
    const prodQtySums = {};
    formData.items.forEach((item) => {
      if (item.productId) {
        const qty = Number(item.quantity);
        if (!isNaN(qty) && qty > 0) {
          prodQtySums[item.productId] = (prodQtySums[item.productId] || 0) + qty;
        }
      }
    });

    const itemsErrors = [];
    if (formData.items.length === 0) {
      errors.itemsGlobal = 'At least one product item is required';
    } else {
      formData.items.forEach((item, index) => {
        const itemErr = {};
        // Only require product selection when creating a sale. In edit mode we show existing products and do not ask user to re-select them.
        if (!item.productId) itemErr.productId = 'Required';

        const qty = Number(item.quantity);
        if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
          itemErr.quantity = 'Must be positive integer';
        } else if (item.productId) {
          const product = productById[item.productId];
          const orgQty = originalQuantities[item.productId] || 0;
          const availableStock = (product?.stockQuantity || 0) + orgQty;
          const totalRequestedQty = prodQtySums[item.productId] || 0;
          
          if (totalRequestedQty > availableStock) {
            itemErr.quantity = `Only ${availableStock} units available (requested ${totalRequestedQty})`;
          }
        }

        const price = Number(item.unitPrice);
        if (isNaN(price) || price < 0) {
          itemErr.unitPrice = 'Must be non-negative';
        }

        if (Object.keys(itemErr).length > 0) {
          itemsErrors[index] = itemErr;
        }
      });
      if (itemsErrors.length > 0) {
        errors.items = itemsErrors;
      }
    }

    if (formData.discount === '' || isNaN(Number(formData.discount)) || Number(formData.discount) < 0) {
      errors.discount = 'Discount must be a non-negative number';
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

    try {
      // Inside your handleSubmit function
      const formattedItems = formData.items.map((item) => {
        const qty = parseInt(item.quantity, 10);
        const price = parseFloat(item.unitPrice);

        return {
          id: item.id || undefined,
          productId: parseInt(item.productId, 10),
          quantity: parseInt(item.quantity, 10),
          unitPrice: parseFloat(item.unitPrice),
          totalPrice: parseInt(item.quantity, 10) * parseFloat(item.unitPrice),
          product_id: parseInt(item.productId, 10),
          subtotal: qty * price,
        };
      });

      const payload = {
        customerId: parseInt(formData.customerId, 10),
        invoiceNumber: String(formData.invoiceNumber || '').trim(), // Double protected string conversion
        saleDate: formData.saleDate,
        status: String(formData.status || 'COMPLETED').toUpperCase(),
        paymentMethod: formData.paymentMethod,
        subtotal: calculatedSubtotal,
        tax: 0,
        discount: parseFloat(formData.discount) || 0,
        totalAmount: calculatedTotal,
        notes: String(formData.notes || '').trim(),
        items: formattedItems,
        saleItems: formattedItems, // Defensive alignment matching various ORM structures
      };

      if (modalMode === 'create') {
        await createSale(payload);
      } else if (modalMode === 'edit') {
        await updateSale(selectedSale.id, payload);
      }

      reload();
      closeModal();
    } catch (err) {
      console.error("Submission pipeline failed:", err);
      setSubmitError(
        err.response?.data?.message || err.message || 'Failed to save sale record. Please try again.'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const salesTrend = lastMonthsSeries(data.sales || [], 'saleDate', 'totalAmount');
  const totalSales = (data.sales || []).reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);

  const rows = paginatedSales.map((sale) => {
    return [
      sale.invoiceNumber || `SALE-${sale.id}`,
      customerById[sale.customerId]?.fullName || `Customer #${sale.customerId || '-'}`,
      sale.products || '-',
      currency(sale.totalAmount),
      date(sale.saleDate),
      status(sale.status),
    ];
  });

  // Normalize viewSaleItems for display in the view modal
  const viewItems = viewSaleItems.map((item) => {
    const productId = item.productId ?? item.product_id ?? item.product?.id ?? item.product?.productId;
    const productName =
      item.productName || item.product?.productName || item.product?.name || productById[productId]?.productName || `Product #${productId}`;
    const quantity = Number(item.quantity ?? item.qty ?? 0);
    const unitPrice = Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0);
    const totalPrice = Number(item.totalPrice ?? item.total_price ?? item.total ?? quantity * unitPrice);
    return {
      productName,
      quantity: isNaN(quantity) ? 0 : quantity,
      unitPrice: isNaN(unitPrice) ? 0 : unitPrice,
      totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
    };
  });

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader
        eyebrow="Sales"
        title="Sales history"
        description="Live sales records from smartbiz_db."
        actions={<Button icon="plus" onClick={openCreateModal}>Record new sale</Button>}
      />

      <section className="grid grid-cols-3 gap-4 max-[860px]:grid-cols-1">
        <StatCard label="Total Sales Value" value={currency(totalSales)} growth="Live" icon="sales" />
        <StatCard label="Orders" value={number((data.sales || []).length)} growth="Live" icon="invoices" />
        <StatCard label="Average Sale" value={currency((data.sales || []).length ? totalSales / (data.sales || []).length : 0)} growth="Live" icon="profit" />
      </section>

      <ChartCard title="Sales Analytics" subtitle="Sales totals by month">
        <AreaChart labels={salesTrend.labels} values={salesTrend.raw} />
      </ChartCard>

      <Toolbar
        searchPlaceholder="Search sales..."
        filters={['Completed', 'Pending', 'Refunded']}
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
              columns={['Invoice Number', 'Customer', 'Products', 'Total Amount', 'Date', 'Status']}
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
              <span>Page {currentPage} of {totalPages} ({filteredSales.length} sales)</span>
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
            title="No sales yet"
            description="Sales records from the database will appear here."
            action="Record sale"
            onAction={openCreateModal}
          />
        )}
      </section>

      {/* CREATE & EDIT MODAL */}
      {modalMode && modalMode !== 'view' && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(720px,96vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">{modalMode === 'create' ? 'Record New Sale' : 'Edit Sale Record'}</h3>
              <button className="bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 overflow-y-auto overflow-x-hidden max-h-[calc(90vh-180px)]">
                {submitError && (
                  <div className="text-[var(--red)] bg-[var(--red-soft)] py-[10px] px-[14px] rounded-[8px] mb-4 text-[14px]">
                    {submitError}
                  </div>
                )}
                <div className="grid gap-[18px]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="customerId" className="text-[13px] font-semibold text-[var(--text)]">Customer *</label>
                      <select
                        id="customerId"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.customerId ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.customerId}
                        onChange={(e) => {
                          setFormData({ ...formData, customerId: e.target.value });
                          setFormErrors({ ...formErrors, customerId: '' });
                        }}
                        required
                      >
                        <option value="">Select Customer</option>
                        {(data.customers || []).map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.fullName}
                          </option>
                        ))}
                      </select>
                      {formErrors.customerId && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.customerId}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {/* Invoice: editable when creating, read-only display when editing */}
                      {modalMode === 'create' ? (
                        <>
                          <label htmlFor="invoiceNumber" className="text-[13px] font-semibold text-[var(--text)]">Invoice Number *</label>
                          <input
                            type="text"
                            id="invoiceNumber"
                            className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.invoiceNumber ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                            value={formData.invoiceNumber}
                            onChange={(e) => {
                              setFormData({ ...formData, invoiceNumber: e.target.value });
                              setFormErrors({ ...formErrors, invoiceNumber: '' });
                            }}
                            placeholder="e.g. SALE-1024"
                            required
                          />
                          {formErrors.invoiceNumber && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.invoiceNumber}</span>}
                        </>
                      ) : (
                        <>
                          <label className="text-[13px] font-semibold text-[var(--text)]">Invoice Number</label>
                          <div className="py-[10px] px-3 rounded-[6px] bg-[var(--app-bg)] font-bold">{formData.invoiceNumber || (selectedSale && (selectedSale.invoiceNumber || `SALE-${selectedSale.id}`))}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="saleDate" className="text-[13px] font-semibold text-[var(--text)]">Sale Date *</label>
                      <input
                        type="date"
                        id="saleDate"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.saleDate ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.saleDate}
                        onChange={(e) => {
                          setFormData({ ...formData, saleDate: e.target.value });
                          setFormErrors({ ...formErrors, saleDate: '' });
                        }}
                        required
                      />
                      {formErrors.saleDate && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.saleDate}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="status" className="text-[13px] font-semibold text-[var(--text)]">Payment Status *</label>
                      <select
                        id="status"
                        className="h-[40px] px-3 border border-[var(--border)] rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        required
                      >
                        <option value="COMPLETED">Completed</option>
                        <option value="PENDING">Pending</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="paymentMethod" className="text-[13px] font-semibold text-[var(--text)]">Payment Method</label>
                    <select
                      id="paymentMethod"
                      className="h-[40px] px-3 border border-[var(--border)] rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    >
                      <option value="CASH">Cash</option>
                      <option value="CARD">Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Dynamic Product Items */}
                  <div className="border-t border-[var(--border)] pt-4 mt-2">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="m-0 font-bold">Products List *</h4>
                      <Button variant="ghost" icon="plus" onClick={addItemRow}>Add Product</Button>
                    </div>
                    {formErrors.itemsGlobal && (
                      <div className="text-[12px] text-[var(--red)] mt-0.5 mb-3 block">{formErrors.itemsGlobal}</div>
                    )}

                    <div className="grid gap-3">
                      {formData.items.map((item, idx) => {
                        const itemErr = formErrors.items?.[idx] || {};
                        return (
                          <div key={idx} className="bg-[var(--app-bg)] p-3 rounded-[10px] grid grid-cols-2 gap-2.5">
                            {/* Product selector — full width */}
                            <div className="col-span-2 flex flex-col gap-1.5">
                              <label className="text-[11px] text-[var(--muted)]">Product</label>
                              <select
                                className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${itemErr.productId ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                                value={item.productId || ''}
                                onChange={(e) =>
                                  handleItemChange(idx, 'productId', e.target.value)
                                }
                                required
                              >
                                <option value="">Select Product</option>
                                {(data.products || []).map((product) => {
                                  const orgQty = originalQuantities[product.id] || 0;
                                  const availableStock = product.stockQuantity + orgQty;
                                  return (
                                    <option key={product.id} value={product.id} disabled={availableStock <= 0}>
                                      {product.productName} ({currency(product.unitPrice)}) - {availableStock > 0 ? `${availableStock} available` : 'Out of Stock'}
                                    </option>
                                  );
                                })}
                              </select>
                              {itemErr.productId && (
                                <span className="text-[12px] text-[var(--red)] mt-0.5">{itemErr.productId}</span>
                              )}
                            </div>

                            {/* Qty */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] text-[var(--muted)]">Qty</label>
                              <input
                                type="number"
                                min="1"
                                step="1"
                                className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${itemErr.quantity ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                                value={item.quantity}
                                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                required
                              />
                              {itemErr.quantity && <span className="text-[12px] text-[var(--red)] mt-0.5">{itemErr.quantity}</span>}
                            </div>

                            {/* Unit Price */}
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[11px] text-[var(--muted)]">Price ($)</label>
                              <input
                                type="number"
                                min="0.00"
                                step="0.01"
                                className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${itemErr.unitPrice ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                                required
                              />
                              {itemErr.unitPrice && <span className="text-[12px] text-[var(--red)] mt-0.5">{itemErr.unitPrice}</span>}
                            </div>

                            {/* Row total + remove button */}
                            <div className="col-span-2 flex justify-between items-center pt-1">
                              <span className="text-[13px] text-[var(--muted)]">
                                Total:&nbsp;
                                <strong className="text-[var(--text)] text-[14px]">
                                  {currency(Number(item.quantity || 0) * Number(item.unitPrice || 0))}
                                </strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItemRow(idx)}
                                className="bg-transparent border-none text-[var(--red)] cursor-pointer p-1.5 flex items-center justify-center"
                                title="Remove item"
                              >
                                <Icon name="trash" size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calculations Breakdowns */}
                  <div className="bg-[var(--app-bg)] p-4 rounded-xl mt-3 grid gap-2">
                    <div className="flex justify-between text-[14px]">
                      <span>Subtotal:</span>
                      <strong>{currency(calculatedSubtotal)}</strong>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="discount" className="text-[12px] font-semibold text-[var(--text)]">Discount ($)</label>
                      <input
                        type="number"
                        id="discount"
                        min="0"
                        step="0.01"
                        className={`h-[40px] px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] ${formErrors.discount ? 'border-[var(--red)]' : 'border-[var(--border)]'}`}
                        value={formData.discount}
                        onChange={(e) => {
                          setFormData({ ...formData, discount: e.target.value });
                          setFormErrors({ ...formErrors, discount: '' });
                        }}
                      />
                      {formErrors.discount && <span className="text-[12px] text-[var(--red)] mt-0.5">{formErrors.discount}</span>}
                    </div>

                    <div className="flex justify-between text-[16px] font-extrabold border-t border-[var(--border)] pt-3 mt-1">
                      <span>Total Amount:</span>
                      <span className="text-[var(--blue)]">{currency(calculatedTotal)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="notes" className="text-[13px] font-semibold text-[var(--text)]">Notes</label>
                    <textarea
                      id="notes"
                      rows="2"
                      className="py-2 px-3 border rounded-[10px] text-[14px] bg-[var(--surface)] text-[var(--text)] outline-none transition-all duration-200 focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] border-[var(--border)]"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter additional details..."
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
                <Button variant="ghost" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save Sale Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {modalMode === 'view' && selectedSale && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeModal}>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(680px,96vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <h3>Sale Invoice Details</h3>
              <button className="bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeModal} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>
            <div className="p-6 grid gap-5 overflow-y-auto max-h-[calc(90vh-160px)] pr-2">
              {viewLoading ? (
                <div className="text-center py-10 text-[var(--muted)]">Loading sale details…</div>
              ) : (<>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div>
                    <h4 className="m-0 text-[18px] font-bold">
                      {selectedSale.invoiceNumber || `SALE-${selectedSale.id}`}
                    </h4>
                    <span className="text-[var(--muted)] text-[13px]">Date: {date(selectedSale.saleDate)}</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block py-1.5 px-3 rounded-[12px] text-[13px] font-bold ${selectedSale.status === 'COMPLETED' ? 'bg-[var(--blue-soft)] text-[var(--blue)]' : 'bg-[var(--orange-soft)] text-[var(--orange)]'}`}>
                      {status(selectedSale.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-1">Customer Name</label>
                    <strong>{customerById[selectedSale.customerId]?.fullName || `Customer #${selectedSale.customerId || '-'}`}</strong>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-1">Payment Method</label>
                    <strong>{status(selectedSale.paymentMethod)}</strong>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-t border-[var(--border)] pt-4">
                  <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-3">Items Ordered</label>
                  {viewItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-[14px]">
                        <thead>
                          <tr className="border-b-2 border-[var(--border)]">
                            <th className="text-left p-[8px_10px] text-[11px] text-[var(--muted)] font-semibold uppercase">Product</th>
                            <th className="text-center p-[8px_10px] text-[11px] text-[var(--muted)] font-semibold uppercase">Qty</th>
                            <th className="text-right p-[8px_10px] text-[11px] text-[var(--muted)] font-semibold uppercase">Unit Price</th>
                            <th className="text-right p-[8px_10px] text-[11px] text-[var(--muted)] font-semibold uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewItems.map((item, idx) => (
                            <tr key={idx} className="border-b border-[var(--border)]">
                              <td className="p-2.5 font-medium">{item.productName}</td>
                              <td className="p-2.5 text-center">{item.quantity}</td>
                              <td className="p-2.5 text-right">{currency(item.unitPrice)}</td>
                              <td className="p-2.5 text-right font-bold">{currency(item.totalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-[var(--border)]">
                            <td colSpan={3} className="p-[8px_10px] text-right text-[14px] text-[var(--muted)]">Discount:</td>
                            <td className="p-[8px_10px] text-right text-[14px] text-[var(--orange)]">− {currency(selectedSale.discount ?? 0)}</td>
                          </tr>
                          <tr className="border-t-2 border-[var(--border)]">
                            <td colSpan={3} className="p-2.5 text-right font-bold text-[15px]">Total Amount:</td>
                            <td className="p-2.5 text-right font-extrabold text-[15px] text-[var(--blue)]">{currency(selectedSale.totalAmount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <p className="m-0 text-[14px] text-[var(--muted)]">No item details available.</p>
                  )}
                </div>

                {selectedSale.notes && (
                  <div className="border-t border-[var(--border)] pt-4">
                    <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-1">Notes</label>
                    <p className="m-0 text-[14px] whitespace-pre-line">{selectedSale.notes}</p>
                  </div>
                )}
              </>)}
            </div>
            <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
              <Button variant="ghost" onClick={closeModal}>Close</Button>
              <Button variant="primary" icon="edit" onClick={() => {
                const index = paginatedSales.findIndex(s => s.id === selectedSale.id);
                if (index !== -1) {
                  handleEdit(index);
                }
              }}>Edit Invoice</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


