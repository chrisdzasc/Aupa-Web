import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Ruler,
  Activity,
  FileText,
  AlertTriangle,
} from "lucide-react";

// ---- Objeto de ejemplo (se reemplazará por datos reales del backend) ----
const medicionEjemplo = {
  id: 12,
  pacienteId: 2,
  pacienteNombre: "Mateo García López",
  numeroExpediente: "EXP-0002",
  fecha: "15 Sep 2026",
  edadEnConsulta: "2 años 3 meses",
  ultimaModificacion: "—", // placeholder hasta tener backend
  // Antropometría básica (obligatorias)
  pesoKg: 11.8,
  tallaCm: 83.5,
  perimetroBraquialCm: 14.2,
  // Complementarias (opcionales; null = no registrado)
  perimetroCefalicoCm: 47.8 as number | null,
  cinturaCm: 46.2 as number | null,
  abdomenCm: 48.0 as number | null,
  caderaCm: 49.5 as number | null,
  pantorrillaCm: null as number | null,
  tricipitalMm: null as number | null,
  notas:
    "El paciente muestra ganancia ponderal y de talla acorde a su carril de crecimiento. Buena tolerancia a la transición dietética. Control en 3 meses.",
};

function DetalleMedicion() {
  const { id, idMedicion } = useParams();
  const navigate = useNavigate();
  const [modalEliminar, setModalEliminar] = useState(false);

  const m = medicionEjemplo;

  // IMC calculado
  const calcularIMC = (): string => {
    if (!m.pesoKg || !m.tallaCm) return "-";
    const metros = m.tallaCm / 100;
    return (m.pesoKg / (metros * metros)).toFixed(1);
  };
  const imc = calcularIMC();

  // Helper para mostrar valor o "No registrado"
  const valorOpcional = (valor: number | null, unidad: string) =>
    valor !== null ? (
      <span className="text-base font-semibold text-gray-800">
        {valor} <span className="text-xs font-normal text-gray-500">{unidad}</span>
      </span>
    ) : (
      <span className="text-base font-normal text-gray-400 italic">No registrado</span>
    );

  const complementarias = [
    { label: "Perímetro cefálico", valor: m.perimetroCefalicoCm, unidad: "cm" },
    { label: "Cintura", valor: m.cinturaCm, unidad: "cm" },
    { label: "Abdomen", valor: m.abdomenCm, unidad: "cm" },
    { label: "Cadera", valor: m.caderaCm, unidad: "cm" },
    { label: "Pantorrilla", valor: m.pantorrillaCm, unidad: "cm" },
    { label: "Pliegue tricipital", valor: m.tricipitalMm, unidad: "mm" },
  ];

  const handleEliminar = () => {
    // Cuando haya backend: llamada DELETE. Por ahora simula y regresa.
    alert("Medición eliminada (simulado)");
    setModalEliminar(false);
    navigate(`/pacientes/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back link */}
      <Link
        to={`/pacientes/${id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-teal-700 transition-colors mb-6 group animate-entrance delay-1"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Volver al expediente
      </Link>

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-6 border-b border-gray-200 animate-entrance delay-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medición del {m.fecha}</h1>
          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-2">
            <span>Paciente:</span>
            <span className="font-semibold text-gray-700">{m.pacienteNombre}</span>
            <span className="text-gray-300">•</span>
            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
              {m.numeroExpediente}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to={`/pacientes/${id}/mediciones/${idMedicion}/editar`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-teal-500/60 hover:text-teal-800 shadow-sm transition-all group"
          >
            <Pencil size={15} className="text-gray-500 group-hover:text-teal-600 transition-colors" />
            Editar
          </Link>
          <button
            onClick={() => setModalEliminar(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 shadow-sm transition-all"
          >
            <Trash2 size={15} className="text-red-500" />
            Eliminar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

{/* Datos de la consulta — móvil: 1º | desktop: columna derecha, arriba */}
<section className="order-1 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-5 sm:p-6 animate-entrance delay-3">
  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-4">
    <Calendar size={14} className="text-teal-600" />
    Datos de la consulta
  </h2>
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-4">
    <div>
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Fecha de consulta</span>
      <span className="text-lg font-medium text-gray-800">{m.fecha}</span>
    </div>
    <div>
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Edad del paciente</span>
      <span className="text-lg font-medium text-gray-800">{m.edadEnConsulta}</span>
    </div>
    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Última modificación</span>
      <span className="text-xs text-gray-500 font-medium">{m.ultimaModificacion}</span>
    </div>
  </div>
</section>

{/* Antropometría básica — móvil: 2º | desktop: columna izquierda, arriba */}
<section className="order-2 lg:order-none lg:col-span-7 lg:col-start-1 lg:row-start-1 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-5 sm:p-6 animate-entrance delay-3">
  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-4">
    <Ruler size={14} className="text-teal-600" />
    Antropometría básica
  </h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-default group">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Peso</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-gray-900 group-hover:text-teal-950 transition-colors">{m.pesoKg}</span>
        <span className="text-sm font-medium text-gray-500">kg</span>
      </div>
    </div>
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-default group">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Talla / Estatura</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-gray-900 group-hover:text-teal-950 transition-colors">{m.tallaCm}</span>
        <span className="text-sm font-medium text-gray-500">cm</span>
      </div>
    </div>
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-teal-300 hover:bg-teal-50/30 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-default group">
      <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Perímetro braquial</span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-gray-900 group-hover:text-teal-950 transition-colors">{m.perimetroBraquialCm}</span>
        <span className="text-sm font-medium text-gray-500">cm</span>
      </div>
    </div>
    <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 relative overflow-hidden hover:border-teal-400 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default group">
      <div className="imc-breathe absolute -right-2 -bottom-2 w-20 h-20 bg-teal-200/40 rounded-full pointer-events-none"></div>
      <span className="block text-[11px] font-bold uppercase tracking-wider text-teal-800 mb-1.5 relative z-10">IMC Calculado</span>
      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-2xl font-bold text-teal-900">{imc}</span>
        <span className="text-xs font-semibold text-teal-700">kg/m²</span>
      </div>
    </div>
  </div>
</section>

{/* Medidas complementarias — móvil: 3º | desktop: columna izquierda, abajo */}
<section className="order-3 lg:order-none lg:col-span-7 lg:col-start-1 lg:row-start-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-5 sm:p-6 animate-entrance delay-4">
  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-4">
    <Activity size={14} className="text-teal-600" />
    Medidas complementarias
  </h2>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
    {complementarias.map((c) => (
      <div key={c.label} className="p-2.5 -mx-2.5 rounded-lg hover:bg-gray-50 transition-all duration-150 group">
        <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 group-hover:text-teal-700 mb-1 transition-colors">
          {c.label}
        </span>
        {valorOpcional(c.valor, c.unidad)}
      </div>
    ))}
  </div>
</section>

{/* Notas — móvil: 4º | desktop: columna derecha, abajo */}
<section className="order-4 lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md p-5 sm:p-6 animate-entrance delay-4">
  <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-3">
    <FileText size={14} className="text-teal-600" />
    Notas de la consulta
  </h2>
  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
    {m.notas ? <p>{m.notas}</p> : <p className="text-gray-400 italic">Sin notas</p>}
  </div>
</section>

</div>

      {/* Modal de confirmación de eliminación */}
      {modalEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 modal-backdrop" onClick={() => setModalEliminar(false)}></div>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative z-10 modal-content">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 pulse-danger flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Eliminar medición</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              ¿Seguro que deseas eliminar la medición del {m.fecha}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalEliminar(false)}
                className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetalleMedicion;
