// Mock community data — featured professionals, posts, groups.
// Used by Feed, Profile, and Groups pages until real social features ship.

export interface CommunityPerson {
  slug: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  avatarColor: string; // dicebear bg
  about: string;
  tags: string[];
  experience: { role: string; company: string; period: string }[];
  projects: { title: string; description: string }[];
  training: { resume: boolean; voice: boolean; projects: number };
  agentLink?: string | null;
  featured?: boolean;
}

export const communityPeople: CommunityPerson[] = [
  {
    slug: "steve-jobs",
    firstName: "Steve",
    lastName: "Jobs",
    headline: "Co-founder, Apple · NeXT · Pixar",
    location: "Cupertino, CA",
    avatarColor: "0a0a0a",
    about: "Obsessed with the intersection of technology and the liberal arts. Believer in saying no to a thousand things to focus on what matters.",
    tags: ["Product Vision", "Design Thinking", "Storytelling", "Leadership"],
    experience: [
      { role: "CEO", company: "Apple", period: "1997 – 2011" },
      { role: "Founder & CEO", company: "NeXT", period: "1985 – 1996" },
      { role: "Co-founder", company: "Apple", period: "1976 – 1985" },
    ],
    projects: [
      { title: "iPhone", description: "Reinvented the phone by combining a touchscreen, iPod, and internet communicator." },
      { title: "Pixar", description: "Acquired and led Pixar to redefine animated storytelling." },
    ],
    training: { resume: true, voice: true, projects: 12 },
    featured: true,
  },
  {
    slug: "jony-ive",
    firstName: "Jony",
    lastName: "Ive",
    headline: "Founder, LoveFrom · Former CDO, Apple",
    location: "San Francisco, CA",
    avatarColor: "1d4ed8",
    about: "Designer focused on craft, materiality and the quiet confidence of products that disappear into people's lives.",
    tags: ["Industrial Design", "Minimalism", "Hardware", "Craft"],
    experience: [
      { role: "Founder", company: "LoveFrom", period: "2019 – Present" },
      { role: "Chief Design Officer", company: "Apple", period: "2015 – 2019" },
      { role: "SVP Design", company: "Apple", period: "1996 – 2015" },
    ],
    projects: [
      { title: "iMac G3", description: "Translucent, friendly, and the start of a design renaissance at Apple." },
      { title: "Apple Watch", description: "An entirely new product category built around personal craft." },
    ],
    training: { resume: true, voice: true, projects: 8 },
    featured: true,
  },
  {
    slug: "satya-nadella",
    firstName: "Satya",
    lastName: "Nadella",
    headline: "Chairman & CEO, Microsoft",
    location: "Redmond, WA",
    avatarColor: "16a34a",
    about: "Mission-driven leader who believes in empathy, growth mindset, and empowering every person and organization on the planet to achieve more.",
    tags: ["Cloud", "AI Strategy", "Leadership", "Culture"],
    experience: [
      { role: "CEO", company: "Microsoft", period: "2014 – Present" },
      { role: "EVP, Cloud & Enterprise", company: "Microsoft", period: "2011 – 2014" },
    ],
    projects: [
      { title: "Azure", description: "Repositioned Microsoft as a leading cloud platform." },
      { title: "OpenAI Partnership", description: "Embedded generative AI across Microsoft's product surface." },
    ],
    training: { resume: true, voice: false, projects: 6 },
    featured: true,
  },
  {
    slug: "lisa-su",
    firstName: "Lisa",
    lastName: "Su",
    headline: "Chair & CEO, AMD",
    location: "Santa Clara, CA",
    avatarColor: "dc2626",
    about: "Engineer at heart. Focused on building the high-performance computing engines behind modern AI.",
    tags: ["Semiconductors", "Engineering", "Strategy", "AI Hardware"],
    experience: [
      { role: "CEO", company: "AMD", period: "2014 – Present" },
      { role: "SVP & GM", company: "AMD", period: "2012 – 2014" },
    ],
    projects: [
      { title: "Ryzen", description: "Returned AMD to performance leadership in CPUs." },
      { title: "MI300", description: "Datacenter accelerator for the AI era." },
    ],
    training: { resume: true, voice: true, projects: 9 },
    featured: true,
  },
  {
    slug: "brian-chesky",
    firstName: "Brian",
    lastName: "Chesky",
    headline: "Co-founder & CEO, Airbnb",
    location: "San Francisco, CA",
    avatarColor: "ea580c",
    about: "Designer-founder. Obsessed with hospitality, craft, and building products people love.",
    tags: ["Marketplace", "Design", "Founder-led Product"],
    experience: [
      { role: "CEO", company: "Airbnb", period: "2008 – Present" },
    ],
    projects: [
      { title: "Airbnb 2022 Release", description: "Reimagined the product around the host." },
    ],
    training: { resume: true, voice: true, projects: 7 },
    featured: true,
  },
  {
    slug: "jensen-huang",
    firstName: "Jensen",
    lastName: "Huang",
    headline: "Founder & CEO, NVIDIA",
    location: "Santa Clara, CA",
    avatarColor: "7c3aed",
    about: "Believer that accelerated computing and AI will reshape every industry. Obsessed with the speed of light as the only real benchmark.",
    tags: ["GPU Computing", "AI Infrastructure", "Deep Learning"],
    experience: [
      { role: "CEO", company: "NVIDIA", period: "1993 – Present" },
    ],
    projects: [
      { title: "CUDA", description: "Made GPUs programmable and unlocked the modern AI era." },
      { title: "DGX & Hopper", description: "The compute backbone behind today's largest AI models." },
    ],
    training: { resume: true, voice: true, projects: 11 },
    featured: true,
  },
];

export const getPersonBySlug = (slug: string) =>
  communityPeople.find((p) => p.slug === slug);

export const avatarUrl = (p: CommunityPerson) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${p.firstName[0]}${p.lastName[0]}&backgroundColor=${p.avatarColor}&textColor=ffffff`;

// ---------- Feed posts ----------
export interface FeedPost {
  id: string;
  authorSlug: string;
  timeAgo: string;
  content: string;
  reactions: number;
  comments: number;
}

export const feedPosts: FeedPost[] = [
  {
    id: "p1",
    authorSlug: "satya-nadella",
    timeAgo: "2h",
    content: "The companies that will lead the next decade aren't the ones with the most data — they're the ones who build the deepest empathy into their software. Curious what teams are doing to operationalize that.",
    reactions: 248,
    comments: 41,
  },
  {
    id: "p2",
    authorSlug: "jony-ive",
    timeAgo: "5h",
    content: "Constraint is a creative collaborator. The best products I've worked on weren't shaped by what was possible, but by what we refused to compromise on.",
    reactions: 512,
    comments: 78,
  },
  {
    id: "p3",
    authorSlug: "lisa-su",
    timeAgo: "1d",
    content: "Hardware roadmaps are bets you make 5 years before customers know they need them. Talk to me about how your team is planning for the next AI compute wave — happy to compare notes via my agent.",
    reactions: 196,
    comments: 33,
  },
  {
    id: "p4",
    authorSlug: "brian-chesky",
    timeAgo: "2d",
    content: "Founder mode is just the realization that the people closest to the work should own the decisions. You can't outsource taste.",
    reactions: 980,
    comments: 145,
  },
  {
    id: "p5",
    authorSlug: "jensen-huang",
    timeAgo: "3d",
    content: "Every company will become an AI company. The only question is whether you're building the model, the application, or the muscle to deploy them at speed.",
    reactions: 421,
    comments: 67,
  },
];

// ---------- Groups & Interests ----------
export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  tag: string;
}

export const groups: Group[] = [
  { id: "g1", name: "Product Leaders", description: "PMs, heads of product, and founders shipping software.", members: 4231, tag: "Product" },
  { id: "g2", name: "AI Builders", description: "Engineers and researchers building with LLMs and agents.", members: 8104, tag: "AI" },
  { id: "g3", name: "Design Craft", description: "Industrial, product, and brand designers obsessed with craft.", members: 2987, tag: "Design" },
  { id: "g4", name: "Founders Circle", description: "Early-stage founders trading hard-won lessons.", members: 5612, tag: "Startups" },
  { id: "g5", name: "GTM & Growth", description: "Go-to-market operators, marketers, and revenue leaders.", members: 3340, tag: "Growth" },
  { id: "g6", name: "Hardware & Semis", description: "Chip designers, hardware engineers, and infra folks.", members: 1245, tag: "Hardware" },
];

export const interests = [
  "Product", "AI", "Design", "Startups", "Growth", "Hardware",
  "Engineering", "Strategy", "Leadership", "Marketing", "Research", "Climate",
];
