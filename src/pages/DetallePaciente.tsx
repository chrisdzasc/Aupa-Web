import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Baby,
  User,
  Cake,
  Calendar,
  Users,
  Phone,
  Mail,
  TriangleAlert,
  Utensils,
  Plus,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import ModalAgregarConsulta from "../components/ModalAgregarConsulta";
import { obtenerPaciente, PacienteDetalle } from "../services/paciente.service";
import {
  formatearFecha,
  calcularEdadMeses,
  obtenerIniciales,
  formatearTelefono,
} from "../utils/fechas";

const PARENTESCO_LEGIBLE: Record<string, string> = {
  MADRE: "Madre",
  PADRE: "Padre",
  ABUELO: "Abuelo/a",
  TUTOR_LEGAL: "Tutor legal",
  OTRO: "Otro",
};

// Traduce la respuesta de la API a la forma que espera esta pantalla
const adaptarPaciente = (p: PacienteDetalle) => ({
  id: p.id,
  numeroExpediente: p.numeroExpediente,
  nombre: p.nombre,
  iniciales: obtenerIniciales(p.nombre),
  sexo: p.sexo,
  fechaNacimiento: formatearFecha(p.fechaNacimiento),
  edadMeses: calcularEdadMeses(p.fechaNacimiento),
  activo: p.activo,
  tipoAlimentacion: p.tipoAlimentacion ?? "No registrado",
  inicioComplementaria: p.inicioComplementaria ?? "No registrado",

  // La API devuelve un solo arreglo de alertas; aquí se separan por tipo
  alergias: p.alertas
    .filter((a) => a.tipo === "ALERGIA")
    .map((a) => a.descripcion),
  condicionesCronicas: p.alertas
    .filter((a) => a.tipo === "CONDICION_CRONICA")
    .map((a) => a.descripcion),

  tutor: {
    nombre: p.tutor.nombre,
    parentesco: PARENTESCO_LEGIBLE[p.tutor.parentesco] ?? p.tutor.parentesco,
    telefono: formatearTelefono(p.tutor.telefono),
    telefonoCrudo: p.tutor.telefono,
    email: p.tutor.email,
  },

  // Los decimales llegan como texto desde Prisma: hay que convertirlos
  mediciones: p.mediciones.map((m) => ({
    id: m.id,
    fecha: formatearFecha(m.fechaConsulta),
    pesoKg: Number(m.pesoKg),
    tallaCm: Number(m.tallaCm),
  })),
});

type PacienteVista = ReturnType<typeof adaptarPaciente>;

function DetallePaciente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tabActiva, setTabActiva] = useState("Mediciones");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [paginaMed, setPaginaMed] = useState(1);

  const [paciente, setPaciente] = useState<PacienteVista | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarPaciente = async () => {
      try {
        const datos = await obtenerPaciente(id!);
        setPaciente(adaptarPaciente(datos));
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "Error al cargar el paciente";
        setError(mensaje);
      } finally {
        setCargando(false);
      }
    };

    cargarPaciente();
  }, [id]);

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex justify-center">
        <Loader2 className="animate-spin text-teal-600" size={32} />
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center">
        <p className="text-sm text-red-600 mb-4">
          {error || "Paciente no encontrado"}
        </p>
        <Link to="/pacientes" className="text-teal-600 text-sm hover:underline">
          &larr; Volver a Pacientes
        </Link>
      </div>
    );
  }

  const obtenerCasoAlimentacion = (meses: number): 1 | 2 | 3 => {
    if (meses < 6) return 1;
    if (meses < 24) return 2;
    return 3;
  };

  const casoAlim = obtenerCasoAlimentacion(paciente.edadMeses);

  const etiquetaAlimentacion =
    casoAlim === 1
      ? "Alimentación actual"
      : casoAlim === 2
        ? "Alimentación primeros 6 meses"
        : "Alimentación primeros 6 meses";

  const etiquetaComplementaria =
    casoAlim === 2
      ? "Introducción de sólidos"
      : "Inicio de alimentación complementaria";

  const dosDatos = casoAlim === 2 || casoAlim === 3;

  const tabs = ["Mediciones", "Graficas", "Alimentacion"];

  const sexoTexto = paciente.sexo === "F" ? "Femenino" : "Masculino";
  const tieneAlertas =
    paciente.alergias.length > 0 || paciente.condicionesCronicas.length > 0;

  /* Paginación de Medidas */
  const MED_POR_PAGINA = 5;

  const totalPaginasMed = Math.max(
    1,
    Math.ceil(paciente.mediciones.length / MED_POR_PAGINA),
  );
  const inicioMed = (paginaMed - 1) * MED_POR_PAGINA;
  const medicionesVisibles = paciente.mediciones.slice(
    inicioMed,
    inicioMed + MED_POR_PAGINA,
  );
  const desdeMed = paciente.mediciones.length === 0 ? 0 : inicioMed + 1;
  const hastaMed = Math.min(
    inicioMed + MED_POR_PAGINA,
    paciente.mediciones.length,
  );

  /* Calcular IMC */
  const calcularIMC = (pesoKg: number, tallaCm: number): string => {
    if (!pesoKg || !tallaCm) return "-";
    const m = tallaCm / 100;
    return (pesoKg / (m * m)).toFixed(1);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/pacientes"
        className="text-teal-600 text-sm hover:underline mb-4 inline-block"
      >
        &larr; Volver a Pacientes
      </Link>

      {/* ===== TARJETA DE DATOS DEL PACIENTE ===== */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        {/* Barra superior: distintivo y estado */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-medium">
              <Baby size={14} className="text-teal-600" />
              Expediente Pediátrico
            </span>
            <span className="text-gray-400 font-mono">
              {paciente.numeroExpediente}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-500">
            <span
              className={`w-2 h-2 rounded-full ${
                paciente.activo ? "bg-emerald-500" : "bg-gray-400"
              }`}
            ></span>
            {paciente.activo ? "Paciente activo" : "Paciente inactivo"}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6">
          {/* Fila superior: Identidad + Tutor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ZONA 1: Identidad */}
            <section className="lg:col-span-7 flex items-start gap-4">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-semibold shrink-0 ${
                  paciente.sexo === "F"
                    ? "bg-pink-100 text-pink-600"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                {paciente.iniciales}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {paciente.nombre}
                </h1>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-sm text-gray-600 font-medium mt-2">
                  <span className="inline-flex items-center gap-1">
                    <User size={15} className="text-gray-400" />
                    {sexoTexto}
                  </span>
                  <span className="text-gray-300 font-bold">•</span>
                  <span className="inline-flex items-center gap-1 text-gray-900 font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100">
                    <Cake size={14} className="text-teal-600" />
                    {paciente.edadMeses} Meses
                  </span>
                  <span className="text-gray-300 font-bold">•</span>
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <Calendar size={14} className="text-gray-400" />
                    {paciente.fechaNacimiento}
                  </span>
                </div>
              </div>
            </section>

            {/* ZONA 4: Contacto del tutor */}
            <section className="lg:col-span-5 bg-gray-50 rounded-lg p-4 border border-gray-200 w-full">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2.5">
                <span className="uppercase tracking-wider font-semibold text-[11px] text-gray-500 flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" />
                  Contacto del tutor
                </span>
                <span className="text-gray-400 text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border border-gray-200">
                  {paciente.tutor.parentesco}
                </span>
              </div>

              <p className="text-sm font-semibold text-gray-900 mb-2">
                {paciente.tutor.nombre}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                <a
                  href={`tel:${paciente.tutor.telefonoCrudo}`}
                  className="inline-flex items-center gap-1.5 hover:text-teal-700 transition-colors group"
                >
                  <Phone
                    size={14}
                    className="text-gray-400 group-hover:text-teal-600 shrink-0"
                  />
                  <span className="font-mono text-xs">
                    {paciente.tutor.telefono}
                  </span>
                </a>
                <a
                  href={`mailto:${paciente.tutor.email}`}
                  className="inline-flex items-center gap-1.5 hover:text-teal-700 transition-colors group min-w-0"
                >
                  <Mail
                    size={14}
                    className="text-gray-400 group-hover:text-teal-600 shrink-0"
                  />
                  <span className="truncate text-xs">
                    {paciente.tutor.email}
                  </span>
                </a>
              </div>
            </section>
          </div>

          <hr className="border-gray-100" />

          {/* Fila: Alertas (+ alimentación si es caso 1) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* ZONA 2: Alertas médicas */}
            {tieneAlertas && (
              <section
                className={`${dosDatos ? "md:col-span-12" : "md:col-span-7"} bg-red-50/50 rounded-lg p-4 border border-red-200`}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-red-800">
                    Alertas Médicas
                  </h2>
                </div>

                {tieneAlertas ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {paciente.alergias.map((alergia, i) => (
                      <span
                        key={`a-${i}`}
                        className="inline-flex items-center gap-1.5 bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        <TriangleAlert
                          size={13}
                          className="text-red-600 shrink-0"
                        />
                        {alergia}
                      </span>
                    ))}
                    {paciente.condicionesCronicas.map((condicion, i) => (
                      <span
                        key={`c-${i}`}
                        className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        {condicion}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Sin alertas registradas
                  </p>
                )}
              </section>
            )}

            {/* ZONA 3 (solo caso 1): Alimentación de un dato, comparte fila */}
            {!dosDatos && (
              <section className="md:col-span-5 bg-teal-50/50 rounded-lg p-4 border border-teal-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Utensils size={15} className="text-teal-600" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-teal-600/70">
                    {etiquetaAlimentacion}
                  </h2>
                </div>
                <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                  {paciente.tipoAlimentacion}
                </p>
              </section>
            )}
          </div>

          {/* Fila propia de alimentación (casos 2 y 3): dos mini-bloques */}
          {dosDatos && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <section className="bg-teal-50/50 rounded-lg p-4 border border-teal-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Utensils size={15} className="text-teal-600" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-teal-600/70">
                    {etiquetaAlimentacion}
                  </h2>
                </div>
                <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                  {paciente.tipoAlimentacion}
                </p>
              </section>

              <section className="bg-teal-50/50 rounded-lg p-4 border border-teal-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <Utensils size={15} className="text-teal-600" />
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-teal-600/70">
                    {etiquetaComplementaria}
                  </h2>
                </div>
                <p className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                  {paciente.inicioComplementaria}
                </p>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setTabActiva(tab)}
            className={`pb-3 text-sm font-medium ${
              tabActiva === tab
                ? "text-teal-600 border-b-2 border-teal-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {tabActiva === "Mediciones" && (
        <div>
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Historial de Crecimiento
              </h2>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setModalAbierto(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg shadow-sm transition-all"
              >
                <Calendar size={16} className="text-gray-500" />
                Agendar consulta
              </button>
              <Link
                to={`/pacientes/${id}/nueva-medicion`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all"
              >
                <Plus size={16} />
                Nueva Medición
              </Link>
            </div>
          </div>

          {/* Timeline (key por página para re-animar al cambiar de página) */}
          <div
            key={paginaMed}
            className="relative pl-8 before:absolute before:left-[7px] before:top-3 before:bottom-3 before:w-0.5 before:bg-teal-500 timeline-line space-y-4"
          >
            {medicionesVisibles.map((m, index) => {
              // La más reciente real es la primera de la primera página
              const esMasReciente = paginaMed === 1 && index === 0;
              return (
                <div
                  key={m.id}
                  className="relative group animate-stagger-card"
                  style={{ animationDelay: `${100 + index * 70}ms` }}
                >
                  {/* Punto del timeline */}
                  <div
                    className={`absolute left-[-25px] top-5 -translate-x-1/2 rounded-full border-2 border-white transition-all duration-300 group-hover:scale-125 ${
                      esMasReciente
                        ? "w-4 h-4 bg-teal-600 ring-4 ring-teal-50 pulse-active-node group-hover:ring-teal-200"
                        : "w-3.5 h-3.5 bg-gray-300 ring-4 ring-gray-100 group-hover:bg-teal-600 group-hover:ring-teal-100"
                    }`}
                  ></div>

                  {/* Tarjeta clickeable */}
                  <div
                    onClick={() =>
                      navigate(`/pacientes/${id}/mediciones/${m.id}`)
                    }
                    className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Fecha */}
                      <div className="min-w-[150px]">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                          Fecha
                        </span>
                        <div className="text-base font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                          {m.fecha}
                        </div>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-3 sm:flex items-center gap-3 sm:gap-6 flex-1 sm:justify-center bg-gray-50/70 sm:bg-transparent p-3 sm:p-0 rounded-lg">
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                            Peso
                          </span>
                          <span className="text-sm sm:text-base font-medium text-gray-900">
                            {m.pesoKg}{" "}
                            <span className="text-xs text-gray-500 font-normal">
                              kg
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                            Talla
                          </span>
                          <span className="text-sm sm:text-base font-medium text-gray-900">
                            {m.tallaCm}{" "}
                            <span className="text-xs text-gray-500 font-normal">
                              cm
                            </span>
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-0.5">
                            IMC
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-white sm:bg-gray-100 text-gray-700 border border-gray-200/60 sm:border-0 group-hover:bg-teal-100 group-hover:text-teal-800 transition-all">
                            {calcularIMC(m.pesoKg, m.tallaCm)}
                          </span>
                        </div>
                      </div>

                      {/* Acción */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 sm:hidden">
                          Acción
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-gray-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                          <ChevronRight
                            size={16}
                            className="text-gray-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginación */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-3.5 mt-4">
            <p className="text-xs sm:text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-medium text-gray-700">{desdeMed}</span> a{" "}
              <span className="font-medium text-gray-700">{hastaMed}</span> de{" "}
              <span className="font-medium text-gray-700">
                {paciente.mediciones.length}
              </span>{" "}
              mediciones
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPaginaMed((p) => Math.max(1, p - 1))}
                disabled={paginaMed === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
              <button
                onClick={() =>
                  setPaginaMed((p) => Math.min(totalPaginasMed, p + 1))
                }
                disabled={paginaMed >= totalPaginasMed}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tabActiva === "Graficas" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500">
            Las gráficas de crecimiento OMS se implementarán aquí.
          </p>
        </div>
      )}

      {tabActiva === "Alimentacion" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500">
            El plan de alimentación y checklist se implementarán aquí.
          </p>
        </div>
      )}

      <ModalAgregarConsulta
        pacienteNombre={paciente.nombre}
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
      />
    </div>
  );
}

export default DetallePaciente;
