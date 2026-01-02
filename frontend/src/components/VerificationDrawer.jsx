import { X, Users, CheckCircle, Clock, XCircle, UserCheck, Eye, Send } from "lucide-react"; 
import { useState } from "react"; // Tambahkan useState

export default function VerificationDrawer({ 
    isOpen, 
    onClose, 
    pendingUsers, 
    onVerify, 
    onReject, // Sekarang menerima (id, message)
    onViewDetail
}) {
    // State untuk melacak user mana yang sedang diproses penolakannya
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectMessage, setRejectMessage] = useState("");

    const drawerClasses = isOpen ? "translate-x-0" : "translate-x-full";

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ').filter(n => n);
        if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return parts[0][0].toUpperCase();
    }

    // Fungsi untuk reset state saat batal atau sukses
    const cancelReject = () => {
        setRejectingId(null);
        setRejectMessage("");
    }

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/30 z-[99]" onClick={onClose}></div>
            )}

            <div className={`fixed top-0 right-0 w-full sm:w-[28rem] bg-white h-full shadow-2xl z-[100] p-6 
                    transition-transform duration-500 ease-in-out ${drawerClasses}`}>
                
                <div className="flex justify-between items-center pb-4 border-b border-yellow-500 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <UserCheck size={28} className="text-blue-600"/> Verifikasi Peserta
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition p-1">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 overflow-y-auto h-[calc(100%-120px)] pb-10">
                    {pendingUsers && pendingUsers.length > 0 ? (
                        pendingUsers.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow hover:shadow-md transition">
                                <div className="flex justify-start items-center gap-4 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {getInitials(p.namaLengkap)} 
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg text-gray-900 leading-snug truncate">{p.namaLengkap}</h3>
                                        <p className="text-xs text-gray-500 truncate">{p.noWa || p.email}</p>
                                    </div>
                                </div>
                                
                                {/* Form Alasan Penolakan (Muncul jika tombol tolak diklik) */}
                                {rejectingId === p.id ? (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                        <textarea 
                                            className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-red-500 outline-none"
                                            placeholder="Tulis alasan penolakan (contoh: Foto KTP tidak jelas)..."
                                            rows="3"
                                            value={rejectMessage}
                                            onChange={(e) => setRejectMessage(e.target.value)}
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={() => {
                                                    onReject(p.id, rejectMessage);
                                                    cancelReject();
                                                }}
                                                className="flex-1 bg-red-600 text-white py-1.5 rounded text-sm font-medium flex items-center justify-center gap-1"
                                            >
                                                <Send size={14}/> Kirim & WA
                                            </button>
                                            <button 
                                                onClick={cancelReject}
                                                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                                            >
                                                Batal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 text-sm mt-3 pt-3 border-t border-gray-100">
                                        <button 
                                            onClick={() => onVerify(p.id)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                        >
                                            <CheckCircle size={16}/> Verifikasi
                                        </button>
                                        <button 
                                            onClick={() => setRejectingId(p.id)}
                                            className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                        >
                                            <XCircle size={16}/> Tolak
                                        </button>
                                        <button 
                                            onClick={() => onViewDetail(p.id)}
                                            className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                            title="Lihat Detail"
                                        >
                                            <Eye size={16}/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                            <UserCheck size={32} className="mx-auto mb-3 text-green-500"/>
                            <p className="text-lg text-gray-600">Semua peserta telah diverifikasi!</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}