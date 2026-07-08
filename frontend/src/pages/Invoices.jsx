import { useState } from 'react';
import Icon from '../components/ui/Icon';
import { jsPDF } from 'jspdf';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import EmptyState from '../components/ui/EmptyState';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import Toolbar from '../components/ui/Toolbar';
import { useBusinessData } from '../api/resources';
import { getSaleById, getSaleItems } from '../api/useSales';
import { currency, date, indexById, status } from '../utils/formatters';

export default function Invoices() {
  const { data, loading, error, reload } = useBusinessData();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [saleDetails, setSaleDetails] = useState(null);   // full sale object
  const [saleItems, setSaleItems] = useState([]);          // line items

  const openView = async (index) => {
    const invoice = data.invoices?.[index];
    if (!invoice) return;
    setSelectedInvoice(invoice);
    setSaleDetails(null);
    setSaleItems([]);

    if (invoice.saleId) {
      setViewLoading(true);
      try {
        const [saleRes, itemsRes] = await Promise.all([
          getSaleById(invoice.saleId),
          getSaleItems(),
        ]);
        setSaleDetails(saleRes.data);
        const allItems = Array.isArray(itemsRes.data) ? itemsRes.data : [];
        const filtered = allItems.filter(
          (item) =>
            item.saleId === invoice.saleId ||
            item.sale?.id === invoice.saleId ||
            item.sale_id === invoice.saleId
        );
        setSaleItems(filtered);
      } catch {
        // graceful — modal still shows invoice-level data
      } finally {
        setViewLoading(false);
      }
    }
  };

  const closeView = () => {
    setSelectedInvoice(null);
    setSaleDetails(null);
    setSaleItems([]);
  };

  /* ── shared helper: fetch sale + items for any invoice row ── */
  const fetchInvoiceData = async (index) => {
    const invoice = data.invoices?.[index];
    if (!invoice) return null;
    const customerById = indexById(data.customers || []);
    const productById  = indexById(data.products  || []);
    let sale  = null;
    let items = [];
    if (invoice.saleId) {
      try {
        const [saleRes, itemsRes] = await Promise.all([
          getSaleById(invoice.saleId),
          getSaleItems(),
        ]);
        sale  = saleRes.data;
        const all = Array.isArray(itemsRes.data) ? itemsRes.data : [];
        items = all.filter(
          (it) =>
            it.saleId === invoice.saleId ||
            it.sale?.id === invoice.saleId ||
            it.sale_id === invoice.saleId
        );
      } catch { /* graceful */ }
    }
    const normaliseItems = (raw) => raw.map((item) => {
      const productId = item.productId ?? item.product_id ?? item.product?.id ?? item.product?.productId;
      const productName =
        item.productName || item.product?.productName || item.product?.name ||
        productById[productId]?.productName || `Product #${productId}`;
      const quantity   = Number(item.quantity  ?? item.qty        ?? 0);
      const unitPrice  = Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0);
      const totalPrice = Number(item.totalPrice ?? item.total_price ?? item.total ?? quantity * unitPrice);
      return { productName, quantity, unitPrice, totalPrice };
    });
    return { invoice, sale, items: normaliseItems(items), customerById, productById };
  };

  /* ── PRINT (table row action) ── */
  const handlePrintByIndex = async (index) => {
    const d = await fetchInvoiceData(index);
    if (!d) return;
    const { invoice: inv, sale, items, customerById } = d;
    const customerName  = sale ? customerById[sale.customerId]?.fullName || `Customer #${sale.customerId}` : '—';
    const paymentMethod = sale ? status(sale.paymentMethod) : '—';
    const subtotal = items.length > 0
      ? items.reduce((sum, item) => sum + item.totalPrice, 0)
      : (sale?.subtotal ?? inv.totalAmount);
    const discount = sale?.discount ?? 0;
    const total    = inv.totalAmount ?? sale?.totalAmount;

    const itemsHtml = items.length
      ? items.map(it => `
          <tr>
            <td style="padding:8px 10px">${it.productName}</td>
            <td style="padding:8px 10px;text-align:center">${it.quantity}</td>
            <td style="padding:8px 10px;text-align:right">${currency(it.unitPrice)}</td>
            <td style="padding:8px 10px;text-align:right;font-weight:700">${currency(it.totalPrice)}</td>
          </tr>`).join('')
      : `<tr><td colspan="4" style="padding:10px;color:#888">No line items available.</td></tr>`;

    const printContent = `
      <!DOCTYPE html><html>
      <head>
        <title>Invoice ${inv.invoiceNumber || `INV-${inv.id}`}</title>
        <style>
          body { font-family: Inter, system-ui, sans-serif; color: #111; padding: 40px; font-size: 14px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
          .badge { display:inline-block; padding:4px 10px; border-radius:10px; font-size:12px; font-weight:700;
                   background:${inv.status==='PAID'?'#e0f0ff':'#fff3e0'}; color:${inv.status==='PAID'?'#0070f3':'#e07a00'}; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px; }
          label { font-size:11px; color:#888; text-transform:uppercase; font-weight:600; display:block; margin-bottom:3px; }
          table { width:100%; border-collapse:collapse; margin-bottom:16px; }
          th { text-align:left; padding:8px 10px; font-size:11px; color:#888; text-transform:uppercase; border-bottom:2px solid #eee; }
          th:last-child, td:last-child { text-align:right; }
          th:nth-child(2), td:nth-child(2) { text-align:center; }
          td { padding:8px 10px; border-bottom:1px solid #f0f0f0; }
          tfoot td { font-size:13px; }
          .total-row td { font-size:15px; font-weight:800; border-top:2px solid #eee; }
          .footer { margin-top:32px; font-size:12px; color:#aaa; text-align:center; }
        </style>
      </head>
      <body>
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <h1>${inv.invoiceNumber || `INV-${inv.id}`}</h1>
            <div class="meta">Issue: ${date(inv.issueDate)} &bull; Due: ${date(inv.dueDate)}</div>
          </div>
          <div><span class="badge">${status(inv.status)}</span></div>
        </div>
        <div class="grid">
          <div><label>Customer</label><strong>${customerName}</strong></div>
          <div><label>Payment Method</label><strong>${paymentMethod}</strong></div>
        </div>
        <table>
          <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr><td colspan="3" style="text-align:right;color:#888">Subtotal:</td><td style="text-align:right">${currency(subtotal)}</td></tr>
            <tr><td colspan="3" style="text-align:right;color:#e07a00">Discount:</td><td style="text-align:right;color:#e07a00">− ${currency(discount)}</td></tr>
            <tr class="total-row"><td colspan="3" style="text-align:right">Total Amount:</td><td style="text-align:right;color:#0070f3">${currency(total)}</td></tr>
          </tfoot>
        </table>
        <div class="footer">Generated by SmartBiz &bull; ${new Date().toLocaleDateString()}</div>
      </body></html>`;

    const win = window.open('', '_blank', 'width=800,height=700');
    win.document.write(printContent);
    win.document.close();
    win.focus();
    win.print();
  };

  /* ── DOWNLOAD PDF (table row action) ── */
  const handleDownloadPDFByIndex = async (index) => {
    const d = await fetchInvoiceData(index);
    if (!d) return;
    const { invoice: inv, sale, items: pdfItems, customerById } = d;

    const customerName  = sale ? customerById[sale.customerId]?.fullName || `Customer #${sale.customerId}` : '—';
    const paymentMethod = sale ? status(sale.paymentMethod) : '—';
    const subtotal = pdfItems.length > 0
      ? pdfItems.reduce((sum, item) => sum + item.totalPrice, 0)
      : (sale?.subtotal ?? inv.totalAmount);
    const discount = sale?.discount ?? 0;
    const total    = inv.totalAmount ?? sale?.totalAmount;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W  = doc.internal.pageSize.getWidth();
    const H  = doc.internal.pageSize.getHeight();
    const LM = 20;
    const RM = W - 20;
    let y = 22;

    const setColour   = (r, g, b) => doc.setTextColor(r, g, b);
    const resetColour = () => setColour(17, 17, 17);
    const muted       = () => setColour(120, 120, 120);

    /* Header band */
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, W, 40, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
    doc.text(inv.invoiceNumber || `INV-${inv.id}`, LM, y);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(180, 190, 210);
    doc.text(`Issue: ${date(inv.issueDate)}   \u2022   Due: ${date(inv.dueDate)}`, LM, y + 8);

    const isPaid = inv.status === 'PAID';
    const pillW = 28, pillX = RM - 28, pillY = y - 6;
    doc.setFillColor(isPaid ? 0 : 255, isPaid ? 186 : 167, isPaid ? 124 : 38);
    doc.roundedRect(pillX, pillY, pillW, 8, 3, 3, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(isPaid ? 0 : 130, isPaid ? 70 : 60, isPaid ? 20 : 0);
    doc.text(status(inv.status), pillX + pillW / 2, pillY + 5.2, { align: 'center' });

    y = 50;

    /* Customer / Payment */
    const labelStyle = () => { doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); muted(); };
    const valueStyle = () => { doc.setFont('helvetica', 'bold'); doc.setFontSize(11); resetColour(); };
    labelStyle(); doc.text('CUSTOMER NAME', LM, y);
    labelStyle(); doc.text('PAYMENT METHOD', W / 2 + 5, y);
    y += 5;
    valueStyle(); doc.text(customerName, LM, y);
    valueStyle(); doc.text(paymentMethod, W / 2 + 5, y);
    y += 10;
    doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.3); doc.line(LM, y, RM, y);
    y += 8;

    /* Products table */
    const colProduct = LM, colQty = W * 0.60, colUnit = W * 0.76, colTotal = RM;
    doc.setFillColor(245, 247, 250);
    doc.rect(LM, y - 4.5, RM - LM, 8, 'F');
    labelStyle();
    doc.text('PRODUCT', colProduct, y);
    doc.text('QTY', colQty, y, { align: 'center' });
    doc.text('UNIT PRICE', colUnit, y, { align: 'right' });
    doc.text('TOTAL', colTotal, y, { align: 'right' });
    y += 5;
    doc.setDrawColor(210, 215, 225); doc.setLineWidth(0.4); doc.line(LM, y, RM, y);
    y += 5;
    doc.setLineWidth(0.2);

    if (pdfItems.length === 0) {
      muted(); doc.setFont('helvetica', 'italic'); doc.setFontSize(10);
      doc.text('No line items available.', LM, y);
      y += 8;
    } else {
      pdfItems.forEach((item, i) => {
        if (i % 2 === 0) { doc.setFillColor(252, 253, 255); doc.rect(LM, y - 4, RM - LM, 8, 'F'); }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); resetColour();
        doc.text(item.productName, colProduct, y);
        doc.setFont('helvetica', 'normal');
        doc.text(String(item.quantity), colQty, y, { align: 'center' });
        doc.text(currency(item.unitPrice), colUnit, y, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(currency(item.totalPrice), colTotal, y, { align: 'right' });
        y += 8;
        doc.setDrawColor(230, 234, 240); doc.line(LM, y - 2, RM, y - 2);
      });
    }
    y += 6;

    /* Totals */
    const totX = W * 0.60;
    doc.setDrawColor(210, 215, 225); doc.setLineWidth(0.3); doc.line(totX, y, RM, y); y += 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); muted();
    doc.text('Subtotal', totX, y);
    resetColour(); doc.setFont('helvetica', 'bold');
    doc.text(currency(subtotal), RM, y, { align: 'right' }); y += 7;
    doc.setFont('helvetica', 'normal'); setColour(200, 100, 0);
    doc.text('Discount', totX, y);
    doc.setFont('helvetica', 'bold'); setColour(200, 100, 0);
    doc.text(`- ${currency(discount)}`, RM, y, { align: 'right' }); y += 5;
    doc.setDrawColor(180, 185, 200); doc.setLineWidth(0.5); doc.line(totX, y, RM, y); y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); resetColour();
    doc.text('Total Amount', totX, y);
    setColour(0, 112, 243); doc.text(currency(total), RM, y, { align: 'right' });

    /* Footer */
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); setColour(170, 175, 185);
    doc.text(`Generated by SmartBiz  \u2022  ${new Date().toLocaleDateString()}`, W / 2, H - 12, { align: 'center' });
    doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.2); doc.line(LM, H - 17, RM, H - 17);

    doc.save(`${inv.invoiceNumber || `INV-${inv.id}`}.pdf`);
  };

  if (loading) return <LoadingState message="Loading invoices..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const customerById = indexById(data.customers || []);
  const productById = indexById(data.products || []);

  const rows = data.invoices.map((invoice) => [
    invoice.invoiceNumber || `INV-${invoice.id}`,
    `Sale #${invoice.saleId || '-'}`,
    currency(invoice.totalAmount),
    date(invoice.issueDate),
    date(invoice.dueDate),
    status(invoice.status),
  ]);

  // Normalize line items for the modal
  const viewItems = saleItems.map((item) => {
    const productId = item.productId ?? item.product_id ?? item.product?.id ?? item.product?.productId;
    const productName =
      item.productName || item.product?.productName || item.product?.name || productById[productId]?.productName || `Product #${productId}`;
    const quantity = Number(item.quantity ?? item.qty ?? 0);
    const unitPrice = Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0);
    const totalPrice = Number(item.totalPrice ?? item.total_price ?? item.total ?? quantity * unitPrice);
    return { productName, quantity: isNaN(quantity) ? 0 : quantity, unitPrice: isNaN(unitPrice) ? 0 : unitPrice, totalPrice: isNaN(totalPrice) ? 0 : totalPrice };
  });

  const modalSubtotal = viewItems.length > 0
    ? viewItems.reduce((sum, item) => sum + item.totalPrice, 0)
    : (saleDetails?.subtotal ?? selectedInvoice?.totalAmount ?? 0);

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader eyebrow="Billing" title="Invoices" description="Live invoice records from smartbiz_db." />
      <Toolbar searchPlaceholder="Search invoices..." filters={['Paid', 'Pending', 'Overdue']} />
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5">
        {rows.length ? (
          <DataTable columns={['Invoice Number', 'Customer', 'Amount', 'Issue Date', 'Due Date', 'Status']} rows={rows} actions="invoice" onView={openView} onPrint={handlePrintByIndex} onDownloadPDF={handleDownloadPDFByIndex} />
        ) : (
          <EmptyState title="No invoices yet" description="Invoice records from the database will appear here." />
        )}
      </section>

      {/* VIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-[rgba(15,23,42,0.5)] backdrop-blur-[6px] flex items-center justify-center z-[1000] animate-[fadeIn_0.25s_ease-out]" onClick={closeView}>
          <div
            className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-[min(680px,96vw)] max-h-[90vh] flex flex-col animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between py-5 px-6 border-b border-[var(--border)]">
              <div>
                <h3 className="m-0 text-[18px] font-bold text-[var(--text)]">Invoice Details</h3>
                <div className="text-[13px] text-[var(--muted)] mt-[6px]">
                  Sale ID: {selectedInvoice.saleId ?? '—'}
                </div>
              </div>
              <button className="bg-transparent border-0 text-[var(--muted)] cursor-pointer flex items-center justify-center p-1 rounded-[6px] transition-colors duration-200 hover:bg-[var(--app-bg)] hover:text-[var(--text)]" onClick={closeView} aria-label="Close">
                <Icon name="close" size={20} />
              </button>
            </div>

            {/* Body */}
            <div
              className="p-6 overflow-y-auto grid gap-5 max-h-[calc(90vh-160px)] pr-2"
            >
              {/* Invoice number + status badge */}
              <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
                <div>
                  <h4 className="m-0 text-[18px] font-bold">{selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id}`}</h4>
                  <span className="text-[var(--muted)] text-[13px]">Issue: {date(selectedInvoice.issueDate)} &bull; Due: {date(selectedInvoice.dueDate)}</span>
                </div>
                <span className={`inline-block py-1.5 px-3 rounded-[12px] text-[13px] font-bold ${
                  selectedInvoice.status === 'PAID'
                    ? 'bg-[var(--blue-soft)] text-[var(--blue)]'
                    : 'bg-[var(--orange-soft)] text-[var(--orange)]'
                }`}>
                  {status(selectedInvoice.status)}
                </span>
              </div>

              {/* Customer + Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-1">Customer Name</label>
                  <strong>
                    {saleDetails
                      ? customerById[saleDetails.customerId]?.fullName || `Customer #${saleDetails.customerId}`
                      : '—'}
                  </strong>
                </div>
                <div>
                  <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-1">Payment Method</label>
                  <strong>{saleDetails ? status(saleDetails.paymentMethod) : '—'}</strong>
                </div>
              </div>

              {/* Products / Line Items */}
              <div className="border-t border-[var(--border)] pt-4">
                <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-3">Products</label>
                {viewLoading ? (
                  <p className="m-0 text-[14px] text-[var(--muted)]">Loading items…</p>
                ) : viewItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[14px]">
                      <thead>
                        <tr className="border-b-2 border-[var(--border)]">
                          <th className="text-left py-2 px-2.5 text-[11px] text-[var(--muted)] font-semibold uppercase">Product</th>
                          <th className="text-center py-2 px-2.5 text-[11px] text-[var(--muted)] font-semibold uppercase">Qty</th>
                          <th className="text-right py-2 px-2.5 text-[11px] text-[var(--muted)] font-semibold uppercase">Unit Price</th>
                          <th className="text-right py-2 px-2.5 text-[11px] text-[var(--muted)] font-semibold uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewItems.map((item, idx) => (
                          <tr key={idx} className="border-b border-[var(--border)]">
                            <td className="p-[10px] font-medium">{item.productName}</td>
                            <td className="p-[10px] text-center">{item.quantity}</td>
                            <td className="p-[10px] text-right">{currency(item.unitPrice)}</td>
                            <td className="p-[10px] text-right font-bold">{currency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="m-0 text-[14px] text-[var(--muted)]">
                    {selectedInvoice.saleId ? 'No line items found.' : 'No linked sale — item details unavailable.'}
                  </p>
                )}
              </div>

              {/* Subtotal / Discount / Total */}
              <div className="bg-[var(--app-bg)] p-4 rounded-[12px] grid gap-[10px]">
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--muted)]">Subtotal</span>
                  <strong>{currency(modalSubtotal)}</strong>
                </div>
                <div className="flex justify-between text-[14px]">
                  <span className="text-[var(--muted)]">Discount</span>
                  <span className="text-[var(--orange)] font-semibold">− {currency(saleDetails?.discount ?? 0)}</span>
                </div>
                <div className="flex justify-between text-[16px] font-extrabold border-t border-[var(--border)] pt-[10px]">
                  <span>Total Amount</span>
                  <span className="text-[var(--blue)]">{currency(selectedInvoice.totalAmount)}</span>
                </div>
              </div>

              {/* Notes (if present) */}
              {selectedInvoice.notes && (
                <div className="border-t border-[var(--border)] pt-4">
                  <label className="block text-[11px] text-[var(--muted)] font-semibold uppercase mb-1">Notes</label>
                  <p className="m-0 text-[14px] whitespace-pre-line">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 py-[18px] px-6 bg-[var(--surface-soft)] border-t border-[var(--border)]">
              <Button variant="primary" onClick={closeView}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
