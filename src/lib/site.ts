export type SiteConfig = {
  name: string;
  tagline: string;
  description: string;
  heroHeadline: string;
  heroBadge: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
};

export const siteConfig: SiteConfig = {
  name: "Grace Harbor Church",
  tagline: "A church website and care-focused CMS for people, programs, and pastoral follow-up.",
  description:
    "Grace Harbor Church helps teams manage church updates, events, galleries, programs, and membership care in one place.",
  heroHeadline: "A cleaner church website and admin workspace for communication, care, and records.",
  heroBadge: "Clean church operations",
  address: "214 Hope Avenue, Pasig City, Metro Manila",
  phone: "+63 2 8123 4567",
  email: "hello@graceharbor.org",
  logoUrl: "",
};

export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/ministries", label: "Ministries" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/updates", label: "Updates" },
  { href: "/bible", label: "Bible" },
  { href: "/contact", label: "Contact" },
];

export const ministryHighlights = [
  {
    name: "Worship and Creative Arts",
    description: "Music, sound, and visual storytelling teams that serve weekly worship services.",
  },
  {
    name: "Children and Families",
    description: "Weekend discipleship, parent support, and family care gatherings.",
  },
  {
    name: "Prayer and Care",
    description: "Home visits, bereavement support, prayer chains, and pastoral follow-up.",
  },
  {
    name: "Youth and Campus",
    description: "Campus groups, mentorship, and youth-led service opportunities.",
  },
];