// Separa una fecha "YYYY-MM-DD" en sus partes numéricas.
// El slice(0, 10) tolera también el formato largo "2024-03-10T00:00:00.000Z".
// Nunca se usa new Date(fecha) porque el navegador interpretaría esa cadena
// como medianoche UTC y en México mostraría el día anterior.
const partesFecha = (fecha: string) => {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  return { anio, mes, dia };
};

// Calcula la edad a partir de la fecha de nacimiento y la devuelve legible
export const calcularEdad = (fechaNacimiento: string): string => {
  const { anio, mes, dia } = partesFecha(fechaNacimiento);
  const hoy = new Date();

  let anios = hoy.getFullYear() - anio;
  let meses = hoy.getMonth() + 1 - mes;

  if (hoy.getDate() < dia) {
    meses--;
  }

  if (meses < 0) {
    anios--;
    meses += 12;
  }

  if (anios === 0) {
    return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  }

  if (meses === 0) {
    return `${anios} ${anios === 1 ? "año" : "años"}`;
  }

  return `${anios} ${anios === 1 ? "año" : "años"}, ${meses} ${meses === 1 ? "mes" : "meses"}`;
};

// Calcula la edad en meses cumplidos, que es la unidad que usan
// los estándares de crecimiento de la OMS
export const calcularEdadMeses = (fechaNacimiento: string): number => {
  const { anio, mes, dia } = partesFecha(fechaNacimiento);
  const hoy = new Date();

  let meses = (hoy.getFullYear() - anio) * 12 + (hoy.getMonth() + 1 - mes);

  if (hoy.getDate() < dia) {
    meses--;
  }

  return Math.max(0, meses);
};

// Formatea una fecha "2026-09-15" a "15 Sep 2026"
export const formatearFecha = (fecha: string | null | undefined): string => {
  if (!fecha) return "Sin consultas";

  const { anio, mes, dia } = partesFecha(fecha);
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  return `${String(dia).padStart(2, "0")} ${meses[mes - 1]} ${anio}`;
};

// Obtiene las iniciales de un nombre completo
export const obtenerIniciales = (nombre: string): string => {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
};

// Formatea 3312434323 → "33 1243 4323"
export const formatearTelefono = (telefono: string): string => {
  if (telefono.length !== 10) return telefono;
  return `${telefono.slice(0, 2)} ${telefono.slice(2, 6)} ${telefono.slice(6)}`;
};
