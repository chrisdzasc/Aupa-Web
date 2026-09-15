const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

interface OpcionesPeticion {
  metodo?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  requiereAuth?: boolean;
}

export const peticion = async (ruta: string, opciones: OpcionesPeticion = {}) => {
  const { metodo = "GET", body, requiereAuth = true } = opciones;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiereAuth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: metodo,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || "Error en la petición");
  }

  return datos;
};