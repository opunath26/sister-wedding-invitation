/**
 * Central wedding configuration.
 * Replace the placeholder values (in square brackets or empty strings) with real details.
 * Empty strings hide the related UI automatically.
 */

export type WeddingEvent = {
  id: string;
  title: string;
  date: string; // Bengali display text
  time: string; // leave "" until confirmed
  venue: string;
  description: string;
  icon: "sun" | "flame" | "flower" | "utensils" | "home";
  optional?: boolean;
  confirmed?: boolean;
};

export type GalleryItem = {
  category: string;
  src: string; // "" = placeholder frame
  alt: string;
};

export const wedding = {
  bride: {
    name: "শতাব্দী দাশ",
    photo: "/images/bride.jpeg", // Add bride photo later
    bio: "",
  },

  groom: {
    name: "অ্যাডভোকেট অর্ণব দাশ",
    photo: "/images/groom.jpeg", // Add groom photo later
    bio: "",
  },

  // Wedding day, start of day in Asia/Dhaka (UTC+6)
  weddingDateISO: "2026-11-26T00:00:00+06:00",
  weddingDateBn: "২৬ নভেম্বর ২০২৬",
  weddingTimeBn: "",

  family: {
    brideParents: "অজিত কুমার দাশ - স্বপ্না রানী মজুমদার",
    groomParents: "অ্যাডভোকেট বাদল কান্তি দাশ - সুজল রানী দাশ",
    familyName: "",
    inviter: "",
  },

  venue: {
    name: "রয়েল অর্কিড ব্যাঙ্কুইট হল",
    address: "জামালখান, চট্টগ্রাম",
    mapsUrl: "https://maps.app.goo.gl/ppMYRTsNnZ3jyf2u5",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3690.2050659133884!2d91.8318772738418!3d22.34588454124445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30ad275e356e13bb%3A0x70031841dae05491!2sRoyal%20Orchid%20Chittagong!5e0!3m2!1sen!2sbd!4v1793601871441!5m2!1sen!2sbd",
  },

  events: [
    {
      id: "gaye-holud",
      title: "গায়ে হলুদ",
      date: "২৫ নভেম্বর ২০২৬",
      time: "",
      venue: "",
      description: "হলুদের রঙে মঙ্গলকামনা ও আনন্দে ভরা প্রথম আচার।",
      icon: "sun",
    },
    {
      id: "lagna",
      title: "বিয়ের শুভ লগ্ন",
      date: "২৬ নভেম্বর ২০২৬",
      time: "সন্ধ্যা ৭টা",
      venue: "রয়েল অর্কিড ব্যাঙ্কুইট হল, জামালখান",
      description: "অগ্নিসাক্ষী রেখে সাতপাকে বাঁধা পড়ার পবিত্র মুহূর্ত।",
      icon: "flame",
      confirmed: true,
    },
    {
      id: "shubhodrishti",
      title: "শুভদৃষ্টি ও মালাবদল",
      date: "২৬ নভেম্বর ২০২৬",
      time: "সন্ধ্যা ৭টা",
      venue: "রয়েল অর্কিড ব্যাঙ্কুইট হল, জামালখান",
      description: "পানপাতার আড়াল সরিয়ে প্রথম শুভদৃষ্টি, তারপর মালাবদল।",
      icon: "flower",
    },
    {
      id: "pritibhoj",
      title: "প্রীতিভোজ",
      date: "২৬ নভেম্বর ২০২৬",
      time: "",
      venue: "রয়েল অর্কিড ব্যাঙ্কুইট হল, জামালখান",
      description: "প্রিয়জনদের সঙ্গে আনন্দঘন ভোজের আয়োজন।",
      icon: "utensils",
    },
  ] as WeddingEvent[],

  gallery: [
    { category: "কনের ছবি", src: "/images/gallery/photo-1.jpeg", alt: "কনের ছবি" },
    { category: "বরের ছবি", src: "/images/gallery/photo-2.jpeg", alt: "বরের ছবি" },
    { category: "যুগল ছবি", src: "/images/gallery/photo-7.jpeg", alt: "যুগল ছবি" },
    { category: "পরিবারের ছবি", src: "/images/gallery/photo-4.jpeg", alt: "পরিবারের ছবি" },
    { category: "যুগল ছবি", src: "/images/gallery/photo-5.jpeg", alt: "যুগল ছবি" },
    { category: "পরিবারের ছবি", src: "/images/gallery/photo-6.jpeg", alt: "পরিবারের ছবি" },
  ] as GalleryItem[],

  engagementVideo: {
    embedUrl:
      "https://drive.google.com/file/d/1jvOws0-d3RFEi3RdO3eYhJp0c5XKXBS8/preview",
    title: "আমাদের বাগদানের কিছু স্মৃতি",
    subtitle: "একটি সুন্দর মুহূর্ত, ভালোবাসার নতুন অধ্যায়।",
    caption:
      "দুটি পরিবারের ভালোবাসা আর আশীর্বাদে শুরু হয়েছিল আমাদের নতুন পথচলা। সেই বিশেষ মুহূর্তের কিছু স্মৃতি আপনাদের সঙ্গে ভাগ করে নিতে চাই।",
  },

  musicSrc: "/sounds/aaj-se-teri.mp3", // place an mp3 in /public/music

  contact: {
    phone: "",
    email: "",
  },

  siteUrl: "", // set after publishing
};

const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);

export function getCountdown(targetISO: string, now: number) {
  const diff = new Date(targetISO).getTime() - now;

  if (diff <= 0) return null;

  const s = Math.floor(diff / 1000);

  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Developer credit shown in the footer.
 * Empty/placeholder links are hidden.
 */
export const developerInfo = {
  name: "APU Nath",
  email: "apunath1026@gmail.com",
  facebook: "https://www.facebook.com/oputhecoder26",
  // github: "https://github.com/apunath",
  linkedin: "https://www.linkedin.com/in/apu-n-76a490392/",
};

/**
 * EmailJS public (browser-safe) settings for RSVP notifications.
 * Values come from VITE_EMAILJS_* build variables.
 */
export const emailjsConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID ?? "",
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY ?? "",
};
