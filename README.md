# CampusCompass

CampusCompass is a premium, production-grade College Discovery and Decision-Making Platform designed for students and academics. Wrapped in a handcrafted **Classical Academia** ("Library at Night") visual theme, the platform offers search catalogs, side-by-side comparative matrices, dynamic predictor engines, and active discussion forums.

---

## 🏛️ Visual Identity: The Classical Academia Theme

The interface utilizes a custom academic styling system defined in `src/app/globals.css`:
- **Typography Hierarchy**: Utilizes `Cormorant Garamond` for editorial headings, `Crimson Pro` for readable body paragraphs, and `Cinzel` spaced-out capitals for high-contrast section markers.
- **Library Color Palette**:
  - **Background**: Deep Mahogany (`#1C1714`)
  - **Cards & Popovers**: Aged Oak (`#251E19`)
  - **Primary & Accent**: Polished Brass (`#C9A962`)
  - **Highlights & Actions**: Library Crimson (`#8B2635`)
  - **Borders & Dividers**: Wood Grain (`#4A3F35`)
- **Micro-interactions**: Incorporates gold corner frame flourishes, sepia image filter transitions, custom styled initials badges, and paper grain noise/vignette overlays.

---

## 🚀 Key Features

### 1. College Directory & Catalog Search
- Paginated listing with real-time text search.
- Filter panels to narrow down colleges by average tuition fees, state/location, type (Public/Private), stream (Engineering, Management, Medical), and minimum student ratings.

### 2. Tabbed Detail Pages
Each institution lists complete specifications under a unified tabs console:
- **Overview**: Extended description and institutional metadata.
- **Courses**: Fee catalogs, program durations, streams, and descriptions.
- **Placements**: Average salary, highest package, placement rates, and partner recruiters.
- **Reviews**: Authenticated reviews detailing campus life. If a user does not have a profile picture, a styled text initials badge is rendered.
- **Facilities**: Iconography-mapped campus facilities (e.g. WiFi, libraries, sports complex).

### 3. Oraculum Predictor Tool
- Input entrance exams (JEE Main, CAT, NEET, SAT, GMAT) along with ranks or percentiles/scores.
- Interactive toggle controls convert raw score percentiles into cutoff ranks.
- Returns list of matching colleges with cutoffs and placements, integrated with the comparison queue.

### 4. Real-time Comparison Matrix
- Add up to 3 institutions into a responsive comparison grid.
- Compares tuition fees, average packages, location state, and course counts side-by-side.
- Save active comparison matrices directly to your profile.

### 5. Symposium Q&A Discussions
- Categorized forum topics (Admissions, Placements, Campus Life, General).
- Complete thread list search and creation forms.
- Detail page containing scholarly answers and submission reply forms.

### 6. Authentication & Bookmarks
- Managed via Supabase Auth.
- Users are automatically signed in immediately upon successful sign-up.
- Secure, custom bookmark lists synced to individual student profiles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (Turbopack)
- **Database & ORM**: Supabase PostgreSQL database managed via Prisma Client
- **Authentication**: Supabase Auth Client
- **State Management**: Zustand (for comparison queues)
- **Queries & Mutations**: TanStack React Query (for cache invalidation and reviews submission)
- **Styling**: Tailwind CSS (v4) with custom utility layers
- **Icons & Animation**: Lucide React & Framer Motion

---

## 📂 Architecture & Folder Structure

```
├── prisma/
│   ├── schema.prisma       # Prisma DB relations (User, College, Course, Placement, Review, SavedCollege, Comparison, Discussion)
│   └── seed.js             # Seed script populating colleges, placements, and courses
├── public/                 # Static assets (favicons, SVG assets)
├── src/
│   ├── app/
│   │   ├── api/            # API Endpoints (colleges, saved-colleges, saved-comparisons, discussions, auth)
│   │   ├── auth/           # Login and Sign-up interface views
│   │   ├── colleges/       # Directory and Detail tabs views
│   │   ├── compare/        # Side-by-side comparison ledger view
│   │   ├── dashboard/      # Profile dashboard showing bookmarks & comparisons
│   │   ├── discussions/    # Discussion boards and Q&A symposia views
│   │   ├── predictor/      # Entrance exam calculator form view
│   │   ├── globals.css     # Theme design tokens and styling rules
│   │   └── layout.tsx      # Global layouts and Google Font loading config
│   ├── components/
│   │   ├── layout/         # Layout panels (Navbar, Footer)
│   │   └── ui/             # Reusable design primitives (Buttons, Cards, Inputs, Skeletons)
│   ├── hooks/              # Custom React hooks (useAuth)
│   └── lib/
│       ├── db.ts           # Prisma client instantiation
│       ├── supabase.ts     # Supabase client credentials initialization
│       └── mockData.ts     # Robust in-memory fallback datasets
```

---

## 🔧 Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/harshshirke66/AI-Software-Engineer-Internship.git
cd AI-Software-Engineer-Internship
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the root directory and configure the environment variables as required:
```env
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Database Setup & Seeding
Push the database schema structures and seed initial mock colleges:
```bash
npx prisma db push
node prisma/seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Production Builds

### Run TypeScript Compilation
```bash
npx tsc --noEmit
```

### Run Linter Checks
```bash
npm run lint
```

### Compile Production Build
```bash
npm run build
npm run start
```
