import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { Search, Receipt } from "lucide-react";

const methodLabels = { CASH: "Efectivo", TRANSFER: "Transferencia", CARD: "Tarjeta" };

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/payments/all").then(({ data }) => setPayments(data)).finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p =>
    searchTerm === "" ||
    (p.clientName && p.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.clientEmail && p.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    String(p.loanId).includes(searchTerm)
  );

  const formatDate = (d) => {
    if (!d) return "---";
    return new Date(d).toLocaleString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-white text-2xl font-bold font-['Outfit']">Historial de Pagos</h1>
            <p className="text-white/40 text-sm mt-1">{payments.length} pago(s) registrado(s)</p>
          </div>
          <div className="flex items-center gap-2">
            <Receipt size={20} className="text-amber-400" />
          </div>
        </div>

        <div className="relative mb-6 animate-fade-in-up stagger-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-glass pl-11 w-full" placeholder="Buscar por cliente, email o ID de prestamo..." />
        </div>

        {loading ? (
          <div className="text-white/40 text-center py-20">Cargando historial...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-white/30 text-lg">No hay pagos registrados</p></div>
        ) : (
          <div className="glass overflow-hidden animate-fade-in-up stagger-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 border-b border-white/5">
                    <th className="text-left px-5 py-3">ID</th>
                    <th className="text-left px-5 py-3">Cliente</th>
                    <th className="text-center px-5 py-3">Prestamo</th>
                    <th className="text-center px-5 py-3">Cuota</th>
                    <th className="text-right px-5 py-3">Monto</th>
                    <th className="text-center px-5 py-3">Metodo</th>
                    <th className="text-left px-5 py-3">Fecha</th>
                    <th className="text-left px-5 py-3">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white/30">#{p.id}</td>
                      <td className="px-5 py-3">
                        <p className="text-white/80 font-medium">{p.clientName || "---"}</p>
                        <p className="text-white/25 text-xs">{p.clientEmail || ""}</p>
                      </td>
                      <td className="px-5 py-3 text-center text-white/50">#{p.loanId}</td>
                      <td className="px-5 py-3 text-center text-white/50">#{p.installmentNumber}</td>
                      <td className="px-5 py-3 text-right font-medium gold-text">S/ {Number(p.amountPaid).toFixed(2)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-white/50">{methodLabels[p.paymentMethod] || p.paymentMethod}</span>
                      </td>
                      <td className="px-5 py-3 text-white/50 text-xs">{formatDate(p.paymentDate)}</td>
                      <td className="px-5 py-3 text-white/30 text-xs">{p.notes || "---"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}