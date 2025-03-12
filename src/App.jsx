import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomeNav from './components/Navigation/HomeNav';
import Login from './components/Pages/Login';
import Header from './components/Navigation/Header';
import Register from './components/Pages/Register';
import ForgotPassword from './components/Pages/ForgotPassword';
import About from './components/Pages/About';
import Contact from './components/Pages/Contact';
import Profile from './components/Pages/Profile';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
      <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeNav />} />
        
        <Route path="/register" element={<Register/>} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
};

export default App;