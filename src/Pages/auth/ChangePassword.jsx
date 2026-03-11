import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { authService } from "../../services/authService";
import { KeyRound, Check } from "lucide-react";

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setError("Las contrasenas no coinciden"); return; }
    setLoading(true); setError("");
    try {
      await authService.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cambiar contrasena");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-md mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-white text-2xl font-bold font-['Outfit']">Cambiar Contrasena</h1>
          <p className="text-white/40 text-sm mt-1">Actualiza tu contrasena de acceso</p>
        </div>
        {success && (
          <div className="glass border-green-500/20 bg-green-500/5 p-4 mb-6 flex items-center gap-3 animate-fade-in">
            <Check size={18} className="text-green-400" />
            <p className="text-green-400 text-sm">Contrasena actualizada. Redirigiendo...</p>
          </div>
        )}
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-6 text-sm">{error}</div>}
        <div className="glass p-8 animate-fade-in-up stagger-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Contrasena actual</label>
              <input type="password" value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="input-glass" required />
            </div>
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Nueva contrasena</label>
              <input type="password" value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="input-glass" required />
            </div>
            <div>
              <label className="text-white/50 text-sm font-medium block mb-2">Confirmar nueva contrasena</label>
              <input type="password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="input-glass" required />
            </div>
            <button type="submit" disabled={loading || success}
              className="btn-gold w-full py-3.5 text-sm flex items-center justify-center gap-2">
              <KeyRound size={16} /> {loading ? "Actualizando..." : "Cambiar Contrasena"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
