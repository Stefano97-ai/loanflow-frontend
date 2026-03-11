import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { loanService } from "../../services/loanService";
import { ArrowLeft, Info } from "lucide-react";

export default function RequestLoan() {
  const [form, setForm] = useState({ loanTypeId: "", amount: "", termMonths: "", purpose: "" });
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { loanService.getLoanTypes().then(({ data }) => setLoanTypes(data)); }, []);
  useEffect(() => {
    if (location.state) setForm(p => ({ ...p, amount: location.state.amount || p.amount, termMonths: location.state.termMonths || p.termMonths }));
  }, [location.state]);

  const handleTypeChange = (id) => { setForm({ ...form, loanTypeId: id }); setSelectedType(loanTypes.find(t => t.id === Number(id))); setError(""); };

  const getEstimation = () => {
    if (!selectedType || !form.amount || !form.termMonths) return null;
    const p = Number(form.amount), rate = Number(selectedType.annualInterestRate), m = Number(form.termMonths);
    if (p <= 0 || m <= 0 || rate <= 0) return null;
    const mr = rate / 12 / 100, mp = p / m, mi = p * mr, pay = mp + mi, total = pay * m;
    return { monthlyPayment: pay.toFixed(2), totalAmount: total.toFixed(2), totalInterest: (total - p).toFixed(2), monthlyRate: (rate / 12).toFixed(2) };
  };

  const validate = () => {
    if (!selectedType) return "Selecciona un tipo de prestamo";
    const a = Number(form.amount), m = Number(form.termMonths);
    if (a < selectedType.minAmount || a > selectedType.maxAmount) return "El monto debe estar entre S/ " + selectedType.minAmount.toLocaleString() + " y S/ " + selectedType.maxAmount.toLocaleString();
    if (m < selectedType.minMonths || m > selectedType.maxMonths) return "El plazo debe estar entre " + selectedType.minMonths + " y " + selectedType.maxMonths + " meses";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate(); if (v) { setError(v); return; }
    setLoading(true); setError("");
    try {
      await loanService.requestLoan({ loanTypeId: Number(form.loanTypeId), amount: Number(form.amount), termMonths: Number(form.termMonths), purpose: form.purpose });
      navigate("/client/loans");
    } catch (err) { setError(err.response?.data?.message || "Error al enviar solicitud"); }
    finally { setLoading(false); }
  };

  const est = getEstimation();

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate("/client/loans")} className="flex items-center gap-2 text-white/30 hover:text-amber-400 text-sm transition-colors mb-6">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-white text-2xl font-bold font-['Outfit']">Solicitar Prestamo</h1>
          <p className="text-white/40 text-sm mt-1">Tu solicitud sera revisada por un administrador</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">{error}</div>}

        <div className="glass p-8 animate-fade-in-up stagger-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-white/50 text-sm font-medium block mb-2">Tipo de Prestamo</label>
              <select value={form.loanTypeId} onChange={e => handleTypeChange(e.target.value)} className="input-glass" required>
                <option value="">Selecciona un tipo</option>
                {loanTypes.filter(t => t.name !== "Pr\u00e9stamo Personalizado").map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {selectedType && (
              <div className="glass p-4 text-sm animate-fade-in">
                <p className="gold-text font-semibold">{selectedType.name}</p>
                <p className="text-white/40 mt-1">{selectedType.description}</p>
                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <div><p className="text-white/25">Monto</p><p className="text-white/70">S/ {Number(selectedType.minAmount).toLocaleString()} - S/ {Number(selectedType.maxAmount).toLocaleString()}</p></div>
                  <div><p className="text-white/25">Plazo</p><p className="text-white/70">{selectedType.minMonths} - {selectedType.maxMonths} meses</p></div>
                  <div><p className="text-white/25">Tasa mensual</p><p className="gold-text font-medium">{(Number(selectedType.annualInterestRate) / 12).toFixed(2)}%</p></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-white/50 text-sm font-medium block mb-2">Monto (S/)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-glass"
                  placeholder={selectedType ? selectedType.minAmount + " - " + selectedType.maxAmount : "5000"} required /></div>
              <div><label className="text-white/50 text-sm font-medium block mb-2">Plazo (meses)</label>
                <input type="number" value={form.termMonths} onChange={e => setForm({ ...form, termMonths: e.target.value })} className="input-glass"
                  placeholder={selectedType ? selectedType.minMonths + " - " + selectedType.maxMonths : "12"} required /></div>
            </div>

            <div><label className="text-white/50 text-sm font-medium block mb-2">Proposito</label>
              <input type="text" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="input-glass" placeholder="Ej: Reparacion de vehiculo" required /></div>

            {est && (
              <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center gap-2 mb-3"><Info size={16} className="text-amber-400" /><p className="gold-text text-sm font-medium">Estimacion de tu prestamo</p></div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-white/30 text-xs">Cuota mensual</p><p className="text-white font-bold text-lg">S/ {est.monthlyPayment}</p></div>
                  <div><p className="text-white/30 text-xs">Total a pagar</p><p className="text-white font-bold text-lg">S/ {est.totalAmount}</p></div>
                  <div><p className="text-white/30 text-xs">Total intereses</p><p className="text-red-400 font-bold text-lg">S/ {est.totalInterest}</p></div>
                </div>
                <p className="text-white/15 text-xs mt-2 text-center">Tasa mensual: {est.monthlyRate}% - Valores referenciales</p>
              </div>
            )}

            <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3">
              <p className="text-yellow-400/60 text-xs">Tu solicitud quedara en estado PENDIENTE hasta que un administrador la apruebe.</p>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-sm">{loading ? "Enviando..." : "Enviar Solicitud"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
