export const EVENT = {
  slug: "tom-winter-2026",
  title: "TOM WINTER ❄️☃️",
  date: "Sat, Oct 10",
  venue: "Mixbuzz Audio, Vadodara",
};

export const TICKETS = [
  { id: "adult", name: "Adult", price: 199, desc: "Single entry for one person", seats: "1 person" },
  { id: "couple", name: "Couple", price: 300, desc: "Entry for two, best value for pairs", seats: "2 people" },
  { id: "group4", name: "Group of 4", price: 500, desc: "Bring your gang along", seats: "4 people" },
] as const;

export const CATEGORIES = [
  "Poetry", "Shayari", "Storytelling", "Stand-up Comedy", "Singing",
  "Rap / Hip-Hop", "Acting", "Mimicry", "Others",
];

export const PERFORMER_FEE = 350; // registration only, no video
export const VIDEO_PACKAGE_FEE = 354; // registration + up to 6 min raw video, all-inclusive
export const VIDEO_INCLUDED_MINUTES = 6; // minutes covered inside the ₹354 package
export const EXTRA_MINUTE_RATE = 59; // ₹ per minute beyond the included 6 minutes

export const PACKAGE = {
  name: "Ultimate Artist Portfolio Package",
  price: 15000,
  deliverables: [
    "45 to 90 minutes full video recording",
    "Targeted 35 to 45 ticket show, promoted for a full house",
    "Complete Ads & Marketing management",
    "Professional Reels + edited photos for your portfolio",
  ],
};
