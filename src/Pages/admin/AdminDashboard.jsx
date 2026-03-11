import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { dashboardService } from "../../services/otherServices";
import { loanService } from "../../services/loanService";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileText, UserPlus, PlusCircle, Calculator, Download, TrendingUp, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";

const PIE_COLORS = ["#f5b820", "#22c55e", "#ef4444", "#3b82f6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardService.getStats(), loanService.getAllLoans()])
      .then(([s, l]) => { setStats(s.data); setLoans(l.data); })
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: "Pendientes", value: Number(stats.pendingLoans) },
    { name: "Aprobados", value: Number(stats.approvedLoans) },
    { name: "Rechazados", value: Number(stats.rejectedLoans) },
    { name: "Completados", value: Number(stats.completedLoans) },
  ].filter(d => d.value > 0) : [];

  const getMonthlyData = () => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("es-PE", { month: "short" });
      months[key] = { name: key, total: 0 };
    }
    loans.forEach(loan => {
      if (!loan.createdAt) return;
      const d = new Date(loan.createdAt);
      const key = d.toLocaleDateString("es-PE", { month: "short" });
      if (months[key]) months[key].total += 1;
    });
    return Object.values(months);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("LoanFlow - Reporte General", 14, 22);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text("Generado el " + new Date().toLocaleDateString("es-PE"), 14, 30);
    doc.setFontSize(14); doc.setTextColor(0); doc.text("Resumen", 14, 45);
    autoTable(doc, {
      startY: 50, head: [["Metrica", "Valor"]],
      body: [
        ["Total Prestamos", String(stats?.totalLoans || 0)],
        ["Pendientes", String(stats?.pendingLoans || 0)],
        ["Aprobados", String(stats?.approvedLoans || 0)],
        ["Rechazados", String(stats?.rejectedLoans || 0)],
        ["Completados", String(stats?.completedLoans || 0)],
        ["Total Desembolsado", "S/ " + Number(stats?.totalAmountDisbursed || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })],
      ],
      theme: "grid", headStyles: { fillColor: [212, 160, 23] },
    });
    doc.text("Listado de Prestamos", 14, doc.lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [["#", "Cliente", "Monto", "Cuotas", "Estado"]],
      body: loans.map(l => [String(l.id), l.userName, "S/ " + Number(l.amount).toLocaleString("es-PE", { minimumFractionDigits: 2 }), (l.paidInstallments || 0) + "/" + (l.installmentCount || 0), l.status]),
      theme: "grid", headStyles: { fillColor: [212, 160, 23] },
    });
    doc.save("LoanFlow_Reporte.pdf");
  };

  const StatCard = ({ icon: Icon, label, value, accent, sub, delay }) => (
    <div className={`glass glass-hover p-5 animate-fade-in-up ${delay}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-sm font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || "bg-white/5"}`}>
          <Icon size={16} className="text-white/80" />
        </div>
      </div>
      <p className="text-white text-3xl font-bold font-['Outfit']">{value ?? "---"}</p>
      {sub && <p className="text-white/25 text-xs mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="bg-scene min-h-screen">
      <div className="noise-overlay" />
      <Navbar />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-white text-2xl font-bold font-['Outfit']">Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Resumen general del sistema</p>
          </div>
          {stats && (
            <button onClick={exportPDF} className="btn-gold px-5 py-2.5 text-sm flex items-center gap-2">
              <Download size={16} /> Exportar PDF
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-white/40 text-center py-20">Cargando estadisticas...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={FileText} label="Total Prestamos" value={stats?.totalLoans} accent="bg-amber-500/10" delay="stagger-1" />
              <StatCard icon={Clock} label="Pendientes" value={stats?.pendingLoans} accent="bg-yellow-500/10" sub="Requieren aprobacion" delay="stagger-2" />
              <StatCard icon={CheckCircle2} label="Aprobados" value={stats?.approvedLoans} accent="bg-green-500/10" delay="stagger-3" />
              <StatCard icon={TrendingUp} label="Completados" value={stats?.completedLoans} accent="bg-blue-500/10" delay="stagger-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatCard icon={XCircle} label="Rechazados" value={stats?.rejectedLoans} accent="bg-red-500/10" delay="stagger-5" />
              <StatCard icon={Wallet} label="Total Desembolsado"
                value={stats?.totalAmountDisbursed ? "S/ " + Number(stats.totalAmountDisbursed).toLocaleString("es-PE", { minimumFractionDigits: 2 }) : "S/ 0.00"}
                accent="bg-amber-500/10" delay="stagger-6" />
              <StatCard icon={Clock} label="Cuotas Vencidas" value={stats?.overdueInstallments} accent="bg-orange-500/10" sub="Sin pagar y con fecha pasada" delay="stagger-7" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass p-6 animate-fade-in-up stagger-5">
                <h2 className="text-white font-semibold font-['Outfit'] mb-4">Distribucion por Estado</h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                        label={({ name, value }) => name + ": " + value}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", fontFamily: "DM Sans" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-white/20 text-center py-16">Sin datos disponibles</p>}
              </div>

              <div className="glass p-6 animate-fade-in-up stagger-6">
                <h2 className="text-white font-semibold font-['Outfit'] mb-4">Prestamos por Mes</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={getMonthlyData()}>
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#141829", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="total" name="Prestamos" fill="#d4a017" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass p-6 animate-fade-in-up stagger-7">
              <h2 className="text-white font-semibold font-['Outfit'] mb-4">Acciones Rapidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { to: "/admin/loans", icon: FileText, label: "Ver Prestamos" },
                  { to: "/admin/register-client", icon: UserPlus, label: "Registrar Cliente" },
                  { to: "/admin/create-loan", icon: PlusCircle, label: "Crear Prestamo" },
                  { to: "/simulator", icon: Calculator, label: "Simulador" },
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}
                    className="glass glass-hover p-5 text-center transition-all flex flex-col items-center gap-3 group">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                      <Icon size={22} className="text-amber-400" />
                    </div>
                    <p className="text-white/70 text-sm font-medium group-hover:text-white transition-colors">{label}</p>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
