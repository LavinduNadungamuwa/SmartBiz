import { AreaChart, ChartCard, LineChart } from '../components/charts';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { revenueSeries, salesSeries } from '../data/businessData';

const cards = [
  ['Business performance summary', 'Net profit is trending above the previous quarter and customer retention is stable.'],
  ['Inventory predictions', 'Thermal Printer Paper will reach reorder level within 5 days at the current sales rate.'],
  ['Revenue forecasting', 'Projected revenue for June is $141K based on current pipeline and recurring customers.'],
  ['Expense analysis', 'Marketing spend is efficient, but travel expenses need review before month close.'],
  ['Customer behavior insights', 'Repeat orders are concentrated among 14 customers with high invoice consistency.'],
  ['Recommended actions', 'Reorder scanners, follow up overdue invoices, and promote top-selling bundles.'],
];

export default function AIInsights() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="AI Insights"
        title="Business assistant"
        description="Forecast performance, surface risk, and turn business activity into recommended actions."
        actions={<Button icon="ai">Ask SmartBiz AI</Button>}
      />
      <section className="assistant-hero card">
        <div className="ai-orb large">AI</div>
        <div>
          <h2>Good morning. Your business is operating above plan.</h2>
          <p>Revenue momentum is strong, stock risks are manageable, and three overdue invoices need attention.</p>
        </div>
      </section>
      <section className="ai-grid">
        {cards.map(([title, text]) => (
          <article className="card ai-tile" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
      <section className="dashboard-grid two">
        <ChartCard title="Revenue Forecasting" subtitle="Projected monthly growth">
          <LineChart data={revenueSeries} />
        </ChartCard>
        <ChartCard title="Sales Prediction" subtitle="Likely sales trend">
          <AreaChart data={salesSeries} />
        </ChartCard>
      </section>
      <section className="card conversation-card">
        <div className="chat-row ai"><strong>SmartBiz AI</strong><p>Your top action today is to reorder POS Barcode Scanners and contact Northline Traders about INV-1045.</p></div>
        <div className="chat-row user"><strong>You</strong><p>Show me which products are most at risk next week.</p></div>
      </section>
    </div>
  );
}
