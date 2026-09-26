import { useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Curva } from "../services/curvas.service";
import {
  prepararDatos,
  bandasVisibles,
  claveBanda,
  colorBanda,
} from "../utils/curvas";

interface Props {
  curva: Curva;
  indiceSeleccionado: number | null;
  onSeleccionar: (indice: number) => void;
  onEnfocar: (indice: number | null) => void;
}

function GraficaCrecimiento({
  curva,
  indiceSeleccionado,
  onSeleccionar,
  onEnfocar,
}: Props) {
  const datos = prepararDatos(curva);
  const bandas = bandasVisibles(curva.indicador);

  const etiquetaX = curva.eje.tipo === "edad" ? "Edad (meses)" : "Talla (cm)";

  // El último punto del paciente se dibuja más grande y relleno
  const ultimoX = curva.paciente[curva.paciente.length - 1]?.x;

  // Grupo de curvas resaltado al pasar el mouse por la leyenda, null significa que todas se ven normales.
  const [resaltado, setResaltado] = useState<string | null>(null);

  // A qué grupo de la leyenda pertenece cada curva
  const grupoDe = (z: number) => `sd${Math.abs(z)}`;

  const opacidadDe = (grupo: string) =>
    resaltado === null || resaltado === grupo ? 1 : 0.2;

  // Referencias que se explican en la leyenda.
  const leyenda = [
    { grupo: "paciente", color: "#2563eb", etiqueta: "Paciente", grosor: 3.5 },
    { grupo: "sd0", color: "#16a34a", etiqueta: "Mediana (0 DE)", grosor: 2 },
    ...(bandas.includes(1)
      ? [{ grupo: "sd1", color: "#f59e0b", etiqueta: "±1 DE", grosor: 1.5 }]
      : []),
    { grupo: "sd2", color: "#dc2626", etiqueta: "±2 DE", grosor: 1.5 },
    { grupo: "sd3", color: "#0f172a", etiqueta: "±3 DE", grosor: 1.5 },
  ];

  // El eje Y se ajusta al rango de las curvas, como en las gráficas de la
  // OMS. Empezar en cero dejaría la mitad inferior vacía.
  const valores = datos.flatMap((punto) =>
    Object.entries(punto)
      .filter(([clave]) => clave !== "x")
      .map(([, valor]) => valor as number)
      .filter((valor) => valor != null),
  );

  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const margen = (maximo - minimo) * 0.05;

  const dominioY: [number, number] = [
    Math.floor((minimo - margen) / 5) * 5,
    Math.ceil((maximo + margen) / 5) * 5,
  ];

  // Marcas del eje Y, para que el eje derecho muestre la misma escala que el izquierdo, como en las gráficas impresas de la OMS
  const marcasY = (() => {
    const [min, max] = dominioY;
    const pasos = 7;
    const intervalo = Math.ceil((max - min) / pasos / 5) * 5;
    const marcas: number[] = [];

    for (let valor = min; valor <= max; valor += intervalo) {
      marcas.push(valor);
    }

    return marcas;
  })();

  // Punto personalizado de la línea del paciente
  const puntoPaciente = (props: any) => {
    const { cx, cy, payload } = props;
    if (cx == null || cy == null || payload.paciente == null) return <></>;

    const indice = curva.paciente.findIndex((p) => p.x === payload.x);
    const esUltimo = payload.x === ultimoX;
    const activo = indice === indiceSeleccionado;

    return (
      <g>
        {/* Área invisible más grande, para que sea fácil apuntarle */}
        <circle
          cx={cx}
          cy={cy}
          r={14}
          fill="transparent"
          style={{ outline: "none" }}
          tabIndex={-1}
          className="cursor-pointer"
          onMouseEnter={() => indice >= 0 && onEnfocar(indice)}
          onMouseLeave={() => onEnfocar(null)}
          onClick={() => indice >= 0 && onSeleccionar(indice)}
        />
        <circle
          cx={cx}
          cy={cy}
          r={activo ? 7 : 5}
          fill={activo ? "#1d4ed8" : "#ffffff"}
          stroke={activo ? "#1d4ed8" : "#2563eb"}
          strokeWidth={2.5}
          opacity={opacidadDe("paciente")}
          className="pointer-events-none transition-all"
        />
      </g>
    );
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 mb-2">
        {leyenda.map((item) => (
          <span
            key={item.etiqueta}
            onMouseEnter={() => setResaltado(item.grupo)}
            onMouseLeave={() => setResaltado(null)}
            className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
              resaltado === item.grupo ? "text-gray-700" : "text-gray-400"
            }`}
          >
            <span
              className="w-4 rounded-full transition-all"
              style={{
                height:
                  resaltado === item.grupo ? item.grosor + 1 : item.grosor,
                backgroundColor: item.color,
              }}
            ></span>
            {item.etiqueta}
          </span>
        ))}
      </div>

      <div className="w-full h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={datos}
            margin={{ top: 10, right: 34, bottom: 28, left: 4 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeWidth={1} />

            <XAxis
              dataKey="x"
              type="number"
              domain={[curva.eje.min, curva.eje.max]}
              tickCount={9}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              stroke="#cbd5e1"
              label={{
                value: etiquetaX,
                position: "insideBottom",
                offset: -18,
                style: {
                  fontSize: 11,
                  fill: "#94a3b8",
                  letterSpacing: "0.05em",
                },
              }}
            />

            <YAxis
              domain={dominioY}
              ticks={marcasY}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              stroke="#cbd5e1"
              width={44}
              label={{
                value: `${curva.etiqueta.split(" ")[0]} (${curva.unidadValor})`,
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 11, fill: "#94a3b8", textAnchor: "middle" },
              }}
            />

            {/* Curvas de referencia de la OMS */}
            {bandas.map((z) => (
              <Line
                key={z}
                dataKey={claveBanda(z)}
                stroke={colorBanda(z)}
                strokeWidth={
                  resaltado === grupoDe(z) ? 2.6 : z === 0 ? 1.8 : 1.2
                }
                strokeOpacity={opacidadDe(grupoDe(z))}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                connectNulls
              >
                <LabelList
                  dataKey={claveBanda(z)}
                  position="right"
                  content={(props: any) => {
                    if (props.index !== datos.length - 1) return null;
                    return (
                      <text
                        x={props.x + 6}
                        y={props.y + 4}
                        fill={colorBanda(z)}
                        fontSize={12}
                        fontWeight={700}
                      >
                        {z}
                      </text>
                    );
                  }}
                />
              </Line>
            ))}

            {/* Línea del paciente */}
            <Line
              dataKey="paciente"
              stroke="#2563eb"
              strokeWidth={resaltado === "paciente" ? 4.5 : 3.5}
              strokeOpacity={opacidadDe("paciente")}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={puntoPaciente}
              activeDot={false}
              isAnimationActive={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default GraficaCrecimiento;
