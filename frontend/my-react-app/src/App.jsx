import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import LoginPage from "./components/LoginPage/LoginPage.jsx";
import RegisterPage from "./components/RegisterPage/RegisterPage.jsx";
import Home from "./pages/Home.jsx";
import Items from "./pages/Items.jsx";
import AddItem from "./pages/AddItem.jsx";
import ExchangeRequests from "./pages/ExchangeRequests.jsx";
import Donations from "./pages/Donations.jsx";
import EcoPoints from "./pages/EcoPoints.jsx";
import Messages from "./pages/Messages.jsx";
import Profile from "./pages/Profile.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import UserProfile from "./pages/UserProfile.jsx";

function ProtectedRoute() {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />

          <Route element={<ProtectedRoute />}>

            <Route path="/items" element={<Items />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/exchange" element={<ExchangeRequests />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/eco-points" element={<EcoPoints />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:id" element={<UserProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// // Example App.jsx or RouterSetup.jsx
// import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import LoginPage from './components/LoginPage/LoginPage.jsx';
// import RegisterPage from './components/RegisterPage/RegisterPage.jsx';

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         {/* Add other routes here */}
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
