import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { simulatorService } from "../../services/otherServices";
import { useAuthStore } from "../../store/authStore";
import { Calculator, SendHorizonal } from "lucide-react";

export default function Simulator() {
  const [form, setForm] = useState({
    amount: "",
    monthlyInterestRate: "",
    termMonths: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  const handleSimulate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await simulatorService.simulate({
        amount: Number(form.amount),
        monthlyInterestRate: Number(form.monthlyInterestRate),
        termMonths: Number(form.termMonths),
      });
      setResult(data);
    } catch {
      setError("Error al calcular. Verifica los datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-white text-3xl font-bold font-['Outfit'] mb-2">
            Simulador de <span className="gold-text">Prestamos</span>
          </h1>
          <p className="text-white/40">
            Calcula tu cuota mensual y tabla de amortizacion al instante
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 animate-fade-in-up stagger-1">
            <h2 className="text-white font-semibold font-['Outfit'] mb-5 flex items-center gap-2">
              <Calculator size={18} className="text-amber-400" /> Datos del
              Prestamo
            </h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3 mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSimulate} className="space-y-4">
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">
                  Monto (S/)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="input-glass"
                  placeholder="10000"
                  required
                />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">
                  Tasa mensual (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.monthlyInterestRate}
                  onChange={(e) =>
                    setForm({ ...form, monthlyInterestRate: e.target.value })
                  }
                  className="input-glass"
                  placeholder="2.0"
                  required
                />
              </div>
              <div>
                <label className="text-white/50 text-sm font-medium block mb-2">
                  Plazo (meses)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.termMonths}
                  onChange={(e) =>
                    setForm({ ...form, termMonths: e.target.value })
                  }
                  className="input-glass"
                  placeholder="12"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full py-3 text-sm"
              >
                {loading ? "Calculando..." : "Simular Prestamo"}
              </button>
            </form>
          </div>

          <div className="md:col-span-2 animate-fade-in-up stagger-2">
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="glass p-4 text-center bg-amber-500/5 border-amber-500/15">
                    <p className="text-amber-400/70 text-xs mb-1">
                      Cuota Mensual
                    </p>
                    <p className="text-white text-xl font-bold font-['Outfit']">
                      S/ {Number(result.monthlyPayment).toFixed(2)}
                    </p>
                  </div>
                  <div className="glass p-4 text-center">
                    <p className="text-white/30 text-xs mb-1">Total a Pagar</p>
                    <p className="text-white text-xl font-bold font-['Outfit']">
                      S/ {Number(result.totalAmount).toFixed(2)}
                    </p>
                  </div>
                  <div className="glass p-4 text-center bg-red-500/5 border-red-500/15">
                    <p className="text-red-400/70 text-xs mb-1">
                      Total Intereses
                    </p>
                    <p className="text-white text-xl font-bold font-['Outfit']">
                      S/ {Number(result.totalInterest).toFixed(2)}
                    </p>
                  </div>
                </div>

                {!isAdmin() && (
                  <button
                    onClick={() =>
                      navigate("/client/request-loan", {
                        state: {
                          amount: form.amount,
                          termMonths: form.termMonths,
                        },
                      })
                    }
                    className="w-full glass glass-hover text-green-400/80 hover:text-green-400 border-green-500/15 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm bg-green-500/5"
                  >
                    <SendHorizonal size={16} /> Solicitar este prestamo
                  </button>
                )}

                <div className="glass overflow-hidden">
                  <div className="p-4 border-b border-white/5">
                    <h3 className="text-white font-semibold font-['Outfit']">
                      Tabla de Amortizacion
                    </h3>
                  </div>
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-[#0d1120]">
                        <tr className="text-white/30">
                          <th className="text-left px-4 py-3">#</th>
                          <th className="text-left px-4 py-3">Vencimiento</th>
                          <th className="text-right px-4 py-3">Capital</th>
                          <th className="text-right px-4 py-3">Interes</th>
                          <th className="text-right px-4 py-3">Cuota</th>
                          <th className="text-right px-4 py-3">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.installments.map((inst) => (
                          <tr
                            key={inst.installmentNumber}
                            className="border-t border-white/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-4 py-2.5 text-white/30">
                              {inst.installmentNumber}
                            </td>
                            <td className="px-4 py-2.5 text-white/80">
                              {inst.dueDate}
                            </td>
                            <td className="px-4 py-2.5 text-right text-white/80">
                              S/ {Number(inst.principalAmount).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-white/50">
                              S/ {Number(inst.interestAmount).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-right gold-text font-medium">
                              S/ {Number(inst.totalAmount).toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 text-right text-white/50">
                              S/ {Number(inst.remainingBalance).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass h-full flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-amber-500/20">
                    <Calculator size={32} className="text-black" />
                  </div>
                  <p className="text-white/30">
                    Ingresa los datos y haz clic en
                  </p>
                  <p className="gold-text font-semibold">Simular Prestamo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
