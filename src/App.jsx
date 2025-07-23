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
import AddAddress from "./components/Pages/AddAddress";
import AddStall from "./components/Pages/addStall";
import AdminDashboard from "./components/Admin/Screen/AdminDashboard";
import Chats from "./components/User/Chats";
import ChatRoom from "./components/User/ChatRoom";
import MessengerLayout from "./components/User/Messenger";
import Market from "./components/Admin/Market/Market";
import Footer from "./components/Navigation/Footer";
import MarketList from "./components/Vendor/MarketList";
import ProtectedRoute from "./utils/ProtectedRoutes";
import AdminViewStalls from "./components/Admin/AdminViewStalls";
import StallIndex from "./components/Admin/Stall/StallIndex";
import ViewPosts from "./components/User/Stall/ViewPosts";
import ComposterViewPosts from "./components/Composter/Stall/ComposterViewPosts";
import RecentPost from "./components/Vendor/RecentPost";

const App = () => {
  const [mySacks, setMySacks] = useState([]); // Lifted state for sacks

  return (
    <div className="app-wrapper">
      <Router>
        <Header />
        <div className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/addAddress" element={<AddAddress />} />
              <Route path="/addStall" element={<AddStall />} />
              <Route path="/viewstalls" element={<ViewStalls />} />
              <Route path="/viewposts" element={<ViewPosts />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/chatroom/:userId/:receiverId" element={<ChatRoom />} />
              <Route path="/messenger" element={<MessengerLayout />} />
              <Route path="/stalls/:id" element={<StallDetails mySacks={mySacks} setMySacks={setMySacks} />} />
              <Route path="/mysack" element={<MySack mySacks={mySacks} setMySacks={setMySacks} />} />
              <Route path="/pickup" element={<Pickup mySacks={mySacks} setMySacks={setMySacks} />} />
              <Route path="/pickup/see/:id" element={<PickupDetails mySacks={mySacks} setMySacks={setMySacks} />} />

              {/* Vendor Routes */}
              <Route path="/vendor/myStall/:id" element={<MyStall />} />
              <Route path="/vendor/post/:id" element={<RecentPost />} />
              <Route path="/vendor/create-sack" element={<CreateSack />} />
              <Route path="/vendor/pickup" element={<VendorPickup />} />
              <Route path="/vendor/pickup-detail/:id" element={<SeePickUp />} />
              <Route path="/vendor/market-list" element={<MarketList />} />

              {/* Composter Routes */}
              <Route path="/composter/dashboard/" element={<ComposterIndex />} />
              <Route path="/composter/market/" element={<ComposterMarket />} />
              <Route path="/composter/viewposts/" element={<ComposterViewPosts />} />
              <Route path="/composter/market/detail/:id" element={<ComposterViewStall />} />
              <Route path="/composter/pickup/" element={<CompPickup />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute isAdmin={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/market" element={<Market />} />
              <Route path="/admin/farmers" element={<Farmers />} />
              <Route path="/admin/create/farmer" element={<CreateFarmer />} />
              <Route path="/admin/composters" element={<Composters />} />
              <Route path="/admin/create/composter" element={<CreateComposter />} />
              <Route path="/admin/vendors" element={<Vendors />} />
              <Route path="/admin/create/vendor" element={<CreateVendor />} />
              <Route path="/admin/view/stalls" element={<AdminViewStalls />} />
              <Route path="/admin/stall-index/:id" element={<StallIndex />} />
            </Route>
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
};

export default App;