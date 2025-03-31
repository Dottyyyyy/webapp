import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Pages/Home";
import Login from "./components/Pages/Login";
import Header from "./components/Navigation/Header";
import Register from "./components/Pages/Register";
import ForgotPassword from "./components/Pages/ForgotPassword";
import About from "./components/Pages/About";
import Contact from "./components/Pages/Contact";
import Profile from "./components/Pages/Profile";
import Dashboard from "./components/Pages/Dashboard";
import ViewStalls from "./components/User/viewStalls";
import StallDetails from "./components/User/Stalldetail";

import "./css/style.css";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/dashboard" element={<Dashboard />} />

        {/* Farmer Sidebar */}
        <Route path="/viewstalls" element={<ViewStalls />} />
        <Route path="/stalls/:id" element={<StallDetails />} />

        {/* Vendor Sidebar */}
      </Routes>
    </Router>
  );
};

export default App;
