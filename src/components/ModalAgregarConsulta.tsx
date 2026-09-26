import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, Check } from "lucide-react";
import toast from "react-hot-toast";
import { crearCita, listarCitas } from "../services/cita.service";
import { obtenerIniciales } from "../utils/fechas";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: number;
  pacienteNombre: string;
  numeroExpediente: string;
  sexo: "M" | "F";
  onAgendada?: () => void;
}

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

// Horarios de consulta, cada 30 minutos de 8:00 a 20:30
const HORARIOS = Array.from({ length: 26 }, (_, i) => {
  const hora = 8 + Math.floor(i / 2);
  const minuto = i % 2 === 0 ? "00" : "30";
  return `${String(hora).padStart(2, "0")}:${minuto}`;
});

const GRUPOS = [
  { nombre: "Mañana", rango: "08:00 - 13:30", desde: 8, hasta: 14 },
  { nombre: "Tarde", rango: "14:00 - 18:30", desde: 14, hasta: 19 },
  { nombre: "Noche", rango: "19:00 - 20:30", desde: 19, hasta: 21 },
];

// Convierte un Date a "YYYY-MM-DD" sin que la zona horaria mueva el día
const aFechaISO = (fecha: Date): string =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(
    fecha.getDate(),
  ).padStart(2, "0")}`;

const mismoDia = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function ModalAgregarConsulta({
  isOpen,
  onClose,
  pacienteId,
  pacienteNombre,
  numeroExpediente,
  sexo,
  onAgendada,
}: Props) {
  const hoy = new Date();

  const [mesVisible, setMesVisible] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1),
  );
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState("");
  const [notas, setNotas] = useState("");

  const [ocupados, setOcupados] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  // Al abrir se limpia todo, para no arrastrar la cita anterior
  useEffect(() => {
    if (isOpen) {
      setMesVisible(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      setFecha(null);
      setHora("");
      setNotas("");
      setOcupados([]);
      setError("");
      setGuardando(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Al elegir una fecha se consultan las citas de ese día
  useEffect(() => {
    if (!fecha) {
      setOcupados([]);
      return;
    }

    const cargar = async () => {
      setCargandoHorarios(true);
      setHora("");

      try {
        const dia = aFechaISO(fecha);
        const citas = await listarCitas(dia, dia);
        setOcupados(citas.map((c) => c.hora));
      } catch {
        // Si falla, se muestran todos; el backend rechaza el duplicado
        setOcupados([]);
      } finally {
        setCargandoHorarios(false);
      }
    };

    cargar();
  }, [fecha]);

  if (!isOpen) return null;

  // ---- Calendario ----
  const anio = mesVisible.getFullYear();
  const mes = mesVisible.getMonth();

  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const primerDia = new Date(anio, mes, 1).getDay();
  const desfase = (primerDia + 6) % 7; // la semana empieza en lunes
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const diasMesAnterior = new Date(anio, mes, 0).getDate();

  const esPasado = (dia: Date) => dia < inicioHoy;

  // ---- Horarios ----
  const yaPaso = (horario: string): boolean => {
    if (!fecha || !mismoDia(fecha, hoy)) return false;

    const [h, m] = horario.split(":").map(Number);
    return (
      h < hoy.getHours() || (h === hoy.getHours() && m <= hoy.getMinutes())
    );
  };

  const noDisponible = (horario: string) =>
    ocupados.includes(horario) || yaPaso(horario);

  const handleAgendar = async () => {
    if (!fecha || !hora) return;

    setGuardando(true);
    setError("");

    try {
      await crearCita({
        pacienteId,
        fecha: aFechaISO(fecha),
        hora,
        notas: notas.trim() || undefined,
      });

      toast.success("Consulta agendada correctamente");
      onAgendada?.();
      onClose();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "Error al agendar la consulta";
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const esFemenino = sexo === "F";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 modal-backdrop"
        onClick={onClose}
      ></div>

      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg border border-gray-200 relative z-10 flex flex-col max-h-[94vh] modal-content overflow-hidden">
        {/* Encabezado */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Agendar consulta
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Selecciona el día y la hora de la próxima consulta
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* En celular todo se apila en el orden del flujo: paciente y fecha,
            horarios, notas y acciones. En escritorio son dos columnas, con
            las notas debajo del calendario. */}
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-y-auto">
          {/* Paciente y calendario */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 px-5 pt-5 sm:px-6 sm:pt-6 space-y-4 bg-gray-50/40">
            <div className="p-3 bg-white rounded-lg border border-gray-200 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  esFemenino
                    ? "bg-pink-100 text-pink-600"
                    : "bg-teal-100 text-teal-700"
                }`}
              >
                {obtenerIniciales(pacienteNombre)}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">
                  {pacienteNombre}
                </p>
                <p className="text-xs text-gray-500">{numeroExpediente}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Fecha <span className="text-red-500">*</span>
                  </span>
                  <h4 className="text-sm font-semibold text-gray-900 capitalize">
                    {MESES[mes]} {anio}
                  </h4>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setMesVisible(new Date(anio, mes - 1, 1))}
                    className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    aria-label="Mes anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setMesVisible(new Date(anio, mes + 1, 1))}
                    className="p-1 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    aria-label="Mes siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 text-center text-[11px] font-medium text-gray-400 border-b border-gray-100 pb-2 mb-1">
                {DIAS_SEMANA.map((dia) => (
                  <span key={dia}>{dia}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: desfase }, (_, i) => (
                  <span
                    key={`prev-${i}`}
                    className="py-1.5 text-center text-[11px] text-gray-300 select-none"
                  >
                    {diasMesAnterior - desfase + i + 1}
                  </span>
                ))}

                {Array.from({ length: diasDelMes }, (_, i) => {
                  const dia = new Date(anio, mes, i + 1);
                  const pasado = esPasado(dia);
                  const seleccionado = fecha !== null && mismoDia(dia, fecha);
                  const esHoy = mismoDia(dia, hoy);

                  return (
                    <button
                      key={i}
                      disabled={pasado}
                      onClick={() => setFecha(dia)}
                      className={`py-1.5 text-xs rounded-lg transition-colors ${
                        pasado
                          ? "text-gray-300 cursor-not-allowed"
                          : seleccionado
                            ? "bg-teal-600 text-white font-semibold"
                            : esHoy
                              ? "text-teal-700 bg-teal-50 border border-teal-200 font-medium hover:bg-teal-100"
                              : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-gray-500 pt-3 mt-2 border-t border-gray-100 flex items-center gap-1.5 min-h-[22px]">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0"></span>
                {fecha ? (
                  <span>
                    Día seleccionado:{" "}
                    <strong className="text-gray-800 font-medium">
                      {NOMBRES_DIA[fecha.getDay()]}, {fecha.getDate()} de{" "}
                      {MESES[fecha.getMonth()]}
                    </strong>
                  </span>
                ) : (
                  <span>Elige una fecha para consultar disponibilidad</span>
                )}
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="order-2 lg:col-start-2 lg:row-start-1 px-5 pt-5 sm:px-6 sm:pt-6 lg:border-l border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <label className="text-xs font-medium text-gray-700">
                Hora <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full border border-gray-300 bg-white"></span>
                  Libre
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  Elegido
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                  Ocupado
                </span>
              </div>
            </div>

            <div className="min-h-[280px] rounded-lg border border-gray-200 p-3 bg-gray-50/40">
              {!fecha && (
                <div className="min-h-[256px] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                    <Calendar size={16} />
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                    Selecciona una fecha para ver los horarios disponibles
                  </p>
                </div>
              )}

              {fecha && cargandoHorarios && (
                <div className="min-h-[256px] flex flex-col items-center justify-center gap-2.5">
                  <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-500">
                    Consultando disponibilidad...
                  </span>
                </div>
              )}

              {fecha && !cargandoHorarios && (
                <div className="space-y-3.5">
                  {GRUPOS.map((grupo) => {
                    const horariosGrupo = HORARIOS.filter((h) => {
                      const hh = Number(h.split(":")[0]);
                      return hh >= grupo.desde && hh < grupo.hasta;
                    });

                    return (
                      <div key={grupo.nombre}>
                        <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                          {grupo.nombre} ({grupo.rango})
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {horariosGrupo.map((horario) => {
                            const bloqueado = noDisponible(horario);
                            const elegido = hora === horario;

                            return (
                              <button
                                key={horario}
                                disabled={bloqueado}
                                onClick={() => setHora(horario)}
                                title={
                                  ocupados.includes(horario)
                                    ? "Horario ocupado"
                                    : undefined
                                }
                                className={`py-1.5 px-2 text-xs rounded-md border transition-all tabular-nums ${
                                  bloqueado
                                    ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed"
                                    : elegido
                                      ? "bg-teal-600 text-white border-teal-600 font-medium"
                                      : "bg-white text-gray-700 border-gray-200 hover:bg-teal-50/60 hover:border-teal-300"
                                }`}
                              >
                                {horario}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div className="order-3 lg:col-start-1 lg:row-start-2 px-5 pt-4 pb-5 sm:px-6 sm:pb-6 bg-gray-50/40">
            <div className="bg-white p-3.5 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Notas{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <span
                  className={`text-[11px] tabular-nums ${
                    notas.length > 280 ? "text-amber-600" : "text-gray-400"
                  }`}
                >
                  {notas.length} / 300
                </span>
              </div>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="Traer resultados de laboratorio, revisar checklist de alimentos…"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all resize-none"
              />
            </div>
          </div>

          {/* Resumen y acciones */}
          <div className="order-4 lg:col-start-2 lg:row-start-2 px-5 pb-5 sm:px-6 sm:pb-6 lg:border-l border-gray-100 flex flex-col justify-end">
            {fecha && hora && (
              <div className="mt-3 p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium flex items-center gap-2">
                <Check size={16} className="text-teal-600 shrink-0" />
                Consulta: {NOMBRES_DIA[fecha.getDay()]} {fecha.getDate()} de{" "}
                {MESES[fecha.getMonth()]}, {hora}
              </div>
            )}

            {error && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button
                onClick={onClose}
                disabled={guardando}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAgendar}
                disabled={!fecha || !hora || guardando}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 disabled:cursor-not-allowed transition-all"
              >
                {guardando ? "Agendando..." : "Agendar consulta"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalAgregarConsulta;
