import { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import { Trash2, Eye } from "lucide-react";


function Peserta() {
  const [kelompokUmur, setKelompokUmur] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');

  // Ambil data peserta per kelompok umur
  const fetchPeserta = async () => {
    try {
      const res = await api.get("/peserta/kelompok-umur");
      setKelompokUmur(res.data);
    } catch (err) {
      console.error("Error fetch peserta:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeserta();
  }, []);

  // Hapus peserta
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin mau hapus peserta ini?")) return;
    try {
      await api.delete(`/peserta/${id}`);
      fetchPeserta(); // refresh data setelah hapus
    } catch (err) {
      console.error("Error delete:", err);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-yellow-600 text-center">
        👥 Daftar Peserta per Kelompok Umur
      </h1>

      {kelompokUmur.length === 0 ? (
        <p className="text-center text-gray-600">Belum ada data</p>
      ) : (
        <div className="space-y-6">
          {kelompokUmur.map((ku) => (
            <div
              key={ku.id}
              className="bg-white border border-gray-200 rounded-xl shadow-md p-5"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">{ku.nama}</h2>
                <p className="text-sm text-gray-500">
                  Total Peserta: {ku.peserta.length}
                </p>
              </div>

              {ku.peserta.length === 0 ? (
                <p className="text-gray-500">Belum ada peserta</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {ku.peserta.map((p) => (
                    <div
                      key={p.id}
                      className="bg-gradient-to-b from-yellow-50 to-white rounded-xl px-5 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer flex flex-col justify-around"
                      style={{ minHeight: "200px" }}
                    >
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">
                          {p.namaLengkap}
                        </h3>

                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            p.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : p.status === "verified"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/admin/detail-peserta/${p.id}`}
                          className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition transform hover:scale-105"
                        >
                          <Eye size={16} /> Detail
                        </Link>

                        {/* ✅ Tombol hapus hanya muncul kalau role = admin */}
                        {role === "admin" && (
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="flex items-center justify-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition transform hover:scale-105"
                          >
                            <Trash2 size={16} /> Hapus
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
