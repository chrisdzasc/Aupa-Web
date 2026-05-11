import { error } from "console";
import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

interface Errores {
    fechaConsulta?: string;
    peso?: string;
    talla?: string;
    perimetroBraquial?: string;
    perimetroCefalico?: string;
    cintura?: string;
    abdomen?: string;
    cadera?: string;
    pantorrilla?: string;
}

function NuevaMedicion() {

    const { id } = useParams();
    const navigate = useNavigate();

    const hoy = new Date().toISOString().split("T")[0];

    const [fechaConsulta, setFechaConsulta] = useState(hoy);
    const [peso, setPeso] = useState("");
    const [talla, setTalla] = useState("");
    const [perimetroBraquial, setPerimetroBraquial] = useState("");
    const [perimetroCefalico, setPerimetroCefalico] = useState("");
    const [cintura, setCintura] = useState("");
    const [abdomen, setAbdomen] = useState("");
    const [cadera, setCadera] = useState("");
    const [pantorrilla, setPantorrilla] = useState("");
    const [errores, setErrores] = useState<Errores>({});

    const validarNumerosPositivo = (valor: string, nombreCampo: string, obligatorio: boolean) : string | undefined => {
        console.log(`Validando ${nombreCampo}: "${valor}", trim: "${valor.trim()}"`);

        if(!valor.trim()) {
            return obligatorio ? `${nombreCampo} es obligatorio` : undefined;
        }
        
        const num = Number(valor);

        console.log(`Numero convertido: ${num}, isNaN: ${isNaN(num)}`);

        if(isNaN(num)) {
            return `${nombreCampo} debe ser un número`;
        }

        if(num <= 0) {
            return `${nombreCampo} debe ser mayor a 0`;
        }

        return undefined;
    };

    const validar = () => {
        const nuevosErrores: Errores = {};

        if(!fechaConsulta) {
            nuevosErrores.fechaConsulta = "La fecha de consulta es obligatoria";
        }

        nuevosErrores.peso = validarNumerosPositivo(peso, "El peso", true);
        nuevosErrores.talla = validarNumerosPositivo(talla, "La longitud/estatura", true);
        nuevosErrores.perimetroBraquial = validarNumerosPositivo(perimetroBraquial, "El perímetro braquial", true);

        nuevosErrores.perimetroCefalico = validarNumerosPositivo(perimetroCefalico, "El perímetro cefálico", false);
        nuevosErrores.cintura = validarNumerosPositivo(cintura, "La cintura", false);
        nuevosErrores.abdomen = validarNumerosPositivo(abdomen, "El abdomen", false);
        nuevosErrores.cadera = validarNumerosPositivo(cadera, "La cadera", false);
        nuevosErrores.pantorrilla = validarNumerosPositivo(pantorrilla, "La pantorrilla", false);

        Object.keys(nuevosErrores).forEach((key) => {
            if (nuevosErrores[key as keyof Errores] === undefined) {
                delete nuevosErrores[key as keyof Errores];
            }
        });

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleGuardar = () => {
        const esValido = validar();

        console.log("Errores:", errores);
        console.log("Es válido:", esValido);

        if(esValido) {
            alert("Medición guardada (por ahora solo simula)");
            navigate(`/pacientes/${id}`);
        }
    };

    const inputClassName = (error?: string) => 
        `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`;

    return (
        <div>
            <Link to={`/pacientes/{id}`} className="text-teal-600 text-sm hover:underline mb-4 inline-block">&larr; Volver al perfil del paciente</Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Nueva Medición</h1>
            <p className="text-gray-500 text-sm mb-6">Registra las mediciones de la consulta actual</p>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📅</span>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Datos de la consulta</h2>

                        <p className="text-sm text-gray-500">Información de la visita</p>
                    </div>
                </div>

                <div className="max-w-xs mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de consulta <span className="text-red-500">*</span></label>
                    
                    <input 
                        type="date"
                        value={fechaConsulta}
                        onChange={(e) => {
                            setFechaConsulta(e.target.value);

                            if(errores.fechaConsulta) setErrores({ ...errores, fechaConsulta: undefined });
                        }}
                        className={inputClassName(errores.fechaConsulta)}
                    />
                    {errores.fechaConsulta && (
                        <p className="text-xs text-red-500 mt-1">{errores.fechaConsulta}</p>
                    )}
                </div>

                <div className="border-t border-gray-200 my-6"></div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📏</span>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Mediciones</h2>

                        <p className="text-sm text-gray-500">Registro antropométrico del paciente</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) <span className="text-red-500">*</span></label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={peso}
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setPeso(valor)

                                    if (errores.peso) setErrores({ ...errores, peso: undefined });
                                }
                            }}
                            placeholder="0.00"
                            className={inputClassName(errores.peso)}
                        />
                        {errores.peso && (
                            <p className="text-xs text-red-500 mt-1">{errores.peso}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitud / Estatura (cm) <span className="text-red-500">*</span></label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={talla}
                            onChange={(e) => {
                                const valor = e.target.value;
                                
                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setTalla(valor);

                                    if (errores.talla) setErrores({ ...errores, talla: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.talla)}
                        />
                        {errores.talla && (
                            <p className="text-xs text-red-500 mt-1">{errores.talla}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Perimetro Braquial (cm) <span className="text-red-500">*</span></label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={perimetroBraquial}
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setPerimetroBraquial(valor);

                                    if (errores.perimetroBraquial) setErrores({ ...errores, perimetroBraquial: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.perimetroBraquial)}
                        />
                        {errores.perimetroBraquial && (
                            <p className="text-xs text-red-500 mt-1">{errores.perimetroBraquial}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cintura (cm)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={cintura}
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setCintura(valor);

                                    if (errores.cintura) setErrores({ ...errores, cintura: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.cintura)}
                        />
                        {errores.cintura && (
                            <p className="text-xs text-red-500 mt-1">{errores.cintura}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cadera (cm)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={cadera}
                            onChange={(e) => {
                                const valor = e.target.value;
                                
                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setCadera(valor);

                                    if (errores.cadera) setErrores({ ...errores, cadera: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.cadera)}
                        />
                        {errores.cadera && (
                            <p className="text-xs text-red-500 mt-1">{errores.cadera}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abdomen (cm)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={abdomen}
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setAbdomen(valor);

                                    if (errores.abdomen) setErrores({ ...errores, abdomen: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.cadera)}
                        />
                        {errores.abdomen && (
                            <p className="text-xs text-red-500 mt-1">{errores.abdomen}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pantorrilla (cm)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={pantorrilla}
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setPantorrilla(valor);

                                    if (errores.pantorrilla) setErrores({ ...errores, pantorrilla: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.pantorrilla)}
                        />
                        {errores.pantorrilla && (
                            <p className="text-xs text-red-500 mt-1">{errores.pantorrilla}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Perimetro Céfalico (cm)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={perimetroCefalico}
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^\d*\.?\d*$/.test(valor)) {
                                    setPerimetroCefalico(valor);

                                    if (errores.perimetroCefalico) setErrores({ ...errores, perimetroCefalico: undefined });
                                }
                            }}
                            placeholder="0.0"
                            className={inputClassName(errores.perimetroCefalico)}
                        />
                        {errores.perimetroCefalico && (
                            <p className="text-xs text-red-500 mt-1">{errores.perimetroCefalico}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 mb-8">
                <Link to={`/pacientes/${id}`} className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>

                <button onClick={handleGuardar} className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">Guardar Medición</button>
            </div>
        </div>
    );
}

export default NuevaMedicion;