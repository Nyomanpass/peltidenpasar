import { useState, useEffect, useRef } from "react";
import { PlusCircle, FileDown, Trash2, Edit, Image } from "lucide-react";
import api from "../api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


export default function AthleteSetting() {
  const [athleteList, setAthleteList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);
  const [kelompokUmurList, setKelompokUmurList] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);



const [formData, setFormData] = useState({
  name: "",
  birthDate: "",
  gender: "Male",
  category: "",
  phoneNumber: "",
  address: "",
  club: "",
  photo: null,
});


const fetchKelompokUmur = async () => {
  try {
    const res = await api.get("/kelompok-umur"); // pastikan route ini sesuai
    setKelompokUmurList(res.data);
  } catch (err) {
    console.error(err);
  }
};


const handleExportPDF = async (athlete) => {
  // set dulu atletnya
  setSelectedAthlete(athlete);

  // tunggu React render DOM
  await new Promise((r) => setTimeout(r, 200));

  const element = document.getElementById("athlete-card-pdf");
  if (!element) return alert("Element PDF tidak ditemukan");

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`kartu-atlet-${athlete.name}.pdf`);
};





  const [editingId, setEditingId] = useState(null);

  // ======================
  // PAGINATION
  // ======================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ======================
  // FETCH DATA
  // ======================
  const fetchAthletes = async () => {
    try {
      const res = await api.get("/athlete/get");
      setAthleteList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAthletes();
    fetchKelompokUmur();
  }, []);

  // ======================
  // FORM HANDLER
  // ======================
const resetForm = () => {
  setFormData({
    name: "",
    birthDate: "",
    gender: "male",
    category: "U-10",
    phoneNumber: "",
    address: "",
    club: "",
    photo: null,
  });
  setEditingId(null);
  setPreviewImage(null);
};


  const openForm = (athlete = null) => {
    if (athlete) {
      setFormData({
        name: athlete.name || "",
        birthDate: athlete.birthDate ? athlete.birthDate.slice(0, 10) : "",
        gender: athlete.gender || "male",
        category: athlete.category || "U-10",
        phoneNumber: athlete.phoneNumber || "",
        address: athlete.address || "",
        club: athlete.club || "",
        photo: null,
      });


      setEditingId(athlete.id);

      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } else {
      resetForm();
    }
  };
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  const dayDiff = today.getDate() - birth.getDate();

  // jika belum ulang tahun tahun ini
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
};

 const handleSubmit = async (e) => {
  e.preventDefault();

   const age = calculateAge(formData.birthDate);

  // cek kategori
  const category = formData.category;
  let valid = true;
  let message = "";

  if (category === "U-10" && age > 10) {
    valid = false;
    message = "Umur atlet melebihi batas kategori U-10";
  } else if (category === "U-12" && age > 12) {
    valid = false;
    message = "Umur atlet melebihi batas kategori U-12";
  } else if (category === "U-14" && age > 14) {
    valid = false;
    message = "Umur atlet melebihi batas kategori U-14";
  } else if (category === "U-16" && age > 16) {
    valid = false;
    message = "Umur atlet melebihi batas kategori U-16";
  }

  if (!valid) {
    alert(message);
    return;
  }
  // ======================
  // PROSES SUBMIT
  // ======================
  try {
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("birthDate", formData.birthDate);
    fd.append("gender", formData.gender);
    fd.append("category", formData.category);
    fd.append("phoneNumber", formData.phoneNumber);
    fd.append("address", formData.address);
    fd.append("club", formData.club);
    if (formData.photo) fd.append("photo", formData.photo);


    if (editingId) {
      await api.put(`/athlete/update/${editingId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/athlete/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    resetForm();
    fetchAthletes();
    setCurrentPage(1);
  } catch (err) {
    console.error(err);
  }
};


  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus atlet ini?")) return;
    try {
      await api.delete(`/athlete/delete/${id}`);
      fetchAthletes();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // PAGINATION LOGIC
  // ======================
  const totalPages = Math.ceil(athleteList.length / itemsPerPage);
  const paginatedData = athleteList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const visiblePages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-100">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-yellow-500/50 pb-3 flex items-center gap-2">
        <PlusCircle size={24} className="text-blue-600" />
        Tambah / Kelola Atlet
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        ref={formRef}
        className="mb-8 flex flex-col gap-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Nama Atlet</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
              required
            />
          </div>

          {/* Birth Date */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
              required
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            >
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Kategori</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            >
              <option value="">-- Pilih Kategori --</option>

              {kelompokUmurList.map((k) => (
                <option key={k.id} value={k.nama}>
                  {k.nama}
                </option>
              ))}

            </select>
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">No. Telp</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>

          {/* Address */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-semibold mb-1">Alamat</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>

          {/* Club */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Club / Pelatih</label>
            <input
              type="text"
              value={formData.club}
              onChange={(e) =>
                setFormData({ ...formData, club: e.target.value })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>


          {/* Photo */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-1">Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.files[0] })
              }
              className="border border-gray-300 px-4 py-3 rounded-xl shadow-sm 
              focus:ring-2 focus:ring-yellow-500/70 focus:border-yellow-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
            {editingId ? <Edit size={18} /> : <PlusCircle size={18} />}
            {editingId ? "Update" : "Tambah"}
          </button>
        </div>
      </form>

      {/* TABLE */}

      <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
        <table className="min-w-full text-sm table-fixed">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3 text-center w-16">No</th>
              <th className="px-5 py-3 text-left">Nama</th>
              <th className="px-5 py-3 text-left">Club</th>
              <th className="px-5 py-3 text-center w-28">Kategori</th>
              <th className="px-5 py-3 text-center w-24">Gender</th>
              <th className="px-5 py-3 text-center w-24">Foto</th>
              <th className="px-5 py-3 text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((a, i) => (
              <tr key={a.id} className="hover:bg-yellow-50/50">
                <td className="px-5 py-3 text-center">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>

                <td className="px-5 py-3 font-semibold text-left">
                  {a.name}
                </td>

                <td className="px-5 py-3 text-left">
                  {a.club || "-"}
                </td>

                <td className="px-5 py-3 text-center">
                  {a.category}
                </td>

                <td className="px-5 py-3 text-center capitalize">
                  {a.gender}
                </td>

                <td className="px-5 py-3 text-center">
                  {a.photo ? (
                    <img
                      src={a.photo}
                      className="w-14 h-14 object-cover rounded mx-auto"
                    />
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-5 py-3">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => openForm(a)}
                      className="bg-yellow-500 text-white px-3 py-2 rounded-lg"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(a.id)}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => handleExportPDF(a)}
                      className="bg-green-600 text-white px-3 py-2 rounded-lg"
                    >
                      <FileDown size={16} />
                    </button>

                   <button
                      onClick={() => setPreviewImage(a.photo)}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg"
                      title="Preview"
                    >
                      <Image size={16} />
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {visiblePages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-4 py-2 rounded ${
                currentPage === p
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* PREVIEW */}
     {previewImage && (
  <div
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    onClick={() => setPreviewImage(null)}
  >
    <div
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* BUTTON CLOSE */}
      <button
        onClick={() => setPreviewImage(null)}
        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white 
                   w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
      >
        ✕
      </button>

      {/* IMAGE */}
      <img
        src={previewImage}
        className="max-h-[90vh] rounded-xl shadow-2xl"
      />
    </div>
  </div>
)}


  {selectedAthlete && (
      <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
        <div
          id="athlete-card-pdf"
          style={{
            width: "300px",
            padding: "16px",
            background: "#ffffff",
            color: "#000000",
            fontFamily: "Arial, sans-serif",
            border: "2px solid #000",
            borderRadius: "10px"
          }}
        >

          {/* FOTO */}
          <div
            style={{
              height: "250px",
              background: "#f3f4f6",
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "10px"
            }}
          >
            {selectedAthlete.photo ? (
              <img
                src={selectedAthlete.photo}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  color: "#666"
                }}
              >
                Tidak ada foto
              </div>
            )}
          </div>

          {/* INFO */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>
              {selectedAthlete.name}
            </div>

            <div style={{ fontSize: "12px", marginBottom: "6px" }}>
              {selectedAthlete.category}
            </div>

            <div style={{ fontSize: "12px" }}>
              Gender: {selectedAthlete.gender}
            </div>
            <div style={{ fontSize: "12px" }}>
              Club: {selectedAthlete.club || "-"}
            </div>
            <div style={{ fontSize: "12px" }}>
              No Telp: {selectedAthlete.phoneNumber || "-"}
            </div>

            <div
              style={{
                fontSize: "10px",
                marginTop: "10px",
                color: "#888"
              }}
            >
              PELTI DENPASAR
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}
