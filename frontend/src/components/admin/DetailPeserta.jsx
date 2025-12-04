import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import { ArrowLeft, User, Mail, Phone, Calendar, Users, FileText, CheckCircle, Clock } from "lucide-react";

// Fungsi untuk mendapatkan inisial nama, diambil dari logika sebelumnya
const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ').filter(n => n);
    if (parts.length > 1) {
        // Mengambil inisial dari kata pertama dan terakhir
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    // Mengambil huruf pertama jika hanya satu kata
    return parts[0][0].toUpperCase();
};

export default function DetailPeserta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPesertaDetail = async () => {
      try {
        const res = await api.get(`/peserta/${id}`);
        setPeserta(res.data);
      } catch (err) {
        console.error("Error fetching detail peserta:", err);
        setError("Gagal mengambil data peserta.");
      } finally {
        setLoading(false);
      }
    };
    fetchPesertaDetail();
  }, [id]);

  // Handler Verifikasi
  const handleVerify = async () => {
    if (!peserta) return;
    // Menggunakan custom modal, BUKAN window.confirm
    if (!window.confirm(`Apakah Anda yakin ingin memverifikasi ${peserta.namaLengkap}?`)) return; 
    
    try {
      // Asumsi endpoint verifikasi
      await api.put(`/peserta/${id}/verify`, { status: "verified" });
      setPeserta(p => ({ ...p, status: 'verified' }));
    } catch (err) {
      console.error("Error verifying:", err);
      setError("Gagal memverifikasi peserta.");
    }
  };

  if (loading) return <div className="p-6 text-center text-xl text-gray-500">Memuat detail peserta...</div>;
  if (error || !peserta) return <div className="p-6 text-center text-red-500 text-xl">{error || "Data peserta tidak ditemukan."}</div>;

  const fotoUrl = peserta.fotoKartu ? `http://localhost:5004/${peserta.fotoKartu}` : null;
  const statusClass = peserta.status === "pending" 
    ? "bg-yellow-100 text-yellow-700 border-yellow-300" 
    : peserta.status === "verified"
    ? "bg-green-100 text-green-700 border-green-300"
    : "bg-red-100 text-red-700 border-red-300";

  return (
    <div className="min-h-auto bg-gray-50">
      
      {/* Tombol Kembali */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
      >
        <ArrowLeft size={18} /> Kembali
      </button>

      {/* Konten Utama Detail */}
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-5xl mx-auto">
        
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-2">
          Detail Peserta: {peserta.namaLengkap}
        </h1>

        <div className="md:flex gap-10">
          
          {/* KOLOM KIRI: Foto & Status */}
          <div className="flex flex-col items-center mb-8 md:mb-0 md:w-1/3">
            <div className="w-64 h-64 rounded-xl overflow-hidden shadow-xl flex items-center justify-center">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={peserta.namaLengkap}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/256x256/CCCCCC/333333?text=Foto+NDK" }}
                />
              ) : (
                // Avatar Inisial sebagai fallback
                <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-7xl font-extrabold">
                    {getInitials(peserta.namaLengkap)}
                </div>
              )}
            </div>
            
            {/* Status Badge Besar */}
            <div className={`mt-6 px-5 py-2 text-md font-bold uppercase rounded-full border shadow-md ${statusClass}`}>
                Status: {peserta.status === "pending" ? "Menunggu Verifikasi" : peserta.status}
            </div>

            {/* Tombol Verifikasi */}
            {peserta.status === "pending" && (
                <button
                  onClick={handleVerify}
                  className="mt-6 w-full max-w-[250px] flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg text-lg"
                >
                  <CheckCircle size={20} /> Verifikasi
                </button>
            )}
            
          </div>

          {/* KOLOM KANAN: Informasi Detail & Dokumen */}
          <div className="md:w-2/3 space-y-6">
            
            <h2 className="text-xl font-bold text-yellow-600 border-b pb-2">Informasi Umum</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem 
                  icon={<User size={20} className="text-blue-500"/>} 
                  label="Nama Lengkap" 
                  value={peserta.namaLengkap} 
              />
              <InfoItem 
                  icon={<Phone size={20} className="text-blue-500"/>} 
                  label="Nomor Whatsapp" 
                  value={peserta.nomorWhatsapp} 
              />
              <InfoItem 
                  icon={<Calendar size={20} className="text-blue-500"/>} 
                  label="Tanggal Lahir" 
                  value={new Date(peserta.tanggalLahir).toLocaleDateString("id-ID")} 
              />
              <InfoItem 
                  icon={<Users size={20} className="text-blue-500"/>} 
                  label="Kelompok Umur" 
                  value={peserta.kelompokUmur?.nama || "N/A"} 
              />
               {peserta.email && (
                  <InfoItem 
                      icon={<Mail size={20} className="text-blue-500"/>} 
                      label="Email Peserta" 
                      value={peserta.email} 
                  />
              )}
            </div>
            
            {/* Bagian Dokumen Pendukung */}
            <div className="pt-6 border-t border-gray-100 mt-6">
                <h2 className="text-xl font-bold text-yellow-600 mb-4 border-b pb-2">Dokumen Pendukung</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DocumentLink 
                        label="Lihat Bukti Pembayaran" 
                        path={peserta.buktiTransfer} 
                        baseUrl="http://localhost:5004"
                    />
                     <DocumentLink 
                        label="Lihat Kartu Identitas" 
                        path={peserta.kartuIdentitas} 
                        baseUrl="http://localhost:5004"
                    />
                </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-komponen untuk menampilkan setiap item info (Card style)
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-shrink-0 p-2 bg-yellow-50 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
            <p className="text-lg font-bold text-gray-900 leading-snug">{value}</p>
        </div>
    </div>
);

// Sub-komponen untuk link dokumen
const DocumentLink = ({ label, path, baseUrl }) => {
    const url = path ? `${baseUrl}/${path}` : null;
    
    return (
        <a 
            href={url || "#"} 
            target={url ? "_blank" : "_self"} 
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 p-4 rounded-lg text-center font-semibold transition text-sm ${
                url 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                : "bg-gray-300 text-gray-700 cursor-not-allowed opacity-70"
            }`}
        >
            <FileText size={18} /> {label} {url ? "" : " (Tidak Ada)"}
        </a>
    );
};