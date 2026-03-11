import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  Calculator,
  CreditCard,
  HandCoins,
  KeyRound,
  LogOut,
  ChevronDown,
  Receipt,
  Tags,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const isActive = (p) => location.pathname === p;

  const linkCls = (p) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive(p)
        ? "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/20"
        : "text-white/50 hover:text-white/90 hover:bg-white/5"
    }`;

  const adminLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/loans", label: "Prestamos", icon: FileText },
    { to: "/admin/create-loan", label: "Crear", icon: PlusCircle },
    { to: "/admin/clients", label: "Clientes", icon: Users },
    { to: "/admin/loan-types", label: "Tipos", icon: Tags },
    { to: "/admin/payments", label: "Pagos", icon: Receipt },
    { to: "/simulator", label: "Simulador", icon: Calculator },
  ];

  const clientLinks = [
    { to: "/client/loans", label: "Mis Prestamos", icon: CreditCard },
    { to: "/client/request-loan", label: "Solicitar", icon: HandCoins },
    { to: "/simulator", label: "Simulador", icon: Calculator },
  ];

  const links = isAdmin() ? adminLinks : clientLinks;

  return (
    <nav
      className="sticky top-0 z-50 glass border-b border-white/5"
      style={{ borderRadius: 0 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link
          to={isAdmin() ? "/admin/dashboard" : "/client/loans"}
          className="flex items-center gap-3 group"
        >
          <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <span className="text-black font-black text-sm tracking-tight">
              LF
            </span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight font-['Outfit']">
            Loan<span className="gold-text">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={linkCls(to)}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 hover:bg-white/5 rounded-xl px-3 py-2 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-black font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-white text-sm font-semibold leading-tight">
                {user?.name}
              </p>
              <p className="text-amber-400/70 text-xs leading-tight">
                {user?.role}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-white/30 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-60 glass overflow-hidden animate-fade-in shadow-2xl shadow-black/50">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-white text-sm font-semibold">{user?.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                  <Users size={15} /> Mi Perfil
                </Link>
                <Link
                  to="/change-password"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm"
                >
                  <KeyRound size={15} /> Cambiar Contrasena
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all text-sm"
                >
                  <LogOut size={15} /> Cerrar Sesion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
