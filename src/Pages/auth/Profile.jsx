import { useState, useEffect } from "react";
import Navbar from "../../components/common/Navbar";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";
import Swal from "sweetalert2";
import { User, Mail, IdCard, Phone, Calendar, Save } from "lucide-react";

const swalTheme = { background: "#141829", color: "#fff", confirmButtonColor: "#d4a017" };

export default function Profile() {
  const { user: authUser, login } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/me")
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.name, phone: data.phone || "" });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/users/me", form);
      setProfile(data);
      // Actualizar nombre en el store global
      const token = localStorage.getItem("token");
      login(token, { ...authUser, name: data.name });
      Swal.fire({ title: "Perfil actualizado!", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "Error al actualizar", icon: "error", ...swalTheme });
    } finally { setSaving(false); }
  };

  const formatDate = (d) => {
    if (!d) return "---";
    return new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-white text-2xl font-bold font-['Outfit']">Mi Perfil</h1>
          <p className="text-white/40 text-sm mt-1">Administra tu informacion personal</p>
        </div>

        {loading ? (
          <div className="text-white/40 text-center py-20">Cargando perfil...</div>
        ) : profile && (
          <>
            {/* Info card */}
            <div className="glass p-6 mb-6 animate-fade-in-up stagger-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-2xl shadow-amber-500/20">
                  <span className="text-black font-bold text-2xl">{profile.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold font-['Outfit']">{profile.name}</h2>
                  <p className="text-white/30 text-sm">{profile.role === "ADMIN" ? "Administrador" : "Cliente"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <Mail size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/25 text-xs">Email</p>
                    <p className="text-white/70 text-sm">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <IdCard size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/25 text-xs">DNI</p>
                    <p className="text-white/70 text-sm">{profile.dni}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <Phone size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/25 text-xs">Telefono</p>
                    <p className="text-white/70 text-sm">{profile.phone || "No registrado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                    <Calendar size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white/25 text-xs">Miembro desde</p>
                    <p className="text-white/70 text-sm">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit form */}
            <div className="glass p-6 animate-fade-in-up stagger-2">
              <h3 className="text-white font-semibold font-['Outfit'] mb-4">Editar Informacion</h3>
              <p className="text-white/20 text-xs mb-4">El email y DNI no se pueden modificar por seguridad.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm font-medium block mb-2">Nombre</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-glass" />
                </div>
                <div>
                  <label className="text-white/50 text-sm font-medium block mb-2">Telefono</label>
                  <input type="text" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input-glass" placeholder="987654321" />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="btn-gold w-full py-3 text-sm flex items-center justify-center gap-2">
                  <Save size={16} /> {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}