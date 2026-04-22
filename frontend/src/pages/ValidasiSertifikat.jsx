import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function ValidasiSertifikat() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
  const [previewHtml, setPreviewHtml] = useState("");
  const baganId = searchParams.get("baganId");

  const [data, setData] = useState(null);

useEffect(() => {
  if (!id || !tournamentId || !baganId) return;

  // 🔥 VALIDASI
  api.get(`/sertifikat/valid/${id}`, {
    params: {
      tournamentId,
      baganId
    }
  })
    .then(res => setData(res.data))
    .catch(() => setData({ valid: false }));

  // 🔥 PREVIEW
  api.get(`/sertifikat/preview`, {
    params: {
      id,
      tournamentId,
      baganId
    },
    responseType: "text"
  })
    .then(res => setPreviewHtml(res.data))
    .catch(err => console.error(err));

}, [id, tournamentId, baganId]);

  // ================= ERROR =================
  if (!id) return <p className="p-10 text-red-500 text-center">ID tidak ditemukan</p>;
  if (!tournamentId) return <p className="p-10 text-red-500 text-center">Tournament tidak ditemukan</p>;
  if (!data) return <p className="p-10 text-center">Loading...</p>;

  if (!data.valid) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <h1 className="text-2xl font-black text-red-600">
            ❌ Sertifikat Tidak Valid
          </h1>
          <p className="mt-2 text-gray-500">
            Data tidak ditemukan pada sistem resmi
          </p>
        </div>
      </div>
    );
  }

  // ================= VALID =================

return (
  <div className="min-h-screen bg-gray-200 flex flex-col">

    {/* HEADER */}
    <div className="bg-white shadow p-3 flex justify-between items-center">
      <h1 className="text-sm font-bold text-gray-700">
        Validasi Sertifikat
      </h1>

      <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full">
        ✔ Resmi
      </span>
    </div>

    {/* CONTENT */}
   <div className="flex-1 p-4 md:p-6 flex justify-center items-center">

  <div className="w-full max-w-[1130px] h-[90vh] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

        {previewHtml ? (
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            Loading preview...
          </div>
        )}

      </div>

    </div>

  </div>
);

}