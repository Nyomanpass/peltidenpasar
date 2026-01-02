import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { ArrowLeft, User, Phone, Calendar, Users, FileText, CheckCircle, X, Bell, XCircle, Send } from "lucide-react";

export default function DetailPeserta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // State baru untuk fitur Tolak
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectMessage, setRejectMessage] = useState("");

  const BASE_URL = "http://localhost:5004";

  useEffect(() => {
    fetchPesertaDetail();
    fetchPendingTotal();
  }, [id]);

  const fetchPesertaDetail = async () => {
    try {
      const res = await api.get(`/peserta/${id}`);
      setPeserta(res.data);
    } catch (err) {
      setError("Gagal mengambil data peserta.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTotal = async () => {
    try {
      const res = await api.get("/peserta?status=pending");
      setPendingCount(res.data.length);
    } catch (err) { console.error(err); }
  };

  // HANDLER VERIFIKASI (SETUJU)
  const handleVerify = async () => {
    if (!window.confirm(`Verifikasi ${peserta.namaLengkap}?`)) return;
    try {
      await api.put(`/peserta/${id}/verify`, { status: "verified" });
      setPeserta(p => ({ ...p, status: 'verified' }));
      fetchPendingTotal();
      alert("Peserta berhasil diverifikasi! ✅");
    } catch (err) { alert("Gagal memverifikasi."); }
  };

  // HANDLER TOLAK (REJECT)
  const handleReject = async () => {
    if (!rejectMessage) {
      alert("Mohon masukkan alasan penolakan.");
      return;
    }

    try {
      // 1. Update status di backend
      await api.put(`/peserta/${id}/verify`, { 
        status: "rejected", 
        alasan: rejectMessage 
      });

      // 2. Logika WhatsApp
      let phone = peserta.nomorWhatsapp;
      if (phone) {
        if (phone.startsWith("0")) phone = "62" + phone.slice(1);
        const text = `Halo *${peserta.namaLengkap}*,\n\nMohon maaf, pendaftaran Anda di PELTI Denpasar *DITOLAK* dengan alasan:\n\n_"${rejectMessage}"_\n\nSilakan melakukan pendaftaran ulang dengan data yang benar. Terima kasih.`;
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, "_blank");
      }

      alert("Peserta ditolak dan pesan WA telah disiapkan.");
      navigate(-1); // Kembali ke list karena data sudah ditolak/dihapus
    } catch (error) {
      console.error(error);
      alert("Gagal memproses penolakan.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat data...</div>;
  if (error || !peserta) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      
      {/* Modal Popup Gambar (Tetap sama) */}
      {modalImage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4" onClick={() => setModalImage(null)}>
          <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalImage(null)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"><X size={24} /></button>
            <div className="p-2"><img src={modalImage} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-lg" /></div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black bg-white rounded-lg border border-gray-200 shadow-sm"><ArrowLeft size={18} /> Kembali</button>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg animate-pulse">
            <Bell size={18} /> <span className="text-sm font-bold">{pendingCount} Peserta Menunggu</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className={`h-4 ${peserta.status === 'verified' ? 'bg-green-500' : peserta.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">{peserta.namaLengkap}</h1>
              <p className="text-gray-500">Status: <span className="font-bold">{peserta.status.toUpperCase()}</span></p>
            </div>
            <div className={`px-6 py-2 rounded-full font-bold text-sm border shadow-sm ${
              peserta.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {peserta.status.toUpperCase()}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* KOLOM KIRI: DATA PRIBADI & AKSI */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><User size={20} className="text-blue-500" /> Data Pribadi</h2>
              <div className="grid gap-3">
                <InfoRow label="Whatsapp" value={peserta.nomorWhatsapp} icon={<Phone size={16}/>} />
                <InfoRow label="Tgl Lahir" value={new Date(peserta.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })} icon={<Calendar size={16}/>} />
                <InfoRow label="Kelompok Umur" value={peserta.kelompokUmur?.nama || "Umum"} icon={<Users size={16}/>} />
              </div>

              {/* TOMBOL AKSI VERIFIKASI / TOLAK */}
              {peserta.status === "pending" && (
                <div className="mt-8 space-y-4">
                  {!isRejecting ? (
                    <div className="flex gap-4">
                      <button onClick={handleVerify} className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg transition-transform active:scale-95">
                        <CheckCircle size={22} /> Verifikasi
                      </button>
                      <button onClick={() => setIsRejecting(true)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 shadow-lg transition-transform active:scale-95">
                        <XCircle size={22} /> Tolak
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-red-700 mb-2">Alasan Penolakan:</label>
                      <textarea 
                        className="w-full p-3 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm"
                        placeholder="Contoh: Bukti transfer tidak terbaca / palsu..."
                        rows="3"
                        value={rejectMessage}
                        onChange={(e) => setRejectMessage(e.target.value)}
                      />
                      <div className="flex gap-2 mt-3">
                        <button onClick={handleReject} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700">
                          <Send size={18}/> Kirim & WA
                        </button>
                        <button onClick={() => setIsRejecting(false)} className="px-5 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300">Batal</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* KOLOM KANAN: DOKUMEN */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><FileText size={20} className="text-orange-500" /> Dokumen</h2>
              <div className="flex flex-col gap-4">
                <DocButton label="Bukti Pembayaran" path={peserta.buktiBayar} baseUrl={BASE_URL} onOpen={setModalImage} color="bg-emerald-600" />
                <DocButton label="Kartu Identitas (KK/KTP)" path={peserta.fotoKartu} baseUrl={BASE_URL} onOpen={setModalImage} color="bg-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Pembantu (InfoRow & DocButton) sama dengan sebelumnya...
function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-2 bg-white rounded-lg text-blue-600">{icon}</div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
        <p className="text-gray-800 font-bold">{value}</p>
      </div>
    </div>
  );
}

function DocButton({ label, path, baseUrl, onOpen, color }) {
  const isExist = !!path;
  return (
    <button onClick={() => isExist && onOpen(`${baseUrl}/${path}`)} disabled={!isExist} className={`flex items-center justify-between w-full p-5 rounded-2xl font-bold transition-all ${isExist ? `${color} text-white shadow-md hover:scale-[1.01]` : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
      <div className="flex items-center gap-3"><FileText size={20} /><span>{label}</span></div>
      <span className="text-[10px] bg-white/20 px-2 py-1 rounded">{isExist ? "LIHAT" : "N/A"}</span>
    </button>
  );
}