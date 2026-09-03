interface StepperProps {
    pasoActual: 1 | 2 | 3;
  }
  
  const pasos = [
    { numero: 1, etiqueta: "Identidad" },
    { numero: 2, etiqueta: "Contacto" },
    { numero: 3, etiqueta: "Consulta" },
  ];
  
  function Stepper({ pasoActual }: StepperProps) {
    // El progreso se mide en el centro de los círculos:
    // paso 1 = 0%, paso 2 = 50%, paso 3 = 100%
    const progreso = pasoActual === 1 ? "0%" : pasoActual === 2 ? "50%" : "100%";
  
    return (
      <div className="mb-8 w-full px-4">
        <div className="relative flex items-start justify-between">
          {/* Línea de fondo (gris) - va de centro a centro de los círculos */}
          <div className="absolute top-4 left-[16px] right-[16px] h-[3px] bg-gray-200 rounded-full"></div>
  
          {/* Línea de progreso (teal) que se llena */}
          <div
            className="absolute top-4 left-[16px] h-[3px] bg-teal-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `calc((100% - 32px) * ${pasoActual === 1 ? 0 : pasoActual === 2 ? 0.5 : 1})` }}
          ></div>
  
          {/* Círculos */}
          {pasos.map((paso) => {
            const completado = paso.numero < pasoActual;
            const activo = paso.numero === pasoActual;
            return (
              <div key={paso.numero} className="relative flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    activo
                      ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : completado
                      ? "bg-teal-600 text-white"
                      : "bg-white text-gray-400 border-2 border-gray-200"
                  }`}
                >
                  {completado ? "✓" : paso.numero}
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    activo ? "text-teal-600 font-semibold" : completado ? "text-teal-600" : "text-gray-400"
                  }`}
                >
                  {paso.etiqueta}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  export default Stepper;