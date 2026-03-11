import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { Search, UserPlus, Phone, Mail, IdCard, PlusCircle } from "lucide-react";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => { api.get("/users/all").then(({ data }) => setClients(data)).finally(() => setLoading(false)); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.dni.includes(searchTerm)
  );

  const formatDate = (d) => { if (!d) return "---"; return new Date(d).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }); };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-white text-2xl font-bold font-['Outfit']">Clientes</h1>
            <p className="text-white/40 text-sm mt-1">{clients.length} cliente(s) registrado(s)</p>
          </div>
          <button onClick={() => navigate("/admin/register-client")} className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
            <UserPlus size={16} /> Nuevo Cliente
          </button>
        </div>

        <div className="relative mb-6 animate-fade-in-up stagger-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-glass pl-11 w-full" placeholder="Buscar por nombre, email o DNI..." />
        </div>

        {loading ? <div className="text-white/40 text-center py-20">Cargando clientes...</div> :
        filtered.length === 0 ? <div className="text-center py-20"><p className="text-white/30 text-lg">{searchTerm ? "No se encontraron clientes" : "No hay clientes registrados aun"}</p></div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client, i) => (
              <div key={client.id} className={`glass glass-hover p-5 animate-fade-in-up stagger-${Math.min(i + 1, 7)}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <span className="text-black font-bold text-sm">{client.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{client.name}</p>
                    <p className="text-white/25 text-xs">ID: {client.id} - Desde {formatDate(client.createdAt)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-white/20 shrink-0" /><span className="text-white/50 truncate">{client.email}</span></div>
                  <div className="flex items-center gap-2 text-sm"><IdCard size={14} className="text-white/20 shrink-0" /><span className="text-white/50">DNI: {client.dni}</span></div>
                  {client.phone && <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-white/20 shrink-0" /><span className="text-white/50">{client.phone}</span></div>}
                </div>
                <button onClick={() => navigate("/admin/create-loan", { state: { client } })}
                  className="w-full mt-4 glass glass-hover text-white/40 hover:text-amber-400 text-xs font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5">
                  <PlusCircle size={13} /> Crear Prestamo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
