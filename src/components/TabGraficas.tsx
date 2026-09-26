import { useState, useEffect, useRef } from "react";
import { Loader2, LineChart, Download } from "lucide-react";
import {
  obtenerCurva,
  Curva,
  IndicadorCurva,
} from "../services/curvas.service";
import { formatearFecha, calcularEdadEnFecha } from "../utils/fechas";
import GraficaCrecimiento from "./GraficaCrecimiento";
import {
  descargarGraficaPDF,
  agregarPaginaGrafica,
  crearDocumento,
  nombreArchivo,
} from "../utils/pdfGrafica";
import { obtenerProfesionista } from "../services/auth.service";

const INDICADORES: { valor: IndicadorCurva; etiqueta: string }[] = [
  { valor: "talla-edad", etiqueta: "Talla / Edad" },
  { valor: "peso-edad", etiqueta: "Peso / Edad" },
  { valor: "imc-edad", etiqueta: "IMC / Edad" },
  { valor: "peso-talla", etiqueta: "Peso / Talla" },
  { valor: "perimetro-cefalico-edad", etiqueta: "P. Cefálico / Edad" },
];

interface Props {
  pacienteId: string;
  fechaNacimiento: string;
  nombrePaciente: string;
  numeroExpediente: string;
  sexo: "M" | "F";
  disponibles: IndicadorCurva[];
  tieneMediciones: boolean;
}

function TabGraficas({
  pacienteId,
  fechaNacimiento,
  nombrePaciente,
  numeroExpediente,
  sexo,
  disponibles,
  tieneMediciones,
}: Props) {
  const opciones = INDICADORES.filter((i) => disponibles.includes(i.valor));

  const [indicador, setIndicador] = useState<IndicadorCurva | null>(
    opciones[0]?.valor ?? null,
  );
  const [curva, setCurva] = useState<Curva | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  const [enfocado, setEnfocado] = useState<number | null>(null);

  const contenedorGrafica = useRef<HTMLDivElement>(null);
  const [descargando, setDescargando] = useState(false);
  const [progreso, setProgreso] = useState<string | null>(null);

  const handleDescargar = async () => {
    if (!contenedorGrafica.current || !curva) return;

    setDescargando(true);

    try {
      const profesionista = obtenerProfesionista();

      await descargarGraficaPDF(contenedorGrafica.current, {
        paciente: {
          nombre: nombrePaciente,
          numeroExpediente,
          sexo,
          fechaNacimiento,
        },
        nutriologo: {
          nombre: profesionista?.nombre ?? "",
          cedulaProfesional: profesionista?.cedulaProfesional,
        },
        curva,
      });
    } catch (err) {
      console.error("Error al generar el PDF:", err);
    } finally {
      setDescargando(false);
    }
  };

  // Descarga todas las gráficas disponibles en un solo PDF.
  const handleDescargarTodas = async () => {
    if (!contenedorGrafica.current) return;

    const indicadorOriginal = indicador;
    setDescargando(true);

    try {
      const profesionista = obtenerProfesionista();
      const pdf = crearDocumento();

      const datosPaciente = {
        nombre: nombrePaciente,
        numeroExpediente,
        sexo,
        fechaNacimiento,
      };

      const datosNutriologo = {
        nombre: profesionista?.nombre ?? "",
        cedulaProfesional: profesionista?.cedulaProfesional,
      };

      for (let i = 0; i < opciones.length; i++) {
        const opcion = opciones[i];
        setProgreso(`${i + 1} de ${opciones.length}`);

        setIndicador(opcion.valor);
        const datosCurva = await obtenerCurva(pacienteId, opcion.valor);
        await new Promise((resolver) => setTimeout(resolver, 700));

        if (!contenedorGrafica.current) break;

        await agregarPaginaGrafica(
          pdf,
          contenedorGrafica.current,
          {
            paciente: datosPaciente,
            nutriologo: datosNutriologo,
            curva: datosCurva,
          },
          i === 0,
        );
      }

      pdf.save(nombreArchivo(numeroExpediente, "graficas"));
    } catch (err) {
      console.error("Error al generar el PDF:", err);
    } finally {
      setIndicador(indicadorOriginal);
      setProgreso(null);
      setDescargando(false);
    }
  };

  useEffect(() => {
    if (!indicador) {
      setCargando(false);
      return;
    }

    const cargar = async () => {
      setCargando(true);
      setError("");

      try {
        const datos = await obtenerCurva(pacienteId, indicador);
        setCurva(datos);
        // Al cambiar de indicador se muestra la última medición
        setSeleccionado(datos.paciente.length - 1);
      } catch (err) {
        const mensaje =
          err instanceof Error ? err.message : "Error al cargar la gráfica";
        setError(mensaje);
        setCurva(null);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [pacienteId, indicador]);

  // Estado vacío: el paciente no tiene mediciones
  if (!tieneMediciones) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <LineChart size={40} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-base font-semibold text-gray-700 mb-1">
          Sin mediciones registradas
        </h3>
        <p className="text-sm text-gray-500">
          Registra la primera medición para visualizar las curvas de
          crecimiento.
        </p>
      </div>
    );
  }

  const indiceActual = enfocado ?? seleccionado;

  const puntoActual =
    curva && indiceActual !== null ? curva.paciente[indiceActual] : null;

  const esUltimo = curva !== null && indiceActual === curva.paciente.length - 1;

  return (
    <div>
      {/* Selector de indicador */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6">
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            onClick={() => setIndicador(opcion.valor)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
              indicador === opcion.valor
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
        {cargando && (
          <div className="h-[420px] flex items-center justify-center">
            <Loader2 className="animate-spin text-teal-600" size={32} />
          </div>
        )}

        {!cargando && error && (
          <div className="h-[420px] flex flex-col items-center justify-center text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!cargando && !error && curva && (
          <>
            {/* Encabezado */}
            <div className="pb-5 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {curva.etiqueta}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {curva.referencia === "OMS 2006"
                    ? "Patrones de crecimiento infantil de la OMS"
                    : "Referencias de crecimiento de la OMS"}
                  {" · "}
                  {curva.sexo === "F" ? "Niñas" : "Niños"}
                  {" · "}
                  {curva.eje.tipo === "edad"
                    ? `${Math.round(curva.eje.min)} a ${Math.round(curva.eje.max)} meses`
                    : `${Math.round(curva.eje.min)} a ${Math.round(curva.eje.max)} cm`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleDescargar}
                  disabled={descargando}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  <Download size={15} className="text-gray-500" />
                  Esta gráfica
                </button>

                {opciones.length > 1 && (
                  <button
                    onClick={handleDescargarTodas}
                    disabled={descargando}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <Download size={15} />
                    {progreso ? `Generando ${progreso}...` : "Todas"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 relative">
              <div className="bg-white" ref={contenedorGrafica}>
                <GraficaCrecimiento
                  curva={curva}
                  indiceSeleccionado={enfocado ?? seleccionado}
                  onSeleccionar={setSeleccionado}
                  onEnfocar={setEnfocado}
                />
              </div>

              {/* Tapa la gráfica mientras se generan las páginas del PDF,
                para que no se vea el cambio de indicador */}
              {progreso && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center gap-3 rounded-lg">
                  <Loader2 className="animate-spin text-teal-600" size={28} />
                  <p className="text-sm font-medium text-gray-700">
                    Generando PDF
                  </p>
                  <p className="text-xs text-gray-500">Gráfica {progreso}</p>
                </div>
              )}
            </div>

            {/* Franja de resumen */}
            {puntoActual && (
              <div className="pt-5 mt-5 border-t border-gray-100">
                {!esUltimo && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-2">
                    Medición seleccionada
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      {curva.etiqueta.split(" ")[0]}
                    </span>
                    <span className="text-2xl font-bold text-gray-900 tabular-nums">
                      {puntoActual.valor}
                      <span className="text-sm font-medium text-gray-500 ml-1">
                        {curva.unidadValor}
                      </span>
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Puntuación Z
                    </span>
                    <span className="text-2xl font-bold text-blue-700 tabular-nums">
                      {puntoActual.z !== null
                        ? `${puntoActual.z > 0 ? "+" : ""}${puntoActual.z.toFixed(2)}`
                        : "—"}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      Fecha de consulta
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatearFecha(puntoActual.fechaConsulta)}
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      {calcularEdadEnFecha(
                        fechaNacimiento,
                        puntoActual.fechaConsulta,
                      )}
                      {curva.eje.tipo === "edad" &&
                        ` (${Math.floor(puntoActual.x)} m)`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[11px] text-gray-400 mt-4 leading-relaxed">
              Puntuación Z calculada con el método LMS. Patrones de crecimiento
              infantil de la OMS (2006) para menores de 5 años y referencias de
              crecimiento (2007) de 5 a 19 años.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default TabGraficas;
