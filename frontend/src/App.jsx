// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./pages/DashboardLayout";


//admin
import VerifyAdmin from "./components/admin/VerifyAdmin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login />} />


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
            <Route path="verify" element={<VerifyAdmin/>}/>
          </Route>

          <Route
            path="/peserta"
            element={
              <ProtectedRoute>
                <RoleRoute allow={["peserta"]}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
