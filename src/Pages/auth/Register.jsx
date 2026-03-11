import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { UserPlus, Sparkles } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", dni: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authService.register(form);
      login(data.token, { name: data.name, email: data.email, role: data.role, userId: data.userId });
      navigate("/client/loans");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-scene min-h-screen flex items-center justify-center p-4">
      <div className="noise-overlay" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="w-20 h-20 gold-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-amber-500/30">
            <Sparkles size={32} className="text-black" />
          </div>
          <h1 className="text-4xl font-bold font-['Outfit'] text-white">Loan<span className="gold-text">Flow</span></h1>
          <p className="text-white/40 mt-2 text-sm">Crea tu cuenta</p>
        </div>

        <div className="glass p-8 animate-fade-in-up stagger-2">
          <h2 className="text-white text-xl font-semibold font-['Outfit'] mb-6">Registro</h2>
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-5 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Nombre completo</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-glass" placeholder="Juan Perez" required />
            </div>
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-glass" placeholder="tu@email.com" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">DNI</label>
                <input type="text" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })}
                  className="input-glass" placeholder="12345678" maxLength={8} required />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">Telefono</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-glass" placeholder="987654321" />
              </div>
            </div>
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Contrasena</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-glass" placeholder="........" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3.5 text-sm flex items-center justify-center gap-2">
              {loading ? "Registrando..." : <><UserPlus size={16} /><span>Crear Cuenta</span></>}
            </button>
          </form>
          <div className="mt-5 text-center">
            <Link to="/login" className="text-white/30 hover:text-amber-400/70 text-sm transition-colors">Ya tienes cuenta? Inicia sesion</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
