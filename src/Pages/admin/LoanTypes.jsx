import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import Swal from "sweetalert2";
import { Plus, Pencil, Trash2, X, Save, Tags } from "lucide-react";

const swalTheme = { background: "#141829", color: "#fff", confirmButtonColor: "#d4a017", cancelButtonColor: "#334155" };

export default function LoanTypes() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", minAmount: "", maxAmount: "",
    minMonths: "", maxMonths: "", annualInterestRate: "",
  });

  const fetchTypes = () => {
    api.get("/loan-types").then(({ data }) => setTypes(data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTypes(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", minAmount: "", maxAmount: "", minMonths: "", maxMonths: "", annualInterestRate: "" });
    setEditing(null);
  };

  const startEdit = (t) => {
    setEditing(t.id);
    setForm({
      name: t.name,
      description: t.description || "",
      minAmount: String(t.minAmount),
      maxAmount: String(t.maxAmount),
      minMonths: String(t.minMonths),
      maxMonths: String(t.maxMonths),
      annualInterestRate: String(t.annualInterestRate),
    });
  };

  const startCreate = () => {
    setEditing("new");
    setForm({ name: "", description: "", minAmount: "", maxAmount: "", minMonths: "", maxMonths: "", annualInterestRate: "" });
  };

  const handleSave = async () => {
    if (!form.name || !form.minAmount || !form.maxAmount || !form.minMonths || !form.maxMonths || !form.annualInterestRate) {
      Swal.fire({ title: "Error", text: "Completa todos los campos obligatorios", icon: "warning", ...swalTheme });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      minAmount: Number(form.minAmount),
      maxAmount: Number(form.maxAmount),
      minMonths: Number(form.minMonths),
      maxMonths: Number(form.maxMonths),
      annualInterestRate: Number(form.annualInterestRate),
    };

    try {
      if (editing === "new") {
        await api.post("/loan-types", payload);
        Swal.fire({ title: "Tipo creado!", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
      } else {
        await api.put("/loan-types/" + editing, payload);
        Swal.fire({ title: "Tipo actualizado!", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
      }
      resetForm();
      fetchTypes();
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "Error al guardar", icon: "error", ...swalTheme });
    }
  };

  const handleDelete = async (id, name) => {
    const r = await Swal.fire({
      title: "Eliminar tipo?",
      text: "Se eliminara \"" + name + "\". Si tiene prestamos asociados podria fallar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
      ...swalTheme,
    });
    if (!r.isConfirmed) return;
    try {
      await api.delete("/loan-types/" + id);
      fetchTypes();
      Swal.fire({ title: "Eliminado!", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "No se pudo eliminar. Puede tener prestamos asociados.", icon: "error", ...swalTheme });
    }
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-white text-2xl font-bold font-['Outfit']">Tipos de Prestamo</h1>
            <p className="text-white/40 text-sm mt-1">{types.length} tipo(s) configurado(s)</p>
          </div>
          {!editing && (
            <button onClick={startCreate} className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
              <Plus size={16} /> Nuevo Tipo
            </button>
          )}
        </div>

        {/* Formulario de crear/editar */}
        {editing && (
          <div className="glass p-6 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold font-['Outfit']">
                {editing === "new" ? "Crear Nuevo Tipo" : "Editar Tipo"}
              </h2>
              <button onClick={resetForm} className="text-white/30 hover:text-white/60 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-white/50 text-sm font-medium block mb-2">Nombre</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-glass" placeholder="Ej: Prestamo Empresarial" />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/50 text-sm font-medium block mb-2">Descripcion</label>
                <input type="text" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-glass" placeholder="Ej: Para capital de trabajo de empresas" />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">Monto Minimo (S/)</label>
                <input type="number" min="1" value={form.minAmount}
                  onChange={e => setForm({ ...form, minAmount: e.target.value })}
                  className="input-glass" placeholder="500" />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">Monto Maximo (S/)</label>
                <input type="number" min="1" value={form.maxAmount}
                  onChange={e => setForm({ ...form, maxAmount: e.target.value })}
                  className="input-glass" placeholder="50000" />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">Plazo Minimo (meses)</label>
                <input type="number" min="1" value={form.minMonths}
                  onChange={e => setForm({ ...form, minMonths: e.target.value })}
                  className="input-glass" placeholder="3" />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">Plazo Maximo (meses)</label>
                <input type="number" min="1" value={form.maxMonths}
                  onChange={e => setForm({ ...form, maxMonths: e.target.value })}
                  className="input-glass" placeholder="60" />
              </div>
              <div className="md:col-span-2">
                <label className="text-white/50 text-sm font-medium block mb-2">Tasa de Interes Anual (%)</label>
                <input type="number" step="0.1" min="0.1" value={form.annualInterestRate}
                  onChange={e => setForm({ ...form, annualInterestRate: e.target.value })}
                  className="input-glass" placeholder="18.0" />
                <p className="text-white/20 text-xs mt-1">
                  Equivale a {form.annualInterestRate ? (Number(form.annualInterestRate) / 12).toFixed(2) : "0.00"}% mensual
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-gold px-6 py-2.5 text-sm flex items-center gap-2">
                <Save size={16} /> {editing === "new" ? "Crear Tipo" : "Guardar Cambios"}
              </button>
              <button onClick={resetForm}
                className="glass glass-hover px-6 py-2.5 text-sm text-white/50 hover:text-white transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de tipos */}
        {loading ? (
          <div className="text-white/40 text-center py-20">Cargando tipos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {types.map((t, i) => (
              <div key={t.id} className={`glass glass-hover p-5 animate-fade-in-up stagger-${Math.min(i + 1, 7)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Tags size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{t.name}</h3>
                      <p className="text-white/30 text-xs">{t.description || "Sin descripcion"}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(t)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-amber-500/10 flex items-center justify-center text-white/30 hover:text-amber-400 transition-all">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(t.id, t.name)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-white/25">Monto</p>
                    <p className="text-white/60">S/ {Number(t.minAmount).toLocaleString()} - S/ {Number(t.maxAmount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-white/25">Plazo</p>
                    <p className="text-white/60">{t.minMonths} - {t.maxMonths} meses</p>
                  </div>
                  <div>
                    <p className="text-white/25">Tasa</p>
                    <p className="gold-text font-medium">{(Number(t.annualInterestRate) / 12).toFixed(2)}% mensual</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}