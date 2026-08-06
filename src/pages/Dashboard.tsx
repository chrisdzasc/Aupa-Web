import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Users, Clock } from "lucide-react";

// Estructura de datos impecable (Cortesía de Claude)
interface Consulta {
  id: number;
  hora: string;
  nombre: string;
  iniciales: string;
  edad: string;
}

const consultasHoy: Consulta[] = [
  { id: 1, hora: "08:00", nombre: "Diego Emilio Enciso Mora", iniciales: "DM", edad: "6 meses" },
  { id: 2, hora: "09:00", nombre: "Christian Uriel Diaz Ascencio", iniciales: "CD", edad: "2 años" },
  { id: 3, hora: "10:30", nombre: "Miguel Angel Velazquez Gonzalez", iniciales: "MV", edad: "4 años" },
  { id: 4, hora: "12:00", nombre: "Jose Alberto Gonzalez Ochoa", iniciales: "JG", edad: "18 meses" },
  { id: 5, hora: "14:30", nombre: "Daniela Melgoza Tamayo", iniciales: "DM", edad: "8 años" },
];

function Dashboard() {
  const navigate = useNavigate();
  
  // 1. El estado maestro (inicia con la fecha actual)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 2. Funciones para cambiar de día
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // 3. Formateador para mostrar "Hoy", "Mañana" o solo la fecha
  const formatDateLabel = (date: Date) => {
    const today = new Date();

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Formatear a "15 jun" o "16 jul"
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    let dateString = date.toLocaleDateString('es-MX', options);
    // Capitalizar la primera letra del mes (Ej: "15 Jun")
    dateString = dateString.replace(/\b[a-z]/g, (c: string) => c.toUpperCase());

    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${dateString}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana, ${dateString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ayer, ${dateString}`;
    } else {
      return dateString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-8 min-h-screen">
      
      {/* Banner de bienvenida (Con fix responsivo whitespace-nowrap) */}
      <div className="bg-teal-50 rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">Buenas tardes, Dr. Gonzalez</h1>
          <p className="text-sm md:text-base text-slate-500">Tu agenda del día</p>
        </div>
        <div className="bg-white rounded-full shadow-sm flex items-center justify-between w-full md:w-auto gap-4 px-4 py-2 border border-slate-100">
          <button
            onClick={handlePrevDay}
            className="text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>

          <span className="text-sm md:text-base text-slate-700 font-semibold whitespace-nowrap">{formatDateLabel(selectedDate)}</span>

          <button
            onClick={handleNextDay}
            className="text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Tarjetas KPI (Con la Opción 3 de colores atenuados) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Tarjeta 1: Total de Pacientes (Cambiada a Índigo) */}
        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-5 md:p-6 flex items-center justify-between shadow-sm">
        <div>
            <h2 className="text-sm font-medium text-indigo-800 mb-1">Total de Pacientes Hoy</h2>
            <p className="text-3xl md:text-4xl font-bold text-indigo-950">12</p>
        </div>
        <div className="text-indigo-600">
            <Users size={32} strokeWidth={1.5} />
        </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-5 md:p-6 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-sm font-medium text-amber-800 mb-1">Citas Pendientes Hoy</h2>
            <p className="text-3xl md:text-4xl font-bold text-amber-950">4</p>
          </div>
          <div className="text-amber-600">
            <Clock size={32} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Agenda del día iterada dinámicamente */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        {consultasHoy.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Clock className="w-8 h-8 text-slate-300"></Clock>
            </div>

            <h3 className="text-slate-700 font-medium mb-1">Sin citas programadas</h3>
            <p className="text-slate-500 text-sm">No hay pacientes en la agenda para este día.</p>
          </div>
        ) : (
          consultasHoy.map((consulta) => (
            <div
              key={consulta.id}
              onClick={() => navigate(`/pacientes/${consulta.id}`)}
              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="text-sm md:text-base font-semibold text-slate-700 w-12 md:w-16 whitespace-nowrap">{consulta.hora}</div>
              <div className="w-8 h-8 md:w-10 md:h-10 text-xs md:text-sm bg-teal-50 border border-teal-100 text-teal-700 font-medium flex items-center justify-center rounded-full shrink-0">
                {consulta.iniciales}
              </div>
              <div className="text-sm md:text-base font-medium text-slate-800 flex-1 truncate">{consulta.nombre}</div>
              <div className="text-xs md:text-sm text-slate-400 hidden sm:block">{consulta.edad}</div>
              <div className="text-slate-300 group-hover:text-teal-600 transition-colors flex items-center justify-center">
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;