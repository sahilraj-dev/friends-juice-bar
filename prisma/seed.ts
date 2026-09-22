import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.addon.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliveryLocation.deleteMany();
  await prisma.businessHours.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleared existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@friendsjuicebar.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const vendorUser = await prisma.user.create({
    data: {
      name: 'Friends Juice Bar',
      email: 'vendor@friendsjuicebar.com',
      phone: '8459725969',
      password: hashedPassword,
      role: 'VENDOR',
    },
  });

        console.log('  ✓ Created users');

  // Create vendor profile
  const vendor = await prisma.vendorProfile.create({
    data: {
      userId: vendorUser.id,
      storeName: 'Friends Juice Bar',
      phone: '8459725969',
      whatsapp: '8459725969',
      description: 'Your favourite campus juice bar! Fresh juices, creamy shakes, delicious chaat & hot beverages.',
      isOpen: true,
      minOrderAmount: 30,
      deliveryFee: 10,
      freeDeliveryThreshold: 200,
      taxRate: 5,
      estimatedPrepTime: 15,
    },
  });

  console.log('  ✓ Created vendor profile');

  // Business hours (9 AM - 10 PM, closed Sunday)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let i = 0; i < 7; i++) {
    await prisma.businessHours.create({
      data: {
        vendorId: vendor.id,
        dayOfWeek: i,
        openTime: '09:00',
        closeTime: '22:00',
        isClosed: i === 0, // Closed on Sunday
      },
    });
  }

  console.log('  ✓ Created business hours');

  // Delivery locations
  const locations = [
    { name: 'Girls Hostel Gate', icon: '👩‍🎓', description: 'Main gate of Girls Hostel', sortOrder: 1 },
    { name: 'Boys Hostel Gate', icon: '👨‍🎓', description: 'Main gate of Boys Hostel', sortOrder: 2 },
    { name: 'Academic Block', icon: '🏫', description: 'Near the main academic building', sortOrder: 3 },
    { name: 'Library', icon: '📚', description: 'Central Library entrance', sortOrder: 4 },
    { name: 'Main Gate', icon: '🏛️', description: 'College main entrance', sortOrder: 5 },
    { name: 'Canteen', icon: '🍴', description: 'College canteen area', sortOrder: 6 },
    { name: 'Administrative Block', icon: '🏢', description: 'Admin office building', sortOrder: 7 },
    { name: 'Sports Complex', icon: '🏟️', description: 'Sports ground & gym area', sortOrder: 8 },
  ];

  const deliveryLocations = [];
  for (const loc of locations) {
    const dl = await prisma.deliveryLocation.create({
      data: { vendorId: vendor.id, ...loc },
    });
    deliveryLocations.push(dl);
  }

  console.log('  ✓ Created delivery locations');

  // Categories
  const categoriesData = [
    { name: 'Creamy Sips', slug: 'creamy-sips', icon: '🥤', sortOrder: 1 },
    { name: 'Sipsters', slug: 'sipsters', icon: '🧃', sortOrder: 2 },
    { name: 'Pind Di Thand', slug: 'pind-di-thand', icon: '🥛', sortOrder: 3 },
    { name: 'Engineers Pasand', slug: 'engineers-pasand', icon: '☕', sortOrder: 4 },
    { name: 'Chaat Zella', slug: 'chaat-zella', icon: '🌶️', sortOrder: 5 },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.create({
      data: { vendorId: vendor.id, ...cat },
    });
  }

  console.log('  ✓ Created categories');

  // Helper to create product with variants and addons
  async function createProduct(data: {
    categorySlug: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    prepTime?: number;
    ingredients?: string;
    isVeg?: boolean;
    isFeatured?: boolean;
    isBestseller?: boolean;
    tags?: string;
    variants?: { name: string; price: number; isDefault?: boolean }[];
    addons?: { name: string; price: number }[];
  }) {
    const product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: categories[data.categorySlug].id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        basePrice: data.basePrice,
        prepTime: data.prepTime || 10,
        ingredients: data.ingredients || '',
        isVeg: data.isVeg !== undefined ? data.isVeg : true,
        isFeatured: data.isFeatured || false,
        isBestseller: data.isBestseller || false,
        tags: data.tags || '',
      },
    });

    if (data.variants) {
      for (let i = 0; i < data.variants.length; i++) {
        await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: data.variants[i].name,
            price: data.variants[i].price,
            isDefault: data.variants[i].isDefault || i === 0,
            sortOrder: i,
          },
        });
      }
    }

    if (data.addons) {
      for (let i = 0; i < data.addons.length; i++) {
        await prisma.addon.create({
          data: {
            productId: product.id,
            name: data.addons[i].name,
            price: data.addons[i].price,
            sortOrder: i,
          },
        });
      }
    }

    return product;
  }

  // ─── CREAMY SIPS (Shakes) ─────────────────────────────────
  const shakeAddons = [
    { name: 'Extra Dry Fruits', price: 20 },
    { name: 'Ice Cream Scoop', price: 25 },
    { name: 'Protein Powder', price: 30 },
  ];

  const mangoShake = await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Mango Shake',
    slug: 'mango-shake',
    description: 'Fresh mango blended with creamy milk — a summer favourite!',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Mango, Milk, Sugar, Ice',
    isFeatured: true,
    isBestseller: true,
    tags: 'fruity,popular,summer',
    variants: [
      { name: '350 ML', price: 50, isDefault: true },
      { name: '500 ML', price: 80 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Banana Shake',
    slug: 'banana-shake',
    description: 'Thick & creamy banana shake loaded with energy',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Banana, Milk, Sugar, Ice',
    tags: 'healthy,energy',
    variants: [
      { name: '350 ML', price: 50, isDefault: true },
      { name: '500 ML', price: 80 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Papaya Shake',
    slug: 'papaya-shake',
    description: 'Refreshing papaya shake — great for digestion',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Papaya, Milk, Sugar, Ice',
    tags: 'healthy,digestion',
    variants: [
      { name: '350 ML', price: 50, isDefault: true },
      { name: '500 ML', price: 80 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Watermelon Shake',
    slug: 'watermelon-shake',
    description: 'Cool & hydrating watermelon shake',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Watermelon, Milk, Sugar, Ice',
    tags: 'summer,refreshing',
    variants: [
      { name: '350 ML', price: 50, isDefault: true },
      { name: '500 ML', price: 80 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Muskmelon Shake',
    slug: 'muskmelon-shake',
    description: 'Sweet muskmelon blended into a creamy delight',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Muskmelon, Milk, Sugar, Ice',
    tags: 'summer',
    variants: [
      { name: '350 ML', price: 50, isDefault: true },
      { name: '500 ML', price: 80 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Strawberry Shake',
    slug: 'strawberry-shake',
    description: 'Pink, creamy strawberry shake — irresistible!',
    basePrice: 80,
    prepTime: 8,
    ingredients: 'Strawberry, Milk, Sugar, Ice Cream, Ice',
    isFeatured: true,
    tags: 'popular,premium',
    variants: [
      { name: '350 ML', price: 80, isDefault: true },
      { name: '500 ML', price: 110 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Pineapple Shake',
    slug: 'pineapple-shake',
    description: 'Tangy-sweet pineapple shake with tropical vibes',
    basePrice: 80,
    prepTime: 8,
    ingredients: 'Pineapple, Milk, Sugar, Ice',
    tags: 'tropical',
    variants: [
      { name: '350 ML', price: 80, isDefault: true },
      { name: '500 ML', price: 110 },
    ],
    addons: shakeAddons,
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Oreo Shake',
    slug: 'oreo-shake',
    description: 'Crunchy Oreo cookies blended with ice cream & milk',
    basePrice: 60,
    prepTime: 8,
    ingredients: 'Oreo Cookies, Milk, Ice Cream, Chocolate',
    isBestseller: true,
    tags: 'popular,chocolate',
    variants: [
      { name: '350 ML', price: 60, isDefault: true },
      { name: '500 ML', price: 100 },
    ],
    addons: [
      { name: 'Extra Oreo', price: 15 },
      { name: 'Chocolate Drizzle', price: 10 },
      { name: 'Ice Cream Scoop', price: 25 },
    ],
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Badam & Kaju Shake',
    slug: 'badam-kaju-shake',
    description: 'Rich almond & cashew shake — pure premium indulgence',
    basePrice: 200,
    prepTime: 10,
    ingredients: 'Almonds, Cashews, Milk, Saffron, Sugar',
    isFeatured: true,
    tags: 'premium,nuts,healthy',
    variants: [
      { name: '350 ML', price: 200, isDefault: true },
      { name: '500 ML', price: 300 },
    ],
    addons: [
      { name: 'Extra Saffron', price: 20 },
      { name: 'Pistachio Topping', price: 15 },
    ],
  });

  const chocoShake = await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Chocolate Shake',
    slug: 'chocolate-shake',
    description: 'Heavenly chocolate shake — every chocoholic\'s dream!',
    basePrice: 70,
    prepTime: 8,
    ingredients: 'Chocolate, Milk, Ice Cream, Cocoa, Ice',
    isBestseller: true,
    isFeatured: true,
    tags: 'popular,chocolate,bestseller',
    variants: [
      { name: '350 ML', price: 70, isDefault: true },
      { name: '500 ML', price: 110 },
    ],
    addons: [
      { name: 'Extra Chocolate', price: 15 },
      { name: 'Whipped Cream', price: 20 },
      { name: 'Ice Cream Scoop', price: 25 },
    ],
  });

  await createProduct({
    categorySlug: 'creamy-sips',
    name: 'Protein Shake',
    slug: 'protein-shake',
    description: 'Energy-packed protein shake for muscle growth',
    basePrice: 150,
    prepTime: 10,
    ingredients: 'Protein Powder, Banana, Milk, Peanut Butter, Oats',
    isFeatured: true,
    tags: 'health,gym,protein,energy',
    variants: [
      { name: '350 ML', price: 150, isDefault: true },
      { name: '500 ML', price: 250 },
    ],
    addons: [
      { name: 'Extra Protein Scoop', price: 30 },
      { name: 'Peanut Butter', price: 20 },
    ],
  });

  console.log('  ✓ Created Creamy Sips products');

  // ─── SIPSTERS (Juices) ────────────────────────────────────
  const juiceAddons = [
    { name: 'Ginger Shot', price: 10 },
    { name: 'Mint Leaves', price: 5 },
    { name: 'Black Salt', price: 5 },
  ];

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Mosambi Juice',
    slug: 'mosambi-juice',
    description: 'Fresh sweet lime juice — vitamin C packed!',
    basePrice: 50,
    prepTime: 7,
    ingredients: 'Mosambi (Sweet Lime), Sugar, Water',
    tags: 'citrus,healthy,vitamin-c',
    variants: [
      { name: '250 ML', price: 50, isDefault: true },
      { name: '400 ML', price: 80 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Pineapple Juice',
    slug: 'pineapple-juice',
    description: 'Tropical pineapple juice — fresh & tangy',
    basePrice: 50,
    prepTime: 7,
    ingredients: 'Pineapple, Sugar, Water',
    tags: 'tropical,tangy',
    variants: [
      { name: '250 ML', price: 50, isDefault: true },
      { name: '400 ML', price: 80 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Apple Juice',
    slug: 'apple-juice',
    description: 'Pure apple juice — keeps the doctor away!',
    basePrice: 70,
    prepTime: 7,
    ingredients: 'Apple, Sugar, Water, Lemon',
    isBestseller: true,
    tags: 'healthy,popular',
    variants: [
      { name: '250 ML', price: 70, isDefault: true },
      { name: '400 ML', price: 100 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Orange Juice',
    slug: 'orange-juice',
    description: 'Freshly squeezed oranges — burst of citrus!',
    basePrice: 50,
    prepTime: 7,
    ingredients: 'Orange, Sugar',
    isFeatured: true,
    tags: 'citrus,popular',
    variants: [
      { name: '250 ML', price: 50, isDefault: true },
      { name: '400 ML', price: 100 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Cucumber Juice',
    slug: 'cucumber-juice',
    description: 'Cool cucumber juice — perfect summer cooler',
    basePrice: 50,
    prepTime: 7,
    ingredients: 'Cucumber, Mint, Lemon, Salt',
    tags: 'cooling,healthy,summer',
    variants: [
      { name: '250 ML', price: 50, isDefault: true },
      { name: '400 ML', price: 80 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Grapes Juice',
    slug: 'grapes-juice',
    description: 'Sweet & juicy grape goodness',
    basePrice: 80,
    prepTime: 7,
    ingredients: 'Grapes, Sugar, Water',
    tags: 'sweet',
    variants: [
      { name: '250 ML', price: 80, isDefault: true },
      { name: '400 ML', price: 120 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Beetroot Juice',
    slug: 'beetroot-juice',
    description: 'Nutrient-rich beetroot juice — boost your hemoglobin!',
    basePrice: 60,
    prepTime: 8,
    ingredients: 'Beetroot, Lemon, Ginger, Water',
    tags: 'healthy,detox,iron',
    variants: [
      { name: '250 ML', price: 60, isDefault: true },
      { name: '400 ML', price: 120 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Carrot Juice',
    slug: 'carrot-juice',
    description: 'Fresh carrot juice — good for eyes & skin',
    basePrice: 40,
    prepTime: 7,
    ingredients: 'Carrot, Ginger, Lemon',
    tags: 'healthy,vitamin-a',
    variants: [
      { name: '250 ML', price: 40, isDefault: true },
      { name: '400 ML', price: 60 },
    ],
    addons: juiceAddons,
  });

  await createProduct({
    categorySlug: 'sipsters',
    name: 'Pomegranate Juice',
    slug: 'pomegranate-juice',
    description: 'Ruby red pomegranate juice — antioxidant powerhouse',
    basePrice: 80,
    prepTime: 10,
    ingredients: 'Pomegranate, Sugar',
    isFeatured: true,
    tags: 'premium,healthy,antioxidant',
    variants: [
      { name: '250 ML', price: 80, isDefault: true },
      { name: '400 ML', price: 120 },
    ],
    addons: juiceAddons,
  });

  const mixJuice = await createProduct({
    categorySlug: 'sipsters',
    name: 'Mix Juice',
    slug: 'mix-juice',
    description: 'A blend of seasonal fruits — our special mix!',
    basePrice: 50,
    prepTime: 10,
    ingredients: 'Seasonal Fruits Mix, Sugar, Water',
    isBestseller: true,
    isFeatured: true,
    tags: 'popular,special,mix',
    variants: [
      { name: '250 ML', price: 50, isDefault: true },
      { name: '400 ML', price: 80 },
    ],
    addons: juiceAddons,
  });

  console.log('  ✓ Created Sipsters products');

  // ─── PIND DI THAND ───────────────────────────────────────
  await createProduct({
    categorySlug: 'pind-di-thand',
    name: 'Lassi',
    slug: 'lassi',
    description: 'Traditional Punjabi lassi — thick, sweet & refreshing',
    basePrice: 50,
    prepTime: 5,
    ingredients: 'Yogurt, Sugar, Cardamom, Rose Water',
    isBestseller: true,
    tags: 'traditional,popular,punjabi',
    addons: [
      { name: 'Malai Topping', price: 15 },
      { name: 'Dry Fruit Garnish', price: 20 },
    ],
  });

  await createProduct({
    categorySlug: 'pind-di-thand',
    name: 'Jaljeera',
    slug: 'jaljeera',
    description: 'Spicy & tangy cumin drink — perfect digestive!',
    basePrice: 30,
    prepTime: 5,
    ingredients: 'Cumin, Mint, Black Salt, Lemon, Water',
    tags: 'spicy,digestive,summer',
    addons: [{ name: 'Extra Spicy', price: 5 }],
  });

  await createProduct({
    categorySlug: 'pind-di-thand',
    name: 'Shikanji',
    slug: 'shikanji',
    description: 'Masala lemonade — the ultimate thirst quencher!',
    basePrice: 30,
    prepTime: 5,
    ingredients: 'Lemon, Sugar, Black Salt, Cumin, Water, Ice',
    isFeatured: true,
    tags: 'summer,lemon,refreshing',
    addons: [
      { name: 'Extra Masala', price: 5 },
      { name: 'Soda', price: 10 },
    ],
  });

  console.log('  ✓ Created Pind Di Thand products');

  // ─── ENGINEERS PASAND ─────────────────────────────────────
  await createProduct({
    categorySlug: 'engineers-pasand',
    name: 'Cup Tea',
    slug: 'cup-tea',
    description: 'Classic Indian chai — the engineer\'s fuel!',
    basePrice: 15,
    prepTime: 5,
    ingredients: 'Tea Leaves, Milk, Sugar, Ginger',
    isBestseller: true,
    tags: 'popular,everyday,chai',
    addons: [
      { name: 'Extra Sugar', price: 0 },
      { name: 'Elaichi', price: 5 },
    ],
  });

  await createProduct({
    categorySlug: 'engineers-pasand',
    name: 'Kulhad Chai',
    slug: 'kulhad-chai',
    description: 'Authentic clay-cup chai — the desi experience!',
    basePrice: 20,
    prepTime: 7,
    ingredients: 'Tea Leaves, Milk, Sugar, Ginger, Cardamom',
    isFeatured: true,
    tags: 'premium,traditional,desi',
    addons: [
      { name: 'Masala', price: 5 },
      { name: 'Extra Ginger', price: 5 },
    ],
  });

  const coldCoffee = await createProduct({
    categorySlug: 'engineers-pasand',
    name: 'Cold Coffee',
    slug: 'cold-coffee',
    description: 'Creamy cold coffee — your afternoon pick-me-up!',
    basePrice: 80,
    prepTime: 8,
    ingredients: 'Coffee, Milk, Ice Cream, Sugar, Ice',
    isBestseller: true,
    isFeatured: true,
    tags: 'popular,coffee,cold,bestseller',
    addons: [
      { name: 'Extra Coffee Shot', price: 15 },
      { name: 'Chocolate Syrup', price: 10 },
      { name: 'Whipped Cream', price: 20 },
    ],
  });

  await createProduct({
    categorySlug: 'engineers-pasand',
    name: 'Hot Coffee',
    slug: 'hot-coffee',
    description: 'Strong hot coffee for those late-night study sessions',
    basePrice: 20,
    prepTime: 5,
    ingredients: 'Coffee, Milk, Sugar',
    tags: 'coffee,hot,study',
    addons: [
      { name: 'Extra Shot', price: 10 },
      { name: 'Sugar Free', price: 0 },
    ],
  });

  console.log('  ✓ Created Engineers Pasand products');

  // ─── CHAAT ZELLA ──────────────────────────────────────────
  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Mix Fruit Chaat',
    slug: 'mix-fruit-chaat',
    description: 'A colourful medley of fresh fruits with chaat masala',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Mixed Fruits, Chaat Masala, Lemon, Black Salt',
    isBestseller: true,
    isFeatured: true,
    tags: 'healthy,popular,fruity',
    addons: [
      { name: 'Extra Masala', price: 5 },
      { name: 'Cream Topping', price: 15 },
    ],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Sprouts Chaat',
    slug: 'sprouts-chaat',
    description: 'Protein-rich sprouts tossed with spices & lemon',
    basePrice: 40,
    prepTime: 8,
    ingredients: 'Mixed Sprouts, Onion, Tomato, Lemon, Chaat Masala',
    tags: 'healthy,protein',
    addons: [{ name: 'Extra Sprouts', price: 10 }],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Corn Chaat',
    slug: 'corn-chaat',
    description: 'Tangy & spicy corn kernels — a campus favourite!',
    basePrice: 40,
    prepTime: 8,
    ingredients: 'Sweet Corn, Butter, Lemon, Chaat Masala, Chili',
    isBestseller: true,
    tags: 'popular,spicy',
    addons: [
      { name: 'Extra Butter', price: 10 },
      { name: 'Cheese', price: 15 },
    ],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Papaya Chaat',
    slug: 'papaya-chaat',
    description: 'Fresh papaya cubes with tangy chaat masala',
    basePrice: 40,
    prepTime: 7,
    ingredients: 'Papaya, Chaat Masala, Lemon, Black Salt',
    tags: 'healthy,fruity',
    addons: [{ name: 'Extra Masala', price: 5 }],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Pineapple Chaat',
    slug: 'pineapple-chaat',
    description: 'Juicy pineapple pieces with a spicy-tangy twist',
    basePrice: 50,
    prepTime: 7,
    ingredients: 'Pineapple, Chaat Masala, Black Salt, Red Chili',
    tags: 'tangy,tropical',
    addons: [{ name: 'Extra Masala', price: 5 }],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Apple Chaat',
    slug: 'apple-chaat',
    description: 'Crunchy apple slices with chaat masala',
    basePrice: 50,
    prepTime: 7,
    ingredients: 'Apple, Chaat Masala, Black Salt, Lemon',
    tags: 'healthy,fruity',
    addons: [{ name: 'Extra Masala', price: 5 }],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Mung Chaat',
    slug: 'mung-chaat',
    description: 'Boiled moong dal tossed with onion, tomato & spices',
    basePrice: 40,
    prepTime: 8,
    ingredients: 'Moong Dal, Onion, Tomato, Green Chili, Lemon',
    tags: 'healthy,protein',
    addons: [{ name: 'Extra Onion', price: 5 }],
  });

  await createProduct({
    categorySlug: 'chaat-zella',
    name: 'Soyabean Chaat',
    slug: 'soyabean-chaat',
    description: 'High-protein soybean chaat — gym lovers favourite!',
    basePrice: 50,
    prepTime: 8,
    ingredients: 'Soybean, Onion, Tomato, Lemon, Green Chili, Chaat Masala',
    tags: 'protein,gym,healthy',
    addons: [{ name: 'Extra Soybean', price: 10 }],
  });

  console.log('  ✓ Created Chaat Zella products');

  // ─── Sample Coupons ───────────────────────────────────────
  await prisma.coupon.create({
    data: {
      vendorId: vendor.id,
      code: 'FIRST50',
      type: 'PERCENTAGE',
      value: 50,
      maxDiscount: 100,
      minOrderAmount: 100,
      description: '50% off on your first order! Max ₹100 discount.',
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      vendorId: vendor.id,
      code: 'CAMPUS20',
      type: 'PERCENTAGE',
      value: 20,
      maxDiscount: 50,
      minOrderAmount: 150,
      description: '20% off for campus students. Min order ₹150.',
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      vendorId: vendor.id,
      code: 'FLAT30',
      type: 'FLAT',
      value: 30,
      minOrderAmount: 200,
      description: 'Flat ₹30 off on orders above ₹200.',
      isActive: true,
    },
  });

  console.log('  ✓ Created coupons');

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────');
        console.log('Vendor:    vendor@friendsjuicebar.com / password123');
  console.log('Admin:     admin@friendsjuicebar.com / password123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
