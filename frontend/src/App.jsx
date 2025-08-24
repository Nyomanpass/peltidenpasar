import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPageLayout from "./layouts/LandingPageLayout";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <LandingPageLayout>
              <Home />
            </LandingPageLayout>
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;
