import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, ChevronRight, Plus, Users } from "lucide-react";

interface Paciente {
  id: number;
  nombre: string;
  iniciales: string;
  edad: string;
  sexo: "M" | "F";
  ultimaConsulta: string;
  telefono: string;
}

const pacientesData: Paciente[] = [
  { id: 1, nombre: "Diego Emilio Enciso Mora", iniciales: "DM", edad: "6 meses", sexo: "M", ultimaConsulta: "12 Oct 2026", telefono: "33 1234 5678" },
  { id: 2, nombre: "Christian Uriel Diaz Ascencio", iniciales: "CD", edad: "2 años", sexo: "F", ultimaConsulta: "05 Oct 2026", telefono: "33 2345 6789" },
  { id: 3, nombre: "Miguel Angel Velazquez Gonzalez", iniciales: "MV", edad: "4 años", sexo: "M", ultimaConsulta: "28 Sep 2026", telefono: "33 3456 7890" },
  { id: 4, nombre: "Jose Alberto Gonzalez Ochoa", iniciales: "JG", edad: "18 meses", sexo: "F", ultimaConsulta: "15 Sep 2026", telefono: "33 4567 8901" },
  { id: 5, nombre: "Daniela Melgoza Tamayo", iniciales: "DM", edad: "8 años", sexo: "M", ultimaConsulta: "02 Sep 2026", telefono: "33 5678 9012" },
  { id: 6, nombre: "Alberto Jahir Ortiz", iniciales: "JO", edad: "3 años", sexo: "F", ultimaConsulta: "28 Ago 2026", telefono: "33 6789 0123" },
  { id: 7, nombre: "Óscar Viclos Robles", iniciales: "OR", edad: "11 meses", sexo: "M", ultimaConsulta: "20 Ago 2026", telefono: "33 7890 1234" },
  { id: 8, nombre: "Renata Fernanda Salas Romero", iniciales: "RS", edad: "12 años", sexo: "F", ultimaConsulta: "14 Ago 2026", telefono: "33 8901 2345" },
  { id: 9, nombre: "Emiliano Alonso Ruiz Zepeda", iniciales: "ER", edad: "5 años", sexo: "M", ultimaConsulta: "08 Ago 2026", telefono: "33 9012 3456" },
  { id: 10, nombre: "Camila Rosario Herrera Perez", iniciales: "CH", edad: "7 meses", sexo: "F", ultimaConsulta: "01 Ago 2026", telefono: "33 0123 4567" },
  { id: 11, nombre: "Fernanda Ríos", iniciales: "FR", edad: "9 años", sexo: "F", ultimaConsulta: "28 Jul 2026", telefono: "33 1122 3344" },
  { id: 12, nombre: "Iker Domínguez", iniciales: "ID", edad: "10 meses", sexo: "M", ultimaConsulta: "25 Jul 2026", telefono: "33 2233 4455" },
  { id: 13, nombre: "Valentina Cruz", iniciales: "VC", edad: "6 años", sexo: "F", ultimaConsulta: "22 Jul 2026", telefono: "33 3344 5566" },
  { id: 14, nombre: "Santiago Peña", iniciales: "SP", edad: "3 años", sexo: "M", ultimaConsulta: "18 Jul 2026", telefono: "33 4455 6677" },
  { id: 15, nombre: "Isabella Mora", iniciales: "IM", edad: "15 años", sexo: "F", ultimaConsulta: "14 Jul 2026", telefono: "33 5566 7788" },
];

const POR_PAGINA = 10;

function Pacientes() {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  const pacientesFiltrados = pacientesData.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalPaginas = Math.max(1, Math.ceil(pacientesFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const pacientesVisibles = pacientesFiltrados.slice(inicio, inicio + POR_PAGINA);

  const desde = pacientesFiltrados.length === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + POR_PAGINA, pacientesFiltrados.length);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-8 space-y-6">

      {/* Cabecera */}
      <div className="bg-indigo-50/70 rounded-2xl border border-indigo-100/60 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Directorio de Pacientes</h1>
            <p className="text-sm text-indigo-900/60 font-medium mt-1">
              {pacientesData.length} {pacientesData.length === 1 ? "paciente registrado" : "pacientes registrados"}
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
          <div className="w-24">Edad</div>
          <div className="w-16 text-center">Sexo</div>
          <div className="w-32">Última visita</div>
          <div className="w-36 hidden lg:block">Contacto</div>
          <div className="w-8"></div>
        </div>

        {/* Filas */}
        {pacientesVisibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-medium mb-1">Sin resultados</h3>
            <p className="text-slate-500 text-sm">No se encontraron pacientes con ese nombre.</p>
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
                  {paciente.iniciales}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 truncate">{paciente.nombre}</div>
                  <div className="text-xs text-slate-400 mt-0.5 md:hidden">
                    {paciente.edad} • {paciente.sexo}
                  </div>
                </div>

                <div className="w-24 hidden md:block text-sm text-slate-600">{paciente.edad}</div>
                <div className="w-16 hidden md:block text-sm font-medium text-slate-600 text-center">{paciente.sexo}</div>
                <div className="w-32 hidden md:block text-sm text-slate-400">{paciente.ultimaConsulta}</div>
                <div className="w-36 hidden lg:block text-sm font-mono text-slate-600 truncate">{paciente.telefono}</div>

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