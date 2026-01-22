import { useState, useEffect, useRef } from "react";
import { PlusCircle, Edit, Image } from "lucide-react";
import api from "../api";

export default function AthleteSetting() {
  const [athleteList, setAthleteList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "male",
    category: "U-10",
    photo: null,
  });

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
      photo: null,
    });
    setEditingId(null);
    setPreviewImage(null);
  };

  const openForm = (athlete = null) => {
    if (athlete) {
      setFormData({
        name: athlete.name || "",
        birthDate: athlete.birthDate
          ? athlete.birthDate.slice(0, 10)
          : "",
        gender: athlete.gender || "male",
        category: athlete.category || "U-10",
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
              {["U-10", "U-12", "U-14", "U-16", "Open"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
        <th className="px-5 py-3 text-center w-12">No</th>
        <th className="px-5 py-3 text-left">Nama</th>
        <th className="px-5 py-3 text-center w-32">Lahir</th>
        <th className="px-5 py-3 text-center w-28">Gender</th>
        <th className="px-5 py-3 text-center w-28">Kategori</th>
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

          <td className="px-5 py-3 text-center">
            {a.birthDate?.slice(0, 10)}
          </td>

          <td className="px-5 py-3 text-center capitalize">
            {a.gender}
          </td>

          <td className="px-5 py-3 text-center">
            {a.category}
          </td>

          <td className="px-5 py-3 text-center">
            {a.photo ? (
              <img
                src={a.photo}
                className="w-16 h-16 object-cover rounded mx-auto"
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
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => handleDelete(a.id)}
                className="bg-red-600 text-white px-3 py-2 rounded-lg"
              >
                <PlusCircle size={16} />
              </button>

              {a.photo && (
                <button
                  onClick={() => setPreviewImage(a.photo)}
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg"
                >
                  <Image size={16} />
                </button>
              )}
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
          <img
            src={previewImage}
            className="max-h-[90vh] rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
