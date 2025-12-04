import { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import { Eye, Trash2, Users, ChevronRight, CheckCircle, XCircle } from "lucide-react";

function Peserta() {
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");
  const selectedTournament = localStorage.getItem("selectedTournament"); 
  const selectedTournamentName = localStorage.getItem("selectedTournamentName");

  // Ambil data peserta per kelompok umur
  const fetchPeserta = async () => {
    try {
      if (!selectedTournament) {
        console.warn("⚠ Tidak ada tournament yang dipilih!");
        return;
      }

      console.log("➡ Fetch peserta untuk tournament:", selectedTournament);

      const res = await api.get(
        `/peserta/kelompok-umur?tournamentId=${selectedTournament}`
      );

      console.log("➡ Data peserta masuk:", res.data);
      setKelompokUmur(res.data);

    } catch (err) {
      console.error("Error fetch peserta:", err);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      fetchPeserta();
    }, [selectedTournament]); 

    useEffect(() => {
      const reloadPeserta = () => {
        fetchPeserta(); 
      };

      window.addEventListener("tournament-changed", reloadPeserta);

      return () => {
        window.removeEventListener("tournament-changed", reloadPeserta);
      };
    }, []);

  // Hapus peserta
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin mau hapus peserta ini?")) return;
    try {
      await api.delete(`/peserta/${id}`);
      fetchPeserta(); // refresh
    } catch (err) {
      console.error("Error delete:", err);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
 <div className="min-h-screen"> {/* Ganti bg-gray-50 menjadi bg-white untuk kontainer utama agar lebih clean */}
    
    {/* --- HEADER DAN STATISTIK GLOBAL --- */}
    <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Daftar Peserta
        </h1>
        <p className="text-md text-yellow-600 font-semibold mt-1">
            Tournament: {selectedTournamentName || "Semua Tournament"}
        </p>
    </div>

    {kelompokUmur.length === 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-xl shadow-inner border border-gray-200">
            <Users size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-lg text-gray-600">Belum ada kelompok umur atau data peserta untuk turnamen ini.</p>
        </div>
    ) : (
        <div className="space-y-10">
            {kelompokUmur.map((ku) => (
                <div
                    key={ku.id}
                    className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6"
                >
                    {/* --- HEADER KELOMPOK UMUR --- */}
                    <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            {ku.nama} <ChevronRight size={20} className="text-yellow-500" />
                        </h2>
                        <span className="inline-flex items-center px-4 py-1 text-sm font-medium text-white bg-slate-700 rounded-full shadow-md">
                            Total Peserta: {ku.peserta.length}
                        </span>
                    </div>

                    {/* --- DAFTAR PESERTA PER KELOMPOK --- */}
                    {ku.peserta.length === 0 ? (
                        <p className="text-gray-500 italic p-3 text-center">Belum ada peserta terdaftar dalam kelompok ini.</p>
                    ) : (
                       <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"> {/* Mengurangi gap */}
                        {ku.peserta.map((p) => (
                            <div
                                key={p.id}
                                // Card lebih compact, shadow halus, rounded 
                                className="bg-white border border-gray-100 rounded-xl p-4 shadow-md hover:shadow-lg transition transform hover:-translate-y-px duration-200"
                            >
                                
                                {/* Header: Status Badge dan Nama Peserta */}
                                <div className="flex justify-between items-start mb-3">
                              
                                    
                                    {/* Badge Status (Ukuran Xtra Small, lebih minimalis) */}
                                    <span
                                        className={`px-2 py-0.5 text-xs font-semibold rounded-full uppercase flex items-center gap-1 w-fit flex-shrink-0 
                                          ${p.status === "pending"
                                              ? "bg-yellow-100 text-yellow-700"
                                              : p.status === "verified"
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                    >
                                        {p.status === "verified" && <CheckCircle size={12} />}
                                        {p.status === "pending" && <Clock size={12} />} 
                                        {p.status === "rejected" && <XCircle size={12} />}
                                        {p.status}
                                    </span>
                                </div>
                                  {/* Nama Peserta (Ukuran dikurangi menjadi MD) */}
                                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                                        {p.namaLengkap}
                                    </h3>
                        

                                {/* Tombol Aksi - Footer (Ikon Saja, Ukuran Kecil) */}
                                <div className="flex gap-2 pt-3 border-t border-gray-100">
                                    
                                    {/* Tombol Detail (Primary) */}
                                    {role === "admin" && (
                                    <Link
                                        to={`/admin/detail-peserta/${p.id}`}
                                        className="p-1.5 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                                        title="Lihat Detail Peserta"
                                    >
                                        <Eye size={16} /> 
                                    </Link>
                                     )}

                                    {/* Tombol Hapus (Hanya untuk Admin) */}
                                    {role === "admin" && (
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="p-1.5 text-red-600 rounded-lg hover:bg-red-50 transition"
                                            title="Hapus Peserta"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            ))}
        </div>
    )}
</div>
  );
}

export default Peserta;
