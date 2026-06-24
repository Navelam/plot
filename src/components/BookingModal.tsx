import React, { useState, useRef } from 'react';
import type { Plot } from '../data/plots';

interface BookingModalProps {
  plot: Plot;
  onClose: () => void;
  onBooked: (plotId: string) => void;
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  federation: string;
  leader: string;
  leaderPhone: string;
  amount: string;
  paymentMode: string;
  transactionId: string;
  screenshot: string;
  screenshotName: string;
}

const INITIAL_FORM: FormData = {
  name: '', phone: '', email: '', gender: '', address: '',
  federation: '', leader: '', leaderPhone: '', amount: '',
  paymentMode: 'Bank Transfer', transactionId: '', screenshot: '', screenshotName: ''
};

const FEDERATIONS = [
  'Alpha Legends', 'Alpha Energy', 'Spearheads', 'Nellai Energy',
  'Rockfort Energy', 'Supreme Energy', 'Power Plus', 'Galaxy Star',
  'Foundation', 'Others',
];

const PAYMENT_MODES = ['Bank Transfer', 'UPI', 'Cheque', 'Demand Draft', 'Cash'];

export const BookingModal: React.FC<BookingModalProps> = ({ plot, onClose, onBooked }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email';
    if (!form.gender) e.gender = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.federation) e.federation = 'Required';
    if (!form.leader.trim()) e.leader = 'Required';
    if (!/^\d{10}$/.test(form.leaderPhone)) e.leaderPhone = 'Enter valid 10-digit number';
    if (!form.amount.trim() || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter valid amount';
    if (!form.transactionId.trim()) e.transactionId = 'Required';
    if (!form.screenshot) e.screenshot = 'Payment screenshot required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, screenshot: reader.result as string, screenshotName: file.name }));
      setErrors(err => ({ ...err, screenshot: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => { if (validate()) setStep(2); };

  const handleConfirm = async () => {
    setLoading(true);
    setServerError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/plots/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plotId: plot.id,
          name: form.name,
          phone: form.phone,
          email: form.email,
          notes: `Gender: ${form.gender} | Address: ${form.address} | Federation: ${form.federation} | Leader: ${form.leader} | Leader Phone: ${form.leaderPhone} | Amount: ₹${form.amount}`,
          federation: form.federation,
          leader: form.leader,
          leaderPhone: form.leaderPhone,
          amount: form.amount,
          paymentMethod: form.paymentMode,
          transactionId: form.transactionId,
          screenshot: form.screenshot,
          idProof: form.screenshot,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onBooked(plot.id);
      } else {
        setServerError(data.message || 'Booking failed. Please try again.');
        setStep(1);
      }
    } catch {
      setServerError('Cannot connect to server. Please ensure the server is running.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof FormData,
    props: React.InputHTMLAttributes<HTMLInputElement> = {}
  ) => (
    <div style={{ marginBottom: '0.85rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem' }}>
        {label} <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <input
        className="input-field"
        value={form[key] as string}
        onChange={e => {
          setForm(f => ({ ...f, [key]: e.target.value }));
          setErrors(err => ({ ...err, [key]: '' }));
        }}
        style={{ padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}
        {...props}
      />
      {errors[key] && <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>{errors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '480px', padding: '0' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', borderRadius: '1.25rem 1.25rem 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {step === 1 ? 'Booking Details' : 'Confirm Booking'}
            </div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.15rem' }}>Plot {plot.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Steps */}
        <div style={{ padding: '1rem 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {(['1', '2'] as const).map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem',
                  background: step > i + 1 ? '#10b981' : step === i + 1 ? '#0d9488' : '#e2e8f0',
                  color: step >= i + 1 ? '#fff' : '#94a3b8',
                }}>{step > i + 1 ? '✓' : s}</div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', color: step === i + 1 ? '#0d9488' : '#94a3b8' }}>
                  {i === 0 ? 'Details' : 'Confirm'}
                </span>
              </div>
              {i === 0 && <div style={{ flex: 1, height: 2, background: step >= 2 ? '#0d9488' : '#e2e8f0', marginBottom: '1rem', transition: 'background 0.3s' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
          {serverError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
              {serverError}
            </div>
          )}

          {step === 1 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>{field('Customer Name', 'name', { placeholder: 'Enter customer name' })}</div>
                {field('Phone Number', 'phone', { placeholder: '10-digit mobile', maxLength: 10 })}
                {field('Email Address', 'email', { placeholder: 'name@example.com', type: 'email' })}
              </div>

              {/* Gender */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem' }}>
                  Gender <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input type="radio" name="gender" value={g} checked={form.gender === g}
                        onChange={() => { setForm(f => ({ ...f, gender: g })); setErrors(e => ({ ...e, gender: '' })); }}
                        style={{ accentColor: '#0d9488' }} />
                      {g}
                    </label>
                  ))}
                </div>
                {errors.gender && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{errors.gender}</span>}
              </div>

              {field('Address', 'address', { placeholder: 'Full postal address' })}

              {/* Federation */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem' }}>
                  Federation <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select className="input-field" value={form.federation}
                  onChange={e => { setForm(f => ({ ...f, federation: e.target.value })); setErrors(err => ({ ...err, federation: '' })); }}
                  style={{ padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}>
                  <option value="">Select Federation</option>
                  {FEDERATIONS.map(f => <option key={f}>{f}</option>)}
                </select>
                {errors.federation && <span style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '0.2rem', display: 'block' }}>{errors.federation}</span>}
              </div>

              {field('Leader', 'leader', { placeholder: 'Enter leader name' })}

              {field('Leader Phone Number', 'leaderPhone', { placeholder: '10-digit mobile', maxLength: 10 })}

              {field('Amount (₹)', 'amount', { placeholder: 'Enter amount paid', type: 'number', min: '1' })}

              {/* Payment Mode */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem' }}>
                  Payment Mode <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select className="input-field" value={form.paymentMode}
                  onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
                  style={{ padding: '0.6rem 0.85rem', fontSize: '0.875rem' }}>
                  {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {field('Transaction ID / Reference No.', 'transactionId', { placeholder: 'UTR / Cheque No. / Reference' })}

              {/* Screenshot */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', color: '#374151', marginBottom: '0.3rem' }}>
                  Payment Screenshot <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                {!form.screenshot ? (
                  <div className="file-upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Click to upload payment screenshot</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.6rem 0.85rem' }}>
                    <img src={form.screenshot} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }} />
                    <span style={{ fontSize: '0.78rem', color: '#15803d', flex: 1 }}>{form.screenshotName}</span>
                    <button onClick={() => { setForm(f => ({ ...f, screenshot: '', screenshotName: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                )}
                {errors.screenshot && <span style={{ color: '#ef4444', fontSize: '0.72rem', display: 'block', marginTop: '0.2rem' }}>{errors.screenshot}</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleNext} style={{ flex: 2 }}>Review Booking</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0d9488', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plot Details</div>
                <Row label="Plot No." value={`Plot ${plot.id}`} />
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0d9488', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buyer Details</div>
                <Row label="Customer Name" value={form.name} />
                <Row label="Phone" value={form.phone} />
                <Row label="Email" value={form.email} />
                <Row label="Gender" value={form.gender} />
                <Row label="Address" value={form.address} />
                <Row label="Federation" value={form.federation} />
                <Row label="Leader" value={form.leader} />
                <Row label="Leader Phone" value={form.leaderPhone} />
                <Row label="Amount" value={`₹${form.amount}`} highlight />
                <Row label="Payment Mode" value={form.paymentMode} />
                <Row label="Transaction ID" value={form.transactionId} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Screenshot</span>
                  <img src={form.screenshot} alt="payment" style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.78rem', color: '#92400e' }}>
                By confirming, your booking request will be submitted for admin approval.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }} disabled={loading}>Edit</button>
                <button className="btn btn-primary" onClick={handleConfirm} style={{ flex: 2, background: '#059669' }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: '1px solid #f1f5f9' }}>
    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
    <span style={{ fontSize: '0.82rem', color: highlight ? '#059669' : '#0f172a', fontWeight: highlight ? 800 : 500 }}>{value}</span>
  </div>
);
