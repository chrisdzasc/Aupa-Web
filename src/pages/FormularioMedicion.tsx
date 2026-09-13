import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Ruler,
  Calculator,
  ClipboardList,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

interface Errores {
  fechaConsulta?: string;
  peso?: string;
  talla?: string;
  perimetroCefalico?: string;
}

// ---- Paciente de ejemplo (vendrá del backend) ----
const pacienteEjemplo = {
  id: 2,
  nombre: "Mateo García López",
  fechaNacimiento: "2024-03-15",
};

// ---- Medición de ejemplo para modo editar (vendrá del backend) ----
const medicionExistente = {
  id: 12,
  fechaConsulta: "2026-09-15",
  peso: "11.8",
  talla: "83.5",
  perimetroCefalico: "47.8",
  perimetroBraquial: "14.2",
  cintura: "46.2",
  abdomen: "48.0",
  cadera: "49.5",
  pantorrilla: "",
  tricipital: "",
  notas:
    "El paciente muestra ganancia ponderal y de talla acorde a su carril de crecimiento. Control en 3 meses.",
};

function FormularioMedicion() {
  const { id, idMedicion } = useParams();
  const navigate = useNavigate();
  const paciente = pacienteEjemplo;

  // Modo: si hay idMedicion en la URL, estamos editando
  const modoEditar = Boolean(idMedicion);

  // Fecha de hoy
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  const hoyStr = `${hoy.getFullYear()}-${mes}-${dia}`;

  // Estados
  const [fechaConsulta, setFechaConsulta] = useState(hoyStr);
  const [peso, setPeso] = useState("");
  const [talla, setTalla] = useState("");
  const [perimetroCefalico, setPerimetroCefalico] = useState("");
  const [perimetroBraquial, setPerimetroBraquial] = useState("");
  const [cintura, setCintura] = useState("");
  const [abdomen, setAbdomen] = useState("");
  const [cadera, setCadera] = useState("");
  const [pantorrilla, setPantorrilla] = useState("");
  const [tricipital, setTricipital] = useState("");
  const [mostrarComplementarias, setMostrarComplementarias] = useState(false);
  const [notas, setNotas] = useState("");

  const [errores, setErrores] = useState<Errores>({});

  // ---- Precargar datos en modo editar ----
  useEffect(() => {
    if (!modoEditar) return;

    // Cuando haya backend: buscar la medición por idMedicion.
    const m = medicionExistente;

    setFechaConsulta(m.fechaConsulta);
    setPeso(m.peso);
    setTalla(m.talla);
    setPerimetroCefalico(m.perimetroCefalico);
    setPerimetroBraquial(m.perimetroBraquial);
    setCintura(m.cintura);
    setAbdomen(m.abdomen);
    setCadera(m.cadera);
    setPantorrilla(m.pantorrilla);
    setTricipital(m.tricipital);
    setNotas(m.notas);

    // Abrir el acordeón si alguna complementaria tiene valor
    const hayComplementarias = [
      m.perimetroBraquial,
      m.cintura,
      m.abdomen,
      m.cadera,
      m.pantorrilla,
      m.tricipital,
    ].some((v) => v.trim() !== "");

    if (hayComplementarias) setMostrarComplementarias(true);
  }, [modoEditar, idMedicion]);

  // ---- Edad en meses en la fecha de la consulta ----
  const calcularEdadMeses = (nacimiento: string, consulta: string): number | null => {
    if (!nacimiento || !consulta) return null;
    const [anioN, mesN, diaN] = nacimiento.split("-").map(Number);
    const [anioC, mesC, diaC] = consulta.split("-").map(Number);
    const fNac = new Date(anioN, mesN - 1, diaN);
    const fCon = new Date(anioC, mesC - 1, diaC);
    if (fCon < fNac) return null;
    let meses = (fCon.getFullYear() - fNac.getFullYear()) * 12;
    meses += fCon.getMonth() - fNac.getMonth();
    if (fCon.getDate() < fNac.getDate()) meses--;
    return meses;
  };

  const edadMeses = calcularEdadMeses(paciente.fechaNacimiento, fechaConsulta);

  // ---- Edad precisa ----
  const calcularEdadPrecisa = (nacimiento: string, consulta: string): string => {
    if (!nacimiento || !consulta) return "";
    const [anioN, mesN, diaN] = nacimiento.split("-").map(Number);
    const [anioC, mesC, diaC] = consulta.split("-").map(Number);
    const fNac = new Date(anioN, mesN - 1, diaN);
    const fCon = new Date(anioC, mesC - 1, diaC);
    if (fCon < fNac) return "";
    let anios = fCon.getFullYear() - fNac.getFullYear();
    let meses = fCon.getMonth() - fNac.getMonth();
    let dias = fCon.getDate() - fNac.getDate();
    if (dias < 0) {
      meses--;
      dias += new Date(fCon.getFullYear(), fCon.getMonth(), 0).getDate();
    }
    if (meses < 0) {
      anios--;
      meses += 12;
    }
    const partes: string[] = [];
    if (anios > 0) partes.push(`${anios} ${anios === 1 ? "año" : "años"}`);
    if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
    if (dias > 0) partes.push(`${dias} ${dias === 1 ? "día" : "días"}`);
    if (partes.length === 0) return "Recién nacido";
    if (partes.length === 1) return partes[0];
    if (partes.length === 2) return `${partes[0]} y ${partes[1]}`;
    return `${partes[0]}, ${partes[1]} y ${partes[2]}`;
  };

  const edadEnConsulta = calcularEdadPrecisa(paciente.fechaNacimiento, fechaConsulta);

  // ---- IMC ----
  const calcularIMC = (): string | null => {
    const p = Number(peso);
    const t = Number(talla);
    if (!p || !t || p <= 0 || t <= 0) return null;
    const tm = t / 100;
    return (p / (tm * tm)).toFixed(1);
  };
  const imcCalculado = calcularIMC();

  const etiquetaTalla =
    edadMeses !== null && edadMeses < 24 ? "Talla / Longitud (cm)" : "Estatura (cm)";

  const regexPeso = /^(0|[1-9]\d{0,2})?(\.\d{0,3})?$/;
  const regexMedida = /^(0|[1-9]\d{0,2})?(\.\d{0,1})?$/;

  const formatearNumero = (valor: string, setter: (val: string) => void) => {
    if (valor.startsWith(".")) setter("0" + valor);
    else if (valor.endsWith(".")) setter(valor.slice(0, -1));
  };

  // ---- Validación ----
  const validar = () => {
    const nuevos: Errores = {};

    if (!fechaConsulta) {
      nuevos.fechaConsulta = "La fecha de consulta es obligatoria";
    } else if (fechaConsulta > hoyStr) {
      nuevos.fechaConsulta = "La fecha no puede ser futura";
    } else if (paciente.fechaNacimiento && fechaConsulta < paciente.fechaNacimiento) {
      nuevos.fechaConsulta = "La fecha no puede ser anterior al nacimiento";
    }

    const pesoNum = Number(peso);
    if (!peso.trim()) nuevos.peso = "El peso es obligatorio";
    else if (isNaN(pesoNum) || pesoNum <= 0) nuevos.peso = "Ingresa un peso válido mayor a 0";
    else if (pesoNum > 250) nuevos.peso = "Revise el peso, excede el límite clínico";

    const tallaNum = Number(talla);
    if (!talla.trim()) nuevos.talla = "La talla es obligatoria";
    else if (isNaN(tallaNum) || tallaNum <= 0) nuevos.talla = "Ingresa una talla válida mayor a 0";
    else if (tallaNum > 250) nuevos.talla = "Revisa la talla, excede el límite clínico";

    if (perimetroCefalico.trim()) {
      const cefNum = Number(perimetroCefalico);
      if (isNaN(cefNum) || cefNum <= 0) nuevos.perimetroCefalico = "El perímetro debe ser mayor a 0";
      else if (cefNum > 70) nuevos.perimetroCefalico = "Excede el límite clínico";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleGuardar = () => {
    if (!validar()) return;

    if (modoEditar) {
      alert("Cambios guardados (simulado)");
      navigate(`/pacientes/${id}/mediciones/${idMedicion}`);
    } else {
      alert("Medición guardada (simulado)");
      navigate(`/pacientes/${id}`);
    }
  };

  // Ruta de regreso según el modo
  const rutaVolver = modoEditar
    ? `/pacientes/${id}/mediciones/${idMedicion}`
    : `/pacientes/${id}`;

  const textoVolver = modoEditar ? "Volver al detalle de la medición" : "Volver al expediente";

  const inputClass = (error?: string) =>
    `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${
      error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500"
    }`;

  const CardHeader = ({ icon: Icon, titulo }: { icon: any; titulo: string }) => (
    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-3">
      <Icon size={20} className="text-teal-600" />
      {titulo}
    </h2>
  );

  return (
    <div className="max-w-3xl mx-auto pb-28">
      {/* Encabezado */}
      <Link
        to={rutaVolver}
        className="inline-flex items-center gap-1.5 text-teal-600 text-sm hover:underline mb-4 group animate-entrance delay-1"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        {textoVolver}
      </Link>

      <div className="animate-entrance delay-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {modoEditar ? "Editar Medición" : "Nueva Medición"}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Paciente: <span className="font-semibold text-gray-700">{paciente.nombre}</span>
        </p>
      </div>

      {/* Sección 1: Fecha de consulta */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow animate-entrance delay-1">
        <CardHeader icon={Calendar} titulo="Fecha de la consulta" />
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de consulta<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={fechaConsulta}
            onChange={(e) => {
              setFechaConsulta(e.target.value);
              if (errores.fechaConsulta) setErrores({ ...errores, fechaConsulta: undefined });
            }}
            className={inputClass(errores.fechaConsulta)}
          />
          {errores.fechaConsulta && (
            <p className="text-xs text-red-500 mt-1">{errores.fechaConsulta}</p>
          )}
        </div>
      </div>

      {/* Sección 2: Antropometría básica */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow animate-entrance delay-2">
        <CardHeader icon={Ruler} titulo="Antropometría básica" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={peso}
              onChange={(e) => {
                if (e.target.value === "" || regexPeso.test(e.target.value)) {
                  setPeso(e.target.value);
                  if (errores.peso) setErrores({ ...errores, peso: undefined });
                }
              }}
              onBlur={() => formatearNumero(peso, setPeso)}
              placeholder="0.000"
              className={inputClass(errores.peso)}
            />
            {errores.peso && <p className="text-xs text-red-500 mt-1">{errores.peso}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {etiquetaTalla}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={talla}
              onChange={(e) => {
                if (e.target.value === "" || regexMedida.test(e.target.value)) {
                  setTalla(e.target.value);
                  if (errores.talla) setErrores({ ...errores, talla: undefined });
                }
              }}
              onBlur={() => formatearNumero(talla, setTalla)}
              placeholder="0.0"
              className={inputClass(errores.talla)}
            />
            {errores.talla && <p className="text-xs text-red-500 mt-1">{errores.talla}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perímetro Cefálico (cm)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={perimetroCefalico}
              onChange={(e) => {
                if (e.target.value === "" || regexMedida.test(e.target.value)) {
                  setPerimetroCefalico(e.target.value);
                  if (errores.perimetroCefalico)
                    setErrores({ ...errores, perimetroCefalico: undefined });
                }
              }}
              onBlur={() => formatearNumero(perimetroCefalico, setPerimetroCefalico)}
              placeholder="0.0"
              className={inputClass(errores.perimetroCefalico)}
            />
            {errores.perimetroCefalico && (
              <p className="text-xs text-red-500 mt-1">{errores.perimetroCefalico}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección 3: Motor clínico */}
      <div className="bg-teal-50 rounded-xl border border-teal-200 p-6 mb-6 relative overflow-hidden animate-entrance delay-3">
        <div className="imc-breathe absolute -right-4 -bottom-4 w-28 h-28 bg-teal-200/40 rounded-full pointer-events-none"></div>
        <h2 className="text-sm font-bold text-teal-700 uppercase mb-4 flex items-center gap-2 relative z-10">
          <Calculator size={18} className="text-teal-600" />
          Cálculo automático
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div>
            <p className="text-xs text-gray-500 mb-1">IMC calculado</p>
            {imcCalculado ? (
              <p className="text-3xl font-bold text-teal-700">
                {imcCalculado} <span className="text-sm font-normal text-gray-500">kg/m²</span>
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-2">Ingresa peso y talla para calcular el IMC</p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Edad en la consulta</p>
            {edadEnConsulta ? (
              <p className="text-lg font-bold text-teal-700 mt-1">{edadEnConsulta}</p>
            ) : (
              <p className="text-sm text-gray-400 mt-2">Selecciona una fecha válida</p>
            )}
          </div>
        </div>
      </div>

      {/* Sección 4: Complementarias */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow animate-entrance delay-4">
        <button
          type="button"
          onClick={() => setMostrarComplementarias(!mostrarComplementarias)}
          className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors"
        >
          <ChevronRight
            size={16}
            className={`transition-transform duration-300 ${
              mostrarComplementarias ? "rotate-90" : ""
            }`}
          />
          Medidas Complementarias de Composición Corporal (Opcional)
        </button>

        {mostrarComplementarias && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 accordion-content">
            {[
              { label: "Perímetro braquial (cm)", val: perimetroBraquial, set: setPerimetroBraquial },
              { label: "Cintura (cm)", val: cintura, set: setCintura },
              { label: "Abdomen (cm)", val: abdomen, set: setAbdomen },
              { label: "Cadera (cm)", val: cadera, set: setCadera },
              { label: "Pantorrilla (cm)", val: pantorrilla, set: setPantorrilla },
              { label: "Pliegue tricipital (mm)", val: tricipital, set: setTricipital },
            ].map((campo) => (
              <div key={campo.label}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{campo.label}</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={campo.val}
                  onChange={(e) => {
                    if (e.target.value === "" || regexMedida.test(e.target.value)) {
                      campo.set(e.target.value);
                    }
                  }}
                  onBlur={() => formatearNumero(campo.val, campo.set)}
                  placeholder="0.0"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 5: Notas */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow animate-entrance delay-5">
        <CardHeader icon={ClipboardList} titulo="Notas de la consulta" />
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Observaciones de la consulta..."
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
        />
      </div>

      {/* Barra de acción fija */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-1px_4px_rgba(0,0,0,0.04)] z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            to={rutaVolver}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            onClick={handleGuardar}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
          >
            {modoEditar ? "Guardar cambios" : "Guardar medición"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormularioMedicion;
