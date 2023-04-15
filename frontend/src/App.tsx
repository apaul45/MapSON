import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import {
  MainNavbar,
  HomeDiscoverScreen,
  ProjectScreen,
  LoginScreen,
  RegisterScreen,
  FrontPageScreen,
  RecoveryScreen,
  DeleteMapDialog,
  ErrorDialog,
} from './components'

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
        <Route path="/" element={<FrontPageScreen />} />
        <Route path="/recover-account" element={<RecoveryScreen />} />
      </Routes>
      <DeleteMapDialog />
      <ErrorDialog />
    </BrowserRouter>
  )
}

export default App
