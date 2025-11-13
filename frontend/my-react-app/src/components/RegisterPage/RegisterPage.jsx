import React, { useState } from 'react';
import './RegisterPage.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  // Paths use the Vite public folder convention (starting with /)
  // Using the male character image for distinction
  const registerModelSrc = "/media/03_fahsion_login_page (1)-Photoroom.png"
  const googleLogoSrc = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg";
  const facebookLogoSrc = "/media/image-removebg-preview (1).png";
  const appleLogoSrc = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg";

  // Reused/Modified SVG for a User/Name field
  const UserIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  // Reused SVG for Lock/Password field
  const LockIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );

  // Reused SVG for Mail/Email field
  const MailIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="5" ry="5"></rect>
      <polyline points="3,7 12,13 21,7"></polyline>
    </svg>
  );

  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    await register({ name: form.name, email: form.email, password: form.password });
    navigate('/login');
  };

  return (
    <div className="wrapper">
      <div className="left_coln">
        <div className="brand_name">
          <h3>ZEDOVA</h3>
          <div className="theme-set"></div>
        </div>

        <div className="navigation">
          <p id="shop" className="nav-item">Shop</p>
          <p id="new-arrivals" className="nav-item">New Arrivals</p>
          <p id="winters" className="nav-item">Winters</p>
          <p id="womens" className="nav-item">Women’s</p>
          <p id="mens" className="nav-item">Men’s</p>
          <p id="kids" className="nav-item">Kids</p>
        </div>
        <div></div>
      </div>

      <div className="center_coln">
        <img 
          id="login_model" 
          src={registerModelSrc} 
          draggable="false" 
          alt="Male character model" 
          // Style adjusted for this specific image asset
          style={{ height: '100%', top: '0%', left: '-20%', objectFit: 'cover' }}
        />
      </div>

      <div className="right_coln">
        <div className="login_wrap">
          <h4 className="welcome-text">
            <span className="bold">NEW MEMBER</span><br />
            <span className="thin">Join the club!</span>
          </h4>
          
          <form onSubmit={submit}>
          <div className="login_mail">
            <div className="icon">
              {UserIcon}
            </div>
            <input type="text" placeholder="Full Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
          </div>

          {/* 2. Email Input */}
          <div className="login_mail">
            <div className="icon">
              {MailIcon}
            </div>
            <input type="email" placeholder="Email Address" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} />
          </div>

          {/* 3. Password Input */}
          <div className="login_pass">
            <div className="icon">
              {LockIcon}
            </div>
            <input type="password" placeholder="Create Password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} />
          </div>
          
          {/* 4. Confirm Password Input */}
          <div className="login_pass" style={{ marginBottom: '10px' }}>
            <div className="icon">
              {LockIcon}
            </div>
            <input type="password" placeholder="Confirm Password" value={form.confirm} onChange={(e)=>setForm({...form, confirm:e.target.value})} />
          </div>


          {/* Register Button */}
          <div className="nxt_btn">
            {/* Added basic button styling */}
            <button type="submit" disabled={loading} style={{ 
                width: '100%', 
                height: '45px', 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                color: '#3E2C23', 
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '15px'
            }}>
                {loading ? 'Please wait...' : 'REGISTER'}
            </button>
          </div>
          </form>
          
          <div className="orstyle">
            <p>OR</p>
          </div>

          <div className="other_meth">
            <div id="signgoogle" className="signlogostyle">
              <img src={googleLogoSrc} alt="Google logo" />
            </div>
            <div id="signfacebook" className="signlogostyle">
              <img src={facebookLogoSrc} alt="Facebook logo" />
            </div>
            <div id="signapple" className="signlogostyle">
              <img src={appleLogoSrc} alt="Apple logo" />
            </div>
          </div>

          <p id="signtologinlink" style={{ fontFamily: 'sans-serif' }}>
            Already have an account? <b><Link to="/login">Login Here</Link></b>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;