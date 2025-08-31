import { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";

function PesertaList() {
  const [peserta, setPeserta] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data peserta
  const fetchPeserta = async () => {
    try {
      const res = await api.get("/peserta?status=pending");
      setPeserta(res.data);
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
      setPeserta(peserta.filter((p) => p.id !== id)); // update state
    } catch (err) {
      console.error("Error delete:", err);
    }
  };

  // Verifikasi peserta
  const handleVerify = async (id) => {
    try {
      await api.put(`/peserta/${id}/verify`, { status: "verified" });
      setPeserta(
        peserta.map((p) =>
          p.id === id ? { ...p, status: "verified" } : p
        )
      );
    } catch (err) {
      console.error("Error verify:", err);
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar Verifikasi Peserta</h1>

      {peserta.length === 0 ? (
        <p className="text-gray-600">Belum ada Verifikasi</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">No</th>
                <th className="px-4 py-2 border-b">Nama Lengkap</th>
                <th className="px-4 py-2 border-b">Tanggal Lahir</th>
                <th className="px-4 py-2 border-b">Kelompok Umur</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {peserta.map((p, index) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-sm">{index + 1}</td>
                  <td className="px-4 py-2 border-b text-sm">{p.namaLengkap}</td>
                  <td className="px-4 py-2 border-b text-sm">
                    {new Date(p.tanggalLahir).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-2 border-b text-sm">{p.kelompokUmur?.nama}</td>
                  <td className="px-4 py-2 border-b">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        p.status === "pending"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-b text-sm flex gap-2 justify-center">
                    {/* Detail */}
                    <Link
                      to={`/admin/detail-peserta/${p.id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600"
                    >
                      Detail
                    </Link>

                    {/* Verifikasi */}
                    {p.status !== "verified" && (
                      <button
                        onClick={() => handleVerify(p.id)}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600"
                      >
                        Verify
                      </button>
                    )}

                    {/* Hapus */}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PesertaList;
