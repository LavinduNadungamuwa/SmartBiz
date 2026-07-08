import { useState, useRef } from 'react';
import { AreaChart, ChartCard, LineChart } from '../components/charts';
import Button from '../components/ui/Button';
import { ErrorState, LoadingState } from '../components/ui/LoadState';
import PageHeader from '../components/ui/PageHeader';
import { askAi, useBusinessData } from '../api/resources';
import { currency, lastMonthsSeries, number, productStatus } from '../utils/formatters';
import Icon from '../components/ui/Icon';

export default function AIInsights() {
  const { data, loading, error, reload } = useBusinessData();
  const [question, setQuestion] = useState('What should I focus on today?');
  const [answer, setAnswer] = useState('');
  const [asking, setAsking] = useState(false);
  const convoRef = useRef(null);
  const questionRef = useRef(null);

  if (loading) return <LoadingState message="Loading AI insights..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const revenue = lastMonthsSeries(data.sales, 'saleDate', 'totalAmount');
  const lowStock = data.products.filter((product) => productStatus(product.stockQuantity) !== 'In Stock');

  const cards = [
    ['Business performance summary', `Revenue is ${currency(data.summary.totalRevenue)} across ${number(data.summary.totalSales)} sales.`],
    ['Inventory predictions', lowStock.length ? `${lowStock.length} products need stock attention.` : 'No low-stock products found in the database.'],
    ['Revenue forecasting', `Current month revenue is ${currency(revenue.raw.at(-1))}.`],
    ['Expense analysis', `Recorded expenses total ${currency(data.summary.totalExpenses)}.`],
    ['Customer behavior insights', `${number(data.customers.length)} customer records are available for analysis.`],
    ['Recommended actions', lowStock.length ? `Review ${lowStock[0].productName} first.` : 'Keep monitoring sales and invoice collections.'],
  ];

  const handleAsk = async () => {
    setAsking(true);
    setAnswer('');
    try {
      const res = await askAi(question);
      setAnswer(res.data?.answer || 'No answer returned.');
    } catch (err) {
      setAnswer(err.response?.data?.message || err.message || 'AI request failed.');
    } finally {
      setAsking(false);
    }
  };

  const handleHeroClick = () => {
    // scroll to the conversation card and focus the textarea
    convoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // focus after scrolling animation
    setTimeout(() => questionRef.current?.focus(), 450);
  };

  return (
    <div className="flex flex-col gap-[22px] max-w-[1600px] mx-auto px-[15px]">
      <PageHeader
        eyebrow="AI Insights"
        title="Business assistant"
        description="Live AI assistant connected to the SmartBiz backend."
        /* actions removed; button moved into the assistant panel */
      />
      <section className="relative overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5 flex items-center gap-[18px] max-[560px]:items-start max-[560px]:flex-col">
        <div className="absolute bottom-[-60px] right-[-40px] w-[160px] h-[160px] rounded-full bg-[rgba(37,99,235,0.08)] pointer-events-none" />
        <div className="inline-flex items-center justify-center w-16 h-16 text-white bg-gradient-to-br from-[var(--blue)] to-[#0ea5e9] rounded-[18px] font-black shrink-0 z-10">AI</div>
        <div className="min-w-0 z-10">
          <h2 className="m-0 text-[17px] text-[var(--text)] font-normal">Your assistant is using live business records.</h2>
          <p className="mt-[6px] text-[var(--muted)] leading-[1.55]">{`SmartBiz can reason over ${number(data.customers.length)} customers, ${number(data.products.length)} products, ${number(data.sales.length)} sales, and ${number(data.invoices.length)} invoices.`}</p>
        </div>
        <div className="ml-auto flex items-center z-10 max-[560px]:ml-0">
          <Button icon="ai" onClick={handleHeroClick}>Ask SmartBiz AI</Button>
        </div>
      </section>
      <section className="grid grid-cols-3 gap-4 max-[1180px]:grid-cols-1">
        {cards.map(([title, text]) => (
          <article className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5 min-h-[150px] flex flex-col justify-start" key={title}>
            <h3 className="m-0 text-[17px] text-[var(--text)] font-semibold">{title}</h3>
            <p className="mt-[6px] text-[var(--muted)] leading-[1.55]">{text}</p>
          </article>
        ))}
      </section>
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow)] p-5 grid gap-3 grid-cols-1 items-start" ref={convoRef}>
        <label className="grid gap-2">
          <span className="text-[var(--muted)] font-bold text-[13px]">Ask a business question</span>
          <div className="relative flex items-end">
            <textarea
              ref={questionRef}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="w-full min-h-[96px] pr-12 bg-[var(--surface)] text-[var(--text)] rounded-[10px] border border-[var(--border)] p-[10px_12px] resize-y outline-none focus:border-[var(--blue)] focus:shadow-[0_8px_30px_rgba(37,99,235,0.12)] transition-all duration-200"
            />
            <button
              type="button"
              onClick={handleAsk}
              aria-label="Send message"
              className="absolute right-2 bottom-2 p-[6px_8px] h-9 w-9 inline-flex items-center justify-center rounded-[8px] bg-[var(--blue)] text-white border border-transparent font-bold cursor-pointer hover:bg-[var(--blue-600)] transition-colors duration-200"
            >
              <Icon name="send" size={16} />
            </button>
          </div>
        </label>
        <div className="w-full p-[14px] rounded-[14px] flex flex-col gap-2 items-start bg-[var(--blue-soft)] text-[var(--text)] border border-[rgba(37,99,235,0.08)]">
          <strong className="text-[var(--blue)] font-extrabold">SmartBiz AI</strong>
          <p className="m-0 text-[var(--text)] leading-[1.5] whitespace-pre-wrap">{answer || 'Ask a question to receive a live backend response.'}</p>
        </div>
      </section>
    </div>
  );
}
