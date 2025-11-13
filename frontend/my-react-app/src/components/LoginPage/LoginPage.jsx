import React, { useState } from 'react';
import './LoginPage.css';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  // Paths use the Vite public folder convention (starting with /)
  const loginModelSrc = "/media/03_fahsion_login_page (1)-Photoroom.png";
  const facebookLogoSrc = "/media/image-removebg-preview (1).png";
  const googleLogoSrc = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg";
  const appleLogoSrc = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg";

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e) => {
    e?.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
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
          src={loginModelSrc} 
          draggable="false" 
          alt="Fashion model" 
        />
      </div>

      <div className="right_coln">
        <div className="login_wrap">
          <h4 className="welcome-text">
            <span className="bold">EXISTING MEMBER</span><br />
            <span className="thin">Welcome Back!</span>
          </h4>
          
          <form onSubmit={submit} className="login_wrap__form">
          <div className="login_mail">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="5" ry="5"></rect>
                <polyline points="3,7 12,13 21,7"></polyline>
              </svg>
            </div>
            <input type="text" placeholder="email@example.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>

          <div className="login_pass">
            <div className="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <input type="password" placeholder="Enter Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>

          <div className="nxt_btn">
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
                {loading ? 'Signing in...' : 'SIGN IN'}
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

          {/* Inline style converted to JSX style object: font-family: sans-serif to fontFamily: 'sans-serif' */}
          <p id="signtologinlink" style={{ fontFamily: 'sans-serif' }}>
            Don’t have account? <Link to="/register"><b>Register Now</b></Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;