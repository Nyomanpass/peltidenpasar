import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function AlertMessage({ type = "success", message, onClose }) {
  if (!message) return null;

  const config = {
    success: {
      title: "Berhasil",
      icon: <CheckCircle size={48} className="text-green-500" />,
      ring: "ring-green-200",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      title: "Gagal",
      icon: <XCircle size={48} className="text-red-500" />,
      ring: "ring-red-200",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      title: "Peringatan",
      icon: <AlertTriangle size={48} className="text-yellow-500" />,
      ring: "ring-yellow-200",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
  };

  const { title, icon, ring, button } = config[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm mx-4 rounded-2xl shadow-2xl p-6 animate-in zoom-in duration-200">
        
        {/* ICON */}
        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-gray-50 ring-4 ${ring}`}>
          {icon}
        </div>

        {/* TEXT */}
        <div className="mt-4 text-center">
          <h2 className="text-xl font-extrabold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        </div>

        {/* BUTTON */}
        <button
          onClick={onClose}
          className={`mt-6 w-full py-2.5 rounded-xl text-white font-bold transition ${button}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
