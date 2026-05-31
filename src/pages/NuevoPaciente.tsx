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

    // Notas (Paso 1)
    const [observaciones, setObservaciones] = useState("");

    // Datos del tutor (Paso 2)
    const [nombreTutor, setNombreTutor] = useState("");
    const [parentesco, setParentesco] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");
    const [accesoAppMovil, setAccesoAppMovil] = useState(true);

    const [errores, setErrores] = useState<ErroresPaso1>({});
    const [erroresPaso2, setErroresPaso2] = useState<ErroresPaso2>({});

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
    
    const opcionesComplementaria = () => {
        if (caso === 2) {
            return ["A los 6 meses", "Antes de los 6 meses", "Después de los 6 meses", "Aún no inicia"];
        }

        if (caso === 3) {
            return ["A los 6 meses", "Antes de los 6 meses", "Después de los 6 meses", "No recuerda"];
        }

        return [];
    }

    const regexPeso = /^(0|[1-9]\d?)?(\.\d{0,3})?$/;
    const regexTalla = /^(0|[1-9]\d?)?(\.\d{0,1})?$/;

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

                    {/* Sección 4: Notas */}
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
        </div>
    );
}

export default NuevoPaciente;