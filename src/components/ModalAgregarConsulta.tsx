import { useState } from "react";

interface ModalAgregarConsultaProps {
    pacienteNombre: string;
    isOpen: boolean;
    onClose: () => void;
}

function ModalAgregarConsulta({ pacienteNombre, isOpen, onClose }: ModalAgregarConsultaProps) {

    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");
    const [errores, setErrores] = useState<{ fecha?: string; hora?: string }>({});

    if(!isOpen) return null;

    const validar = () => {
        const nuevosErrores: { fecha?: string; hora?: string; } = {}

        if ( !fecha ) {
            nuevosErrores.fecha = "Selecciona una fecha";
        } else {
            const hoy = new Date().toISOString().split("T")[0];

            if(fecha < hoy) {
                nuevosErrores.fecha = "La fecha no puede ser anterior a hoy";
            }
        }

        if(!hora) {
            nuevosErrores.hora = "Selecciona una hora";
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    }

    const handleAgendar = () => {
        if (validar()) {
            alert(`Consulta agendada para ${pacienteNombre} el ${fecha} a las ${hora} (por ahora solo simula).`);

            setFecha("");
            setHora("");
            setErrores({});
            onClose();
        }
    };

    const handleCerrar = () => {
        setFecha("");
        setHora("");
        setErrores({});
        onClose();
    };

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={handleCerrar}></div>

            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative z-10">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Agendar Consulta</h2>

                <p className="text-sm text-gray-500 mb-6">Selecciona día y hora para agendar una nueva consulta</p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>

                    <input 
                        type="text"
                        value={pacienteNombre}
                        disabled
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-red-500">*</span></label>

                        <input 
                            type="date"
                            value={fecha}
                            onChange={(e) => {
                                const hoy = new Date().toISOString().split("T")[0];

                                if(e.target.value >= hoy) {
                                    setFecha(e.target.value);

                                    if(errores.fecha) setErrores({ ...errores, fecha: undefined });
                                }
                            }}
                            min={new Date().toISOString().split("T")[0]}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none ${ errores.fecha ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        />

                        {errores.fecha && (
                            <p className="text-xs text-red-500 mt-1">{errores.fecha}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora <span className="text-red-500">*</span></label>

                        <select
                            value={hora}
                            onChange={(e) => {
                                setHora(e.target.value);

                                if (errores.hora) setErrores({ ...errores, hora:undefined });
                            }}
                            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none bg-white ${ errores.hora ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-teal-500" }`}
                        >
                            <option value="">--Seleccionar Hora--</option>
                            {Array.from({ length: 14 }, (_, i) => 9 + i).map((h) => 
                                ["00", "30"].map((m) => {
                                    const valor = `${String(h).padStart(2, "0")}:${m}`;

                                    return (
                                        <option key={valor} value={valor}>{valor}</option>
                                    );
                                })
                            )}
                        </select>
                        {errores.hora && (
                            <p className="text-xs text-red-500 mt-1">{errores.hora}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={handleCerrar}
                        className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >Cancelar</button>

                    <button
                        onClick={handleAgendar}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                    >Agendar consulta</button>
                </div>
            </div>
        </div>
    );
}

export default ModalAgregarConsulta;