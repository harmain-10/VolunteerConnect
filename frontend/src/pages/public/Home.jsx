import { Link } from "react-router-dom";
import "./Home.css";

const CATEGORIES_PREVIEW = [
  {
    title: "Environment & Conservation",
    count: "48 Events",
    img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=600",
    desc: "Tree planting, beach cleanups, and eco-restoration projects."
  },
  {
    title: "Education & Literacy",
    count: "35 Events",
    img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600",
    desc: "Mentoring students, literacy drives, and STEM workshops."
  },
  {
    title: "Food & Relief Drives",
    count: "62 Events",
    img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600",
    desc: "Food pantries, hot meal distributions, and emergency relief."
  },
  {
    title: "Healthcare & Support",
    count: "29 Events",
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
    desc: "Blood donation camps, health awareness, and senior care."
  }
];

function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <main className="home-page">

      {/* ================= HERO SECTION ================= */}
      <section className="hero-banner">
        <div className="hero-container">
          
          <div className="hero-text-side">
            <span className="hero-tag-badge font-teal">
              🌟 Empowering Local Communities Worldwide
            </span>

            <h1>
              Connect People. <br />
              <span className="highlight-teal">Create Real Impact.</span>
            </h1>

            <p className="hero-subtext">
              VolunteerConnect bridges passionate individuals with verified non-profits and community organizations. 
              Discover local events, track your contributions, and earn verified participation passes.
            </p>

            <div className="hero-cta-buttons">
              {user ? (
                <Link to="/events" className="primary-btn teal-glow">
                  🔍 Browse Event Feed →
                </Link>
              ) : (
                <>
                  <Link to="/signup?role=volunteer" className="primary-btn teal-glow">
                    🙋 Become a Volunteer
                  </Link>

                  <Link to="/signup?role=organization" className="secondary-btn">
                    🏢 Register Organization
                  </Link>
                </>
              )}
            </div>

            {/* Quick Live Stats Pill */}
            <div className="hero-trust-badges">
              <div className="trust-item">
                <strong>1,200+</strong>
                <span>Volunteers Active</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <strong>150+</strong>
                <span>Host Organizations</span>
              </div>
              <div className="trust-divider"></div>
              <div className="trust-item">
                <strong>100%</strong>
                <span>Verified Passes</span>
              </div>
            </div>
          </div>

          <div className="hero-image-side">
            <div className="hero-card-stack">
              <img
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=900"
                alt="Volunteers in action"
                className="hero-main-img"
              />

              <div className="floating-badge badge-top-right">
                <span className="badge-icon">🎟️</span>
                <div>
                  <strong>Verified Event Pass</strong>
                  <small>Instant PDF Download</small>
                </div>
              </div>

              <div className="floating-badge badge-bottom-left">
                <span className="badge-icon font-teal">✅</span>
                <div>
                  <strong>Organization Verified</strong>
                  <small>Approved by Admin</small>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= IMPACT CATEGORIES ================= */}
      <section className="categories-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-pretitle">EXPLORE CAUSES</span>
            <h2>Volunteer Opportunities by Category</h2>
            <p>Find meaningful initiatives aligned with your personal passion and expertise.</p>
          </div>

          <div className="categories-grid">
            {CATEGORIES_PREVIEW.map((cat, idx) => (
              <div className="category-card" key={idx}>
                <div className="cat-img-wrapper">
                  <img src={cat.img} alt={cat.title} />
                  <span className="cat-count-badge">{cat.count}</span>
                </div>
                <div className="cat-card-body">
                  <h3>{cat.title}</h3>
                  <p>{cat.desc}</p>
                  <Link to="/events" className="cat-link">
                    Explore Events →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW: HOW IT WORKS ================= */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-pretitle">SIMPLE 4-STEP PROCESS</span>
            <h2>How VolunteerConnect Works</h2>
            <p>Empowering seamless collaboration between volunteers and host organizations.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">👤</div>
              <h3>Create Profile</h3>
              <p>Sign up as a Volunteer or register your non-profit Organization in seconds.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">🔍</div>
              <h3>Discover Events</h3>
              <p>Browse local opportunities filtered by category, date, city, and required skills.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">📩</div>
              <h3>Apply & Review</h3>
              <p>Volunteers apply with custom details while host Organizations review & accept applications.</p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">🎟️</div>
              <h3>Get Verified Pass</h3>
              <p>Once accepted, download and print your official Volunteer Participation Pass!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DUAL AUDIENCE SECTION ================= */}
      <section className="audience-dual-section">
        <div className="section-container">
          <div className="dual-grid">
            
            {/* VOLUNTEER CARD */}
            <div className="dual-card volunteer-side">
              <span className="card-tag font-teal">FOR VOLUNTEERS</span>
              <h2>Turn Your Time Into Positive Change</h2>
              <p>
                Discover local projects, build teamwork skills, and create lasting memories while supporting causes you care about.
              </p>
              <ul className="perks-list">
                <li>✓ Personalized event recommendations based on your skills</li>
                <li>✓ Transparent application tracking on your dashboard</li>
                <li>✓ Printable Participation Pass with unique Ticket ID & Barcode</li>
                <li>✓ Direct communication with host organization coordinators</li>
              </ul>
              <Link to="/signup?role=volunteer" className="dual-cta-btn teal-btn">
                Join as Volunteer →
              </Link>
            </div>

            {/* ORGANIZATION CARD */}
            <div className="dual-card organization-side">
              <span className="card-tag font-teal">FOR ORGANIZATIONS</span>
              <h2>Amplify Your Cause & Mobilize Teams</h2>
              <p>
                Post events, manage incoming volunteer registrations, and track event capacity seamlessly on a centralized dashboard.
              </p>
              <ul className="perks-list">
                <li>✓ Easy event creation with date, venue & capacity limits</li>
                <li>✓ Detailed applicant profile review (Bio, Skills, Message)</li>
                <li>✓ One-click Accept and Reject application decisions</li>
                <li>✓ Admin-verified organization badge for trusted engagement</li>
              </ul>
              <Link to="/signup?role=organization" className="dual-cta-btn dark-btn">
                Register Organization →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA BANNER ================= */}
      <section className="cta-banner-section">
        <div className="cta-banner-card">
          <h2>Ready to Make a Difference Today?</h2>
          <p>Join hundreds of volunteers and organizations creating impactful change in your city.</p>
          <div className="cta-banner-btns">
            <Link to="/signup" className="primary-btn teal-glow">
              Get Started Now — It's Free
            </Link>
            <Link to="/login" className="secondary-btn light">
              Log In to Dashboard
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

export default Home;