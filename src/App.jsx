import './App.css'
import { Route, Routes, Link } from 'react-router-dom';
import { useState } from 'react';
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        SilverNest
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/how-it-works">How It Works</Link>
        <Link to="/services">Services</Link>
        <Link to="/volunteer">Volunteer</Link>
      </div>

      <div className="nav-buttons">
        <Link to="/login" className="login-btn">Log In</Link>
        <Link to="/signup" className="signup-btn">Sign Up</Link>
      </div>
    </nav>
  )
}

function IntroSection() {
  return (
    <section className="intro-section" id="home">
      <h1>
        Help for everyday tasks,
        <br />
        from neighbors you can trust
      </h1>

      <p>
        Find vetted local volunteers for non-medical help,
        errands, and companionship.
      </p>

      <div className="intro-buttons">
        <button className="primary-btn">Get Started</button>
        <button className="secondary-btn">
          Become a Volunteer
        </button>
      </div>
    </section>
  )
}
function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <h2>How it works</h2>

      <div className="steps-container">
        <div className="step-card">
          <h3>Request help</h3>
          <p>Tell us what you need, where, and when.</p>
        </div>

        <div className="step-card">
          <h3>Vetted volunteer accepts</h3>
          <p>An approved neighbor accepts your request.</p>
        </div>

        <div className="step-card">
          <h3>Task completed and family notified</h3>
          <p>Help is provided and your family gets an update.</p>
        </div>
      </div>
    </section>
  )
}



function PlaceForEveryone() {
  return (
    <section className="place-for-everyone">
      <h2>A place for everyone</h2>

      <div className="roles-container">
        <div className="role-card">
          <h3>Senior</h3>
          <p>
            Get a helping hand with errands, light
            household tasks, or a friendly visit.
          </p>
        </div>

        <div className="role-card">
          <h3>Family Caregiver</h3>
          <p>
            Arrange non-medical support for a loved
            one and stay informed along the way.
          </p>
        </div>

        <div className="role-card">
          <h3>Volunteer</h3>
          <p>
            Offer your time for non-medical help and
            companionship in your neighborhood.
          </p>
        </div>
      </div>
    </section>
  )
}
function Message() {
  return (
    <div className="message">
      <p>All volunteers are vetted and approved</p>
    </div>
  )
}
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <h2>SilverNest</h2>
        <p>&copy; 2026 SilverNest. Neighbors helping neighbors.</p>
      </div>

      <div className="footer-links">
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#safety">Safety</a>
        <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms</a>
      </div>
    </footer>
  )
}
function Login() {
  const[loginError, setLoginError] = useState('');
  const[loginSuccess, setLoginSuccess] = useState(false);
  function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    // Simulate login validation
    if (email === 'user@example.com' && password === 'password') {
      setLoginSuccess(true);
      setLoginError('');
    } else {
      setLoginError('Email or password is incorrect.');
    }
  }
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>SilverNest</h2>
        <h3>Welcome back</h3>
        {loginError && (<div className="login-error"><strong>{loginError}</strong><p>Check your details and try again.</p></div>)}
        {loginSuccess && (<div className="login-success"><strong>Login successful!</strong></div>)}

        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            required
          />

        
          <span className="show-password">
            Show password / Hide password
          </span>

          <a href="#forgot-password">Forgot password?</a>

          <button type="submit" className="login-submit">
            Log In
          </button>
        </form>

        <p>
          Don't have an account? <Link to="/signup">Create account.</Link>
        </p>
      </div>

      <p className="login-tagline">
        Trusted local help for everyday, non-medical tasks.
      </p>
    </div>
  )
}

function Signup() {
  return (
    <div>
      <h1>Sign Up</h1>
      <p>Create your SilverNest account.</p>
    </div>
  )
}

function HomePage() {
  return (
    <>
      <Navbar />
      <IntroSection />
      <HowItWorks />
      <PlaceForEveryone />
      <Message />
      <Footer />
    </>
  )
}
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

    </Routes>
  )
}

export default App


