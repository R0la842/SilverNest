import './App.css'
import { Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import MemberFeatures from './MemberFeatures.jsx';
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        SilverNest
      </Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/#how-it-works">How It Works</Link>
        <Link to="/services">Services</Link>
        <Link to="/signup?role=Volunteer">Volunteer</Link>
      </div>

      <div className="nav-buttons">
        <Link to="/login" className="login-btn">
          Log In
        </Link>
        <Link to="/signup" className="signup-btn">
          Sign Up
        </Link>
      </div>
    </nav>
  );
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
        <Link to="/signup" className="primary-btn">
          Get Started
        </Link>

        <Link
          to="/signup?role=Volunteer"
          className="secondary-btn"
        >
          Become a Volunteer
        </Link>
      </div>
    </section>
  );
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
  );
}

/* =====================================================
   SCROLL TO HOW IT WORKS FROM NAVBAR
   ===================================================== */

function ScrollToSection() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.substring(1);

      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [location.pathname, location.hash]);

  return null;
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
          <Link to="/senior" className="role-dashboard-link">Open senior dashboard →</Link>
        </div>

        <div className="role-card">
          <h3>Family Caregiver</h3>
          <p>
            Arrange non-medical support for a loved
            one and stay informed along the way.
          </p>
          <Link to="/caregiver" className="role-dashboard-link">Open caregiver dashboard →</Link>
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
       <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/safety">Safety</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms of Service</Link>
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
  const [volunteerFile, setVolunteerFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const navigate = useNavigate();

  function handleVolunteerFile(event) {
    const file = event.target.files?.[0];

    setFileError('');
    setVolunteerFile(null);

    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png'
    ];

    if (
      !allowedTypes.includes(file.type) ||
      !/\.(pdf|jpg|jpeg|png)$/i.test(file.name)
    ) {
      setFileError('Only PDF, JPG, or PNG files are allowed.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must not exceed 5 MB.');
      event.target.value = '';
      return;
    }

    setVolunteerFile(file);
  }
  const location = useLocation();
  useEffect(() => {
    const selectedRole = new URLSearchParams(location.search).get('role');
    if (selectedRole) {
      sessionStorage.setItem('silvernestSignup', JSON.stringify({ role: selectedRole }));
    }
  }, [location.search]);
  function handleSignup(event) {
    event.preventDefault();
    setSignupError('');

    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setSignupError(
        'Password must contain at least 8 characters, a letter, and a number.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }

    if (role === 'Volunteer' && !volunteerFile) {
      setSignupError(
        fileError || 'Please upload your ID or vetting document.'
      );
      return;
    }

    if (!agreeToTerms) {
      setSignupError(
        'You must agree to the Terms and Privacy Policy.'
      );
      return;
    }

    const email = document.getElementById('signupEmail').value.trim();
    sessionStorage.setItem('silvernestSignup', JSON.stringify({ email, role }));
    navigate('/check-email', {
      state: {
        role,
        email: event.currentTarget.elements.signupEmail.value.trim()
      }
    });
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
              {['Senior', 'Family Caregiver', 'Volunteer'].map(
                (option) => (
                  <label key={option}>
                    <input
                      type="radio"
                      name="role"
                      value={option}
                      checked={role === option}
                      onChange={() => {
                        setRole(option);
                        setSignupError('');
                        setFileError('');
                      }}
                    />
                    {option}
                  </label>
                )
              )}
            </div>

            <div className="signup-fields">
              <div className="signup-row">
                <div className="signup-field">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Your full name"
                    minLength={2}
                    required
                  />
                </div>

                <div className="signup-field">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
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
                  name="signupEmail"
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
                <label htmlFor="confirmPassword">
                  Confirm password
                </label>

                <div className="signup-password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <p className="password-hint">
              At least 8 characters, with a letter and a number.
            </p>

            {role === 'Volunteer' && (
              <div className="volunteer-upload">
                <label htmlFor="volunteerFile">
                  ID / Vetting Information
                </label>

                <label
                  htmlFor="volunteerFile"
                  className="upload-box"
                >
                  <span>
                    {volunteerFile
                      ? volunteerFile.name
                      : 'Upload ID or vetting document'}
                  </span>
                  <small>PDF, JPG or PNG, up to 5 MB</small>
                </label>

                <input
                  id="volunteerFile"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="volunteer-file-input"
                  onChange={handleVolunteerFile}
                  aria-label="Upload ID or vetting document"
                />

                {fileError && (
                  <p className="file-error" role="alert">
                    {fileError}
                  </p>
                )}

                <p className="volunteer-note">
                  Volunteer accounts require admin approval
                  before you can accept tasks.
                </p>
              </div>
            )}

            <div className="signup-terms">
              <label>
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) =>
                    setAgreeToTerms(e.target.checked)
                  }
                />
                <span>
                  I agree to the Terms and Privacy Policy
                </span>
              </label>
            </div>

            {signupError && (
              <p className="signup-error" role="alert">
                {signupError}
              </p>
            )}

            <button
              type="submit"
              className="create-account-btn"
            >
              Create Account
            </button>

            <p className="signup-login-link">
              Already have an account?{' '}
              <Link to="/login">Log In</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

function ActivationLayout({ icon, title, children }) {
  return (
    <>
      <Navbar />
      <main className="signup-page activation-page">
        <section className="signup-card activation-card">
          <div className="activation-icon" aria-hidden="true">
            {icon}
          </div>
          <h2>{title}</h2>
          {children}
        </section>
      </main>
    </>
  );
}

function CheckEmail() {
  const navigate = useNavigate();
  const signup = JSON.parse(sessionStorage.getItem('silvernestSignup') || '{}');
  const email = signup.email || 'your email address';
  const [message, setMessage] = useState('');

  function resendEmail() {
    setMessage('A new activation link has been simulated.');
  }

  function simulateActivation() {
    navigate(
      signup.role === 'Volunteer'
        ? '/volunteer-pending'
        : '/account-activated'
    );
  }

  return (
    <ActivationLayout
      icon="✉"
      title="Check your email to activate your account"
    >
      <p>
        We sent an activation link to <strong>{email}</strong>.
        Click the link to finish setting up your account.
      </p>

      <button
        type="button"
        className="activation-secondary-btn"
        onClick={resendEmail}
      >
        Resend activation email
      </button>

      {message && <p className="activation-message">{message}</p>}

      <button
        type="button"
        className="activation-demo-btn"
        onClick={simulateActivation}
      >
        Simulate Email Activation
      </button>

      <Link to="/signup" className="activation-back">
        Back to Sign Up
      </Link>
    </ActivationLayout>
  );
}

function AccountActivated() {
  return (
    <ActivationLayout
      icon="✓"
      title="Your account is active"
    >
      <p>
        Thanks for confirming your email. You can now log in
        to SilverNest.
      </p>

      <Link to="/login" className="create-account-btn activation-primary-btn">
        Log In
      </Link>
    </ActivationLayout>
  );
}

function VolunteerPending() {
  return (
    <ActivationLayout
      icon="◷"
      title="Your profile is pending admin approval"
    >
      <p>
        Thanks for submitting your details. We will review your
        ID and vetting information. We will email you once you
        are approved.
      </p>

      <Link to="/" className="create-account-btn activation-primary-btn">
        Back to Home
      </Link>
    </ActivationLayout>
  );
}

function ActivationExpired() {
  const [message, setMessage] = useState('');

  return (
    <ActivationLayout
      icon="!"
      title="This activation link has expired"
    >
      <p>
        For your security, activation links expire after 24 hours.
        Request a new one below.
      </p>

      <button
        type="button"
        className="create-account-btn activation-primary-btn"
        onClick={() => setMessage('A new activation link has been simulated.')}
      >
        Resend activation email
      </button>

      {message && <p className="activation-message">{message}</p>}

      <Link to="/signup" className="activation-back">
        Back to Sign Up
      </Link>
    </ActivationLayout>
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
    </>
  )
}
function About() {
  return (
    <div className="footer-page">
      <h1>About SilverNest</h1>
      <p>
        SilverNest connects seniors and family caregivers with
        vetted local volunteers for everyday non-medical
        assistance and companionship.
      </p>

      <h2>Our Mission</h2>
      <p>
        To build a supportive community where seniors can
        receive trusted help while staying independent.
      </p>
    </div>
  );
}

function Contact() {
  return (
    <div className="footer-page">
      <h1>Contact Us</h1>
      <p>Have a question or need assistance?</p>

      <h2>Get in Touch</h2>
      <p>
        Contact the SilverNest support team for help with
        your account, volunteer registration, or assistance requests.
      </p>

      <p>Our team is here to support you.</p>
    </div>
  );
}

function Safety() {
  return (
    <div className="footer-page">
      <h1>Safety at SilverNest</h1>
      <p>Your safety and trust are our priorities.</p>

      <h2>Volunteer Verification</h2>
      <p>
        Volunteers must complete a verification process
        and receive administrator approval before helping seniors.
      </p>

      <h2>Non-Medical Assistance</h2>
      <p>
        SilverNest volunteers provide everyday assistance
        and companionship, not medical treatment or emergency services.
      </p>

      <h2>Report a Concern</h2>
      <p>
        Users can report safety concerns for administrator review.
      </p>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="footer-page">
      <h1>Privacy Policy</h1>
      <p>
        SilverNest is designed to respect the privacy
        of seniors, caregivers, and volunteers.
      </p>

      <h2>Information We Collect</h2>
      <p>
        Account information, contact details, and assistance
        request information may be used to support the platform.
      </p>

      <h2>How Information Is Used</h2>
      <p>
        Information supports account management,
        volunteer matching, and communication between users.
      </p>

      <h2>Privacy and Security</h2>
      <p>
        Personal information should only be accessible
        to authorized users for appropriate purposes.
      </p>
    </div>
  );
}

function Terms() {
  return (
    <div className="footer-page">
      <h1>Terms of Service</h1>
      <p>
        By using SilverNest, users agree to follow
        the platform's community guidelines.
      </p>

      <h2>Acceptable Use</h2>
      <p>
        Users must provide accurate information
        and treat other community members respectfully.
      </p>

      <h2>Volunteer Responsibilities</h2>
      <p>
        Volunteers must be approved before accepting requests
        and must only perform permitted non-medical tasks.
      </p>

      <h2>Platform Responsibilities</h2>
      <p>
        SilverNest provides a platform for coordinating
        community assistance and reporting concerns.
      </p>
    </div>
  );
}
function App() {
  return (
    <>
      <ScrollToSection />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/account-activated" element={<AccountActivated />} />
        <Route path="/senior" element={<MemberFeatures />} />
        <Route path="/caregiver" element={<MemberFeatures />} />
        <Route path="/volunteer-pending" element={<VolunteerPending />} />
        <Route path="/activation-expired" element={<ActivationExpired />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />


      </Routes>
      <Footer />

    </>
  );
}

export default App


