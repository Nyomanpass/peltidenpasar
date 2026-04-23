import api from "../api";
import { useEffect, useState, useRef } from "react";
import { Layout, Upload, Trash2, RefreshCcw, Eye, Download, Trophy } from "lucide-react";


export default function SertifikatPage() {
  const [baganList, setBaganList] = useState([]);
  const [selectedBaganId, setSelectedBaganId] = useState(null);
  const [data, setData] = useState(null);

  const [template, setTemplate] = useState(null);
  const [file, setFile] = useState(null);

  const selectedTournament = localStorage.getItem("selectedTournament");
  const [filterBaganKategori, setFilterBaganKategori] = useState("all");
  const infoRef = useRef(null);

  const role = localStorage.getItem('role');
  const isAdmin = role === "admin";

  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // 🔥 peserta yang tidak boleh download / preview
  const blockedParticipantIds = [152];

  const isBlocked = (id) => blockedParticipantIds.includes(Number(id));

  const getImageUrl = (path) => {
    if (!path) return "";
    return `${API_URL}${path}`;
  };


const getPlayers = (p) => {
  if (!p) return [];

  // 🔥 DOUBLE → gabung nama
  if (p.Player1 && p.Player2) {
    return [
      {
        id: p.Player1.id, // tetap pakai salah satu id
        namaLengkap: `${p.Player1.namaLengkap} / ${p.Player2.namaLengkap}`
      }
    ];
  }

  // 🔥 SINGLE
  if (p.namaLengkap) {
    return [
      {
        id: p.id,
        namaLengkap: p.namaLengkap
      }
    ];
  }

  // 🔥 ROUND ROBIN
  if (p.peserta) {
    return [
      {
        id: p.peserta.id,
        namaLengkap: p.peserta.namaLengkap
      }
    ];
  }

  return [];
};


  const juara3List = Array.isArray(data?.juara3)
    ? data.juara3
    : data?.juara3
    ? [data.juara3]
    : [];

  // ================= BAGAN =================
  useEffect(() => {
  if (!selectedTournament) return;

  api.get("/bagan", {
    params: { tournamentId: selectedTournament }
  }).then(res => setBaganList(res.data));
}, [selectedTournament]);

  // ================= JUARA =================
  useEffect(() => {
    if (!selectedBaganId) return;

    api.get(`/sertifikat/${selectedBaganId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, [selectedBaganId]);

  // ================= TEMPLATE =================
  const fetchTemplate = async () => {
  const res = await api.get("/template", {
    params: { tournamentId: selectedTournament }
  });

  setTemplate(res.data);
};

  useEffect(() => {
    fetchTemplate();
  }, []);

  
  const handleUpload = async (isUpdate = false) => {
    try {
      if (!file) return alert("Pilih file dulu");

    if (!selectedTournament) {
      return alert("Tournament belum dipilih");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tournamentId", selectedTournament); // 🔥 WAJIB

    if (isUpdate) {
      await api.put("/template", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      await api.post("/template", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    await fetchTemplate(); // refresh
    setFile(null); // reset input
    alert("Template berhasil disimpan!");

  } catch (err) {
    console.error(err);
    alert("Gagal upload template");
  }
};

const handleDelete = async () => {
  try {
    if (!selectedTournament) {
      return alert("Tournament belum dipilih");
    }

    const confirmDelete = confirm("Yakin hapus template?");
    if (!confirmDelete) return;

    await api.delete("/template", {
      params: { tournamentId: selectedTournament } // 🔥 WAJIB
    });

    setTemplate(null);
    alert("Template berhasil dihapus!");

  } catch (err) {
    console.error(err);
    alert("Gagal hapus template");
  }
};


const getId = (p) => {
  if (!p) return null;

  // DOUBLE → ambil Player1 dulu (atau nanti kita split)
  if (p.Player1) return p.Player1.id;

  // ROUND ROBIN
  if (p.peserta) return p.peserta.id;

  // SINGLE
  return p.id;
};

// ================= PREVIEW =================
const preview = (w) => {
  const id = getId(w);

  const url = `${API_URL}/api/sertifikat/preview?id=${id}&tournamentId=${selectedTournament}&baganId=${selectedBaganId}`;

  setPreviewUrl(url);
  setShowPreview(true);
};

useEffect(() => {
  if (data && infoRef.current) {
    setTimeout(() => {
      infoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 200);
  }
}, [data]);

// ================= DOWNLOAD =================
const download = async (w) => {
  try {
    const id = getId(w);

    const res = await api.get(
      `/sertifikat/download?id=${id}&tournamentId=${selectedTournament}&baganId=${selectedBaganId}`,
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    const namaFile = w.namaLengkap
      ?.toUpperCase()
      .replace(/\s+/g, "-");

    link.href = url;
    link.setAttribute("download", `SERTIFIKAT-${namaFile}.pdf`);
    document.body.appendChild(link);
    link.click();

    window.URL.revokeObjectURL(url);
    link.remove();

  } catch (err) {
    console.error(err);
    alert("Gagal download");
  }
};


  return (
    <div className="p-6 space-y-6">

  {/* ================= HEADER ================= */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">

    <div>
      <h1 className="text-2xl md:text-3xl font-black text-gray-900">
        Modul Sertifikat
      </h1>

      <p className="text-xs md:text-sm text-yellow-600 font-bold uppercase tracking-widest mt-1">
        Tournament: {localStorage.getItem("selectedTournamentName") || "-"}
      </p>
    </div>

  </div>

  {/* ================= TEMPLATE ================= */}
 {isAdmin && (
  <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">

    <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-700">
      <Upload size={16}/> Template Sertifikat
    </h3>

    {template ? (
      <div className="flex flex-col md:flex-row gap-6">

        {/* PREVIEW */}
        <img
          src={getImageUrl(template.image)}
          className="w-full md:w-80 rounded-xl border shadow"
        />

        {/* ACTION */}
        <div className="flex flex-col gap-3">
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm"
          />

          <div className="flex gap-2">
            <button
              onClick={() => handleUpload(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-xs flex items-center gap-1"
            >
              <RefreshCcw size={14}/> Update
            </button>

            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs flex items-center gap-1"
            >
              <Trash2 size={14}/> Delete
            </button>
          </div>
        </div>

      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
          onClick={() => handleUpload(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs"
        >
          Upload Template
        </button>
      </div>
    )}

  </div>
)}

  {/* ================= BAGAN ================= */}
  <div className="space-y-4">

  {/* LABEL */}
  <label className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
    <Layout size={16} className="text-blue-600" /> Pilih Kelompok Umur
  </label>

  {/* FILTER */}
  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
    {["all", "single", "double"].map((cat) => (
      <button
        key={cat}
        type="button"
        onClick={() => setFilterBaganKategori(cat)}
        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
          ${
            filterBaganKategori === cat
              ? "bg-white text-blue-600 shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
      >
        {cat === "all" ? "Semua" : cat}
      </button>
    ))}
  </div>

  {/* BAGAN LIST */}
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">

    {baganList
      .filter(b => (filterBaganKategori || "all") === "all"
        ? true
        : b.kategori === filterBaganKategori
      )
      .sort((a, b) => a.kelompokUmurId - b.kelompokUmurId)
      .map((bagan) => {

        const ringkasNama = bagan.nama
          ?.replace(/Bagan/gi, '')
          ?.replace(/\(Tunggal\)/gi, '')
          ?.replace(/\(Ganda\)/gi, '')
          ?.trim();

        const active = selectedBaganId === Number(bagan.id);

        return (
          <button
            key={bagan.id}
            type="button"
            onClick={() => setSelectedBaganId(Number(bagan.id))}
            className={`group relative p-4 rounded-2xl border transition-all duration-300 shadow-sm text-left

              ${active
                ? "bg-blue-600 border-blue-700 ring-4 ring-blue-100"
                : "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
              }
            `}
          >

            {/* NAMA */}
            <p className={`text-sm font-black leading-tight ${
              active ? "text-white" : "text-slate-700"
            }`}>
              {ringkasNama}
            </p>

            {/* BADGE */}
            <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md
              ${active
                ? "bg-blue-500 text-blue-100"
                : "bg-slate-100 text-slate-400"
              }
            `}>
              {bagan.kategori}
            </span>

            {/* INDICATOR */}
            {active && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
            )}

          </button>
        );
      })
    }

  </div>

</div>

  {/* ================= INFO ================= */}
  {data && (
    <div ref={infoRef} className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-2xl shadow">

      <p className="text-[10px] uppercase tracking-widest opacity-80">
        Informasi
      </p>

      <p className="font-black text-lg">
        {data.tipe.toUpperCase()} • {data.kategori.toUpperCase()}
      </p>

      <p className="text-sm opacity-90">
        {data.kelompokUmur}
      </p>

    </div>
  )}

  {/* ================= JUARA ================= */}
  {data && (
    <div className="space-y-6">

      {/* JUARA 1 */}
      <div>
        <h3 className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-2">
          Juara 1
        </h3>

        {getPlayers(data.juara1).map((player, i) => (
          <Card
            key={i}
            title="Juara 1"
            nama={player.namaLengkap}
            onPreview={() => preview(player, 1)}
            onDownload={() => download(player, 1)}
          />
        ))}
      </div>

      {/* JUARA 2 */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          Juara 2
        </h3>

        {getPlayers(data.juara2).map((player, i) => (
          <Card
            key={i}
            title="Juara 2"
            nama={player.namaLengkap}
            onPreview={() => preview(player, 2)}
            onDownload={() => download(player, 2)}
          />
        ))}
      </div>

      {/* JUARA 3 */}
   {juara3List
  .flatMap(j => getPlayers(j))
  .filter(player => !isBlocked(getId(player))) // 🔥 HIDE DISINI
  .map((player, i) => (
    <Card
      key={i}
      title="Juara 3"
      nama={player.namaLengkap}
      onPreview={() => preview(player)}
      onDownload={() => download(player)}
    />
))}

    </div>
  )}

  {showPreview && (
  <div
    onClick={() => setShowPreview(false)}
    className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
  >

    {/* BOX */}
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-[1130px] h-[95vh] bg-white rounded-2xl overflow-hidden shadow-2xl"
    >

      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-white/80 backdrop-blur flex items-center justify-between px-4 z-20 border-b">
        <span className="text-xs font-bold text-gray-600">
          Preview Sertifikat
        </span>

        <button
          onClick={() => setShowPreview(false)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
        >
          ✕ Tutup
        </button>
      </div>

      {/* CONTENT */}
      <iframe
         src={previewUrl}
        className="w-full h-full border-0 pt-12"
      />

    </div>
  </div>
)}
</div>


  );
}

// ================= CARD =================
function Card({ title, nama, onPreview, onDownload }) {

  const colorMap = {
    "Juara 1": "from-yellow-400 to-yellow-600",
    "Juara 2": "from-gray-300 to-gray-500",
    "Juara 3": "from-orange-400 to-orange-600"
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">

      {/* LEFT */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* ICON */}
        <div className={`p-2 sm:p-3 rounded-xl text-white bg-gradient-to-r ${colorMap[title]}`}>
          <Trophy size={18} />
        </div>

        {/* TEXT */}
        <div>
          <p className="text-[10px] sm:text-xs text-gray-400">{title}</p>
          <p className="font-bold text-sm sm:text-lg text-gray-800 break-words">
            {nama}
          </p>
        </div>

      </div>

      {/* RIGHT BUTTON */}
      <div className="flex gap-2 w-full sm:w-auto">

        <button
          onClick={onPreview}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs transition"
        >
          <Eye size={14}/> Preview
        </button>

        <button
          onClick={onDownload}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs transition"
        >
          <Download size={14}/> Download
        </button>

      </div>

    </div>
  );
}