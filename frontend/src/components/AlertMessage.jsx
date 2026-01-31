import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function AlertMessage({ type = "success", message, onClose, children }) {
  if (!message) return null;

  const config = {
    success: {
      title: "Berhasil",
      icon: <CheckCircle size={52} className="text-green-500" />,
      ring: "ring-green-300",
      gradient: "from-green-50 to-white",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      title: "Gagal",
      icon: <XCircle size={52} className="text-red-500" />,
      ring: "ring-red-300",
      gradient: "from-red-50 to-white",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      title: "Peringatan",
      icon: <AlertTriangle size={52} className="text-yellow-500" />,
      ring: "ring-yellow-300",
      gradient: "from-yellow-50 to-white",
      button: "bg-yellow-500 hover:bg-yellow-600",
    },
  };

  const { title, icon, ring, button, gradient } = config[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`bg-gradient-to-b ${gradient} w-full max-w-sm mx-4 rounded-3xl shadow-2xl p-6 animate-in zoom-in duration-200`}
      >
        {/* ICON */}
        <div
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-white ring-4 ${ring} shadow`}
        >
          {icon}
        </div>

        {/* TEXT */}
        <div className="mt-5 text-center">
          <h2 className="text-2xl font-extrabold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {message}
          </p>
        </div>

        {/* ACTION */}
        {children ? (
          <div className="mt-6 flex gap-3 justify-center">
            {children}
          </div>
        ) : (
          <button
            onClick={onClose}
            className={`mt-6 w-full py-3 rounded-xl text-white font-bold tracking-wide transition transform hover:scale-[1.02] active:scale-95 ${button}`}
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}
