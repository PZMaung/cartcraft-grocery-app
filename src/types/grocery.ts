export type CategoryId =
  | 'produce'
  | 'dairy'
  | 'bakery'
  | 'meat'
  | 'pantry'
  | 'frozen'
  | 'beverages'
  | 'snacks'
  | 'household'
  | 'personal'
  | 'other';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  aisleNumber: number;
  aisleName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  note?: string;
  category: CategoryId;
  quantity: number;
  unit?: string;
  completed: boolean;
  completedAt?: string;
  isUrgent?: boolean;
  createdAt: string;
  listId: string;
  userId?: string;
  userName?: string;
}

export interface GroceryList {
  id: string;
  name: string;
  icon: string;
  isDefault?: boolean;
  createdAt: string;
}

export const CATEGORIES: Record<CategoryId, CategoryInfo> = {
  produce: {
    id: 'produce',
    name: 'Produce & Fresh Herbs',
    aisleNumber: 1,
    aisleName: 'Aisle 1 · Produce',
    icon: 'Apple',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  bakery: {
    id: 'bakery',
    name: 'Bakery & Bread',
    aisleNumber: 2,
    aisleName: 'Aisle 2 · Bakery',
    icon: 'Croissant',
    color: 'text-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  meat: {
    id: 'meat',
    name: 'Meat & Seafood',
    aisleNumber: 3,
    aisleName: 'Aisle 3 · Butcher & Fish',
    icon: 'Beef',
    color: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
  },
  dairy: {
    id: 'dairy',
    name: 'Dairy & Eggs',
    aisleNumber: 4,
    aisleName: 'Aisle 4 · Dairy Cooler',
    icon: 'Egg',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  pantry: {
    id: 'pantry',
    name: 'Pantry, Grains & Canned',
    aisleNumber: 5,
    aisleName: 'Aisle 5 · Dry Goods & Spices',
    icon: 'Boxes',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  beverages: {
    id: 'beverages',
    name: 'Coffee, Tea & Drinks',
    aisleNumber: 6,
    aisleName: 'Aisle 6 · Beverages',
    icon: 'Coffee',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  snacks: {
    id: 'snacks',
    name: 'Snacks & Sweets',
    aisleNumber: 7,
    aisleName: 'Aisle 7 · Snacks',
    icon: 'Cookie',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  frozen: {
    id: 'frozen',
    name: 'Frozen Foods',
    aisleNumber: 8,
    aisleName: 'Aisle 8 · Freezers',
    icon: 'Snowflake',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  household: {
    id: 'household',
    name: 'Household & Cleaning',
    aisleNumber: 9,
    aisleName: 'Aisle 9 · Home & Paper',
    icon: 'Sparkles',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
  },
  personal: {
    id: 'personal',
    name: 'Health & Personal Care',
    aisleNumber: 10,
    aisleName: 'Aisle 10 · Health & Care',
    icon: 'HeartPulse',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  other: {
    id: 'other',
    name: 'Other Essentials',
    aisleNumber: 11,
    aisleName: 'Aisle 11 · Misc',
    icon: 'Tag',
    color: 'text-stone-700',
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-300',
  },
};

export const COMMON_UNITS = [
  '',
  'pcs',
  'lbs',
  'kg',
  'oz',
  'g',
  'carton',
  'pack',
  'bunch',
  'bottle',
  'bag',
  'can',
  'box',
  'gallon',
];

// Smart auto-classifier keywords
export const KEYWORD_CATEGORY_MAP: Record<string, CategoryId> = {
  // Produce
  apple: 'produce',
  banana: 'produce',
  orange: 'produce',
  lemon: 'produce',
  lime: 'produce',
  avocado: 'produce',
  tomato: 'produce',
  onion: 'produce',
  garlic: 'produce',
  potato: 'produce',
  ginger: 'produce',
  spinach: 'produce',
  kale: 'produce',
  lettuce: 'produce',
  broccoli: 'produce',
  carrot: 'produce',
  cucumber: 'produce',
  celery: 'produce',
  mushroom: 'produce',
  berry: 'produce',
  strawberr: 'produce',
  blueberr: 'produce',
  cilantro: 'produce',
  parsley: 'produce',
  basil: 'produce',
  rosemary: 'produce',
  thyme: 'produce',
  pepper: 'produce',
  zucchini: 'produce',
  herb: 'produce',
  fruit: 'produce',
  salad: 'produce',

  // Bakery
  bread: 'bakery',
  bagel: 'bakery',
  croissant: 'bakery',
  sourdough: 'bakery',
  brioche: 'bakery',
  tortilla: 'bakery',
  bun: 'bakery',
  roll: 'bakery',
  muffin: 'bakery',
  pita: 'bakery',

  // Dairy & Eggs
  egg: 'dairy',
  milk: 'dairy',
  butter: 'dairy',
  cheese: 'dairy',
  cheddar: 'dairy',
  parmesan: 'dairy',
  mozzarella: 'dairy',
  yogurt: 'dairy',
  cream: 'dairy',
  'sour cream': 'dairy',
  cottage: 'dairy',

  // Meat & Fish
  chicken: 'meat',
  beef: 'meat',
  steak: 'meat',
  pork: 'meat',
  salmon: 'meat',
  fish: 'meat',
  shrimp: 'meat',
  bacon: 'meat',
  sausage: 'meat',
  turkey: 'meat',
  tuna: 'meat',

  // Pantry
  rice: 'pantry',
  pasta: 'pantry',
  spaghetti: 'pantry',
  flour: 'pantry',
  sugar: 'pantry',
  oil: 'pantry',
  'olive oil': 'pantry',
  vinegar: 'pantry',
  salt: 'pantry',
  'pepper spice': 'pantry',
  'soy sauce': 'pantry',
  sauce: 'pantry',
  oats: 'pantry',
  oatmeal: 'pantry',
  bean: 'pantry',
  lentil: 'pantry',
  chickpea: 'pantry',
  soup: 'pantry',
  honey: 'pantry',
  cereal: 'pantry',

  // Beverages
  coffee: 'beverages',
  tea: 'beverages',
  juice: 'beverages',
  soda: 'beverages',
  sparkling: 'beverages',
  water: 'beverages',
  beer: 'beverages',
  wine: 'beverages',

  // Snacks
  chip: 'snacks',
  cracker: 'snacks',
  cookie: 'snacks',
  chocolate: 'snacks',
  nuts: 'snacks',
  almond: 'snacks',
  popcorn: 'snacks',
  pretzel: 'snacks',

  // Frozen
  frozen: 'frozen',
  'ice cream': 'frozen',
  pizza: 'frozen',
  popsicle: 'frozen',
  waffle: 'frozen',
  peas: 'frozen',

  // Household
  'paper towel': 'household',
  'toilet paper': 'household',
  'trash bag': 'household',
  soap: 'household',
  detergent: 'household',
  sponge: 'household',
  foil: 'household',
  cleaner: 'household',
  wipe: 'household',

  // Personal Care
  shampoo: 'personal',
  conditioner: 'personal',
  toothpaste: 'personal',
  toothbrush: 'personal',
  deodorant: 'personal',
  lotion: 'personal',
  sunscreen: 'personal',
  bandaid: 'personal',
};

export interface StapleItem {
  name: string;
  category: CategoryId;
  defaultUnit?: string;
  defaultNote?: string;
}

export const FREQUENT_STAPLES: StapleItem[] = [
  { name: 'Fresh Milk', category: 'dairy', defaultUnit: 'carton', defaultNote: 'Whole or 2% organic' },
  { name: 'Large Farm Eggs', category: 'dairy', defaultUnit: 'pack', defaultNote: 'Pasture-raised 12ct' },
  { name: 'Sourdough Bread', category: 'bakery', defaultUnit: 'loaf', defaultNote: 'Fresh crusty loaf' },
  { name: 'Unsalted Butter', category: 'dairy', defaultUnit: 'pack', defaultNote: 'Grass-fed' },
  { name: 'Bananas', category: 'produce', defaultUnit: 'bunch', defaultNote: 'Slightly green so they last' },
  { name: 'Garlic Bulbs', category: 'produce', defaultUnit: 'pack', defaultNote: 'Firm, no sprouting' },
  { name: 'Yellow Onions', category: 'produce', defaultUnit: 'bag', defaultNote: '3lb mesh bag' },
  { name: 'Extra Virgin Olive Oil', category: 'pantry', defaultUnit: 'bottle', defaultNote: 'Cold-pressed' },
  { name: 'Ground Dark Roast Coffee', category: 'beverages', defaultUnit: 'bag', defaultNote: 'Whole bean preferred' },
  { name: 'Boneless Chicken Breast', category: 'meat', defaultUnit: 'lbs', defaultNote: 'Approx 2 lbs' },
  { name: 'Avocados', category: 'produce', defaultUnit: 'pcs', defaultNote: 'Ready to eat in 2-3 days' },
  { name: 'Roma Tomatoes', category: 'produce', defaultUnit: 'lbs', defaultNote: 'Firm and deep red' },
  { name: 'Baby Spinach', category: 'produce', defaultUnit: 'tub', defaultNote: 'Check crispness' },
  { name: 'Greek Yogurt', category: 'dairy', defaultUnit: 'tub', defaultNote: 'Plain unsweetened' },
  { name: 'Paper Towels', category: 'household', defaultUnit: 'pack', defaultNote: 'Double rolls' },
  { name: 'Sea Salt Flakes', category: 'pantry', defaultUnit: 'box', defaultNote: 'Maldon if available' },
];

export const FORGOTTEN_CHECKLIST: { item: string; reason: string; category: CategoryId }[] = [
  { item: 'Cooking Oil / Butter', reason: 'Commonly empty when starting dinner', category: 'pantry' },
  { item: 'Garlic & Onions', reason: 'Base for almost every savory dish', category: 'produce' },
  { item: 'Eggs', reason: 'Easy to forget if you have just 1 left in the carton', category: 'dairy' },
  { item: 'Coffee / Creamer', reason: 'Terrible surprise tomorrow morning!', category: 'beverages' },
  { item: 'Paper Towels / Toilet Paper', reason: 'Bulky and easy to overlook on the list', category: 'household' },
  { item: 'Spices / Salt', reason: 'You only notice when you open the spice rack', category: 'pantry' },
  { item: 'Trash Bags / Dish Soap', reason: 'Worst to run out of mid-week', category: 'household' },
];
