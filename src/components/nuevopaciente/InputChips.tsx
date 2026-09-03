import { useState } from "react";
import { X, Plus } from "lucide-react";

interface InputChipsProps {
  valores: string[];
  onChange: (valores: string[]) => void;
  placeholder?: string;
  colorChip?: "rojo" | "ambar";
  maxLength?: number;
}

function InputChips({
  valores,
  onChange,
  placeholder = "Escribe y presiona Enter",
  colorChip = "rojo",
  maxLength = 40,
}: InputChipsProps) {
  const [texto, setTexto] = useState("");

  const colores = {
    rojo: "bg-red-50 text-red-700 border-red-200",
    ambar: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const agregar = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    // Evitar duplicados (sin importar mayúsculas)
    const yaExiste = valores.some((v) => v.toLowerCase() === limpio.toLowerCase());
    if (yaExiste) {
      setTexto("");
      return;
    }
    onChange([...valores, limpio]);
    setTexto("");
  };

  const eliminar = (indice: number) => {
    onChange(valores.filter((_, i) => i !== indice));
  };

  const manejarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregar();
    }
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={manejarTecla}
          maxLength={maxLength}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
        />
        <button
          type="button"
          onClick={agregar}
          className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
          title="Agregar"
        >
          <Plus size={18} />
        </button>
      </div>

      {valores.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {valores.map((valor, i) => (
            <span
              key={i}
              className={`inline-flex items-start gap-1.5 px-3 py-1 rounded-2xl text-xs font-medium border max-w-full ${colores[colorChip]}`}
            >
              <span className="break-words min-w-0">{valor}</span>
              <button
                type="button"
                onClick={() => eliminar(i)}
                className="hover:opacity-70 transition-opacity shrink-0 mt-0.5"
                title="Eliminar"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default InputChips;