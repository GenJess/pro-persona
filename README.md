# ProPersona — Your Resume, Now It Speaks

> Transform a static resume into a dynamic, voice-interactive AI persona powered by ElevenLabs conversational AI.

**Live:** [pro-persona.lovable.app](https://pro-persona.lovable.app)

---

## The Problem

Professionals spend hours crafting their resumes — yet those documents sit passively on job boards, inboxes, and LinkedIn profiles. In a world where personal branding matters more than ever, there's no way to make your professional story *interactive*. Recruiters skim. Hiring managers scan. Your story gets lost in a sea of PDFs.

## The Opportunity

**What if your resume could talk?**

ProPersona sits at the intersection of three massive trends:
1. **AI-powered personal branding** — Professionals increasingly want to differentiate themselves
2. **Voice AI maturity** — Conversational AI (ElevenLabs, OpenAI) is now production-ready
3. **Always-on representation** — The gig economy and remote work demand 24/7 professional presence

### Market Positioning

| Segment | Use Case |
|---|---|
| **Job Seekers** | Stand out to recruiters with an interactive resume that speaks |
| **Freelancers & Consultants** | Let prospective clients "interview" your persona before a call |
| **Conference Speakers** | Share a persona link so attendees can learn about your expertise on-demand |
| **Sales Professionals** | Create a voice agent that represents your pitch 24/7 |
| **Recruiters / HR Tech** | Embed persona interviews into hiring pipelines |

---

## Product Overview

### Core User Journey

```
Upload Resume → AI Extracts Text → ElevenLabs Agent Created → Shareable Voice Persona
```

1. **Sign Up** — Create an account with name, email, and password
2. **Upload Resume** — Upload a PDF/DOCX/TXT or paste raw text
3. **AI Extraction** — A backend function uses Google Gemini to extract structured text from uploaded documents
4. **Agent Creation** — A backend function calls the ElevenLabs Conversational AI API to create a voice agent trained on the user's resume
5. **Persona Management** — Set visibility (public/private), copy shareable conversation links
6. **Public Discovery** — Browse and interact with public personas on the Explore page

### Key Features

| Feature | Description |
|---|---|
| **One-Click Resume Upload** | PDF, DOCX, TXT — drag-and-drop with AI text extraction |
| **AI Voice Agent** | ElevenLabs-powered persona that speaks about your experience naturally |
| **Public/Private Toggle** | Full control over discoverability |
| **Shareable Links** | Direct conversation links for embedding in portfolios, email signatures, or social bios |
| **Public Gallery** | Browse and search all public personas |
| **Account Dashboard** | Manage persona settings, copy links, view status |
| **Password Strength Meter** | Real-time feedback on account security |
| **Progressive Creation Flow** | 4-step visual progress indicator during persona creation |

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui component library |
| **Authentication** | Lovable Cloud (Supabase Auth) — email/password |
| **Database** | PostgreSQL via Lovable Cloud |
| **Backend Functions** | Deno-based edge functions (serverless) |
| **AI — Document Extraction** | Google Gemini 2.5 Flash (via edge function) |
| **AI — Voice Agents** | ElevenLabs Conversational AI API |
| **Validation** | Zod schema validation |
| **State Management** | React Query, React Context (AuthProvider) |

### Architecture Diagram

```
┌─────────────────────────────────────────────┐
│                 Frontend (React)             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  Index   │ │  SignUp   │ │  Account     │ │
│  │ (Landing)│ │ (Onboard) │ │ (Dashboard)  │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │  SignIn  │ │ Personas │ │CreatePersona │ │
│  │          │ │ (Gallery)│ │              │ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           Lovable Cloud (Backend)           │
│  ┌─────────────────────────────────────┐    │
│  │         Authentication (Auth)       │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  PostgreSQL Database                │    │
│  │  ├─ profiles (user info, agent IDs) │    │
│  │  └─ personas (visibility, links)    │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  Edge Functions                     │    │
│  │  ├─ extract-document-text (Gemini)  │    │
│  │  └─ create-agent (ElevenLabs API)   │    │
│  └─────────────────────────────────────┘    │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ Google Gemini│    │   ElevenLabs     │
│ (Doc Extract)│    │ (Voice Agent API)│
└──────────────┘    └──────────────────┘
```

### Database Schema

**`profiles`** — User identity and agent metadata
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Matches `auth.users.id` |
| `first_name` | text | User's first name |
| `last_name` | text | User's last name |
| `elevenlabs_agent_id` | text | Created agent ID |
| `elevenlabs_agent_link` | text | Direct conversation URL |

**`personas`** — Persona configuration and visibility
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Persona identifier |
| `user_id` | UUID | Owner reference |
| `is_public` | boolean | Public gallery visibility |
| `agent_id` | text | ElevenLabs agent ID |
| `conversation_link` | text | Shareable conversation URL |
| `avatar_url` | text | Generated avatar |
| `elevenlabs_api_key` | text | User's API key (encrypted) |

### Security

- **Row Level Security (RLS)** on all tables
- Users can only read/update their own profiles and personas
- Public personas are readable by everyone (authenticated and anonymous)
- Profile data for public personas is readable for gallery display
- API keys are stored server-side, never exposed to the client
- Zod schema validation on all user inputs
- Auth state managed via secure session tokens

### Edge Functions

| Function | Purpose | External API |
|---|---|---|
| `extract-document-text` | Converts uploaded PDF/DOCX/TXT to structured text using AI | Google Gemini 2.5 Flash |
| `create-agent` | Creates an ElevenLabs conversational AI agent from resume text | ElevenLabs Conversational AI |

---

## Design System

### Visual Language

- **Typography:** Sora (display/headings) + Inter (body) — modern, geometric, professional
- **Color System:** HSL-based design tokens with full light/dark mode support
- **Layout:** Glass-morphism header, gradient orb backgrounds, generous white space
- **Animations:** CSS keyframe-driven fade-in, slide-up, float, and pulse-glow effects with staggered delays
- **Components:** shadcn/ui primitives customized with Tailwind design tokens

### Pages

| Page | Route | Purpose |
|---|---|---|
| Landing | `/` | Marketing hero, how-it-works, CTA |
| Sign Up | `/signup` | Account creation + persona setup (all-in-one) |
| Sign In | `/signin` | Returning user authentication |
| Account | `/account` | Dashboard — manage persona, settings |
| Create Persona | `/create-persona` | Standalone persona creation (for existing users) |
| Explore Personas | `/personas` | Public persona gallery with search |
| 404 | `/*` | Branded not-found page |

---

## Competitive Landscape

| Product | Differentiator | Limitation |
|---|---|---|
| **LinkedIn** | Professional network, passive profiles | No interactivity, no voice |
| **Loom** | Async video | One-way, not conversational |
| **ChatGPT Custom GPTs** | Text chat agents | No voice, not resume-focused |
| **ProPersona** | **Voice-interactive resume personas** | Requires ElevenLabs API key |

---

## Future Roadmap

- [ ] **Multi-persona support** — Create different personas for different contexts (technical, executive, creative)
- [ ] **Analytics dashboard** — Track how many conversations your persona has had
- [ ] **Custom voice cloning** — Use your own voice via ElevenLabs voice cloning
- [ ] **Embeddable widget** — Drop a "Talk to me" widget on any website
- [ ] **LinkedIn import** — Auto-pull profile data instead of uploading a resume
- [ ] **Conversation transcripts** — Review what people asked your persona
- [ ] **Team/org plans** — Company-wide persona directories
- [ ] **Custom domains** — White-label persona pages

---

## Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Requirements:** Node.js 18+ and npm

---

## Deployment

- **Frontend:** Deployed via Lovable — click Publish in the editor
- **Backend:** Edge functions deploy automatically on code push
- **Database:** Managed PostgreSQL via Lovable Cloud

---

<p align="center">
  <strong>ProPersona</strong> — Built at the intersection of AI, personal branding, and voice technology.
</p>
