import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { loanService } from "../../services/loanService";
import api from "../../services/api";
import { Search, CheckCircle2, ArrowLeft } from "lucide-react";

export default function CreateLoan() {
  const [form, setForm] = useState({ amount: "", termMonths: "", tasaInteresPersonalizada: "", purpose: "" });
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.client) { const c = location.state.client; setSelectedClient(c); setSearch(c.name); }
  }, [location.state]);

  useEffect(() => {
    if (search.length < 2) { setResults([]); setShowDropdown(false); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try { const { data } = await api.get("/users/search?q=" + search); setResults(data); setShowDropdown(true); }
      catch { setResults([]); } finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) { setError("Debes seleccionar un cliente"); return; }
    setLoading(true); setError("");
    try {
      await loanService.createLoanForClient({ userId: selectedClient.id, amount: Number(form.amount), termMonths: Number(form.termMonths), tasaInteresPersonalizada: Number(form.tasaInteresPersonalizada), purpose: form.purpose });
      navigate("/admin/loans");
    } catch (err) { setError(err.response?.data?.message || "Error al crear prestamo"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <button onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 text-white/30 hover:text-amber-400 text-sm transition-colors mb-6">
          <ArrowLeft size={16} /> Volver al inicio
        </button>
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-white text-2xl font-bold font-['Outfit']">Crear Prestamo</h1>
          <p className="text-white/40 text-sm mt-1">Crea un prestamo pre-aprobado para un cliente</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">{error}</div>}

        <div className="glass p-8 animate-fade-in-up stagger-2">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-6">
            <p className="text-amber-400/80 text-sm">Los prestamos creados por el admin se aprueban automaticamente y las cuotas se generan al instante.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div ref={dropdownRef} className="relative">
              <label className="text-white/50 text-sm font-medium block mb-2">Buscar Cliente</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setSelectedClient(null); }}
                  className="input-glass pl-9" placeholder="Nombre o email del cliente..." />
                {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">Buscando...</span>}
              </div>
              {showDropdown && results.length > 0 && (
                <div className="absolute z-20 w-full mt-1 glass overflow-hidden shadow-2xl shadow-black/50">
                  {results.map(c => (
                    <div key={c.id} onClick={() => { setSelectedClient(c); setSearch(c.name); setShowDropdown(false); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-0">
                      <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">{c.name.charAt(0).toUpperCase()}</div>
                      <div><p className="text-white text-sm font-medium">{c.name}</p><p className="text-white/30 text-xs">{c.email} - DNI: {c.dni}</p></div>
                      <span className="ml-auto text-white/15 text-xs">ID: {c.id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedClient && (
              <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
                <CheckCircle2 size={18} className="text-green-400" />
                <div><p className="text-green-400 text-sm font-medium">{selectedClient.name}</p><p className="text-white/30 text-xs">{selectedClient.email} - ID: {selectedClient.id}</p></div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-white/50 text-sm font-medium block mb-2">Monto (S/)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input-glass" placeholder="5000" required /></div>
              <div><label className="text-white/50 text-sm font-medium block mb-2">Plazo (meses)</label>
                <input type="number" value={form.termMonths} onChange={e => setForm({ ...form, termMonths: e.target.value })} className="input-glass" placeholder="12" required /></div>
            </div>
            <div><label className="text-white/50 text-sm font-medium block mb-2">Tasa de interes mensual (%)</label>
              <input type="number" step="0.1" value={form.tasaInteresPersonalizada} onChange={e => setForm({ ...form, tasaInteresPersonalizada: e.target.value })} className="input-glass" placeholder="2.0" required />
              <p className="text-white/20 text-xs mt-1">Ejemplo: 2 = 2% mensual (interes simple)</p></div>
            <div><label className="text-white/50 text-sm font-medium block mb-2">Proposito</label>
              <input type="text" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} className="input-glass" placeholder="Capital de trabajo" required /></div>
            <button type="submit" disabled={loading || !selectedClient} className="btn-gold w-full py-3.5 text-sm">{loading ? "Creando..." : "Crear Prestamo"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
