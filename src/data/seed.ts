import aqualustre from "@/assets/products/aqualustre.jpeg";
import kampala from "@/assets/products/kampala.jpeg";
import braiding from "@/assets/products/braiding.webp";
import rolex from "@/assets/products/rolex.jpg";
import soap from "@/assets/products/soap.jpeg";
import room from "@/assets/products/room.webp";
import food from "@/assets/products/food.webp";

export type Category =
  | "Phones & Gadgets"
  | "Fashion"
  | "NYSC Essentials"
  | "Accommodation"
  | "Services"
  | "Food"
  | "Beauty & Hair"
  | "Soap"
  | "Accessories & Wears"
  | "Estate"
  | "Laundry & Cleaning Services"
  | "Others";

export const CATEGORIES: { name: Category; emoji: string }[] = [
  { name: "Phones & Gadgets", emoji: "📱" },
  { name: "Fashion", emoji: "👗" },
  { name: "NYSC Essentials", emoji: "🎓" },
  { name: "Accommodation", emoji: "🏠" },
  { name: "Services", emoji: "🛠️" },
  { name: "Food", emoji: "🍲" },
  { name: "Beauty & Hair", emoji: "💇🏽‍♀️" },
  { name: "Soap", emoji: "🧴" },
  { name: "Accessories & Wears", emoji: "👜" },
  { name: "Estate", emoji: "🏡" },
  { name: "Laundry & Cleaning Services", emoji: "🧺" },
  { name: "Others", emoji: "✨" },
];

export const OSUN_LGAS = [
  "Osogbo", "Ilesa", "Ile-Ife", "Ede", "Iwo", "Ikirun", "Ikire", "Oyan", "Ila", "Ejigbo", "Ifon", "Modakeke", "Gbongan",
];

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: Category;
  description: string;
  images: string[];
  state?: string;
  location: string;
  vendorName: string;
  vendorPhone: string;
  vendorVerified: boolean;
  sellerId: string;
  createdAt: number;
}

const phone = (n: string) => (n.startsWith("+") ? n : `+234${n.replace(/^0/, "")}`);

let id = 1;
const mk = (l: Omit<Listing, "id" | "createdAt">): Listing => ({
  ...l,
  id: String(id++),
  createdAt: Date.now() - id * 3600_000,
});

export const SEED_LISTINGS: Listing[] = [
  // NEE LUXXE x 2
  mk({ title: "NEE LUXXE Accessories", price: 30000, category: "Accessories & Wears", description: "NEE LUXXE is a trusted brand where you can get quality accessories and wears at affordable prices.", images: [kampala], state: "Osun", location: "Osogbo", vendorName: "Akande Shukurah", vendorPhone: phone("09132188510"), vendorVerified: true, sellerId: "seed-1" }),
  mk({ title: "NEE LUXXE Accessories", price: 30000, category: "Accessories & Wears", description: "NEE LUXXE is a trusted brand where you can get quality accessories and wears at affordable prices.", images: [kampala], state: "Osun", location: "Ilesa", vendorName: "Akande Shukurah", vendorPhone: phone("09132188510"), vendorVerified: true, sellerId: "seed-1" }),
  mk({ title: "NEE LUXXE Accessories", price: 30000, category: "Accessories & Wears", description: "NEE LUXXE is a trusted brand where you can get quality accessories and wears at affordable prices.", images: [kampala], state: "Osun", location: "Ede", vendorName: "Akande Shukurah", vendorPhone: phone("09132188510"), vendorVerified: true, sellerId: "seed-1" }),

  // Kampala Palazzo Trouser x 3
  mk({ title: "Kampala Palazzo Trouser", price: 20000, category: "Fashion", description: "Vibrant Kampala print palazzo trouser with wide legs. Flowy, bold, stylish 😊. Available in different prints and sizes.", images: [kampala], state: "Osun", location: "Osogbo", vendorName: "Znab.luxe Creation", vendorPhone: phone("08161551135"), vendorVerified: true, sellerId: "seed-2" }),
  mk({ title: "Kampala Palazzo Trouser", price: 20000, category: "Fashion", description: "Vibrant Kampala print palazzo trouser with wide legs. Flowy, bold, stylish 😊. Available in different prints and sizes.", images: [kampala], state: "Osun", location: "Ile-Ife", vendorName: "Znab.luxe Creation", vendorPhone: phone("08161551135"), vendorVerified: true, sellerId: "seed-2" }),
  mk({ title: "Kampala Palazzo Trouser", price: 20000, category: "Fashion", description: "Vibrant Kampala print palazzo trouser with wide legs. Flowy, bold, stylish 😊. Available in different prints and sizes.", images: [kampala], state: "Osun", location: "Iwo", vendorName: "Znab.luxe Creation", vendorPhone: phone("08161551135"), vendorVerified: true, sellerId: "seed-2" }),

  // Unique 500ml x 3
  mk({ title: "Unique Multi-Purpose Soap (500ml)", price: 800, category: "Soap", description: "Delivers powerful cleaning, rich foam, and lasting freshness for homes and businesses.", images: [soap], state: "Osun", location: "Ile-Ife", vendorName: "Unique", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-3" }),
  mk({ title: "Unique Multi-Purpose Soap (500ml)", price: 800, category: "Soap", description: "Delivers powerful cleaning, rich foam, and lasting freshness for homes and businesses.", images: [soap], state: "Osun", location: "Osogbo", vendorName: "Unique", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-3" }),
  mk({ title: "Unique Multi-Purpose Soap (500ml)", price: 800, category: "Soap", description: "Delivers powerful cleaning, rich foam, and lasting freshness for homes and businesses.", images: [soap], state: "Osun", location: "Ilesa", vendorName: "Unique", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-3" }),

  // Unique 5L x 3
  mk({ title: "Unique Multi-Purpose Soap (5 Litres)", price: 5000, category: "Soap", description: "Delivers powerful cleaning, rich foam, and lasting freshness for homes and businesses.", images: [soap], state: "Osun", location: "Ede", vendorName: "Unique", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-3" }),
  mk({ title: "Unique Multi-Purpose Soap (5 Litres)", price: 5000, category: "Soap", description: "Delivers powerful cleaning, rich foam, and lasting freshness for homes and businesses.", images: [soap], state: "Osun", location: "Osogbo", vendorName: "Unique", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-3" }),
  mk({ title: "Unique Multi-Purpose Soap (5 Litres)", price: 5000, category: "Soap", description: "Delivers powerful cleaning, rich foam, and lasting freshness for homes and businesses.", images: [soap], state: "Osun", location: "Ikirun", vendorName: "Unique", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-3" }),

  // G-Shock x 3
  mk({ title: "G-Shock Watch", price: 60000, category: "Fashion", description: "High-quality full steel GMB-2100 G-Shock wristwatch. Durable and stylish.", images: [rolex], state: "Osun", location: "Osogbo", vendorName: "Sussan", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-4" }),
  mk({ title: "G-Shock Watch", price: 60000, category: "Fashion", description: "High-quality full steel GMB-2100 G-Shock wristwatch. Durable and stylish.", images: [rolex], state: "Osun", location: "Ilesa", vendorName: "Sussan", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-4" }),
  mk({ title: "G-Shock Watch", price: 60000, category: "Fashion", description: "High-quality full steel GMB-2100 G-Shock wristwatch. Durable and stylish.", images: [rolex], state: "Osun", location: "Ede", vendorName: "Sussan", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-4" }),

  // Rolex x 3
  mk({ title: "Rolex Chain Automatic Watch", price: 150000, category: "Fashion", description: "Luxury Rolex chain automatic watch with a premium finish.", images: [rolex], state: "Osun", location: "Oyan", vendorName: "Sussan", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-4" }),
  mk({ title: "Rolex Chain Automatic Watch", price: 150000, category: "Fashion", description: "Luxury Rolex chain automatic watch with a premium finish.", images: [rolex], state: "Osun", location: "Osogbo", vendorName: "Sussan", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-4" }),
  mk({ title: "Rolex Chain Automatic Watch", price: 150000, category: "Fashion", description: "Luxury Rolex chain automatic watch with a premium finish.", images: [rolex], state: "Osun", location: "Ikire", vendorName: "Sussan", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-4" }),

  // Aqualustre x 3
  mk({ title: "Aqualustre Cleanory Services Ltd.", price: 630, category: "Laundry & Cleaning Services", description: "Your trusted partner for premium cleaning and laundry solutions.", images: [aqualustre], state: "Osun", location: "Osogbo", vendorName: "Ishaq Abdulbasit", vendorPhone: phone("07057939152"), vendorVerified: true, sellerId: "seed-5" }),
  mk({ title: "Aqualustre Cleanory Services Ltd.", price: 630, category: "Laundry & Cleaning Services", description: "Your trusted partner for premium cleaning and laundry solutions.", images: [aqualustre], state: "Osun", location: "Ilesa", vendorName: "Ishaq Abdulbasit", vendorPhone: phone("07057939152"), vendorVerified: true, sellerId: "seed-5" }),
  mk({ title: "Aqualustre Cleanory Services Ltd.", price: 630, category: "Laundry & Cleaning Services", description: "Your trusted partner for premium cleaning and laundry solutions.", images: [aqualustre], state: "Osun", location: "Ede", vendorName: "Ishaq Abdulbasit", vendorPhone: phone("07057939152"), vendorVerified: true, sellerId: "seed-5" }),

  // Traditional Food x 3
  mk({ title: "Traditional Food", price: 3500, category: "Food", description: "Delicious homemade traditional Nigerian food. Fresh and hygienically prepared.", images: [food], state: "Osun", location: "Oyan", vendorName: "Traditional Kitchen", vendorPhone: phone("07057939152"), vendorVerified: true, sellerId: "seed-6" }),
  mk({ title: "Traditional Food", price: 3500, category: "Food", description: "Delicious homemade traditional Nigerian food. Fresh and hygienically prepared.", images: [food], state: "Osun", location: "Osogbo", vendorName: "Traditional Kitchen", vendorPhone: phone("07057939152"), vendorVerified: true, sellerId: "seed-6" }),
  mk({ title: "Traditional Food", price: 3500, category: "Food", description: "Delicious homemade traditional Nigerian food. Fresh and hygienically prepared.", images: [food], state: "Osun", location: "Ilesa", vendorName: "Traditional Kitchen", vendorPhone: phone("07057939152"), vendorVerified: true, sellerId: "seed-6" }),

  // Hair Braiding x 3
  mk({ title: "Natural Hair Braiding", price: 8000, category: "Beauty & Hair", description: "Professional hair braiding service with quality materials. Various styles available.", images: [braiding], state: "Osun", location: "Osogbo", vendorName: "Hair Studio Pro", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-7" }),
  mk({ title: "Natural Hair Braiding", price: 8000, category: "Beauty & Hair", description: "Professional hair braiding service with quality materials. Various styles available.", images: [braiding], state: "Osun", location: "Ilesa", vendorName: "Hair Studio Pro", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-7" }),
  mk({ title: "Natural Hair Braiding", price: 8000, category: "Beauty & Hair", description: "Professional hair braiding service with quality materials. Various styles available.", images: [braiding], state: "Osun", location: "Ede", vendorName: "Hair Studio Pro", vendorPhone: phone("08165003477"), vendorVerified: true, sellerId: "seed-7" }),

  // Room x 3
  mk({ title: "Room for Rent", price: 80000, category: "Estate", description: "Comfortable single room apartment with amenities. Perfect for students and young professionals.", images: [room], state: "Osun", location: "Ilesa", vendorName: "Comfort Properties", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-8" }),
  mk({ title: "Room for Rent", price: 80000, category: "Estate", description: "Comfortable single room apartment with amenities. Perfect for students and young professionals.", images: [room], state: "Osun", location: "Osogbo", vendorName: "Comfort Properties", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-8" }),
  mk({ title: "Room for Rent", price: 80000, category: "Estate", description: "Comfortable single room apartment with amenities. Perfect for students and young professionals.", images: [room], state: "Osun", location: "Ile-Ife", vendorName: "Comfort Properties", vendorPhone: "+2349064756136", vendorVerified: true, sellerId: "seed-8" }),
];

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
