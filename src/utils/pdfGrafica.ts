import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Curva } from "../services/curvas.service";
import {
  formatearFecha,
  calcularEdadEnFecha,
  obtenerIniciales,
} from "./fechas";

export interface DatosPDF {
  paciente: {
    nombre: string;
    numeroExpediente: string;
    sexo: "M" | "F";
    fechaNacimiento: string;
  };
  nutriologo: {
    nombre: string;
    cedulaProfesional?: string | null;
  };
  curva: Curva;
}

// Hoja carta horizontal, en milímetros
const ANCHO = 279;
const ALTO = 216;
const MARGEN = 16;
const ANCHO_UTIL = ANCHO - MARGEN * 2;

const AZUL: [number, number, number] = [29, 78, 216];
const TEAL: [number, number, number] = [13, 148, 136];
const NARANJA: [number, number, number] = [234, 138, 39];
const GRIS: [number, number, number] = [100, 116, 139];
const GRIS_CLARO: [number, number, number] = [226, 232, 240];
const GRIS_FONDO: [number, number, number] = [248, 250, 252];
const NEGRO: [number, number, number] = [15, 23, 42];
const ROSA_FONDO: [number, number, number] = [252, 231, 243];
const ROSA_TEXTO: [number, number, number] = [219, 39, 119];
const TEAL_FONDO: [number, number, number] = [204, 251, 241];

const fechaDeHoy = (): string =>
  new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Mexico_City",
  }).format(new Date());

export const crearDocumento = (): jsPDF =>
  new jsPDF({ unit: "mm", format: "letter", orientation: "landscape" });

/** Arma el nombre del archivo, por ejemplo: Aupa_EXP-0003_talla-edad_2026-09-26.pdf */
export const nombreArchivo = (expediente: string, sufijo: string): string =>
  `Aupa_${expediente}_${sufijo}_${new Date().toISOString().slice(0, 10)}.pdf`;

export const agregarPaginaGrafica = async (
  pdf: jsPDF,
  elemento: HTMLElement,
  datos: DatosPDF,
  esPrimera = true,
): Promise<void> => {
  const { paciente, nutriologo, curva } = datos;

  const lienzo = await html2canvas(elemento, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
  });

  if (!esPrimera) {
    pdf.addPage();
  }

  let y = MARGEN;

  // ---- Encabezado ----
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...TEAL);
  pdf.text("Aú", MARGEN, y + 4);
  pdf.setTextColor(...NARANJA);
  pdf.text("pa", MARGEN + pdf.getTextWidth("Aú"), y + 4);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...GRIS);
  pdf.text(nutriologo.nombre, ANCHO - MARGEN, y, { align: "right" });

  if (nutriologo.cedulaProfesional) {
    pdf.text(
      `Cédula profesional ${nutriologo.cedulaProfesional}`,
      ANCHO - MARGEN,
      y + 4.5,
      { align: "right" },
    );
  }

  y += 11;

  // ---- Tarjeta del paciente ----
  const ALTO_TARJETA = 24;

  pdf.setDrawColor(...GRIS_CLARO);
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(MARGEN, y, ANCHO_UTIL, ALTO_TARJETA, 2.5, 2.5, "FD");

  const esFemenino = paciente.sexo === "F";
  const centroX = MARGEN + 14;
  const centroY = y + ALTO_TARJETA / 2;

  pdf.setFillColor(...(esFemenino ? ROSA_FONDO : TEAL_FONDO));
  pdf.circle(centroX, centroY, 8, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(...(esFemenino ? ROSA_TEXTO : TEAL));
  pdf.text(obtenerIniciales(paciente.nombre), centroX, centroY + 1.5, {
    align: "center",
  });

  const textoX = MARGEN + 27;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(...NEGRO);
  pdf.text(paciente.nombre, textoX, centroY - 1.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(...GRIS);
  pdf.text(
    [
      esFemenino ? "Femenino" : "Masculino",
      `Nacimiento: ${formatearFecha(paciente.fechaNacimiento)}`,
    ].join("   ·   "),
    textoX,
    centroY + 5,
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...GRIS);
  pdf.text(paciente.numeroExpediente, ANCHO - MARGEN - 6, centroY + 1, {
    align: "right",
  });

  y += ALTO_TARJETA + 8;

  // ---- Título de la gráfica ----
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...NEGRO);
  pdf.text(curva.etiqueta, MARGEN, y);

  const rangoEje =
    curva.eje.tipo === "edad"
      ? `${Math.round(curva.eje.min)} a ${Math.round(curva.eje.max)} meses`
      : `${Math.round(curva.eje.min)} a ${Math.round(curva.eje.max)} cm`;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...GRIS);
  pdf.text(
    `${
      curva.referencia === "OMS 2006"
        ? "Patrones de crecimiento infantil de la OMS"
        : "Referencias de crecimiento de la OMS"
    }  ·  ${curva.sexo === "F" ? "Niñas" : "Niños"}  ·  ${rangoEje}`,
    MARGEN,
    y + 5,
  );

  y += 10;

  // ---- La gráfica ----
  const ALTO_RESUMEN = 24;
  const ALTO_PIE = 16;
  const altoDisponible = ALTO - y - ALTO_RESUMEN - ALTO_PIE - 20;

  const proporcion = lienzo.height / lienzo.width;
  let anchoImagen = ANCHO_UTIL;
  let altoImagen = anchoImagen * proporcion;

  if (altoImagen > altoDisponible) {
    altoImagen = altoDisponible;
    anchoImagen = altoImagen / proporcion;
  }

  const xImagen = MARGEN + (ANCHO_UTIL - anchoImagen) / 2;

  pdf.addImage(
    lienzo.toDataURL("image/png"),
    "PNG",
    xImagen,
    y,
    anchoImagen,
    altoImagen,
  );

  y += altoImagen + 7;

  // ---- Resumen de la última medición ----
  const ultima = curva.paciente[curva.paciente.length - 1];

  if (ultima) {
    const SEPARACION = 5;
    const anchoTarjeta = (ANCHO_UTIL - SEPARACION * 2) / 3;

    const zTexto =
      ultima.z !== null
        ? `${ultima.z > 0 ? "+" : ""}${ultima.z.toFixed(2)}`
        : "—";

    const tarjetas = [
      {
        etiqueta: curva.etiqueta.split(" ")[0].toUpperCase(),
        valor: `${ultima.valor}`,
        unidad: curva.unidadValor,
        detalle: null as string | null,
        color: NEGRO,
      },
      {
        etiqueta: "PUNTUACIÓN Z",
        valor: zTexto,
        unidad: null,
        detalle: null,
        color: AZUL,
      },
      {
        etiqueta: "FECHA DE CONSULTA",
        valor: formatearFecha(ultima.fechaConsulta),
        unidad: null,
        detalle: `Edad en la consulta: ${calcularEdadEnFecha(
          paciente.fechaNacimiento,
          ultima.fechaConsulta,
        )}`,
        color: NEGRO,
      },
    ];

    tarjetas.forEach((tarjeta, i) => {
      const x = MARGEN + i * (anchoTarjeta + SEPARACION);

      pdf.setFillColor(...GRIS_FONDO);
      pdf.setDrawColor(...GRIS_CLARO);
      pdf.roundedRect(x, y, anchoTarjeta, ALTO_RESUMEN, 2.5, 2.5, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...GRIS);
      pdf.text(tarjeta.etiqueta, x + 5, y + 6);

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(...tarjeta.color);
      pdf.text(tarjeta.valor, x + 5, y + 14);

      if (tarjeta.unidad) {
        const anchoValor = pdf.getTextWidth(tarjeta.valor);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...GRIS);
        pdf.text(tarjeta.unidad, x + 6 + anchoValor, y + 14);
      }

      if (tarjeta.detalle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...GRIS);
        pdf.text(tarjeta.detalle, x + 5, y + 19.5);
      }
    });
  }

  // ---- Pie de página ----
  const pie = ALTO - MARGEN;

  pdf.setDrawColor(...GRIS_CLARO);
  pdf.line(MARGEN, pie - 9, ANCHO - MARGEN, pie - 9);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRIS);
  pdf.text(
    "Puntuación Z calculada con el método LMS. Patrones de crecimiento infantil de la OMS (2006) para menores de 5 años y referencias de crecimiento (2007) de 5 a 19 años.",
    MARGEN,
    pie - 5,
  );
  pdf.text(`Documento generado el ${fechaDeHoy()}`, MARGEN, pie - 1);
};

/** Descarga una sola gráfica en PDF */
export const descargarGraficaPDF = async (
  elemento: HTMLElement,
  datos: DatosPDF,
): Promise<void> => {
  const pdf = crearDocumento();
  await agregarPaginaGrafica(pdf, elemento, datos);
  pdf.save(
    nombreArchivo(datos.paciente.numeroExpediente, datos.curva.indicador),
  );
};
