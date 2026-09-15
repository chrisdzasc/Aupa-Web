import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ChevronRight, Plus, Users, Loader2 } from "lucide-react";
import { listarPacientes, PacienteLista } from "../services/paciente.service";
import {
  calcularEdad,
  formatearFecha,
  obtenerIniciales,
  formatearTelefono,
} from "../utils/fechas";

const POR_PAGINA = 10;

function Pacientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [pacientes, setPacientes] = useState<PacienteLista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPacientes = async () => {
      try {
        const datos = await listarPacientes();
        setPacientes(datos);
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "Error al cargar pacientes";
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(pacientesFiltrados.length / POR_PAGINA),
  );
  const inicio = (pagina - 1) * POR_PAGINA;
  const pacientesVisibles = pacientesFiltrados.slice(
    inicio,
    inicio + POR_PAGINA,
  );

  const desde = pacientesFiltrados.length === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + POR_PAGINA, pacientesFiltrados.length);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-8 space-y-6">
      {/* Cabecera */}
      <div className="bg-indigo-50/70 rounded-2xl border border-indigo-100/60 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              Directorio de Pacientes
            </h1>
            <p className="text-sm text-indigo-900/60 font-medium mt-1">
              {pacientes.length}{" "}
              {pacientes.length === 1
                ? "paciente registrado"
                : "pacientes registrados"}
            </p>
          </div>

          <Link
            to="/pacientes/nuevo"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            Nuevo Paciente
          </Link>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-2 flex items-center gap-3">
        <Search size={18} className="text-slate-400 ml-2 shrink-0" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
          placeholder="Buscar por nombre..."
          className="flex-1 bg-transparent border-none text-slate-800 placeholder-slate-400 py-2 outline-none"
        />
      </div>

      {/* Directorio */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Encabezados (solo escritorio) */}
        <div className="hidden md:flex p-4 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="w-10 mr-4"></div>
          <div className="flex-1">Paciente</div>
          <div className="w-36">Edad</div>
          <div className="w-16 text-center">Sexo</div>
          <div className="w-32">Última visita</div>
          <div className="w-36 hidden lg:block">Contacto</div>
          <div className="w-8"></div>
        </div>

        {/* Filas */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
            <p className="text-slate-500 text-sm">Cargando pacientes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-3">
              <Users className="w-8 h-8 text-red-300" />
            </div>
            <h3 className="text-slate-700 font-medium mb-1">Error al cargar</h3>
            <p className="text-slate-500 text-sm">{error}</p>
          </div>
        ) : pacientesVisibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-medium mb-1">
              {busqueda ? "Sin resultados" : "Aún no hay pacientes"}
            </h3>
            <p className="text-slate-500 text-sm">
              {busqueda
                ? "No se encontraron pacientes con ese nombre."
                : "Registra tu primer paciente para comenzar."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pacientesVisibles.map((paciente) => (
              <div
                key={paciente.id}
                onClick={() => navigate(`/pacientes/${paciente.id}`)}
                className="flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mr-4 shrink-0">
                  {obtenerIniciales(paciente.nombre)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">
                    {paciente.nombre}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 md:hidden">
                    {calcularEdad(paciente.fechaNacimiento)} • {paciente.sexo}
                  </div>
                </div>

                <div className="w-36 hidden md:block text-sm text-slate-600">
                  {calcularEdad(paciente.fechaNacimiento)}
                </div>
                <div className="w-16 hidden md:block text-sm font-medium text-slate-600 text-center">
                  {paciente.sexo}
                </div>
                <div className="w-32 hidden md:block text-sm text-slate-400">
                  {formatearFecha(paciente.mediciones[0]?.fechaConsulta)}
                </div>
                <div className="w-36 hidden lg:block text-sm font-mono text-slate-600 truncate">
                  {formatearTelefono(paciente.tutor.telefono)}
                </div>

                <div className="w-8 flex justify-end text-slate-300 group-hover:text-teal-600 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <span className="text-sm text-slate-500">
            Mostrando {desde} - {hasta} de {pacientesFiltrados.length} pacientes
          </span>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-teal-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:text-slate-400 disabled:bg-slate-50 disabled:border-transparent disabled:shadow-none disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina >= totalPaginas}
              className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-teal-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:text-slate-400 disabled:bg-slate-50 disabled:border-transparent disabled:shadow-none disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pacientes;
