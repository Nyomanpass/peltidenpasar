import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye } from "lucide-react";


export default function BaganPage() {
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedKelompok, setSelectedKelompok] = useState("");
  const [baganList, setBaganList] = useState([]);
  const role = localStorage.getItem('role')
  const navigate = useNavigate();

  const fetchBagan = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/bagan`);
      if (!res.ok) throw new Error("Gagal memuat bagan.");
      const data = await res.json();
      setBaganList(data);
    } catch (err) {
      console.error("Gagal fetch bagan:", err);
    }
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/kelompok-umur")
      .then((res) => res.json())
      .then((data) => setKelompokUmurList(data))
      .catch((err) => console.error(err));
    fetchBagan();
  }, []);

  const handleCreateBagan = async () => {
    if (!selectedKelompok) {
      alert("Pilih kelompok umur terlebih dahulu.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/bagan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kelompokUmurId: selectedKelompok }),
      });
      if (!res.ok) throw new Error("Gagal membuat bagan.");
      alert("Bagan berhasil dibuat!");
      fetchBagan();
    } catch (err) {
      console.error("Gagal membuat bagan:", err);
      alert("Gagal membuat bagan. Pastikan data peserta sudah ada.");
    }
  };

  const handleDeleteBagan = async (baganId, event) => {
    event.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus bagan ini?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/bagan/${baganId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal menghapus bagan.");
        await fetchBagan();
        alert("Bagan berhasil dihapus!");
      } catch (err) {
        console.error("Gagal menghapus bagan:", err);
        alert("Gagal menghapus bagan.");
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-yellow-600 text-center">
        🎾 Daftar Bagan Turnamen
      </h1>

      {/* Filter dan Aksi */}
       {role === "admin" && (
      <div className="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-400"
          value={selectedKelompok}
          onChange={(e) => setSelectedKelompok(e.target.value)}
        >
          <option value="">Pilih Kelompok Umur</option>
          {kelompokUmurList.map((k) => (
            <option key={k.id} value={k.id}>
              {k.nama}
            </option>
          ))}
        </select>

        <button
          onClick={fetchBagan}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition transform hover:scale-105"
        >
          🔄 Tampilkan Semua Bagan
        </button>

        <button
          onClick={handleCreateBagan}
          className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition transform hover:scale-105 disabled:opacity-50"
          disabled={!selectedKelompok}
        >
          ➕ Buat Bagan Baru
        </button>
      </div>
    )}

      {/* List Bagan */}
      <div className="space-y-4">
        {baganList.length === 0 && (
          <p className="text-center text-gray-600">
            Tidak ada bagan untuk kelompok umur ini.
          </p>
        )}

        {baganList.map((bagan) => (
          <div
            key={bagan.id}
            className="flex justify-between items-center bg-white border border-gray-200 p-5 rounded-xl shadow hover:shadow-md transition transform hover:scale-[1] cursor-pointer"
            onClick={() => navigate(`/bagan-view/${bagan.id}`)}
          >
            <div>
              <h2 className="font-bold text-lg text-gray-900">{bagan.nama}</h2>
              <p className="text-sm text-gray-500">
                Jumlah Peserta: {bagan.jumlahPeserta}
              </p>
            </div>

            <div className="flex gap-2">
              {role === "admin" && (
            <button
                onClick={(e) => {
                  e.preventDefault();
                  const confirmed = window.confirm("Apakah kamu yakin ingin menghapus bagan ini?");
                  if (confirmed) {
                    handleDeleteBagan(bagan.id, e);
                    // arahkan setelah delete selesai
                    navigate("/admin/bagan-peserta");
                  }
                  // jika user cancel, tidak terjadi apa-apa
                }}
                className="bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition flex items-center gap-1"
              >
                <Trash2 size={16} /> Hapus
              </button>
              )}


              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/${role}/bagan-view/${bagan.id}`);
                }}
                className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow hover:bg-yellow-600 transition flex items-center gap-1"
              >
                <Eye size={16} /> Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
