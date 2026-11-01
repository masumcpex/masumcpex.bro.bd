const SITE_DATA = {

  nav: [
    { label: "Home", route: "home" },
    { label: "About", route: "about" },
    { label: "Journey", route: "journey" },
    { label: "Library", href: "https://masumcpex.com/index.html#library" },
    { label: "Journal", route: "journal" },
    { label: "Tools", route: "tools" },
    { label: "Contact", route: "contact" }
  ],

  hero: {
    photo: "bd.png",
    name: "Masum",
    role: "Learner • Builder",
    tagline: "Learning never stops.",
    ctaText: "Library দেখুন",
    ctaLink: "https://masumcpex.com/index.html#library"
  },

  journey: [
    { year: "2020", title: "[চলার পথে আমার গল্প:]", description: "জীবনের অভাব, সংগ্রাম, পরিবার আর সম্পর্কের টানাপোড়েন পেরিয়ে এগিয়ে যাওয়ার কিছু সত্য গল্প—যেখানে প্রতিটি অধ্যায় রেখে যায় নতুন কোনো উপলব্ধি।", link: "https://play.google.com/store/books/details/Masum_%E0%A6%9A%E0%A6%B2_%E0%A6%B0_%E0%A6%AA%E0%A6%A5_%E0%A6%86%E0%A6%AE_%E0%A6%BE%E0%A6%B0_%E0%A6%97%E0%A6%B2%E0%A7%8D%E0%A6%AA_Cholar_pothe_Amar_Golpo?id=YuTkEQAAQBAJ", linkText: "বইটি পড়ুন" },
    { year: "2021", title: "[যার জন্য কাঁদি সে কাঁদার যোগ্য নয়]", description: "গল্পটা ছোট ছিল, অনুভূতিটা নয়।", link: "https://masumcpex.com/index.html#library", linkText: "বইটি পড়ুন" },
    { year: "2022", title: "[একাকিত্বের নোটবুক]", description: "কিছু গল্প কাউকে বলা যায় না, কিছু অনুভূতি ভাষায় প্রকাশ করা যায় না—তাই সেগুলো লিখে রাখতে হয়।", link: "https://play.google.com/store/books/details/Masum_%E0%A6%8F%E0%A6%95_%E0%A6%95_%E0%A6%A4_%E0%A6%AC_%E0%A6%B0_%E0%A6%A8_%E0%A6%9F%E0%A6%AC_%E0%A6%95_The_Solitude_Notebook?id=9QTsEQAAQBAJ", linkText: "বইটি পড়ুন" },
    { year: "2023", title: "[আসতেছে]", description: "[2023 আসতেছে — এখনো তথ্য দেওয়া হয়নি]" }
  ],

  about: {
    title: "porichiti",
    photo: "bd.png",
    paragraphs: [
      "[amar somporke 1-2 paragraph likhon —]"
    ],
    stats: []
  },

  library: [],

  journal: [],

  toolGroups: [
    { id: "business", icon: "receipt", title: "ব্যবসা", description: "ইনভয়েস, কোটেশন, রিসিপ্ট ও পে-স্লিপ" },
    { id: "office", icon: "mail", title: "অফিস ও ব্যক্তিগত", description: "চিঠি, সার্টিফিকেট, সিভি ও চুক্তিপত্র" },
    { id: "studio", icon: "doc", title: "এডিটর ও PDF টুলস", description: "ডকুমেন্ট এডিটর, ছবি থেকে PDF ও QR কোড" },
    { id: "data", icon: "set", title: "সেটিং ও ডেটা", description: "কোম্পানির তথ্য, সংরক্ষিত ডকুমেন্ট ও ব্যাকআপ" }
  ],

  tools: [
    { id: "claim", featured: true, icon: "build", title: "প্রগ্রেস ক্লেইম", description: "সাব-কন্ট্রাক্টরের ওয়ার্ক ডান স্টেটমেন্ট ও মেজারমেন্ট শিট — ২ পেজের PDF।" },
    { id: "finance", featured: true, icon: "wallet", title: "ফাইন্যান্স ট্র্যাকার", description: "আয়-ব্যয় ও ফ্যামিলি সাপোর্টের হিসাব।", url: "https://masumcpex.com/Finance.html" },
    {
      id: "attendance",
      featured: true,
      icon: "calendar",
      status: "Live",
      title: "Attendance",
      description: "দলের সদস্যদের দৈনিক হাজিরা, কর্মঘণ্টা ও মাসিক ছুটি এক জায়গায় ট্র্যাক করুন। মাসিক ক্যালেন্ডার, সামারি স্ট্যাটস ও ডাউনলোডযোগ্য PDF রিপোর্টসহ।",
      url: "attendance.html"
    },
    { id: "invoice", group: "business", icon: "receipt", title: "ইনভয়েস", description: "বিল ও ইনভয়েস তৈরি করে PDF করুন।" },
    { id: "quote", group: "business", icon: "quote", title: "কোটেশন", description: "দামের প্রস্তাব বানিয়ে পাঠান।" },
    { id: "receipt", group: "business", icon: "wallet", title: "মানি রিসিপ্ট", description: "টাকা প্রাপ্তির রসিদ তৈরি করুন।" },
    { id: "payslip", group: "business", icon: "wallet", title: "পে-স্লিপ", description: "কর্মচারীর বেতনের স্লিপ বানান।" },
    { id: "letter", group: "office", icon: "mail", title: "চিঠি / আবেদন", description: "যেকোনো আনুষ্ঠানিক চিঠি বা আবেদন।" },
    { id: "cert", group: "office", icon: "award", title: "সার্টিফিকেট", description: "প্রশংসা ও অংশগ্রহণের সনদ।" },
    { id: "cv", group: "office", icon: "user", title: "সিভি / রেজুমে", description: "পেশাদার জীবনবৃত্তান্ত তৈরি করুন।" },
    { id: "agree", group: "office", icon: "pen", title: "চুক্তিপত্র", description: "সহজ চুক্তিপত্র বা অঙ্গীকারনামা।" },
    { id: "editor", group: "studio", icon: "doc", title: "ডকুমেন্ট এডিটর", description: "বাংলায় লিখে A4/A5 PDF করুন।" },
    { id: "img", group: "studio", icon: "image", title: "ছবি থেকে PDF", description: "একাধিক ছবি এক PDF-এ জুড়ুন।" },
    { id: "qr", group: "studio", icon: "qr", title: "QR কোড জেনারেটর", description: "লিংক, ওয়াই-ফাই ও কন্টাক্টের QR কোড।" },
    { id: "saved", group: "data", icon: "save", title: "সংরক্ষিত ডকুমেন্ট", description: "আগে সংরক্ষণ করা ডকুমেন্ট খুলুন বা মুছুন।" },
    { id: "settings", group: "data", icon: "set", title: "সেটিং", description: "কোম্পানির তথ্য, ডকুমেন্টের রঙ ও ব্যাকআপ।" }
  ],

  contact: {
    location: "Lorong Haji Taib 5, Chow Kit, 50350 Malaysia",
    phone: "(+60) 1133192963",
    emails: ["info@masumcpex.com"],
    socials: [
      { url: "https://www.facebook.com/masumcpex", label: "Facebook" },
      { url: "https://www.instagram.com/masumcpex", label: "Instagram" },
      { url: "https://t.me/masumcpex", label: "Telegram" }
    ]
  }

};
