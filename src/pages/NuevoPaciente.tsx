import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ErroresPaso1 {
    nombre?: string;
    sexo?: string;
    fechaNacimiento?: string;
    semanasGestacion?: string;
    pesoNacer?: string;
    tallaNacer?: string;
    perimetroCefalicoNacer?: string;
    tipoParto?: string;
    tipoAlimentacion?: string;
    inicioComplementaria?: string;
}

interface ErroresPaso2 {
    nombreTutor?: string;
    parentesco?: string;
    telefono?: string;
    email?: string;
    accesoAppMovil?: string;
}

interface ErroresPaso3 {
    fechaConsulta?: string;
    pesoActual?: string;
    tallaActual?: string;
    perimetroCefalicoConsulta?: string;
}

function NuevoPaciente() {

    const navigate = useNavigate();

    const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);

    // Datos del paciente (Paso 1)
    const [nombre, setNombre] = useState("");
    const [sexo, setSexo] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");

    // Historial Perinatal (Paso 1)
    const [semanasGestacion, setSemanasGestacion] = useState("");
    const [pesoNacer, setPesoNacer] = useState("");
    const [tallaNacer, setTallaNacer] = useState("");
    const [perimetroCefalicoNacer, setPerimetroCefalicoNacer] = useState("");
    const [tipoParto, setTipoParto] = useState("");

    // Antecedentes Nutricionales (Paso 1)
    const [tipoAlimentacion, setTipoAlimentacion] = useState("");
    const [inicioComplementaria, setInicioComplementaria] = useState("");

    // Antecedentos Heredofamiliares (Paso 1)
    const [antecedentesFamiliares, setAntecedentesFamiliares] = useState({
        diabetes: false,
        hipertension: false,
        obesidad: false,
        cardiovascular: false,
        alergias: false,
    });
    const [otrosAntecedentesFamiliares, setOtrosAntecedentesFamiliares] = useState("");

    // Notas (Paso 1)
    const [observaciones, setObservaciones] = useState("");

    // Datos del tutor (Paso 2)
    const [nombreTutor, setNombreTutor] = useState("");
    const [parentesco, setParentesco] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [accesoAppMovil, setAccesoAppMovil] = useState(true);

    // Datos de la Primera Consulta (Paso 3)
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const hoyStr = `${hoy.getFullYear()}-${mes}-${dia}`;

    const [fechaConsulta, setFechaConsulta] = useState(hoyStr);
    const [pesoActual, setPesoActual] = useState("");
    const [tallaActual, setTallaActual] = useState("");
    const [perimetroCefalicoConsulta, setPerimetroCefalicoConsulta] = useState("");
    const [cintura, setCintura] = useState("");
    const [abdomen, setAbdomen] = useState("");
    const [cadera, setCadera] = useState("");
    const [pantorrilla, setPantorrilla] = useState("");
    const [braquial, setBraquial] = useState("");
    const [tricipital, setTricipital] = useState("");
    const [mostrarComplementarias, setMostrarComplementarias] = useState(false);
    const [notasConsulta, setNotasConsulta] = useState("");

    const [errores, setErrores] = useState<ErroresPaso1>({});
    const [erroresPaso2, setErroresPaso2] = useState<ErroresPaso2>({});
    const [erroresPaso3, setErroresPaso3] = useState<ErroresPaso3>({});

    // Calcular edad en meses a partir de la fecha de nacimiento
    const calcularEdadMeses = (fecha: string): number | null => {
        if (!fecha) return null;

        const [anio, mes, dia] = fecha.split('-');
        const nacimiento = new Date(Number(anio), Number(mes) - 1, Number(dia));
        const hoy = new Date();

        let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12;

        meses += hoy.getMonth() - nacimiento.getMonth();

        if (hoy.getDate() < nacimiento.getDate()) {
            meses--;
        }

        return meses;
    }

    const edadMeses = calcularEdadMeses(fechaNacimiento);

    // Calcular la edad precisa
    const calcularEdadPrecisa = (nacimiento: string, consulta: string): string => {
        if (!nacimiento || !consulta) return "";

        const [anioN, mesN, diaN] = nacimiento.split("-").map(Number);
        const [anioC, mesC, diaC] = consulta.split("-").map(Number);

        const fNac = new Date(anioN, mesN - 1, diaN);
        const fCon = new Date (anioC, mesC -1, diaC);

        if (fCon < fNac) return "";

        let anios = fCon.getFullYear() - fNac.getFullYear();
        let meses = fCon.getMonth() - fNac.getMonth();
        let dias = fCon.getDate() - fNac.getDate();

        if (dias < 0) {
            meses--;
            const ultimoDiaMesAnterior = new Date(fCon.getFullYear(), fCon.getMonth(), 0).getDate();
            
            dias += ultimoDiaMesAnterior;
        }

        if (meses < 0) {
            anios--;
            meses += 12;
        }

        const partes: string[] = [];
        
        if (anios > 0) partes.push(`${anios} ${anios === 1 ? "año" : "años"}`);
        if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);
        if (dias > 0) partes.push(`${dias} ${dias === 1 ? "día" : "días"}`);

        if (partes.length === 0) return "Recien nacido";
        if (partes.length === 1) return partes[0];
        if (partes.length === 2) return `${partes[0]} y ${partes[1]}`;
        return `${partes[0]}, ${partes[1]} y ${partes[2]}`;
    };

    const edadEnConsulta = calcularEdadPrecisa(fechaNacimiento, fechaConsulta);


    // Cálculo del Indice de Masa Corporal (IMC)
    const calcularIMC = (): string | null => {
        const peso = Number(pesoActual);
        const talla = Number(tallaActual);

        if (!peso || !talla || peso <= 0 || talla <= 0) return null;

        const tallaMetros = talla / 100;

        const imc = peso / (tallaMetros * tallaMetros);

        return imc.toFixed(1);
    }

    const imcCalculado = calcularIMC();

    // Determinar el caso segun la edad
    // Caso 1: 0-5 meses | Caso 2: 6-23 meses | Caso 3: 24+ meses
    const obtenerCaso = (): 1 | 2 | 3 | null => {
        if (edadMeses === null) return null;
        if (edadMeses < 6) return 1;
        if (edadMeses < 24) return 2;

        return 3;
    }

    const caso = obtenerCaso();

    // Limpiar campos cuando cambia el caso
    useEffect(() => {
        setTipoAlimentacion("");
        setInicioComplementaria("");
    }, [caso]);

    // Etiquetas dinámicas según el caso
    const etiquetaAlimentacion = () => {
        if (caso === 1) return "Alimentación Actual";
        if (caso === 2) return "Alimentación durante los primeros 6 meses";
        if (caso === 3) return "Alimentación en sus primeros 6 meses de vida";

        return "Tipo de Alimentación";
    };

    const opcionesAlimentacion = () => {
        const base = [
            "Lactancia Materna Exclusiva (LME)",
            "Fórmula Infantil",
            "Lactancia Mixta (Materna + Fórmula)",
        ];

        if (caso === 3) base.push("No Especificado");
        return base;
    }

    const etiquetaComplementaria = () => {
        if (caso === 2) return "Introducción de alimentos sólidos";
        if (caso === 3) return "¿A qué edad inició la alimentación complementaria?";

        return "";
    }

    const etiquetaTalla = edadMeses !== null && edadMeses < 24 ? "Talla / Longitud (cm)" : "Estatura (cm)";
    
    
    const opcionesComplementaria = () => {
        if (caso === 2) {
            return ["A los 6 meses", "Antes de los 6 meses", "Después de los 6 meses", "Aún no inicia"];
        }

        if (caso === 3) {
            return ["A los 6 meses", "Antes de los 6 meses", "Después de los 6 meses", "No recuerda"];
        }

        return [];
    }

    const regexPeso = /^(0|[1-9]\d{0,2})?(\.\d{0,3})?$/;
    const regexTalla = /^(0|[1-9]\d?)?(\.\d{0,1})?$/;
    const regexTallaConsulta = /^(0|[1-9]\d{0,2})?(\.\d{0,1})?$/;

    const formatearNumero = (
        valor: string,
        setter: (val: string) => void
    ) => {
        if (valor.startsWith(".")) {
            setter("0" + valor);
        } else if (valor.endsWith(".")) {
            setter(valor.slice(0, -1));
        }
    };

    const validarPaso1 = () => {
        const nuevosErrores: ErroresPaso1 = {};

        // Nombre
        if (!nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio";
        } else if (nombre.trim().length < 2) {
            nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres";
        } else if (nombre.length > 100) {
            nuevosErrores.nombre = "El nombre no puede exceder 100 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre)) {
            nuevosErrores.nombre = "El nombre solo puede contener letras y espacios";
        }

        // Sexo
        if (!sexo) {
            nuevosErrores.sexo = "Selecciona el sexo biológico";
        }

        // Fecha de Nacimiento
        if (!fechaNacimiento) {
            nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
        } else {
            const hoy = new Date();
            const fechaNac = new Date(fechaNacimiento);
            const hace18 = new Date();

            hace18.setFullYear(hoy.getFullYear() - 18);

            if (fechaNac > hoy) {
                nuevosErrores.fechaNacimiento = "La fecha no puede ser futura";
            } else if (fechaNac < hace18) {
                nuevosErrores.fechaNacimiento = "El paciente debe tener menos de 18 años";
            }
        }

        // Semanas de gestación
        if (!semanasGestacion) {
            nuevosErrores.semanasGestacion = "Selecciona las semanas de gestación";
        }

        // Peso al nacer
        if (!pesoNacer.trim()) {
            nuevosErrores.pesoNacer = "El peso al nacer es obligatorio";
        } else if (Number(pesoNacer) <= 0) {
            nuevosErrores.pesoNacer = "El peso debe ser mayor a 0";
        }

        // Talla al nacer
        if (!tallaNacer.trim()) {
            nuevosErrores.tallaNacer = "La talla al nacer es obligatoria";
        } else if (Number(tallaNacer) <= 0) {
            nuevosErrores.tallaNacer = "La talla debe ser mayor a 0";
        }

        // Perimetro cefálico (opcional, pero si se llena debe ser positivo)
        if (perimetroCefalicoNacer.trim() && Number(perimetroCefalicoNacer) <= 0) {
            nuevosErrores.perimetroCefalicoNacer = "El perímetro cefálico debe ser mayor a 0";
        }

        // Tipo de parto
        if (!tipoParto) {
            nuevosErrores.tipoParto = "Selecciona el tipo de parto";
        }

        // Tipo de alimentación (siempre obligatorio)
        if (!tipoAlimentacion) {
            nuevosErrores.tipoAlimentacion = "Selecciona el tipo de alimentación";
        }

        // Inicio complementaria (obligatorio solo en caso 2 y 3)
        if ((caso === 2 || caso === 3) && !inicioComplementaria) {
            nuevosErrores.inicioComplementaria = "Selecciona una opción";
        }

        setErrores(nuevosErrores);
        
        return Object.keys(nuevosErrores).length === 0;
    };

    const validarPaso2 = () => {
        const nuevosErrores: ErroresPaso2 = {};

        if (!nombreTutor.trim()) {
            nuevosErrores.nombreTutor = "El nombre del tutor es obligatorio";
        } else if (nombreTutor.trim().length < 2) {
            nuevosErrores.nombreTutor = "El nombre debe tener al menos 2 caracteres";
        } else if (nombreTutor.length > 100) {
            nuevosErrores.nombreTutor = "El nombre no puede exceder 100 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombreTutor)) {
            nuevosErrores.nombreTutor = "El nombre solo puede contener letras y espacios";
        }

        if (!parentesco) {
            nuevosErrores.parentesco = "Selecciona el parentesco";
        }

        if (!telefono.trim()) {
            nuevosErrores.telefono = "El teléfono es obligatorio";
        } else if (!/^\d{10}$/.test(telefono)) {
            nuevosErrores.telefono = "El teléfono debe tener 10 dígitos";
        }

        if (!email.trim()) {
            nuevosErrores.email = "El correo eletrónico es obligatorio";
        } else if (email.length > 100) {
            nuevosErrores.email = "El correo no puede exceder 100 caracteres";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nuevosErrores.email = "Ingresa un correo electrónico válido";
        }

        if(!accesoAppMovil) {
            nuevosErrores.accesoAppMovil = "Es obligatorio generar el acceso a la App Móvil para vincular el expediente.";
        }

        setErroresPaso2(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const validarPaso3 = () => {
        const nuevosErrores: ErroresPaso3 = {};

        // 1. Validación de Fecha
        if (!fechaConsulta) {
            nuevosErrores.fechaConsulta = "La fecha de consulta es obligatoria";
        } else {
            if (fechaConsulta > hoyStr) {
                nuevosErrores.fechaConsulta = "La fecha no puede ser futura";
            } else if (fechaNacimiento && fechaConsulta < fechaNacimiento) {
                nuevosErrores.fechaConsulta = "La fecha no puede ser anterior al nacimiento";
            }
        }

        // 2. Validación de Peso (Límite biológicos)
        const pesoNum = Number(pesoActual);

        if (!pesoActual.trim()) {
            nuevosErrores.pesoActual = "El peso es obligatorio";
        } else if (isNaN(pesoNum) || pesoNum <= 0) {
            nuevosErrores.pesoActual = "Ingresa un peso válido mayor a 0";
        } else if (pesoNum > 250) {
            nuevosErrores.pesoActual = "Revise el peso, excede el límite clínico";
        }

        // 3. Validación de Talla (Límites biológicos)
        const tallaNum = Number(tallaActual);

        if (!tallaActual.trim()) {
            nuevosErrores.tallaActual = "La talla es obligatoria";
        } else if (isNaN(tallaNum) || tallaNum <= 0) {
            nuevosErrores.tallaActual = "Ingresa una talla válida mayor a 0";
        } else if (tallaNum > 250) {
            nuevosErrores.tallaActual = "Revisa la talla, excede el límite clínico";
        }

        // 4. Validación de Perímetro Cefálico (Opcional pero exacto)
        if (perimetroCefalicoConsulta.trim()) {
            const perimetroNum = Number(perimetroCefalicoConsulta);

            if (isNaN(perimetroNum) || perimetroNum <= 0) {
                nuevosErrores.perimetroCefalicoConsulta = "El perímetro debe ser mayor a 0";
            } else if (perimetroNum > 70) {
                nuevosErrores.perimetroCefalicoConsulta = "Excede el límite clínico";
            }
        }

        setErroresPaso3(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleContinuar = () => {
        if (validarPaso1()) {
            setPasoActual(2);

            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleContinuarPaso2 = () => {
        if (validarPaso2()) {
            setPasoActual(3);

            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleGuardarFinal = () => {
        if (validarPaso3()) {
            alert("Listo para enviar al Backend");

            navigate("/pacientes");
        }
    }

    const inputClass = (error?: string) => 
        `w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`;

    return(
        <div className="max-w-4xl mx-auto">
            <Link to="/pacientes" className="text-teal-600 text-sm hover:underline mb-4 inline-block">
                &larr; Volver a pacientes
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">Nuevo Paciente</h1>

            {pasoActual === 1 && (
                <>
                    <p className="text-gray-500 text-sm mb-6">Paso 1 de 3 - Identidad del paciente</p>

                    {/* Sección 1: Identificación básica */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Identificación básica</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb1">Nombre completo <span className="text-red-500">*</span></label>
                            <input 
                                type="text"
                                value={nombre}
                                onChange={(e) => {
                                    setNombre(e.target.value);

                                    if (errores.nombre) setErrores({ ...errores, nombre: undefined });
                                }}
                                placeholder="Ej. Mateo García López"
                                className={inputClass(errores.nombre)}
                            />
                            {errores.nombre && (
                                <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo biológico <span className="text-red-500">*</span></label>

                                <select
                                    value={sexo}
                                    onChange={(e) => {
                                        setSexo(e.target.value);

                                        if (errores.sexo) setErrores({ ...errores, sexo: undefined });
                                    }}
                                    className={inputClass(errores.sexo) + " bg-white"}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                                {errores.sexo && (
                                    <p className="text-xs text-red-500 mt-1">{errores.sexo}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento <span className="text-red-500">*</span></label>

                                <input 
                                    type="date"
                                    value={fechaNacimiento}
                                    onChange={(e) => {
                                        setFechaNacimiento(e.target.value);

                                        if (errores.fechaNacimiento) setErrores({ ...errores, fechaNacimiento: undefined});
                                    }}
                                    className={inputClass(errores.fechaNacimiento)}
                                />
                                {errores.fechaNacimiento && (
                                    <p className="text-xs text-red-500 mt-1">{errores.fechaNacimiento}</p>
                                )}

                                {edadMeses !== null && edadMeses >= 0 && (
                                    <p className="text-xs text-teal-600 mt-1">Edad: {edadMeses} {edadMeses === 1 ? "mes" : "meses"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Historial Perinatal */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Historial Perinatal (Nacimiento)</h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semanas de gestación <span className="text-red-500">*</span></label>

                                <select
                                    value={semanasGestacion}
                                    onChange={(e) => {
                                        setSemanasGestacion(e.target.value);

                                        if (errores.semanasGestacion) setErrores({ ...errores, semanasGestacion: undefined});
                                    }}
                                    className={inputClass(errores.semanasGestacion) + " bg-white"}
                                >
                                    <option value="">Seleccionar</option>
                                    {Array.from({ length: 19 }, (_, i) => 24 + i).map((semana) => (
                                        <option key={semana} value={semana}>
                                            {semana} semanas
                                        </option>
                                    ))}
                                </select>

                                {errores.semanasGestacion && (
                                    <p className="text-xs text-red-500 mt-1">{errores.semanasGestacion}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de parto <span className="text-red-500">*</span></label>

                                <select 
                                    value={tipoParto}
                                    onChange={(e) => {
                                        setTipoParto(e.target.value);

                                        if (errores.tipoParto) setErrores({ ...errores, tipoParto: undefined });
                                    }}
                                    className={inputClass(errores.tipoParto) + " bg-white"}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Vaginal">Vaginal</option>
                                    <option value="Cesarea">Cesárea</option>
                                </select>
                                {errores.tipoParto && (
                                    <p className="text-xs text-red-500 mt-1">{errores.tipoParto}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Peso al nacer (kg) <span className="text-red-500">*</span></label>

                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    value={pesoNacer}
                                    onChange={(e) => {
                                        if(e.target.value === "" || regexPeso.test(e.target.value)) {
                                            setPesoNacer(e.target.value);

                                            if(errores.pesoNacer) setErrores({ ...errores, pesoNacer: undefined });
                                        }
                                    }}
                                    onBlur={() => formatearNumero(pesoNacer, setPesoNacer)}
                                    placeholder="0.000"
                                    className={inputClass(errores.pesoNacer)}
                                />
                                {errores.pesoNacer && (
                                    <p className="text-xs text-red-500 mt-1">{errores.pesoNacer}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Talla al nacer (cm) <span className="text-red-500">*</span></label>

                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    value={tallaNacer}
                                    onChange={(e) => {
                                        if (e.target.value === "" || regexTalla.test(e.target.value)) {
                                            setTallaNacer(e.target.value);

                                            if (errores.tallaNacer) setErrores({ ...errores, tallaNacer: undefined });
                                        }
                                    }}
                                    onBlur={() => formatearNumero(tallaNacer, setTallaNacer)}
                                    placeholder="0.0"
                                    className={inputClass(errores.tallaNacer)}
                                />
                                {errores.tallaNacer && (
                                    <p className="text-xs text-red-500 mt-1">{errores.tallaNacer}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Perímetro Cefálico (cm)</label>

                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    value={perimetroCefalicoNacer}
                                    onChange={(e) => {
                                        if (e.target.value === "" || regexTalla.test(e.target.value)) {
                                            setPerimetroCefalicoNacer(e.target.value);

                                            if (errores.perimetroCefalicoNacer) setErrores({ ...errores, perimetroCefalicoNacer: undefined });
                                        }
                                    }}
                                    onBlur={() => formatearNumero(perimetroCefalicoNacer, setPerimetroCefalicoNacer)}
                                    placeholder="0.0"
                                    className={inputClass(errores.perimetroCefalicoNacer)}
                                />
                                {errores.perimetroCefalicoNacer && (
                                    <p className="text-xs text-red-500 mt-1">{errores.perimetroCefalicoNacer}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Antecedentes Nutricionales (dinámico) */}
                    {caso !== null && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Antecedentes Nutricionales</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{etiquetaAlimentacion()} <span className="text-red-500">*</span></label>

                                    <select
                                        value={tipoAlimentacion}
                                        onChange={(e) => {
                                            setTipoAlimentacion(e.target.value);

                                            if (errores.tipoAlimentacion) setErrores({ ...errores, tipoAlimentacion: undefined });
                                        }}
                                        className={inputClass(errores.tipoAlimentacion) + " bg-white"}
                                    >
                                        <option value="">Seleccionar</option>
                                        {opcionesAlimentacion().map((op) => (
                                            <option key={op} value={op}>{op}</option>
                                        ))}
                                    </select>
                                    {errores.tipoAlimentacion && (
                                        <p className="text-xs text-red-500 mt-1">{errores.tipoAlimentacion}</p>
                                    )}
                                </div>

                                {(caso === 2 || caso === 3) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{etiquetaComplementaria()} <span className="text-red-500">*</span></label>

                                        <select
                                            value={inicioComplementaria}
                                            onChange={(e) => {
                                                setInicioComplementaria(e.target.value);

                                                if (errores.inicioComplementaria) setErrores({ ...errores, inicioComplementaria: undefined });
                                            }}
                                            className={inputClass(errores.inicioComplementaria) + " bg-white"}
                                        >
                                            <option value="">Seleccionar</option>
                                            {opcionesComplementaria().map((op) => (
                                                <option key={op} value={op}>{op}</option>
                                            ))}
                                        </select>
                                        {errores.inicioComplementaria && (
                                                <p className="text-xs text-red-500 mt-1">{errores.inicioComplementaria}</p>
                                        )}
                                    </div>
                                )}

                                {caso === 1 && (
                                    <div className="flex items-end">
                                        <p className="text-xs text-gray-400 italic pb-2">La introducción de alimentos sólidos no aplica para la edad actual</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Sección 4: Antecedentes Heredofamiliares */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Antecedentes Heredofamiliares</h2>

                        <p className="text-sm text-gray-500 mb-4">Marca las condiciones presentes en la familia del paciente</p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {[
                                { clave: "diabetes", etiqueta: "Diabetes" },
                                { clave: "hipertension", etiqueta: "Hipertensión" },
                                { clave: "obesidad", etiqueta: "Obesidad" },
                                { clave: "cardiovascular", etiqueta: "Enf. Cardiovascular" },
                                { clave: "alergias", etiqueta: "Alergías" },
                            ].map((item) => (
                                <label key={item.clave} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox"
                                        checked={antecedentesFamiliares[item.clave as keyof typeof antecedentesFamiliares]}
                                        onChange={(e) => 
                                            setAntecedentesFamiliares({
                                                ...antecedentesFamiliares,
                                                [item.clave]: e.target.checked,
                                            })
                                        }
                                        className="w-4 h-4 accent-teal-600 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700">{item.etiqueta}</span>
                                </label>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Especificar (opcional)</label>

                            <input 
                                type="text"
                                value={otrosAntecedentesFamiliares}
                                onChange={(e) => setOtrosAntecedentesFamiliares(e.target.value)}
                                maxLength={300}
                                placeholder="Especificar familiar u otras condiciones (Ej. Abuelo materno con diabetes)"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>

                    {/* Sección 5: Notas */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Notas y antecedentes clínicos</h2>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones del expediente</label>

                        <textarea 
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="Ej. Alergias alimentarias, condiciones genéticas, cirugías, complicaciones en el hospital, etc."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                        ></textarea>
                    </div>

                    {/* Botón */}
                    <div className="flex justify-end mb-8">
                        <button
                            onClick={handleContinuar}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >Continuar a Datos del Tutor →</button>
                    </div>
                </>
            )}

            {pasoActual === 2 && (
                <>
                    <p className="text-gray-500 text-sm mb-6">Paso 2 de 3 - Datos de contacto y responsable</p>

                    {/* Sección 1: Información del Responsable */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Información del responsable</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del tutor <span className="text-red-500">*</span></label>

                                <input 
                                    type="text"
                                    value={nombreTutor}
                                    onChange={(e) => {
                                        setNombreTutor(e.target.value);

                                        if (erroresPaso2.nombreTutor) setErroresPaso2({ ...errores, nombreTutor: undefined });
                                    }}
                                    placeholder="Ej. María López García"
                                    className={inputClass(erroresPaso2.nombreTutor)}
                                />
                                {erroresPaso2.nombreTutor && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso2.nombreTutor}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco <span className="text-red-500">*</span></label>

                                <select 
                                    value={parentesco}
                                    onChange={(e) => {
                                        setParentesco(e.target.value);

                                        if (erroresPaso2.parentesco) setErroresPaso2({ ...erroresPaso2, parentesco: undefined });
                                    }}
                                    className={inputClass(erroresPaso2.parentesco) + " bg-white"}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Madre">Madre</option>
                                    <option value="Padre">Padre</option>
                                    <option value="Abuelo/a">Abuelo/a</option>
                                    <option value="Tutor Legal">Tutor Legal</option>
                                    <option value="Otro">Otro</option>
                                </select>
                                {erroresPaso2.parentesco && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso2.parentesco}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Datos de Contacto y Acceso */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Datos de contacto y acceso</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp <span className="text-red-500">*</span></label>

                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    value={
                                        telefono.length <= 2
                                            ? telefono
                                            : telefono.length <= 6
                                            ? `${telefono.slice(0, 2)} ${telefono.slice(2)}`
                                            : `${telefono.slice(0, 2)} ${telefono.slice(2, 6)} ${telefono.slice(6)}`
                                    }
                                    onChange={(e) => {
                                        const valor = e.target.value.replace(/\s/g, "");

                                        if (valor === "" || (/^\d+$/.test(valor) && valor.length <= 10)) {
                                            setTelefono(valor);
                                            if (erroresPaso2.telefono) setErroresPaso2({ ...erroresPaso2, telefono: undefined });
                                        }
                                    }}
                                    placeholder="33 1234 5678"
                                    className={inputClass(erroresPaso2.telefono)}
                                />
                                {erroresPaso2.telefono && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso2.telefono}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico <span className="text-red-500">*</span></label>

                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);

                                        if (erroresPaso2.email) setErroresPaso2({ ...erroresPaso2, email: undefined});
                                    }}
                                    placeholder="correo@ejemplo.com"
                                    className={inputClass(erroresPaso2.email)}
                                />
                                {erroresPaso2.email && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso2.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: App Móvil */}
                    <div className={`bg-white rounded-xl border p-6 mb-6 ${erroresPaso2.accesoAppMovil ? "border-red-400" : "border-gray-200"}`}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Acceso a la App Móvil</h2>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={accesoAppMovil}
                                onChange={(e) => {
                                    setAccesoAppMovil(e.target.checked);

                                    if (erroresPaso2.accesoAppMovil) setErroresPaso2({ ...erroresPaso2, accesoAppMovil: undefined });
                                }}
                                className="mt-1 w-4 h-4 accent-teal-600 cursor-pointer"
                            />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Generar acceso a la App Móvil y enviar credenciales temporales por correo</p>

                                <p className="text-xs text-gray-500 mt-1">El sistema autogenerará una contraseña segura y obligará al tutor a cambiarla en su primer inicio de sesión.</p>
                                {erroresPaso2.accesoAppMovil && (
                                    <p className="text-xs text-red-500 mt-2">{erroresPaso2.accesoAppMovil}</p>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Navegación */}
                    <div className="flex justify-between mb-8">
                        <button
                            onClick={() => {
                                setPasoActual(1);

                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >← Regresar al Paso 1</button>

                        <button 
                            onClick={handleContinuarPaso2}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >Continuar a Primera Consulta →</button>
                    </div>
                </>
            )}

            {pasoActual === 3 && (
                <>
                    <p className="text-gray-500 text-sm mb-6">Paso 3 de 3 - Primera Consulta y Antropometría</p>

                    {/* Sección 1: Fecha de Consulta */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Fecha de la consulta</h2>

                        <div className="max-w-xs">
                            <label className="bloc text-sm font-medium text-gray-700 mb-1">Fecha de consulta <span className="text-red-500">*</span></label>

                            <input 
                                type="date"
                                value={fechaConsulta}
                                onChange={(e) => {
                                    setFechaConsulta(e.target.value);

                                    if (erroresPaso3.fechaConsulta) setErroresPaso3({ ...errores, fechaConsulta: undefined });
                                }}
                                className={inputClass(erroresPaso3.fechaConsulta)}
                            />
                            {erroresPaso3.fechaConsulta && (
                                <p className="text-xs text-red-500 mt-1">{erroresPaso3.fechaConsulta}</p>
                            )}
                        </div>
                    </div>

                    {/* Sección 2: Antropometría Básica */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Antropometría básica</h2>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Peso actual (kg) <span className="text-red-500">*</span></label>

                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    value={pesoActual}
                                    onChange={(e) => {
                                        if (e.target.value === "" || regexPeso.test(e.target.value)) {
                                            setPesoActual(e.target.value);
                                            
                                            if (erroresPaso3.pesoActual) setErroresPaso3({ ...erroresPaso3, pesoActual: undefined});
                                        }
                                    }}
                                    onBlur={() => formatearNumero(pesoActual, setPesoActual)}
                                    placeholder="0.000"
                                    className={inputClass(erroresPaso3.pesoActual)}
                                />
                                {erroresPaso3.pesoActual && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso3.pesoActual}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{etiquetaTalla} <span className="text-red-500">*</span></label>

                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    value={tallaActual}
                                    onChange={(e) => {
                                        if (e.target.value === "" || regexTallaConsulta.test(e.target.value)) {
                                            setTallaActual(e.target.value);

                                            if (erroresPaso3.tallaActual) setErroresPaso3({ ...erroresPaso3, tallaActual: undefined });
                                        }
                                    }}
                                    onBlur={() => formatearNumero(tallaActual, setTallaActual)}
                                    placeholder="0.0"
                                    className={inputClass(erroresPaso3.tallaActual)}
                                />
                                {erroresPaso3.tallaActual && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso3.tallaActual}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Perímetro Cefálico (cm)</label>

                                <input 
                                    type="text"
                                    inputMode="decimal"
                                    value={perimetroCefalicoConsulta}
                                    onChange={(e) => {
                                        if (e.target.value === "" || regexTallaConsulta.test(e.target.value)) {
                                            setPerimetroCefalicoConsulta(e.target.value);

                                            if (erroresPaso3.perimetroCefalicoConsulta) setErroresPaso3({ ...erroresPaso3, perimetroCefalicoConsulta: undefined });
                                        }
                                    }}
                                    onBlur={() => formatearNumero(perimetroCefalicoConsulta, setPerimetroCefalicoConsulta)}
                                    placeholder="0.0"
                                    className={inputClass(erroresPaso3.perimetroCefalicoConsulta)}
                                />
                                {erroresPaso3.perimetroCefalicoConsulta && (
                                    <p className="text-xs text-red-500 mt-1">{erroresPaso3.perimetroCefalicoConsulta}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sección 3: Motor Clínico */}
                    <div className="bg-teal-50 rounded-xl border border-teal-200 p-6 mb-6">
                        <h2 className="text-sm font-bold text-teal-700 uppercase mb-4">Cálculo automático</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">IMC calculado</p>
                                {imcCalculado ? (
                                    <p className="text-3xl font-bold text-teal-700">{imcCalculado} <span className="text-sm font-normal text-gray-500">kg/m²</span></p>
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

                    {/* Sección 4: Composición Corporal (Acordeón) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <button
                            type="button"
                            onClick={() => setMostrarComplementarias(!mostrarComplementarias)}
                            className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-800"
                        >
                            <span>{mostrarComplementarias ? "▼" : "▶"}</span>
                            Medidas Complementarias de Composición Corporal (Opcional)
                        </button>

                        {mostrarComplementarias && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                {[
                                    { label: "Cintura (cm)", val: cintura, set: setCintura },
                                    { label: "Abdomen (cm)", val: abdomen, set: setAbdomen },
                                    { label: "Cadera (cm)", val: cadera, set: setCadera },
                                    { label: "Pantorrilla (cm)", val: pantorrilla, set: setPantorrilla },
                                    { label: "Perímetro braquial (cm)", val: braquial, set: setBraquial },
                                    { label: "Pliegue tricipital (cm)", val: tricipital, set: setTricipital },
                                ].map((campo) => (
                                    <div key={campo.label}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{campo.label}</label>

                                        <input 
                                            type="text"
                                            inputMode="decimal"
                                            value={campo.val}
                                            onChange={(e) => {
                                                if (e.target.value === "" || regexTallaConsulta.test(e.target.value)) {
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
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Notas de la consulta</h2>

                        <textarea 
                            value={notasConsulta}
                            onChange={(e) => setNotasConsulta(e.target.value)}
                            rows={3}
                            maxLength={1000}
                            placeholder="Observaciones de la primera consulta..."
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                        />
                    </div>

                    {/* Navegación */}
                    <div className="flex justify-between mb-8">
                        <button
                            onClick={() => {
                                setPasoActual(2);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >← Regresar a Datos del Tutor</button>

                        <button
                            onClick={handleGuardarFinal}
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >Guardar Expediente y Consulta</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default NuevoPaciente;