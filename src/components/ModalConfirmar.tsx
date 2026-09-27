import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoProcesando?: string;
  textoCancelar?: string;
  procesando?: boolean;
  error?: string;
}

/* Confirmación para acciones destructivas: eliminar una medición, cancelar una cita y similares */
function ModalConfirmar({
  isOpen,
  onClose,
  onConfirmar,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  textoProcesando = "Procesando...",
  textoCancelar = "Cancelar",
  procesando = false,
  error = "",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 modal-backdrop"
        onClick={onClose}
      ></div>

      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative z-10 modal-content">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 pulse-danger flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
        </div>

        <p className="text-sm text-gray-600 mb-6">{mensaje}</p>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={procesando}
            className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {textoCancelar}
          </button>

          <button
            onClick={onConfirmar}
            disabled={procesando}
            className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {procesando ? textoProcesando : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmar;
