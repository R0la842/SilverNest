import './App.css'
import { Route, Routes, Link ,useNavigate} from 'react-router-dom';
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
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

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
  const [role, setRole] = useState('Senior');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();

  function handleSignup(event) {
    event.preventDefault();

    if (!role) {
      setSignupError('Please select your role.');
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setSignupError('Password must contain at least 8 characters, a letter, and a number.');
      return;
    }

    if (password !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setSignupError('You must agree to the Terms and Privacy Policy.');
      return;
    }

    setSignupError('');
    navigate('/check-email');
  }

  return (
    <>
      <Navbar />

      <div className="signup-page">
        <div className="signup-card">
          <h2>Create your account</h2>
          <p>Choose your role, then tell us a little about you.</p>
          <form onSubmit={handleSignup}>

          <div className="role-selector">
            <label>
              <input
                type="radio"
                name="role"
                value="Senior"
                checked={role === 'Senior'}
                onChange={() => setRole('Senior')}
              />
              Senior
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="Family Caregiver"
                checked={role === 'Family Caregiver'}
                onChange={() => setRole('Family Caregiver')}
              />
              Family Caregiver
            </label>

            <label>
              <input
                type="radio"
                name="role"
                value="Volunteer"
                checked={role === 'Volunteer'}
                onChange={() => setRole('Volunteer')}
              />
              Volunteer
            </label>
          </div>
          <div className="signup-fields">
            <div className="signup-row">
              <div className="signup-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder="05X XXX XXXX"
                  maxLength={10}
                  pattern="05[0-9]{8}"
                  title="Enter a 10-digit phone number starting with 05"
                  required
                />
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="signupEmail">Email</label>
              <input
                type="email"
                id="signupEmail"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          <div className="signup-row signup-passwords">
            <div className="signup-field">
              <label htmlFor="signupPassword">Password</label>

              <div className="signup-password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="signupPassword"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>


            <div className="signup-field">
              <label htmlFor="confirmPassword">Confirm password</label>

              <div className="signup-password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <p className="password-hint">
            At least 8 characters, with a letter and a number.
          </p>
          <div className="signup-terms">
            <label>
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>
          </div>
          {signupError && (<p className="signup-error">{signupError}</p>)}
          {signupSuccess && (<p className="signup-success">Form validation successful!</p>)}
          <button type="submit" className="create-account-btn">
            Create Account
          </button>
          

          <p className="signup-login-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
          </form>

        </div>

      </div>
    </>
  )
}
function CheckEmail() {
  return (
    <>
      <Navbar />

      <div className="signup-page">
        <div className="signup-card">
          <h2>Check your email</h2>

          <p>
            We've sent you an activation link.
            Please check your email to activate your account.
          </p>
          <Link to="/account-activated" className="activation-link">
            Activate Demo Account
          </Link>

          <Link to="/signup">Back to Sign Up</Link>
        </div>
      </div>
    </>
  );
}
function AccountActivated() {
  return (
    <>
      <Navbar />

      <div className="signup-page">
        <div className="signup-card">
          <h2>Your account is active!</h2>

          <p>
            Your email has been verified successfully.
            You can now log in to SilverNest.
          </p>

          <Link to="/login" className="create-account-btn">
            Go to Log In
          </Link>
        </div>
      </div>
    </>
  );
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
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/account-activated" element={<AccountActivated />} />
    </Routes>
  )
}

export default App


