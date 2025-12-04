import { X, Users, CheckCircle, Clock, XCircle, UserCheck, Eye } from "lucide-react"; 

// Komponen ini menerima data dan handler dari NavbarDashboard
export default function VerificationDrawer({ 
    isOpen, 
    onClose, 
    pendingUsers, 
    onVerify, 
    onReject,
    onViewDetail
}) {
    
    const drawerClasses = isOpen 
        ? "translate-x-0" 
        : "translate-x-full";
        
    // Fungsi untuk mendapatkan inisial nama
    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.split(' ').filter(n => n);
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0][0].toUpperCase();
    }


    return (
        <>
            {/* 1. Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/30 z-[99] transition-opacity duration-300"
                    onClick={onClose}
                ></div>
            )}

            {/* 2. Drawer Utama */}
            <div
                className={`fixed top-0 right-0 w-full sm:w-[28rem] bg-white h-full shadow-2xl z-[100] p-6 
                    transition-transform duration-500 ease-in-out ${drawerClasses}`}
            >
                {/* Header Drawer */}
                <div className="flex justify-between items-center pb-4 border-b border-yellow-500 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <UserCheck size={28} className="text-blue-600"/> Verifikasi Peserta
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition p-1">
                        <X size={24} />
                    </button>
                </div>

                {/* Status Notifikasi */}
                {pendingUsers && pendingUsers.length > 0 && (
                     <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded-lg mb-6 shadow-sm">
                        <p className="font-semibold text-sm">
                            <Clock size={16} className="inline mr-1"/> 
                            Ada **{pendingUsers.length}** peserta yang menunggu tindakan Anda.
                        </p>
                    </div>
                )}
                

                {/* Konten Daftar Peserta Pending */}
                <div className="space-y-4 overflow-y-auto h-[calc(100%-120px)] pb-10">
                    {pendingUsers && pendingUsers.length > 0 ? (
                        pendingUsers.map((p) => (
                            <div 
                                key={p.id} 
                                className="bg-white p-4 rounded-xl border border-gray-200 shadow hover:shadow-md transition"
                            >
                                <div className="flex justify-start items-center gap-4 mb-3">
                                    {/* Avatar Inisial */}
                                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                                        {getInitials(p.namaLengkap)} 
                                    </div>
                                    
                                    {/* Nama & Email */}
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg text-gray-900 leading-snug truncate">{p.namaLengkap}</h3>
                                        <p className="text-xs text-gray-500 truncate">{p.email}</p>
                                    </div>
                                </div>
                                
                                {/* Tombol Aksi */}
                                <div className="flex gap-3 text-sm mt-3 pt-3 border-t border-gray-100">
                                    <button 
                                        onClick={() => onVerify(p.id)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium"
                                    >
                                        <CheckCircle size={16}/> Verifikasi
                                    </button>
                                    <button 
                                        onClick={() => onReject(p.id)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
                                    >
                                        <XCircle size={16}/> Tolak
                                    </button>
                                    <button 
                                        onClick={() => onViewDetail(p.id)}
                                        className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition flex items-center justify-center"
                                        title="Lihat Detail"
                                    >
                                        <Eye size={16}/>
                                    </button>
                                </div>
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