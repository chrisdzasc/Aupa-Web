import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function NuevoPaciente() {
    
    const navigate = useNavigate();
    const [mostrarOpcionales, setMostrarOpcionales] = useState(false);

    const [nombre, setNombre] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");
    const [sexo, setSexo] = useState("");
    const [pesoNacer, setPesoNacer] = useState("");
    const [tallaNacer, setTallaNacer] = useState("");

    const [contactoNombre, setContactoNombre] = useState("");
    const [parentesco, setParentesco] = useState("");
    const [telefono, setTelefono] = useState("");
    const [email, setEmail] = useState("");

    const [fechaConsulta, setFechaConsulta] = useState("");
    const [peso, setPeso] = useState("");
    const [talla, setTalla] = useState("");
    const [perimetroBraquial, setPerimetroBraquial] = useState("");

    const [perimetroCefalico, setPerimetroCefalico] = useState("");
    const [cintura, setCintura] = useState("");
    const [abdomen, setAbdomen] = useState("");
    const [cadera, setCadera] = useState("");
    const [pantorrilla, setPantorrilla] = useState("");

    const [errores, setErrores] = useState<{
        nombre?: string;
        fechaNacimiento?: string;
        sexo?: string;
        pesoNacer?: string;
        tallaNacer?: string;
        contactoNombre?: string;
        parentesco?: string;
        telefono?: string;
        email?: string;
    }>({});

    const validarSeccionPaciente = () => {
        const nuevosErrores: typeof errores = {};

        if(!nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio";
        } else if (nombre.trim().length < 2) {
            nuevosErrores.nombre = "El nombre debe tener al menos 2 carácteres";
        } else if (nombre.length > 100) {
            nuevosErrores.nombre = "El nombre no puede exceder 100 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(nombre)) {
            nuevosErrores.nombre = "El nombre solo puede contener letras y espacios";
        }

        if(!fechaNacimiento) {
            nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
        } else {
            const hoy = new Date();
            const fechaNac = new Date(fechaNacimiento);
            const hace18Anios = new Date();
            hace18Anios.setFullYear(hoy.getFullYear() - 18);

            if (fechaNac > hoy) {
                nuevosErrores.fechaNacimiento = "La fecha no puede ser futura";
            } else if (fechaNac < hace18Anios) {
                nuevosErrores.fechaNacimiento = "El paciente debe tener menos de 18 años";
            }
        }

        if (!sexo) {
            nuevosErrores.sexo = "Selecciona el género";
        }

        if (!pesoNacer.trim()) {
            nuevosErrores.pesoNacer = "El peso al nacer es obligatorio";
        } else {
            const num = Number(pesoNacer);

            if (isNaN(num) || num <= 0) {
                nuevosErrores.pesoNacer = "El peso debe ser mayor a 0";
            }
        }

        if (!tallaNacer.trim()) {
            nuevosErrores.tallaNacer = "La talla al nacer es obligatoria";
        } else {
            const num = Number(tallaNacer);

            if (isNaN(num) || num <= 0) {
                nuevosErrores.tallaNacer = "La talla debe ser mayor a 0";
            }
        }

        return nuevosErrores;
    }

    const validarSeccionContacto = () => {
        const nuevosErrores: typeof errores = {};

        if (!contactoNombre.trim()) {
            nuevosErrores.contactoNombre = "El nombre del familiar es obligatorio";
        } else if (contactoNombre.trim().length < 2) {
            nuevosErrores.contactoNombre = "El nombre debe tener al menos 2 caracteres";
        } else if (contactoNombre.length > 100) {
            nuevosErrores.contactoNombre = "El nombre no puede exceder 100 caracteres";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(contactoNombre)) {
            nuevosErrores.contactoNombre = "El nombre solo puede contener letras y espacios";
        }

        if(!parentesco) {
            nuevosErrores.parentesco = "Selecciona el parentesco";
        }

        if(!telefono.trim()) {
            nuevosErrores.telefono = "El telefono es obligatorio";
        } else if (!/^\d{10}$/.test(telefono)) {
            nuevosErrores.telefono = "El teléfono debe tener 10 dígitos";
        }

        if(!email.trim()) {
            nuevosErrores.email = "El email es obligatorio";
        } else if (email.length > 100) {
            nuevosErrores.email = "El email no puede exceder 100 caracteres";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nuevosErrores.email = "Ingresa un email válido";
        }

        return nuevosErrores;
    }

    const handleGuardar = () => {
        const erroresPaciente = validarSeccionPaciente();
        const erroresContacto = validarSeccionContacto();
        const todosLosErrores = {...erroresPaciente, ...erroresContacto};

        setErrores(todosLosErrores);

        if (Object.keys(todosLosErrores).length === 0) {
            alert("Paciente guardado! :) (simulación)");
            navigate("/pacientes");
        }
    };

    return(
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <Link to="/pacientes" className="text-teal-600 text-sm hover:underline mb-4 inline-block">&larr; Volver a Pacientes</Link>

                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h1>

                    <p className="text-gray-500 text-sm mt-1">Completa la información clínica básica para iniciar el seguimiento nutricional</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👤</span>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Datos del paciente</h2>
                        <p className="text-sm text-gray-500">Información básica del paciente y contacto parental</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={nombre}
                            onChange={(e) => {
                                setNombre(e.target.value);

                                if (errores.nombre) setErrores({...errores, nombre: undefined});
                            }}
                            placeholder="Jose Alberto Gonzalez Ochoa"
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.nombre ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.nombre && (
                            <p className="text-xs text-red-500 mt-1">{errores.nombre}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Género <span className="text-red-500">*</span></label>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setSexo("M")

                                    if (errores.sexo) setErrores({ ...errores, sexo: undefined });
                                }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${sexo === "M" ? "bg-teal-600 text-white border-teal-600" : errores.sexo ? "bg-white text-gray-600 border-red-400" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                            >Masculino</button>

                            <button
                                type="button"
                                onClick={() => {
                                    setSexo("F");

                                    if (errores.sexo) setErrores({ ...errores, sexo: undefined });
                                }}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${sexo === "F" ? "bg-pink-600 text-white border-pink-500" : errores.sexo ? "bg-white text-gray-600 border-red-400" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                            >Femenino</button>
                        </div>
                        {errores.sexo && (
                            <p className="text-xs text-red-500 mt-1">{errores.sexo}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento <span className="text-red-500">*</span></label>

                        <input 
                            type="date"
                            value={fechaNacimiento}
                            onChange={(e) => {
                                setFechaNacimiento(e.target.value);

                                if (errores.fechaNacimiento) setErrores({ ...errores, fechaNacimiento: undefined });
                            }}
                            className={`w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400 ${ errores.fechaNacimiento ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.fechaNacimiento && (
                            <p className="text-xs text-red-500 mt-1">{errores.fechaNacimiento}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso al nacer (kg)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={pesoNacer}
                            placeholder="0.00"
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^(0|[1-9]\d*)?(\.\d*)?$/.test(valor)) {
                                    setPesoNacer(valor);

                                    if(errores.pesoNacer) setErrores({ ...errores, pesoNacer: undefined});
                                }
                            }}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.pesoNacer ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.pesoNacer && (
                            <p className="text-xs text-red-500 mt-1">{errores.pesoNacer}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Talla al nacer (cm)</label>

                        <input 
                            type="text"
                            inputMode="decimal"
                            value={tallaNacer}
                            placeholder="0.0"
                            onChange={(e) => {
                                const valor = e.target.value;

                                if (valor === "" || /^(0|[1-9]\d*)?(\.\d*)?$/.test(valor)) {
                                    setTallaNacer(valor);

                                    if(errores.tallaNacer) setErrores({ ...errores, tallaNacer: undefined});
                                }
                            }}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.tallaNacer ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.tallaNacer && (
                            <p className="text-xs text-red-500 mt-1">{errores.tallaNacer}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">👨‍👩‍👦</span>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Contacto Familiar</h2>
                        <p className="text-sm text-gray-500">Información del tutor</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo <span className="text-red-500">*</span></label>

                        <input 
                            type="text" 
                            value={contactoNombre}
                            onChange={(e) => {
                                setContactoNombre(e.target.value);

                                if (errores.contactoNombre) setErrores({ ...errores, contactoNombre: undefined });
                            }}
                            placeholder="Ej. Christian Uriel Diaz Ascencio"
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.contactoNombre ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.contactoNombre && (
                            <p className="text-xs text-red-500 mt-1">{errores.contactoNombre}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parentesco <span className="text-erd-500">*</span></label>

                        <select 
                            value={parentesco}
                            onChange={(e) => {
                                setParentesco(e.target.value);

                                if (errores.parentesco) setErrores({ ...errores, parentesco: undefined });
                            }}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none bg-white ${ errores.parentesco ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        >
                            <option value="">Seleccionar...</option>
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Tutor">Tutor</option>
                        </select>
                        {errores.parentesco && (
                            <p className="text-xs text-red-500 mt-1">{errores.parentesco}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-red-500">*</span></label>

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
                                    
                                    if (errores.telefono) setErrores({ ...errores, telefono: undefined });
                                }
                            }}
                            placeholder="33 1234 5678"
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.telefono ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.telefono && (
                            <p className="text-xs text-red-500 mt-1">{errores.telefono}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>

                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);

                                if (errores.email) setErrores({ ...errores, email: undefined })
                            }}
                            placeholder="correo@ejemplo.com"
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.email ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />
                        {errores.email && (
                            <p className="text-xs text-red-500 mt-1">{errores.email}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📋</span>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Mediciones primera consulta</h2>

                        <p className="text-sm text-gray-500">Datos de la primera consulta</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="bloc text-sm font-medium text-gray-700 mb-1">Fecha de consulta <span className="text-red-500">*</span></label>

                        <input 
                            type="date"
                            value={fechaConsulta}
                            onChange={(e) => setFechaConsulta(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) <span className="text-red-500">*</span></label>

                        <input 
                            type="number"
                            step="0.01"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Talla (cm) <span className="text-red-500">*</span></label>

                        <input 
                            type="number"
                            step="0.1"
                            value={talla}
                            onChange={(e) => setTalla(e.target.value)}
                            placeholder="0.0"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Perímetro braquial (cm) <span className="text-red-500">*</span></label>

                        <input 
                            type="number"
                            step="0.1"
                            value={perimetroBraquial}
                            onChange={(e) => setPerimetroBraquial(e.target.value)}
                            placeholder="0.0"
                            className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setMostrarOpcionales(!mostrarOpcionales)}
                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-800 font-medium mt-2"
                >
                    <span>{mostrarOpcionales ? "▼" : "▶"}</span>
                    Mediciones Opcionales
                </button>

                {mostrarOpcionales && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Perímetro Cefálico (cm)</label>

                                <input 
                                    type="number"
                                    step="0.1"
                                    value={perimetroCefalico}
                                    onChange={(e) => setPerimetroCefalico(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cintura (cm)</label>

                                <input 
                                    type="number"
                                    step="0.1"
                                    value={cintura}
                                    onChange={(e) => setCintura(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Abdomen (cm)</label>

                                <input 
                                    type="number"
                                    step="0.1"
                                    value={abdomen}
                                    onChange={(e) => setAbdomen(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cadera (cm)</label>

                                <input 
                                    type="number"
                                    step="0.1"
                                    value={cadera}
                                    onChange={(e) => setCadera(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pantorrilla (cm)</label>

                                <input 
                                    type="number"
                                    step="0.1"
                                    value={pantorrilla}
                                    onChange={(e) => setPantorrilla(e.target.value)}
                                    placeholder="0.0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-400"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 mb-8">
                <Link to="/pacientes" className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</Link>

                <button onClick={handleGuardar} className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">Guardar Paciente</button>
            </div>
        </div>
    );
}

export default NuevoPaciente;