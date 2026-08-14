import React from "react";
import "./VolunteerPassModal.css";

function VolunteerPassModal({ application, onClose }) {
  if (!application) return null;

  const { event, fullName, email, city, createdAt, _id } = application;
  const passId = `VC-${(_id || "894201").slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pass-modal-overlay" onClick={onClose}>
      <div className="pass-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        
        {/* MODAL ACTIONS BAR (Hidden on print) */}
        <div className="pass-actions-top no-print">
          <button className="print-btn" onClick={handlePrint}>
            🖨️ Print / Save Pass as PDF
          </button>
          <button className="close-pass-btn" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {/* PRINTABLE PASS CARD TICKET */}
        <div className="volunteer-pass-card" id="printable-pass">

          {/* PASS TICKET HEADER */}
          <div className="pass-header">
            <div className="pass-brand">
              <span className="logo-v font-teal">V</span>
              <div>
                <h2>VolunteerConnect</h2>
                <p className="sub font-teal">OFFICIAL EVENT PARTICIPATION PASS</p>
              </div>
            </div>

            <div className="pass-verified-badge">
              <span className="badge-icon">✓</span>
              <span>VERIFIED & APPROVED</span>
            </div>
          </div>

          {/* PASS TICKET BODY */}
          <div className="pass-body">

            {/* EVENT TITLE & CATEGORY */}
            <div className="pass-event-hero">
              <span className="category-pill">{event?.category || "Community Service"}</span>
              <h1 className="event-title">{event?.title || "Volunteer Opportunity"}</h1>
              <p className="org-host">
                Hosted by <strong>{event?.organization?.name || "Community Partner"}</strong>
              </p>
            </div>

            {/* TWO COLUMN PASS DETAILS */}
            <div className="pass-details-grid">
              
              {/* VOLUNTEER DETAILS */}
              <div className="pass-col">
                <p className="section-label font-teal">VOLUNTEER PARTICIPANT</p>
                <h3 className="volunteer-name">{fullName || application.volunteer?.name || "Volunteer"}</h3>
                <p className="detail-line">📧 {email || application.volunteer?.email}</p>
                <p className="detail-line">📍 {city || application.volunteer?.city || "San Francisco"}</p>
              </div>

              {/* EVENT DATE & VENUE */}
              <div className="pass-col">
                <p className="section-label font-teal">EVENT SCHEDULE & VENUE</p>
                <p className="detail-line bold">
                  📅 {event?.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Flexible Date"}
                </p>
                <p className="detail-line">
                  ⏰ {event?.startTime ? `${event.startTime} - ${event.endTime || ""}` : "Check event schedule"}
                </p>
                <p className="detail-line">
                  📍 {event?.location || "Main Venue"}, {event?.city || ""}
                </p>
              </div>

            </div>

            {/* BARCODE / CHECK-IN FOOTER */}
            <div className="pass-barcode-section">
              <div className="barcode-visual">
                <div className="lines">
                  ||||| | |||| ||| || |||||| | |||| ||| ||||| ||| |||
                </div>
                <p className="pass-id-code">TICKET PASS ID: <strong>{passId}</strong></p>
              </div>

              <div className="pass-qr-placeholder">
                <div className="qr-box">
                  <span className="qr-text">QR PASS</span>
                </div>
                <small className="scan-note">Present at check-in</small>
              </div>
            </div>

          </div>

          {/* PASS FOOTER */}
          <div className="pass-footer">
            <p>Issued by VolunteerConnect Platform • Present digital copy or printed ticket upon arrival.</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default VolunteerPassModal;
