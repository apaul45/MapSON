import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  MainNavbar,
  HomeScreen,
  ProjectScreen,
  LoginScreen,
  RegisterScreen,
  FrontPageScreen,
  RecoveryScreen,
  DeleteMapDialog,
  ErrorDialog,
  DiscoverScreen,
  ResetScreen,
} from './components';
import { useEffect } from 'react';
import { store } from './models';

function App() {
  useEffect(() => {
    const checkLoggedIn = async () => {
      await store.dispatch.user.check();
    };

    checkLoggedIn();
  }, []);

  return (
    <BrowserRouter>
      <MainNavbar />
      <Routes>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/discover" element={<DiscoverScreen />} />
        <Route path="/project/:id" element={<ProjectScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/" element={<FrontPageScreen />} />
        <Route path="/recover-account" element={<RecoveryScreen />} />
        <Route path="/reset-password" element={<ResetScreen />} />
      </Routes>
      <DeleteMapDialog />
      <ErrorDialog />
    </BrowserRouter>
  );
}

export default App;
