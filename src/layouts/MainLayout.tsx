import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Settings, LogOut, Moon, Sun, Menu, X } from "lucide-react";

function MainLayout() {
    const location = useLocation();
    const [temaOscuro, setTemaOscuro] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path
            ? "text-teal-600 font-bold border-b-4 border-teal-600 pb-[10px] pt-2"
            : "text-gray-500 font-medium hover:text-teal-600 py-2";
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 relative">
                <div className="flex items-center justify-between px-4 sm:px-8 h-16 w-full">

                    {/* Izquierda: Logo + Navegación */}
                    <div className="flex items-center gap-4 sm:gap-10">
                        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                            <h1 className="text-xl font-bold text-teal-600">Aú<span className="text-amber-500">pa</span></h1>
                        </Link>

                        {/* Navegación desktop (oculta en móvil) */}
                        <nav className="hidden md:flex items-center gap-4 sm:gap-6">
                            <Link to="/dashboard" className={`text-sm transition-colors ${isActive("/dashboard")}`}>
                                Dashboard
                            </Link>
                            <Link to="/pacientes" className={`text-sm transition-colors ${isActive("/pacientes")}`}>
                                Pacientes
                            </Link>
                        </nav>
                    </div>

                    {/* Derecha: Perfil + Acciones (desktop) */}
                    <div className="hidden md:flex items-center gap-2 sm:gap-4">
                        <Link to="/perfil" className="flex items-center gap-3 py-1.5 md:px-4 rounded-full md:bg-gray-50 md:border md:border-gray-200 md:hover:bg-gray-100 md:hover:border-gray-300 transition-colors cursor-pointer">
                            <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-[11px] font-bold">AG</div>
                            <span className="text-sm font-medium text-gray-800 hidden md:block">Dr. Gonzalez</span>
                        </Link>

                        <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

                        <button
                            onClick={() => setTemaOscuro(!temaOscuro)}
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Cambiar tema"
                        >
                            {temaOscuro ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <Link
                            to="/configuracion"
                            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Configuración"
                        >
                            <Settings size={20} />
                        </Link>

                        <button
                            className="p-2 rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    {/* Botón hamburguesa (solo móvil) */}
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Menú"
                    >
                        {menuAbierto ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Menú desplegable móvil */}
                {menuAbierto && (
                    <>
                        {/* Fondo oscuro con blur */}
                        <div
                            className="md:hidden fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40"
                            onClick={() => setMenuAbierto(false)}
                        ></div>

                        {/* Menú flotante */}
                        <div className="md:hidden absolute top-16 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-2 z-50 shadow-lg">
                            <Link
                                to="/dashboard"
                                onClick={() => setMenuAbierto(false)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                    location.pathname === "/dashboard" ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/pacientes"
                                onClick={() => setMenuAbierto(false)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                    location.pathname === "/pacientes" ? "bg-teal-50 text-teal-600" : "text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                Pacientes
                            </Link>

                            <div className="border-t border-gray-100 my-2"></div>

                            <Link
                                to="/perfil"
                                onClick={() => setMenuAbierto(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50"
                            >
                                <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-[11px] font-bold">AG</div>
                                <span className="text-sm font-medium text-gray-800">Dr. Gonzalez</span>
                            </Link>

                            <button
                                onClick={() => {
                                    setTemaOscuro(!temaOscuro);
                                    setMenuAbierto(false);
                                }}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium text-left"
                            >
                                {temaOscuro ? <Sun size={18} /> : <Moon size={18} />} Cambiar tema
                            </button>

                            <Link
                                to="/configuracion"
                                onClick={() => setMenuAbierto(false)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
                            >
                                <Settings size={18} /> Configuración
                            </Link>

                            <button
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium text-left"
                            >
                                <LogOut size={18} /> Cerrar sesión
                            </button>
                        </div>
                    </>
                )}
            </header>

            <main className="flex-1 bg-gray-50 overflow-y-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default MainLayout;