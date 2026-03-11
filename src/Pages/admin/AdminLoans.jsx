import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { loanService } from "../../services/loanService";
import { paymentService } from "../../services/otherServices";
import Swal from "sweetalert2";

const statusColors = { PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", APPROVED: "bg-green-500/15 text-green-400 border-green-500/20", REJECTED: "bg-red-500/15 text-red-400 border-red-500/20", COMPLETED: "bg-blue-500/15 text-blue-400 border-blue-500/20" };
const statusLabels = { PENDING: "Pendiente", APPROVED: "Aprobado", REJECTED: "Rechazado", COMPLETED: "Completado" };
const instColors = { PENDING: "text-yellow-400", PAID: "text-green-400", OVERDUE: "text-red-400" };
const swalTheme = { background: "#141829", color: "#fff", confirmButtonColor: "#d4a017", cancelButtonColor: "#334155" };

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [installments, setInstallments] = useState({});
  const [loadingInst, setLoadingInst] = useState(null);
  const [payLoading, setPayLoading] = useState(null);
  const [payMethod, setPayMethod] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const fetchLoans = () => { loanService.getAllLoans().then(({ data }) => setLoans(data)).finally(() => setLoading(false)); };
  useEffect(() => { fetchLoans(); }, []);

  const handleStatus = async (id, status) => {
    const action = status === "APPROVED" ? "aprobar" : "rechazar";
    const r = await Swal.fire({ title: "Confirmar", text: "Deseas " + action + " el prestamo #" + id + "?", icon: "question", showCancelButton: true, confirmButtonText: "Si, " + action, cancelButtonText: "Cancelar", ...swalTheme });
    if (!r.isConfirmed) return;
    setActionLoading(id);
    try {
      await loanService.updateLoanStatus(id, status);
      fetchLoans();
      Swal.fire({ title: status === "APPROVED" ? "Aprobado!" : "Rechazado", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "Error al actualizar", icon: "error", ...swalTheme });
    } finally { setActionLoading(null); }
  };

  const handleExpand = async (loanId) => {
    if (expanded === loanId) { setExpanded(null); return; }
    setExpanded(loanId);
    if (installments[loanId]) return;
    setLoadingInst(loanId);
    try {
      const { data } = await loanService.getLoanDetail(loanId);
      setInstallments(p => ({ ...p, [loanId]: data.installments || [] }));
    } catch { setInstallments(p => ({ ...p, [loanId]: [] })); }
    finally { setLoadingInst(null); }
  };

  const handlePay = async (loanId, num) => {
    const r = await Swal.fire({ title: "Registrar pago cuota #" + num + "?", text: "Esta accion no se puede deshacer", icon: "question", showCancelButton: true, confirmButtonText: "Si, registrar", cancelButtonText: "Cancelar", ...swalTheme });
    if (!r.isConfirmed) return;
    const key = loanId + "-" + num;
    setPayLoading(key);
    try {
      await paymentService.payInstallment({ loanId, installmentNumber: num, paymentMethod: payMethod[key] || "CASH", notes: "Pago registrado por administrador" });
      const { data } = await loanService.getLoanDetail(loanId);
      setInstallments(p => ({ ...p, [loanId]: data.installments || [] }));
      fetchLoans();
      Swal.fire({ title: "Pago registrado!", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch (err) {
      Swal.fire({ title: "Error", text: err.response?.data?.message || "Error al pagar", icon: "error", ...swalTheme });
    } finally { setPayLoading(null); }
  };

  const filtered = loans
    .filter(l => filter === "ALL" || l.status === filter)
    .filter(l =>
      searchTerm === "" ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(l.id).includes(searchTerm)
    );

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-white text-2xl font-bold font-['Outfit']">Todos los Prestamos</h1>
            <p className="text-white/40 text-sm mt-1">{loans.length} prestamos en total</p>
          </div>
          <button onClick={() => navigate("/admin/create-loan")} className="btn-gold px-5 py-2.5 text-sm">+ Nuevo Prestamo</button>
        </div>

        <div className="flex gap-2 mb-6 animate-fade-in-up stagger-1">
          {["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? "btn-gold" : "glass glass-hover text-white/50"}`}>
              {s === "ALL" ? "Todos" : statusLabels[s]}
            </button>
          ))}
        </div>
        <div className="relative mb-6 animate-fade-in-up stagger-2">
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-glass w-full pl-4" placeholder="Buscar por nombre, email o ID del prestamo..." />
        </div>

        {loading ? <div className="text-white/40 text-center py-20">Cargando prestamos...</div> : (
          <div className="space-y-3">
            {filtered.map(loan => (
              <div key={loan.id} className="glass overflow-hidden animate-fade-in-up">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-white/20 text-xs">#{loan.id}</span>
                        <span className="text-white font-semibold">{loan.userName}</span>
                        <span className="text-white/30 text-sm">{loan.userEmail}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[loan.status]}`}>{statusLabels[loan.status]}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                          ["Monto", "S/ " + Number(loan.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 }), "text-white"],
                          ["Cuota mensual", "S/ " + Number(loan.monthlyPayment).toLocaleString("es-PE", { minimumFractionDigits: 2 }), "gold-text"],
                          ["Plazo", loan.termMonths + " meses", "text-white"],
                          ["Total", "S/ " + Number(loan.totalAmount).toLocaleString("es-PE", { minimumFractionDigits: 2 }), "text-white"],
                          ["Cuotas", (loan.paidInstallments || 0) + "/" + (loan.installmentCount || 0), "text-white"],
                        ].map(([label, val, cls]) => (
                          <div key={label}><p className="text-white/25 text-xs">{label}</p><p className={`font-medium ${cls}`}>{val}</p></div>
                        ))}
                      </div>
                      {loan.purpose && <p className="text-white/20 text-xs mt-2">Proposito: {loan.purpose}</p>}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {loan.status === "PENDING" && (<>
                        <button onClick={() => handleStatus(loan.id, "APPROVED")} disabled={actionLoading === loan.id}
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50">Aprobar</button>
                        <button onClick={() => handleStatus(loan.id, "REJECTED")} disabled={actionLoading === loan.id}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50">Rechazar</button>
                      </>)}
                      {(loan.status === "APPROVED" || loan.status === "COMPLETED") && (
                        <button onClick={() => handleExpand(loan.id)}
                          className="w-8 h-8 flex items-center justify-center glass glass-hover rounded-lg text-white/30 hover:text-amber-400 transition-all text-sm">
                          {expanded === loan.id ? "\u25B2" : "\u25BC"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {expanded === loan.id && (
                  <div className="border-t border-white/5 p-5 bg-black/20">
                    <h3 className="text-white font-medium mb-4 text-sm font-['Outfit']">Tabla de Cuotas</h3>
                    {loadingInst === loan.id ? <p className="text-white/30 text-sm text-center py-4">Cargando cuotas...</p> :
                    installments[loan.id]?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead><tr className="text-white/30 border-b border-white/5">
                            {["#", "Vencimiento", "Capital", "Interes", "Cuota", "Saldo", "Estado", "Accion"].map(h => (
                              <th key={h} className={`pb-2 ${h === "Capital" || h === "Interes" || h === "Cuota" || h === "Saldo" ? "text-right" : h === "Estado" || h === "Accion" ? "text-center" : "text-left"}`}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {installments[loan.id].map(inst => {
                              const key = loan.id + "-" + inst.installmentNumber;
                              return (
                                <tr key={inst.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                  <td className="py-2 text-white/30">{inst.installmentNumber}</td>
                                  <td className="py-2 text-white/80">{inst.dueDate}</td>
                                  <td className="py-2 text-right text-white/80">S/ {Number(inst.principalAmount).toFixed(2)}</td>
                                  <td className="py-2 text-right text-white/50">S/ {Number(inst.interestAmount).toFixed(2)}</td>
                                  <td className="py-2 text-right font-medium gold-text">S/ {Number(inst.totalAmount).toFixed(2)}</td>
                                  <td className="py-2 text-right text-white/50">S/ {Number(inst.remainingBalance).toFixed(2)}</td>
                                  <td className="py-2 text-center"><span className={`font-medium text-xs ${instColors[inst.status]}`}>{inst.status}</span></td>
                                  <td className="py-2 text-center">
                                    {inst.status === "PENDING" && (
                                      <div className="flex items-center gap-1 justify-center">
                                        <select value={payMethod[key] || "CASH"} onChange={e => setPayMethod({ ...payMethod, [key]: e.target.value })}
                                          className="input-glass text-xs py-1 px-2 w-auto rounded-lg">
                                          <option value="CASH">Efectivo</option><option value="TRANSFER">Transferencia</option><option value="CARD">Tarjeta</option>
                                        </select>
                                        <button onClick={() => handlePay(loan.id, inst.installmentNumber)} disabled={payLoading === key}
                                          className="btn-gold text-xs px-2 py-1 rounded-lg disabled:opacity-50">{payLoading === key ? "..." : "Registrar"}</button>
                                      </div>
                                    )}
                                    {inst.status === "PAID" && <span className="text-green-400 text-xs">Pagado</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : <p className="text-white/30 text-sm text-center py-4">No hay cuotas registradas</p>}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div className="text-white/30 text-center py-12">No hay prestamos con ese estado</div>}
          </div>
        )}
      </div>
    </div>
  );
}
