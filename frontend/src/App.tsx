import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomeDiscoverScreen } from "./components/HomeDiscoverScreen";
import { ProjectScreen } from "./components/ProjectScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";
import { MainNavbar } from "./components/MainNavbar";
import { RecoveryScreen } from "./components/RecoveryScreen";

function App() {
  return (
    <BrowserRouter>
      <MainNavbar />
      <Routes>
        <Route path="/home" element={<HomeDiscoverScreen />} />
        <Route path="/discover" element={<HomeDiscoverScreen />} />
        <Route path="/project/:id" element={<ProjectScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/recover-account" element={<RecoveryScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
