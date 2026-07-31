# JKM Timetables HUB 🗓️

**Mechanical Engineering Timetable Hub** — A full-featured web application for JKM (Jabatan Kejuruteraan Mekanikal) students and staff to parse, visualize, resolve clashes, and manage academic timetables.

> Originally scaffolded via [Google AI Studio](https://ai.studio/apps/02d8c285-4d1a-4e88-a2fa-cb9d99b134f0).

## ✨ Features

- **📊 Master Timetable Parser** — Upload and parse Excel-based master schedules for all sections
- **🔍 Repeat Course Clash Detector** — Automatically detect timetable conflicts for students repeating courses across different sections
- **📝 PA Approval Slip Generator** — Generate official Penasihat Akademik (PA) approval slips for clash resolutions
- **📅 Timetable Grid View** — Interactive weekly timetable visualization with color-coded slots
- **🤖 AI Clash Assistant** — Google Gemini-powered assistant to help resolve scheduling conflicts
- **📈 Admin Dashboard** — Department-wide analytics, conflict heatmaps, and credit hour tracking
- **👥 Multi-Role Support** — Student, Advisor (PA), and Admin roles with Firebase authentication
- **🎨 Theme Customizer** — Multiple theme palettes (Cyber, Emerald, Midnight, Amber, Contrast)
- **📤 Calendar Export** — Export resolved schedules to calendar formats
- **💾 Google Drive Integration** — Save and load schedules from Google Drive
- **📋 Borang PK01 & Weekly Timetable** — Generate official department documents

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4, Motion (animations) |
| **Icons** | Lucide React |
| **Backend** | Hono, Express, tsx |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **AI** | Google Gemini API (`@google/genai`) |
| **Excel** | SheetJS (`xlsx`) |
| **Markdown** | React Markdown |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Firebase project (for auth & database)
- Google Gemini API key (for AI clash assistant)

### Installation

```bash
# Clone the repository
git clone https://github.com/wilsonintai76/JKM-Timetables-HUB.git
cd JKM-Timetables-HUB

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Firebase config and Gemini API key
```

### Development

```bash
npm run dev
```

Runs the app with HMR at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── src/
│   ├── components/        # React components
│   │   ├── admin/         # Admin panel components
│   │   ├── auth/          # Authentication views
│   │   ├── documents/     # Document generators (PK01, timetable)
│   │   ├── grid/          # Timetable grid cells
│   │   └── resolver/      # Clash resolver components
│   ├── data/              # Sample data & datasets
│   ├── lib/               # Firebase & API clients
│   ├── utils/             # Utilities (parsing, calendar, themes)
│   ├── api/               # API routes
│   ├── types.ts           # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Entry point
├── server.ts              # Hono/Express server
├── vite.config.ts         # Vite configuration
└── package.json
```

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Student** | View timetable, detect clashes, resolve conflicts, generate PA slips, export calendar |
| **Advisor (PA)** | Manage advisee schedules, approve clash resolutions, view department data |
| **Admin** | Manage master database, slots, endorsements, notifications, and policies |

## 📄 License

This project is for academic use by JKM students and staff.

---

Built with ❤️ for the Mechanical Engineering Department community.

