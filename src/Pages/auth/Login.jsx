import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authService.login(form);
      login(data.token, { name: data.name, email: data.email, role: data.role, userId: data.userId });
      navigate(data.role === "ADMIN" ? "/admin/dashboard" : "/client/loans");
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas");
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
          <h1 className="text-4xl font-bold font-['Outfit'] text-white tracking-tight">
            Loan<span className="gold-text">Flow</span>
          </h1>
          <p className="text-white/40 mt-2 text-sm">Sistema de Gestion de Prestamos</p>
        </div>

        <div className="glass p-8 animate-fade-in-up stagger-2">
          <h2 className="text-white text-xl font-semibold font-['Outfit'] mb-6">Iniciar Sesion</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-5 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-glass" placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Contrasena</label>
              <input type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-glass" placeholder="........" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-gold w-full py-3.5 text-sm flex items-center justify-center gap-2">
              {loading ? "Ingresando..." : <><span>Ingresar</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/register" className="text-white/30 hover:text-amber-400/70 text-sm transition-colors">
              No tienes cuenta? Registrate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
