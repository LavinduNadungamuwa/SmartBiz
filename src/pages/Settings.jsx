import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Toggle from '../components/ui/Toggle';

export default function Settings() {
  return (
    <div className="page">
      <PageHeader eyebrow="Workspace" title="Settings" description="Manage business profile, account security, subscription, and notifications." actions={<Button>Save changes</Button>} />
      <section className="settings-grid">
        <section className="card settings-card">
          <h2>Business Settings</h2>
          <Field label="Business Name" value="Brightline Retail" />
          <Field label="Email" value="hello@brightline.lk" />
          <Field label="Phone" value="+94 77 224 1188" />
          <Field label="Address" value="42 Main St, Colombo" />
        </section>
        <section className="card settings-card">
          <h2>Account Settings</h2>
          <Field label="Profile" value="Amara Perera" />
          <Field label="Password" value="Last changed 18 days ago" />
          <Field label="Security" value="Two-factor authentication enabled" />
        </section>
        <section className="card settings-card">
          <h2>Subscription Settings</h2>
          <div className="plan-card">
            <span>Current Plan</span>
            <strong>SmartBiz Pro</strong>
            <p>Advanced analytics, invoices, reports, and AI insights.</p>
            <Button icon="plus">Upgrade plan</Button>
          </div>
        </section>
        <section className="card settings-card">
          <h2>Notification Settings</h2>
          <Toggle label="Email notifications" />
          <Toggle label="Low stock alerts" />
          <Toggle label="Invoice reminders" />
        </section>
      </section>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      <input defaultValue={value} />
    </label>
  );
}
