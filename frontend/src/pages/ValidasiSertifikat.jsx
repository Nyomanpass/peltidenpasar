import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { CheckCircle, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";

export default function ValidasiSertifikat() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get("tournamentId");
  const baganId = searchParams.get("baganId");

  const [previewHtml, setPreviewHtml] = useState("");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !tournamentId || !baganId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // 🔥 VALIDASI
    const p1 = api.get(`/sertifikat/valid/${id}`, {
      params: { tournamentId, baganId }
    })
      .then(res => setData(res.data))
      .catch(() => setData({ valid: false }));

    // 🔥 PREVIEW
    const p2 = api.get(`/sertifikat/preview`, {
      params: { id, tournamentId, baganId },
      responseType: "text"
    })
      .then(res => setPreviewHtml(res.data))
      .catch(err => console.error(err));

    Promise.all([p1, p2]).finally(() => {
      setIsLoading(false);
    });

  }, [id, tournamentId, baganId]);

  // ================= ERROR / LOADING =================
  if (!id || !tournamentId || !baganId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-black text-slate-800">Parameter Tidak Lengkap</h2>
          <p className="text-xs text-slate-500 mt-1">
            Tautan verifikasi sertifikat tidak memiliki parameter turnamen atau bagan yang valid.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
        <h2 className="text-sm font-black text-slate-700">Memverifikasi Sertifikat Resmi...</h2>
        <p className="text-xs text-slate-400 mt-0.5">Memeriksa keaslian dokumen di database turnamen</p>
      </div>
    );
  }

  if (!data?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Sertifikat Tidak Valid
          </h1>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            Data sertifikat ini tidak ditemukan atau tidak sesuai dengan catatan resmi pada database turnamen.
          </p>
        </div>
      </div>
    );
  }

  // ================= VALID =================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200/60 shadow-2xs">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-800 leading-tight">
              Validasi Sertifikat Resmi
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Sistem Verifikasi Keaslian Turnamen Tenis PELTI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-black uppercase tracking-wider">
          <CheckCircle size={14} />
          <span>Terverifikasi Resmi</span>
        </div>
      </header>

      {/* Frame Pratinjau Sertifikat */}
      <main className="flex-1 p-3 sm:p-6 flex justify-center items-center">
        <div className="w-full max-w-[1140px] h-[85vh] bg-white rounded-2xl sm:rounded-3xl shadow-md border border-slate-200 overflow-hidden">
          {previewHtml ? (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Pratinjau Sertifikat"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span className="text-xs font-medium">Memuat dokumen sertifikat...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}