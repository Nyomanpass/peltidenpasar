// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

// font
import "@fontsource/poppins/400.css"; // Regular
import "@fontsource/poppins/700.css"; // Bold

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";

import PesertaForm from "./pages/PesertaForm";
import ScrollToTop from "./components/ScrollToTop";

//admin
import DetailPeserta from "./components/admin/DetailPeserta";
import Peserta from "./components/admin/Peserta";
import BaganPage from "./pages/BaganPage";
import MatchPage from "./pages/MatchPage";
import Settings from "./pages/Settings";
import JadwalPage from "./pages/JadwalPage";
import BaganView from "./pages/BaganView";
import JuaraPage from "./pages/JuaraPage";
import SkorPage from "./pages/SkorPage";
import Tournament from "./pages/admin/Tournament";
import PesertaGanda from "./components/admin/PesertaGanda"; 

//landing page
import TournamentUser from "./pages/user/TournamentUser";
import AboutPage from "./pages/user/AboutPage";
import ContactPage from "./pages/user/ContactPage";
import TournamentDetailPage from "./components/TournamentDetailPage";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login />} />
          <Route path="/daftar-peserta" element={<PesertaForm/>}/>
          <Route path="/tournament" element={<TournamentUser/>}/>
          <Route path="/about" element={<AboutPage/>}/>
          <Route path="/contact" element={<ContactPage/>}/>
          <Route path="/tournament-detail" element={<TournamentDetailPage/>}/>
   
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
            {/* <Route path="verify" element={<PesertaList/>}/> */}
            <Route path="tournament" element={<Tournament/>}/>
            <Route path="detail-peserta/:id" element={<DetailPeserta/>}/>
            <Route path="peserta" element={<Peserta/>}/>
            <Route path="bagan-peserta" element={<BaganPage/>}/>
            <Route path="match" element={<MatchPage/>}/>
            <Route path="bagan-view/:id" element={<BaganView/>}/>
            <Route path="settings" element={<Settings/>}/>
            <Route path="jadwal-pertandingan" element={<JadwalPage/>}/>
            <Route path="hasil-pertandingan" element={<JuaraPage/>}/>
            <Route path="skor" element={<SkorPage/>}/>
            <Route path="peserta-ganda" element={<PesertaGanda />} />
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
