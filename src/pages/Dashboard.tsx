import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  MoreVertical,
  XCircle,
  UserX,
} from "lucide-react";
import toast from "react-hot-toast";
import { obtenerProfesionista } from "../services/auth.service";
import {
  listarCitas,
  obtenerResumen,
  cambiarEstadoCita,
  Cita,
  EstadoCita,
} from "../services/cita.service";
import { obtenerIniciales } from "../utils/fechas";
import ModalAgregarConsulta from "../components/ModalAgregarConsulta";
import ModalConfirmar from "../components/ModalConfirmar";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const DIAS_SEMANA = ["lu", "ma", "mi", "ju", "vi", "sá", "do"];

const NOMBRES_DIA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const aFechaISO = (fecha: Date): string =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
    fecha.getDate(),
  ).padStart(2, "0")}`;

const mismoDia = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function Dashboard() {
  const navigate = useNavigate();
  const profesionista = obtenerProfesionista();

  const hoy = new Date();

  const [fecha, setFecha] = useState(new Date());
  const [citas, setCitas] = useState<Cita[]>([]);
  const [resumen, setResumen] = useState({ total: 0, pendientes: 0 });
  const [cargando, setCargando] = useState(true);

  const [calendarioAbierto, setCalendarioAbierto] = useState(false);
  const [mesVisible, setMesVisible] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1),
  );
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

  const calendarioRef = useRef<HTMLDivElement>(null);

  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState("");

  const [citaAReagendar, setCitaAReagendar] = useState<Cita | null>(null);

  const saludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const nombreCorto = profesionista?.nombre?.split(" ")[0] ?? "";

  const cargarAgenda = async () => {
    setCargando(true);

    try {
      const dia = aFechaISO(fecha);
      const [listaCitas, datosResumen] = await Promise.all([
        listarCitas(dia, dia, true),
        obtenerResumen(dia),
      ]);

      // Se piden todas para incluir las completadas, pero las canceladas no se muestran en la agenda
      setCitas(listaCitas.filter((c) => c.estado !== "CANCELADA"));
      setResumen(datosResumen);
    } catch {
      setCitas([]);
      setResumen({ total: 0, pendientes: 0 });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarAgenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fecha]);

  // Cierra el calendario al hacer clic fuera
  useEffect(() => {
    const alHacerClic = (e: MouseEvent) => {
      if (
        calendarioRef.current &&
        !calendarioRef.current.contains(e.target as Node)
      ) {
        setCalendarioAbierto(false);
      }
    };

    document.addEventListener("mousedown", alHacerClic);
    return () => document.removeEventListener("mousedown", alHacerClic);
  }, []);

  // Cierra el menú de acciones al hacer clic en cualquier lado
  useEffect(() => {
    const cerrar = () => setMenuAbierto(null);
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  const cambiarDia = (dias: number) => {
    const nueva = new Date(fecha);
    nueva.setDate(fecha.getDate() + dias);
    setFecha(nueva);
  };

  // "Hoy, 27 Sep" / "Mañana, 28 Sep" / "2 Oct"
  const etiquetaFecha = () => {
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const corta = `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;

    if (mismoDia(fecha, hoy)) return `Hoy, ${corta}`;
    if (mismoDia(fecha, manana)) return `Mañana, ${corta}`;
    if (mismoDia(fecha, ayer)) return `Ayer, ${corta}`;
    return corta;
  };

  // "Tu agenda de hoy" / "Tu agenda del viernes 2 de octubre"
  const subtitulo = () => {
    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1);

    if (mismoDia(fecha, hoy)) return "Tu agenda de hoy";
    if (mismoDia(fecha, manana)) return "Tu agenda de mañana";

    return `Tu agenda del ${NOMBRES_DIA[fecha.getDay()]} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
  };

  const handleCancelar = async () => {
    if (!citaACancelar) return;

    setCancelando(true);
    setErrorCancelar("");

    try {
      await cambiarEstadoCita(citaACancelar.id, "CANCELADA");
      toast.success("Cita cancelada");
      setCitaACancelar(null);
      cargarAgenda();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "Error al cancelar la cita";
      setErrorCancelar(mensaje);
    } finally {
      setCancelando(false);
    }
  };

  // Registrar asistencia no necesita confirmación: es reversible en ambos sentidos, a diferencia de cancelar.
  const registrarAsistencia = async (cita: Cita, estado: EstadoCita) => {
    setMenuAbierto(null);

    try {
      await cambiarEstadoCita(cita.id, estado);
      toast.success(
        estado === "COMPLETADA"
          ? "Cita marcada como atendida"
          : "Cita marcada como inasistencia",
      );
      cargarAgenda();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo actualizar la cita",
      );
    }
  };

  // Una cita ya pasó si su hora quedó atrás en el día de hoy,
  // o si el día completo ya pasó
  const yaPaso = (cita: Cita): boolean => {
    const [h, m] = cita.hora.split(":").map(Number);
    const momento = new Date(fecha);
    momento.setHours(h, m, 0, 0);
    return momento < new Date();
  };

  const esHoy = mismoDia(fecha, hoy);
  const esFuturo = aFechaISO(fecha) > aFechaISO(hoy);

  // Datos del calendario
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();
  const desfase = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-10 py-8">
      {/* Banner de bienvenida */}
      <div className="relative z-20 bg-teal-50 rounded-2xl p-4 md:p-6 mb-6 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 text-center md:text-left animate-entrance delay-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
            {saludo()}
            {nombreCorto && `, ${nombreCorto}`}
          </h1>
          <p className="text-sm md:text-base text-slate-500">{subtitulo()}</p>
        </div>

        <div className="flex items-center gap-2 self-center md:self-auto">
          <div className="relative" ref={calendarioRef}>
            <div className="bg-white rounded-full shadow-sm flex items-center gap-2 px-3 py-1.5 border border-slate-100">
              <button
                onClick={() => cambiarDia(-1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Día anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <button
                onClick={() => {
                  setMesVisible(
                    new Date(fecha.getFullYear(), fecha.getMonth(), 1),
                  );
                  setCalendarioAbierto(!calendarioAbierto);
                }}
                className="flex items-center gap-1.5 px-1 text-sm font-semibold text-slate-700 hover:text-teal-700 transition-colors whitespace-nowrap"
              >
                <Calendar size={14} className="text-teal-600" />
                {etiquetaFecha()}
              </button>

              <button
                onClick={() => cambiarDia(1)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                aria-label="Día siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {calendarioAbierto && (
              <div className="absolute right-0 top-11 z-40 bg-white border border-gray-200 rounded-xl p-3 shadow-lg w-64">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {MESES[mes]} {anio}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMesVisible(new Date(anio, mes - 1, 1))}
                      className="p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setMesVisible(new Date(anio, mes + 1, 1))}
                      className="p-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[10px] font-medium text-gray-400 mb-1">
                  {DIAS_SEMANA.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: desfase }, (_, i) => (
                    <span key={`v-${i}`}></span>
                  ))}

                  {Array.from({ length: diasDelMes }, (_, i) => {
                    const dia = new Date(anio, mes, i + 1);
                    const seleccionado = mismoDia(dia, fecha);
                    const diaEsHoy = mismoDia(dia, hoy);

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setFecha(dia);
                          setCalendarioAbierto(false);
                        }}
                        className={`py-1 text-xs rounded transition-colors ${
                          seleccionado
                            ? "bg-teal-600 text-white font-semibold"
                            : diaEsHoy
                              ? "text-teal-700 bg-teal-50 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {!esHoy && (
            <button
              onClick={() => setFecha(new Date())}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 px-2.5 py-1.5 rounded-lg bg-white/70 hover:bg-white transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-indigo-50/60 border border-indigo-100/80 rounded-xl p-5 md:p-6 flex items-center justify-between shadow-sm animate-entrance delay-2">
          <div>
            <h2 className="text-sm font-medium text-indigo-800 mb-1">
              Pacientes del día
            </h2>
            {cargando ? (
              <div className="h-10 w-12 bg-indigo-100 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl md:text-4xl font-bold text-indigo-950">
                {resumen.total}
              </p>
            )}
          </div>
          <div className="text-indigo-600">
            <Users size={32} strokeWidth={1.5} />
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-100/80 rounded-xl p-5 md:p-6 flex items-center justify-between shadow-sm animate-entrance delay-3">
          <div>
            <h2 className="text-sm font-medium text-amber-800 mb-1">
              Citas pendientes
            </h2>
            {cargando ? (
              <div className="h-10 w-12 bg-amber-100 rounded animate-pulse"></div>
            ) : (
              <p className="text-3xl md:text-4xl font-bold text-amber-950">
                {resumen.pendientes}
              </p>
            )}
          </div>
          <div className="text-amber-600">
            <Clock size={32} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Agenda del día */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-entrance delay-4">
        {!cargando && citas.length > 0 && (
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-800">
              Agenda de pacientes
            </h2>
            <span className="hidden sm:inline text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              {citas.length} {citas.length === 1 ? "cita" : "citas"} en la
              agenda
            </span>
          </div>
        )}

        {cargando && (
          <div className="divide-y divide-slate-50">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="p-4 flex items-center gap-4 animate-pulse"
              >
                <div className="w-16 h-4 bg-slate-100 rounded shrink-0"></div>
                <div className="w-9 h-9 bg-slate-100 rounded-full shrink-0"></div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="w-40 h-4 bg-slate-100 rounded"></div>
                  <div className="w-2/3 h-3 bg-slate-50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!cargando && citas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <Clock className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-700 font-medium mb-1">
              Sin citas programadas
            </h3>
            <p className="text-slate-500 text-sm">
              No hay pacientes en la agenda para este día.
            </p>
          </div>
        )}

        {!cargando &&
          citas.map((cita, indice) => {
            const completada = cita.estado === "COMPLETADA";
            const inasistencia = cita.estado === "NO_ASISTIO";
            const resuelta = completada || inasistencia;
            const pasada = yaPaso(cita);
            const esFemenino = cita.paciente?.sexo === "F";
            // Una pendiente siempre se puede cancelar
            const tieneAcciones = cita.estado === "PENDIENTE" || !esFuturo;

            return (
              <div
                key={cita.id}
                onClick={() => navigate(`/pacientes/${cita.pacienteId}`)}
                className={`group px-4 sm:px-5 py-3.5 border-b border-slate-50 last:border-0 last:rounded-b-xl flex items-center gap-3 sm:gap-4 cursor-pointer transition-colors ${
                  resuelta ? "" : "hover:bg-slate-50"
                }`}
              >
                {/* Hora */}
                <div className="w-[62px] sm:w-[76px] shrink-0 flex items-center gap-1.5 text-sm font-semibold">
                  {completada ? (
                    <CheckCircle2
                      size={15}
                      className="text-teal-600 shrink-0"
                    />
                  ) : inasistencia ? (
                    <UserX size={15} className="text-amber-600 shrink-0" />
                  ) : (
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        pasada ? "bg-slate-300" : "bg-teal-500"
                      }`}
                    ></span>
                  )}
                  <span
                    className={resuelta ? "text-slate-400" : "text-slate-700"}
                  >
                    {cita.hora}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-xs font-semibold shrink-0 ${
                    esFemenino
                      ? "bg-pink-50 text-pink-600 border border-pink-100"
                      : "bg-teal-50 text-teal-700 border border-teal-100"
                  } ${resuelta ? "opacity-60" : ""}`}
                >
                  {obtenerIniciales(cita.paciente?.nombre ?? "")}
                </div>

                {/* Paciente y notas */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-medium ${
                        completada
                          ? "text-slate-400 line-through"
                          : inasistencia
                            ? "text-slate-400"
                            : "text-slate-800"
                      }`}
                    >
                      {cita.paciente?.nombre}
                    </span>
                    <span className="hidden sm:inline text-[11px] font-mono text-slate-400">
                      {cita.paciente?.numeroExpediente}
                    </span>
                  </div>
                  {cita.notas && (
                    <p
                      className={`text-xs truncate ${
                        resuelta ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {cita.notas}
                    </p>
                  )}
                </div>
                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                  {tieneAcciones && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAbierto(
                            menuAbierto === cita.id ? null : cita.id,
                          );
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 transition-all"
                        aria-label="Acciones"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuAbierto === cita.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[195px] ${
                            indice === citas.length - 1 && citas.length > 2
                              ? "bottom-8"
                              : "top-8"
                          }`}
                        >
                          {!esFuturo && !completada && (
                            <button
                              onClick={() =>
                                registrarAsistencia(cita, "COMPLETADA")
                              }
                              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle2
                                size={15}
                                className="text-teal-600"
                              />
                              Marcar como atendida
                            </button>
                          )}

                          {!esFuturo && !inasistencia && (
                            <button
                              onClick={() =>
                                registrarAsistencia(cita, "NO_ASISTIO")
                              }
                              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <UserX size={15} className="text-amber-600" />
                              {completada
                                ? "Marcar como inasistencia"
                                : "No asistió"}
                            </button>
                          )}

                          {cita.estado === "PENDIENTE" && (
                            <button
                              onClick={() => {
                                setMenuAbierto(null);
                                setCitaAReagendar(cita);
                              }}
                              className="w-full text-left px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                            >
                              <Calendar size={15} className="text-slate-500" />
                              Reagendar
                            </button>
                          )}

                          {cita.estado === "PENDIENTE" && (
                            <button
                              onClick={() => {
                                setMenuAbierto(null);
                                setErrorCancelar("");
                                setCitaACancelar(cita);
                              }}
                              className="w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <XCircle size={15} />
                              Cancelar cita
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-teal-600 transition-colors"
                  />
                </div>
              </div>
            );
          })}
      </div>

      {citaAReagendar && (
        <ModalAgregarConsulta
          isOpen={true}
          onClose={() => setCitaAReagendar(null)}
          pacienteId={citaAReagendar.pacienteId}
          pacienteNombre={citaAReagendar.paciente?.nombre ?? ""}
          numeroExpediente={citaAReagendar.paciente?.numeroExpediente ?? ""}
          sexo={citaAReagendar.paciente?.sexo ?? "M"}
          cita={citaAReagendar}
          onAgendada={cargarAgenda}
        />
      )}

      <ModalConfirmar
        isOpen={citaACancelar !== null}
        onClose={() => setCitaACancelar(null)}
        onConfirmar={handleCancelar}
        titulo="Cancelar cita"
        mensaje={
          citaACancelar
            ? `¿Seguro que deseas cancelar la cita de ${citaACancelar.paciente?.nombre} de las ${citaACancelar.hora}? La cita dejará de aparecer en la agenda.`
            : ""
        }
        textoConfirmar="Cancelar cita"
        textoProcesando="Cancelando..."
        textoCancelar="Volver"
        procesando={cancelando}
        error={errorCancelar}
      />
    </div>
  );
}

export default Dashboard;
