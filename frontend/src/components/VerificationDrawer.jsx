import { X, CheckCircle, XCircle, UserCheck, Eye, Send } from "lucide-react"; 
import { useState } from "react";
import AlertMessage from "../components/AlertMessage"; // sesuaikan path

export default function VerificationDrawer({ 
  isOpen, 
  onClose, 
  pendingUsers, 
  onVerify, 
  onReject,
  onViewDetail
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [confirmVerifyId, setConfirmVerifyId] = useState(null);

  // ALERT STATE
  const [success, setSuccess] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [warning, setWarning] = useState("");

  const drawerClasses = isOpen ? "translate-x-0" : "translate-x-full";

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length > 1) return (parts[0][0] + parts.at(-1)[0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectMessage("");
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-[99]" onClick={onClose}></div>
      )}

      <div className={`fixed top-0 right-0 w-full sm:w-[28rem] bg-white h-full shadow-2xl z-[100] p-6 
        transition-transform duration-500 ease-in-out ${drawerClasses}`}>

        {/* HEADER */}
        <div className="flex justify-between items-center pb-4 border-b border-yellow-500 mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <UserCheck size={28} className="text-blue-600"/> Verifikasi Peserta
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-4 overflow-y-auto h-[calc(100%-120px)] pb-10">
          {pendingUsers && pendingUsers.length > 0 ? (
            pendingUsers.map((p) => (
              <div key={p.id} className="bg-white p-4 border-b shadow">
                <div className="flex gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {getInitials(p.namaLengkap)} 
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold truncate">{p.namaLengkap}</h3>
                    <p className="text-xs text-gray-500 truncate">{p.noWa || p.email}</p>
                  </div>
                </div>

                {rejectingId === p.id ? (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border">
                    <textarea 
                      className="w-full p-2 text-sm border rounded-md"
                      placeholder="Tulis alasan penolakan..."
                      rows="3"
                      value={rejectMessage}
                      onChange={(e) => setRejectMessage(e.target.value)}
                    />
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={async () => {
                          if (!rejectMessage) {
                            setWarning("Alasan penolakan wajib diisi.");
                            return;
                          }
                          try {
                            await onReject(p.id, rejectMessage);
                            setSuccess(`Peserta ${p.namaLengkap} berhasil ditolak ❌`);
                            cancelReject();
                          } catch {
                            setErrorAlert("Gagal menolak peserta.");
                          }
                        }}
                        className="flex-1 bg-red-600 text-white py-1.5 rounded flex items-center justify-center gap-1"
                      >
                        <Send size={14}/> Kirim & WA
                      </button>
                      <button 
                        onClick={cancelReject}
                        className="px-3 py-1.5 bg-gray-200 rounded"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 mt-3 pt-3">
                    <button 
                      onClick={() => setConfirmVerifyId(p.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg"
                    >
                      <CheckCircle size={16}/> Verifikasi
                    </button>

                    <button 
                      onClick={() => setRejectingId(p.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white py-2 rounded-lg"
                    >
                      <XCircle size={16}/> Tolak
                    </button>

                    <button 
                      onClick={() => onViewDetail(p.id)}
                      className="px-3 py-2 bg-gray-100 rounded-lg"
                    >
                      <Eye size={16}/>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-xl border">
              <UserCheck size={32} className="mx-auto mb-3 text-green-500"/>
              <p className="text-gray-600">Semua peserta telah diverifikasi!</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL KONFIRMASI */}
      {confirmVerifyId && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2">Konfirmasi Verifikasi</h2>
            <p className="text-sm text-gray-600 mb-5">
              Yakin ingin memverifikasi peserta ini?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmVerifyId(null)}
                className="px-4 py-2 rounded-xl bg-gray-200"
              >
                Batal
              </button>

              <button
                onClick={async () => {
                  try {
                    await onVerify(confirmVerifyId);
                    setSuccess("Peserta berhasil diverifikasi");
                    setConfirmVerifyId(null);
                  } catch {
                    setErrorAlert("Gagal memverifikasi peserta.");
                    setConfirmVerifyId(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-green-600 text-white"
              >
                Ya, Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ALERT MESSAGE */}
      <AlertMessage type="success" message={success} onClose={() => setSuccess("")} />
      <AlertMessage type="error" message={errorAlert} onClose={() => setErrorAlert("")} />
      <AlertMessage type="warning" message={warning} onClose={() => setWarning("")} />
    </>
  );
}
