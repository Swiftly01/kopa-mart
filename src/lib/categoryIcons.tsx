import type { IconType } from "react-icons";
import {
  FaMobileScreenButton,
  FaMobile,
  FaTabletScreenButton,
  FaLaptop,
  FaLaptopCode,
  FaTv,
  FaCamera,
  FaHeadphones,
  FaGamepad,
  FaKeyboard,
  FaComputerMouse,
  FaPlug,
  FaWifi,
  FaSimCard,
  FaBatteryFull,
  FaChargingStation,
  FaMicrochip,
  FaRobot,
  FaDatabase,
  FaCloud,
  FaShirt,
  FaShoePrints,
  FaBagShopping,
  FaGem,
  FaGlasses,
  FaPersonDress,
  FaRing,
  FaBaby,
  FaChild,
  FaCouch,
  FaKitchenSet,
  FaBlender,
  FaBed,
  FaLightbulb,
  FaBroom,
  FaHouse,
  FaBuilding,
  FaWarehouse,
  FaFan,
  FaShower,
  FaFaucet,
  FaToilet,
  FaSolarPanel,
  FaFire,
  FaSnowflake,
  FaCar,
  FaMotorcycle,
  FaBicycle,
  FaGasPump,
  FaToolbox,
  FaScrewdriverWrench,
  FaHammer,
  FaPaintRoller,
  FaSeedling,
  FaTree,
  FaLeaf,
  FaDog,
  FaCat,
  FaPaw,
  FaFish,
  FaHorse,
  FaFutbol,
  FaDumbbell,
  FaBasketball,
  FaBook,
  FaGraduationCap,
  FaPencil,
  FaSchool,
  FaChalkboard,
  FaCalculator,
  FaFilePen,
  FaNewspaper,
  FaPalette,
  FaMusic,
  FaGuitar,
  FaFilm,
  FaCakeCandles,
  FaUtensils,
  FaMugHot,
  FaWineBottle,
  FaAppleWhole,
  FaCarrot,
  FaBreadSlice,
  FaBriefcase,
  FaHandshake,
  FaTruck,
  FaBoxOpen,
  FaTag,
  FaTags,
  FaStore,
  FaSpa,
  FaHandsBubbles,
  FaScissors,
  FaStethoscope,
  FaPills,
  FaTooth,
  FaHeart,
  FaStar,
  FaGift,
  FaCalendarDays,
  FaTicket,
  FaPlane,
  FaSuitcaseRolling,
  FaMapLocationDot,
  FaUmbrellaBeach,
  FaEllipsis,
} from "react-icons/fa6";

/**
 * Curated set of category icons.
 *
 * The KEY is what gets stored on the category (`category.icon`) and sent to
 * the backend. Keep these keys stable — renaming one breaks existing
 * categories that already reference it.
 */
export const CATEGORY_ICON_MAP: Record<string, IconType> = {
  // Electronics & gadgets
  FaMobileScreenButton,
  FaMobile,
  FaTabletScreenButton,
  FaLaptop,
  FaLaptopCode,
  FaTv,
  FaCamera,
  FaHeadphones,
  FaGamepad,
  FaKeyboard,
  FaComputerMouse,
  FaPlug,
  FaWifi,
  FaSimCard,
  FaBatteryFull,
  FaChargingStation,
  FaMicrochip,
  FaRobot,
  FaDatabase,
  FaCloud,

  // Fashion & accessories
  FaShirt,
  FaShoePrints,
  FaBagShopping,
  FaGem,
  FaGlasses,
  FaPersonDress,
  FaRing,

  // Family
  FaBaby,
  FaChild,

  // Home & furniture
  FaCouch,
  FaKitchenSet,
  FaBlender,
  FaBed,
  FaLightbulb,
  FaBroom,
  FaHouse,
  FaBuilding,
  FaWarehouse,
  FaFan,
  FaShower,
  FaFaucet,
  FaToilet,
  FaSolarPanel,
  FaFire,
  FaSnowflake,

  // Vehicles
  FaCar,
  FaMotorcycle,
  FaBicycle,
  FaGasPump,

  // Tools & trade
  FaToolbox,
  FaScrewdriverWrench,
  FaHammer,
  FaPaintRoller,

  // Garden & pets
  FaSeedling,
  FaTree,
  FaLeaf,
  FaDog,
  FaCat,
  FaPaw,
  FaFish,
  FaHorse,

  // Sports & fitness
  FaFutbol,
  FaDumbbell,
  FaBasketball,

  // Education
  FaBook,
  FaGraduationCap,
  FaPencil,
  FaSchool,
  FaChalkboard,
  FaCalculator,
  FaFilePen,
  FaNewspaper,

  // Arts & entertainment
  FaPalette,
  FaMusic,
  FaGuitar,
  FaFilm,

  // Food & drink
  FaCakeCandles,
  FaUtensils,
  FaMugHot,
  FaWineBottle,
  FaAppleWhole,
  FaCarrot,
  FaBreadSlice,

  // Business & services
  FaBriefcase,
  FaHandshake,
  FaTruck,
  FaBoxOpen,
  FaTag,
  FaTags,
  FaStore,

  // Health & beauty
  FaSpa,
  FaHandsBubbles,
  FaScissors,
  FaStethoscope,
  FaPills,
  FaTooth,

  // Travel & events
  FaHeart,
  FaStar,
  FaGift,
  FaCalendarDays,
  FaTicket,
  FaPlane,
  FaSuitcaseRolling,
  FaMapLocationDot,
  FaUmbrellaBeach,

  // Fallback / misc
  FaEllipsis,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICON_MAP);

/** Default icon used when a category has no icon or an unrecognised value. */
export const DEFAULT_CATEGORY_ICON_NAME = "FaTag";

/**
 * Resolve a stored `category.icon` value to a react-icons component.
 * Returns `null` if the value isn't a known icon name (e.g. it's a legacy
 * emoji), so callers can fall back to rendering the raw string instead.
 */
export function resolveCategoryIcon(iconName?: string | null): IconType | null {
  if (!iconName) return null;
  return CATEGORY_ICON_MAP[iconName] ?? null;
}

/** True when the given value refers to a known react-icons category icon. */
export function isKnownCategoryIcon(iconName?: string | null): boolean {
  return !!iconName && iconName in CATEGORY_ICON_MAP;
}
