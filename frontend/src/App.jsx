// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";

import PesertaForm from "./pages/PesertaForm";

//admin
import PesertaList from "./components/admin/PesertaList";
import DetailPeserta from "./components/admin/DetailPeserta";
import Peserta from "./components/admin/Peserta";
import BaganPage from "./pages/BaganPage";
import MatchPage from "./pages/MatchPage";
import Settings from "./pages/Settings";
import JadwalPage from "./pages/JadwalPage";
import BaganView from "./pages/BaganView";
import JuaraPage from "./pages/JuaraPage";
import SkorPage from "./pages/SkorPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/daftar-peserta" element={<PesertaForm/>}/>


          <Route
            path="/admin"
            element={
             <ProtectedRoute>
                <RoleRoute allow={["admin"]}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="verify" element={<PesertaList/>}/>
            <Route path="detail-peserta/:id" element={<DetailPeserta/>}/>
            <Route path="peserta" element={<Peserta/>}/>
            <Route path="bagan-peserta" element={<BaganPage/>}/>
            <Route path="match" element={<MatchPage/>}/>
            <Route path="bagan-view/:id" element={<BaganView/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="jadwal-pertandingan" element={<JadwalPage/>}/>
            <Route path="hasil-pertandingan" element={<JuaraPage/>}/>
            <Route path="skor" element={<SkorPage/>}/>
          </Route>

          <Route
            path="/wasit"
            element={
              <ProtectedRoute>
                <RoleRoute allow={["wasit"]}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="peserta" element={<Peserta/>}/>
            <Route path="jadwal-pertandingan" element={<JadwalPage/>}/>
            <Route path="skor" element={<SkorPage/>}/>
            <Route path="bagan-peserta" element={<BaganPage/>}/>
            <Route path="bagan-view/:id" element={<BaganView/>}/>
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
