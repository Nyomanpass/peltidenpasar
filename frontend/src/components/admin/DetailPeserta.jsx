import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

function DetailPeserta() {
  const { id } = useParams(); // ambil :id dari URL
  const navigate = useNavigate();
  const [peserta, setPeserta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/peserta/${id}`);
        setPeserta(res.data);
      } catch (err) {
        console.error("Error fetch detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (!peserta) return <p className="text-center text-red-500">Peserta tidak ditemukan</p>;

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Kembali
      </button>

      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Detail Peserta</h1>

        <div className="flex gap-6">
          {/* Foto */}
          <img
            src={`http://localhost:5004/${peserta.fotoKartu}`}
            alt={peserta.namaLengkap}
            className="w-48 h-48 object-cover rounded-lg border"
          />

          {/* Info */}
          <div className="flex flex-col gap-2">
            <p><span className="font-semibold">Nama Lengkap:</span> {peserta.namaLengkap}</p>
            <p><span className="font-semibold">Nomor Whatsapp:</span> {peserta.nomorWhatsapp}</p>
            <p><span className="font-semibold">Tanggal Lahir:</span> {new Date(peserta.tanggalLahir).toLocaleDateString("id-ID")}</p>
            <p><span className="font-semibold">Kelompok Umur:</span> {peserta.kelompokUmur?.nama}</p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  peserta.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {peserta.status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPeserta;
