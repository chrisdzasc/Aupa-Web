import { useState, useEffect } from "react";
import {
  Calendar,
  MoreVertical,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  listarCitasPaciente,
  cambiarEstadoCita,
  Cita,
  EstadoCita,
} from "../services/cita.service";
import { formatearFecha } from "../utils/fechas";
import ModalAgregarConsulta from "./ModalAgregarConsulta";
import ModalConfirmar from "./ModalConfirmar";

interface Props {
  pacienteId: number;
  pacienteNombre: string;
  numeroExpediente: string;
  sexo: "M" | "F";

  onCambio: () => void;
}

const ESTILOS: Record<
  EstadoCita,
  { etiqueta: string; insignia: string; punto: string; atenuado: boolean }
> = {
  PENDIENTE: {
    etiqueta: "Pendiente",
    insignia: "bg-blue-50 text-blue-700",
    punto: "bg-blue-500 ring-blue-50",
    atenuado: false,
  },
  COMPLETADA: {
    etiqueta: "Atendida",
    insignia: "bg-teal-100 text-teal-700",
    punto: "bg-teal-600 ring-teal-50",
    atenuado: false,
  },
  NO_ASISTIO: {
    etiqueta: "No asistió",
    insignia: "bg-amber-100 text-amber-700",
    punto: "bg-amber-500 ring-amber-50",
    atenuado: true,
  },
  CANCELADA: {
    etiqueta: "Cancelada",
    insignia: "bg-slate-100 text-slate-600",
    punto: "bg-slate-300 ring-slate-100",
    atenuado: true,
  },
};

const POR_PAGINA = 5;

function TabCitas({
  pacienteId,
  pacienteNombre,
  numeroExpediente,
  sexo,
  onCambio,
}: Props) {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaAReagendar, setCitaAReagendar] = useState<Cita | null>(null);

  const [citaACancelar, setCitaACancelar] = useState<Cita | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelar, setErrorCancelar] = useState("");

  const cargarCitas = async () => {
    setCargando(true);

    try {
      setCitas(await listarCitasPaciente(pacienteId));
    } catch {
      setCitas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCitas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId]);

  // Cierra el menú de acciones al hacer clic en cualquier lado
  useEffect(() => {
    const cerrar = () => setMenuAbierto(null);
    document.addEventListener("click", cerrar);
    return () => document.removeEventListener("click", cerrar);
  }, []);

  const refrescar = () => {
    cargarCitas();
    onCambio();
  };

  const handleCancelar = async () => {
    if (!citaACancelar) return;

    setCancelando(true);
    setErrorCancelar("");

    try {
      await cambiarEstadoCita(citaACancelar.id, "CANCELADA");
      toast.success("Cita cancelada");
      setCitaACancelar(null);
      refrescar();
    } catch (err) {
      setErrorCancelar(
        err instanceof Error ? err.message : "Error al cancelar la cita",
      );
    } finally {
      setCancelando(false);
    }
  };

  const contar = (estado: EstadoCita) =>
    citas.filter((c) => c.estado === estado).length;

  const atendidas = contar("COMPLETADA");
  const inasistencias = contar("NO_ASISTIO");
  const canceladas = contar("CANCELADA");

  const totalPaginas = Math.max(1, Math.ceil(citas.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const visibles = citas.slice(inicio, inicio + POR_PAGINA);
  const desde = citas.length === 0 ? 0 : inicio + 1;
  const hasta = Math.min(inicio + POR_PAGINA, citas.length);

  return (
    <div>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-entrance delay-1">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">
            Historial de citas
          </h2>
          {!cargando && citas.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              {citas.length}{" "}
              {citas.length === 1 ? "cita en total" : "citas en total"}
            </span>
          )}
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-lg shadow-sm transition-all hover:shadow active:scale-[0.98]"
        >
          <Calendar size={16} className="text-gray-500" />
          Agendar consulta
        </button>
      </div>

      {/* Resumen de consultas */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-center animate-entrance delay-2">
          <span className="block text-2xl font-bold text-teal-700">
            {atendidas}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-teal-700">
            {atendidas === 1 ? "Atendida" : "Atendidas"}
          </span>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center animate-entrance delay-3">
          <span className="block text-2xl font-bold text-amber-700">
            {inasistencias}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-amber-700">
            {inasistencias === 1 ? "Inasistencia" : "Inasistencias"}
          </span>
        </div>
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center animate-entrance delay-4">
          <span className="block text-2xl font-bold text-slate-700">
            {canceladas}
          </span>
          <span className="text-[11px] sm:text-xs font-medium text-slate-700">
            {canceladas === 1 ? "Cancelada" : "Canceladas"}
          </span>
        </div>
      </div>

      {cargando && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-12 flex justify-center">
          <Loader2 className="animate-spin text-teal-600" size={24} />
        </div>
      )}

      {!cargando && citas.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="bg-slate-50 p-4 rounded-full mb-3">
            <Calendar className="w-7 h-7 text-slate-300" />
          </div>
          <h4 className="text-slate-700 font-medium mb-1">
            Sin citas registradas
          </h4>
          <p className="text-slate-500 text-sm">
            Este paciente aún no tiene citas en su historial.
          </p>
        </div>
      )}

      {!cargando && citas.length > 0 && (
        <div
          key={pagina}
          className="relative pl-8 before:absolute before:left-[7px] before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200 timeline-line space-y-4"
        >
          {visibles.map((cita, indice) => {
            const estilo = ESTILOS[cita.estado];
            const pendiente = cita.estado === "PENDIENTE";

            return (
              <div
                key={cita.id}
                className={`relative group animate-stagger-card ${
                  menuAbierto === cita.id ? "z-30" : ""
                }`}
                style={{ animationDelay: `${100 + indice * 70}ms` }}
              >
                {/* Punto del timeline */}
                <div
                  className={`absolute left-[-25px] top-5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-white ring-4 transition-transform duration-300 group-hover:scale-125 ${estilo.punto} ${
                    pendiente ? "pulse-pending-node" : ""
                  }`}
                ></div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex items-start justify-between gap-3 transition-all hover:border-gray-300 hover:shadow-md">
                  <div className="min-w-0 flex-1">
                    {/* En celular la etiqueta baja a su propio renglón */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-base font-semibold ${
                            estilo.atenuado ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {formatearFecha(cita.fecha)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {cita.hora}
                        </span>
                      </div>
                      <span
                        className={`self-start mt-1.5 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${estilo.insignia}`}
                      >
                        {estilo.etiqueta}
                      </span>
                    </div>

                    {cita.notas && (
                      <p
                        className={`mt-1.5 text-sm ${
                          estilo.atenuado ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {cita.notas}
                      </p>
                    )}
                  </div>

                  {pendiente && (
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAbierto(
                            menuAbierto === cita.id ? null : cita.id,
                          );
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95"
                        aria-label="Acciones"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuAbierto === cita.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg p-1 min-w-[170px] animate-dropdown ${
                            indice === visibles.length - 1 &&
                            visibles.length > 2
                              ? "bottom-8 origin-bottom-right"
                              : "top-8 origin-top-right"
                          }`}
                        >
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
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {!cargando && citas.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-3.5 mt-4">
          <p className="text-xs sm:text-sm text-gray-500">
            Mostrando <span className="font-medium text-gray-700">{desde}</span>{" "}
            a <span className="font-medium text-gray-700">{hasta}</span> de{" "}
            <span className="font-medium text-gray-700">{citas.length}</span>{" "}
            citas
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina >= totalPaginas}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      <ModalAgregarConsulta
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
        numeroExpediente={numeroExpediente}
        sexo={sexo}
        onAgendada={refrescar}
      />

      {citaAReagendar && (
        <ModalAgregarConsulta
          isOpen={true}
          onClose={() => setCitaAReagendar(null)}
          pacienteId={pacienteId}
          pacienteNombre={pacienteNombre}
          numeroExpediente={numeroExpediente}
          sexo={sexo}
          cita={citaAReagendar}
          onAgendada={refrescar}
        />
      )}

      <ModalConfirmar
        isOpen={citaACancelar !== null}
        onClose={() => setCitaACancelar(null)}
        onConfirmar={handleCancelar}
        titulo="Cancelar cita"
        mensaje={
          citaACancelar
            ? `¿Seguro que deseas cancelar la cita del ${formatearFecha(citaACancelar.fecha)} a las ${citaACancelar.hora}?`
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

export default TabCitas;
