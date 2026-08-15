VolunteerConnect** is designed to streamline volunteer recruitment, opportunity discovery, and event participation management. Organizations can publish community initiatives, while volunteers can search by city/category, apply with their profile details, and receive verified participation passes once accepted.
The platform includes full administrative governance to verify and approve non-profit organizations before they can publish public events.
---
## 🚀 Key Features
### 🙋 For Volunteers
- **Smart Opportunity Discovery:** Browse opportunities filtered by category (*Environment, Education, Health, Food & Hunger, Animals, Community, Arts*), date, and city (*Lahore, Karachi, Islamabad, etc.*).
- **One-Click Event Application:** Apply with pre-filled profile data, contact details, skills, and optional motivation messages.
- **Application Tracking:** Live status updates (*Pending, Accepted, Rejected*) directly on the volunteer dashboard.
- **🎟️ Printable Participation Pass:** Accepted volunteers can view and print an official event pass with a unique Ticket ID, barcode, and event guidelines.
### 🏢 For Organizations
- **Event Management:** Create opportunities with date, time, venue, volunteer capacity limits, and required skill tags.
- **Applicant Review Center:** Inspect applicant profiles, bios, skill sets, and personal messages in real time.
- **Capacity Control:** Accept or reject applicants with automatic capacity count updates and auto-closing when event slots are full.
- **Approval Safeguards:** Unapproved organizations have event publishing locked until verified by the platform admin.
### 🛡️ For Administrators
- **Organization Governance:** Review pending organization registrations and approve or reject accounts.
- **Platform Analytics:** Real-time metrics on total organizations, pending approvals, approved hosts, and registered volunteers.
- **User Directory:** System-wide listing and oversight of all volunteers and partner organizations.
### 🔒 Security & Route Protection
- **JWT Authentication:** Secure token-based authorization with Bearer tokens.
- **Role-Based Access Control (RBAC):** Strict middleware enforcement for `volunteer`, `organization`, and `admin` routes on both backend API and React frontend router.
- **Password Security:** Salted password hashing with `bcryptjs`.
---
## 👥 User Roles & Workflows
```mermaid
flowchart TD
    A[User Registration] --> B{Choose Role}
    B -->|Volunteer| C[Volunteer Account - Auto Approved]
    B -->|Organization| D[Org Account - Status: Pending]
    
    D --> E[Admin Reviews & Approves Org]
    E --> F[Org Creates & Publishes Events]
    
    C --> G[Volunteer Browses Events]
    G --> H[Volunteer Applies for Event]
    
    F --> I[Org Reviews Application]
    H --> I
    
    I -->|Accept| J[Volunteer Receives Printable Event Pass]
    I -->|Reject| K[Application Marked Rejected]
