import { useEffect, useState } from "react";
import Navbar from "../../components/common/Navbar";
import { loanService } from "../../services/loanService";
import { paymentService } from "../../services/otherServices";
import Swal from "sweetalert2";

const statusColors = { PENDING: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20", APPROVED: "bg-green-500/15 text-green-400 border-green-500/20", REJECTED: "bg-red-500/15 text-red-400 border-red-500/20", COMPLETED: "bg-blue-500/15 text-blue-400 border-blue-500/20" };
const statusLabels = { PENDING: "Pendiente", APPROVED: "Aprobado", REJECTED: "Rechazado", COMPLETED: "Completado" };
const instColors = { PENDING: "text-yellow-400", PAID: "text-green-400", OVERDUE: "text-red-400" };
const swalTheme = { background: "#141829", color: "#fff", confirmButtonColor: "#d4a017", cancelButtonColor: "#334155" };

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [payLoading, setPayLoading] = useState(null);
  const [payMethod, setPayMethod] = useState({});

  const fetchLoans = () => { loanService.getMyLoans().then(({ data }) => setLoans(data)).finally(() => setLoading(false)); };
  useEffect(() => { fetchLoans(); }, []);

  const handlePay = async (loanId, num) => {
    const r = await Swal.fire({ title: "Pagar cuota #" + num + "?", text: "Confirma que deseas realizar este pago", icon: "question", showCancelButton: true, confirmButtonText: "Si, pagar", cancelButtonText: "Cancelar", ...swalTheme });
    if (!r.isConfirmed) return;
    const key = loanId + "-" + num;
    setPayLoading(key);
    try {
      await paymentService.payInstallment({ loanId, installmentNumber: num, paymentMethod: payMethod[key] || "CASH", notes: "Pago desde la aplicacion" });
      fetchLoans();
      Swal.fire({ title: "Pago realizado!", icon: "success", timer: 1500, showConfirmButton: false, ...swalTheme });
    } catch (err) { Swal.fire({ title: "Error", text: err.response?.data?.message || "Error al pagar", icon: "error", ...swalTheme }); }
    finally { setPayLoading(null); }
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-white text-2xl font-bold font-['Outfit']">Mis Prestamos</h1>
          <p className="text-white/40 text-sm mt-1">{loans.length} prestamo(s) registrado(s)</p>
        </div>

        {loading ? <div className="text-white/40 text-center py-20">Cargando prestamos...</div> :
        loans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No tienes prestamos aun</p>
            <a href="/client/request-loan" className="text-amber-400/70 hover:text-amber-400 text-sm mt-2 block">Solicitar un prestamo</a>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map(loan => (
              <div key={loan.id} className="glass overflow-hidden animate-fade-in-up">
                <div className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/20 text-xs">#{loan.id}</span>
                      <span className="text-white font-semibold">{loan.loanTypeName}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusColors[loan.status]}`}>{statusLabels[loan.status]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {loan.installmentCount > 0 && <span className="text-white/25 text-xs">{loan.paidInstallments}/{loan.installmentCount} cuotas</span>}
                      <span className="text-white/20 text-sm">{expanded === loan.id ? "\u25B2" : "\u25BC"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                    <div><p className="text-white/25 text-xs">Monto</p><p className="text-white font-medium">S/ {Number(loan.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-white/25 text-xs">Cuota mensual</p><p className="gold-text font-semibold">S/ {Number(loan.monthlyPayment).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p></div>
                    <div><p className="text-white/25 text-xs">Plazo</p><p className="text-white">{loan.termMonths} meses</p></div>
                    <div><p className="text-white/25 text-xs">Total a pagar</p><p className="text-white">S/ {Number(loan.totalAmount).toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p></div>
                  </div>
                </div>

                {expanded === loan.id && loan.installments && (
                  <div className="border-t border-white/5 p-5 bg-black/20">
                    <h3 className="text-white font-medium mb-4 font-['Outfit']">Tabla de Cuotas</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="text-white/30 border-b border-white/5">
                          <th className="text-left pb-2">#</th><th className="text-left pb-2">Vencimiento</th>
                          <th className="text-right pb-2">Capital</th><th className="text-right pb-2">Interes</th>
                          <th className="text-right pb-2">Total</th><th className="text-right pb-2">Saldo</th>
                          <th className="text-center pb-2">Estado</th>
                          {loan.status === "APPROVED" && <th className="text-center pb-2">Pagar</th>}
                        </tr></thead>
                        <tbody>{loan.installments.map(inst => {
                          const key = loan.id + "-" + inst.installmentNumber;
                          return (
                            <tr key={inst.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="py-2 text-white/30">{inst.installmentNumber}</td>
                              <td className="py-2 text-white/80">{inst.dueDate}</td>
                              <td className="py-2 text-right text-white/80">S/ {Number(inst.principalAmount).toFixed(2)}</td>
                              <td className="py-2 text-right text-white/50">S/ {Number(inst.interestAmount).toFixed(2)}</td>
                              <td className="py-2 text-right font-medium gold-text">S/ {Number(inst.totalAmount).toFixed(2)}</td>
                              <td className="py-2 text-right text-white/50">S/ {Number(inst.remainingBalance).toFixed(2)}</td>
                              <td className="py-2 text-center"><span className={`text-xs font-medium ${instColors[inst.status]}`}>
                                {inst.status === "PAID" ? "Pagado" : inst.status === "OVERDUE" ? "Vencido" : "Pendiente"}</span></td>
                              {loan.status === "APPROVED" && (
                                <td className="py-2 text-center">
                                  {inst.status === "PENDING" && (
                                    <div className="flex items-center gap-1 justify-center">
                                      <select value={payMethod[key] || "CASH"} onChange={e => setPayMethod({ ...payMethod, [key]: e.target.value })}
                                        className="input-glass text-xs py-1 px-2 w-auto rounded-lg">
                                        <option value="CASH">Efectivo</option><option value="TRANSFER">Transferencia</option><option value="CARD">Tarjeta</option>
                                      </select>
                                      <button onClick={() => handlePay(loan.id, inst.installmentNumber)} disabled={payLoading === key}
                                        className="btn-gold text-xs px-2 py-1 rounded-lg disabled:opacity-50">{payLoading === key ? "..." : "Pagar"}</button>
                                    </div>
                                  )}
                                  {inst.status === "PAID" && <span className="text-green-400 text-xs">OK</span>}
                                </td>
                              )}
                            </tr>
                          );
                        })}</tbody>
                      </table>
                    </div>
                  </div>
                )}
                {expanded === loan.id && loan.status === "PENDING" ? (
                  <div className="border-t border-white/5 p-4 bg-yellow-500/5">
                    <p className="text-yellow-400/70 text-sm text-center">Tu solicitud esta en revision. Las cuotas se generaran una vez aprobada.</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
