import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useState } from "react";
import Home from "./components/Pages/Home";
import Login from "./components/Pages/Login";
import Header from "./components/Navigation/Header";
import Register from "./components/Pages/Register";
import ForgotPassword from "./components/Pages/ForgotPassword";
import About from "./components/Pages/About";
import Contact from "./components/Pages/Contact";
import Profile from "./components/Pages/Profile";
import Dashboard from "./components/Pages/Dashboard";
import MySack from "./components/User/Mysack";
import Pickup from "./components/User/Pickup";

import "./css/style.css";
import Farmers from "./components/Admin/Users/Farmers";
import CreateFarmer from "./components/Admin/Users/CreateFarmer";
import Composters from "./components/Admin/Users/Composters";
import CreateComposter from "./components/Admin/Users/CreateComposter";
import Vendors from "./components/Admin/Users/Vendors";
import CreateVendor from "./components/Admin/Users/CreateVendor";
import MyStall from "./components/Vendor/MyStall";
import CreateSack from "./components/Vendor/CreateSack";
import StallDetails from "./components/User/Stall/Stalldetail";
import ViewStalls from "./components/User/Stall/Viewstalls";
import PickupDetails from "./components/User/MyPickup/PickupDetail";
import VendorPickup from "./components/Vendor/Pickup/VendorPickup";
import SeePickUp from "./components/Vendor/Pickup/SeePickup";
import ComposterIndex from "./components/Composter/ComposterIndex";
import ComposterMarket from "./components/Composter/Stall/ComposterMarket";
import ComposterViewStall from "./components/Composter/Stall/ComposterViewStall";
import CompPickup from "./components/Composter/Pickup/CompPickup";

const App = () => {
  const [mySacks, setMySacks] = useState([]); // Lifted state for sacks

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
        <Route path="/admin/farmers" element={<Farmers />} />
        <Route path="/admin/create/farmer" element={<CreateFarmer />} />
        <Route path="/admin/composters" element={<Composters />} />
        <Route path="/admin/create/composter" element={<CreateComposter />} />
        <Route path="/admin/vendors" element={<Vendors />} />
        <Route path="/admin/create/vendor" element={<CreateVendor />} />
        {/* <Route path="/admin/farmers" element={<Dashboard />} />
        <Route path="/admin/farmers" element={<Dashboard />} /> */}

        {/* Farmer Sidebar */}
        <Route path="/viewstalls" element={<ViewStalls />} />
        <Route
          path="/stalls/:id"
          element={<StallDetails mySacks={mySacks} setMySacks={setMySacks} />}
        />
        <Route
          path="/mysack"
          element={<MySack mySacks={mySacks} setMySacks={setMySacks} />}
        />
        <Route path="/pickup" element={<Pickup mySacks={mySacks} setMySacks={setMySacks} />} />
        <Route path="/pickup/see/:id" element={<PickupDetails mySacks={mySacks} setMySacks={setMySacks} />} />
        
        {/* Composter Side */}
        <Route path="/composter/dashboard/" element={<ComposterIndex />} />
        <Route path="/composter/market/" element={<ComposterMarket />} />
        <Route path="/composter/market/detail/:id" element={<ComposterViewStall />} />
        <Route path="/composter/pickup/" element={<CompPickup />} />

        {/* Vendor Sidebar */}
        <Route path="/vendor/myStall/:id" element={<MyStall />} />
        <Route path="/vendor/create-sack" element={<CreateSack />} />
        <Route path="/vendor/pickup" element={<VendorPickup />} />
        <Route path="/vendor/pickup-detail/:id" element={<SeePickUp />} />
      </Routes>
    </Router>
  );
};

export default App;