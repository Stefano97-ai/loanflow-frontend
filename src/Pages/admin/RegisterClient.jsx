import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import { authService } from "../../services/authService";
import { UserPlus, CheckCircle2 } from "lucide-react";

export default function RegisterClient() {
  const [form, setForm] = useState({ name: "", email: "", password: "", dni: "", phone: "" });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(""); setSuccess(null);
    try {
      const { data } = await authService.register(form);
      setSuccess(data);
      setForm({ name: "", email: "", password: "", dni: "", phone: "" });
    } catch (err) { setError(err.response?.data?.message || "Error al registrar cliente"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-white text-2xl font-bold font-['Outfit']">Registrar Cliente</h1>
          <p className="text-white/40 text-sm mt-1">Crea una cuenta para un nuevo cliente</p>
        </div>
        {success && (
          <div className="glass border-green-500/20 bg-green-500/5 p-4 mb-6 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={18} className="text-green-400" />
            <div><p className="text-green-400 font-medium text-sm">Cliente registrado exitosamente</p>
              <p className="text-white/40 text-xs mt-0.5">{success.name} | {success.email} | {success.role}</p></div>
          </div>
        )}
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">{error}</div>}
        <div className="glass p-8 animate-fade-in-up stagger-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-white/50 text-sm font-medium block mb-2">Nombre completo</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-glass" placeholder="Juan Perez" required /></div>
            <div><label className="text-white/50 text-sm font-medium block mb-2">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-glass" placeholder="cliente@email.com" required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-white/50 text-sm font-medium block mb-2">DNI</label>
                <input type="text" value={form.dni} onChange={e => setForm({ ...form, dni: e.target.value })} className="input-glass" placeholder="12345678" maxLength={8} required /></div>
              <div><label className="text-white/50 text-sm font-medium block mb-2">Telefono</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-glass" placeholder="987654321" /></div>
            </div>
            <div><label className="text-white/50 text-sm font-medium block mb-2">Contrasena inicial</label>
              <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-glass" placeholder="Ej: cliente123" required />
              <p className="text-white/20 text-xs mt-1">Se le entregara al cliente para su primer acceso</p></div>
            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 text-sm flex items-center justify-center gap-2">
              <UserPlus size={16} /> {loading ? "Registrando..." : "Registrar Cliente"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
