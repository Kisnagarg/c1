const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

const categories = [
  {
    name: 'Electronics',
    description: 'Discover the latest gadgets, devices, and tech essentials for your digital lifestyle.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
  },
  {
    name: 'Books',
    description: 'Explore bestsellers, classics, and hidden gems across every genre imaginable.',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=300&fit=crop'
  },
  {
    name: 'Accessories',
    description: 'Complete your look with premium watches, bags, wallets, and everyday carry essentials.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&h=300&fit=crop'
  },
  {
    name: 'Clothing',
    description: 'Stay stylish with trending fashion for men and women, from casual to formal wear.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop'
  },
  {
    name: 'Sports',
    description: 'Gear up with top-quality sports equipment, fitness accessories, and activewear.',
    image: 'https://images.unsplash.com/photo-1461896836934-ber7fc2d4fc5?w=400&h=300&fit=crop'
  },
  {
    name: 'Home & Kitchen',
    description: 'Transform your space with smart home gadgets, decor, and kitchen essentials.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Booking.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bookmart.com',
      password: 'admin123',
      phone: '+1-555-0100',
      role: 'admin'
    });
    console.log('👤 Admin user created: admin@bookmart.com / admin123');

    // Create demo user
    const demoUser = await User.create({
      name: 'John Doe',
      email: 'user@demo.com',
      password: 'user123',
      phone: '+1-555-0200',
      role: 'user'
    });
    console.log('👤 Demo user created: user@demo.com / user123');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });
    console.log(`📁 ${createdCategories.length} categories created`);

    // Create products
    const products = [
      // Electronics
      {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise cancellation with exceptional sound quality and all-day comfort.',
        detailedDescription: 'Experience the next level of silence with the Sony WH-1000XM5. Featuring two processors controlling 8 microphones, Auto NC Optimizer, and 30-hour battery life. The soft-fit leather design provides unmatched comfort for extended listening sessions. Supports LDAC for high-resolution wireless audio and multipoint connection for seamless device switching.',
        category: catMap['Electronics'],
        price: 299.99,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Driver Size', value: '30mm' },
          { key: 'Battery Life', value: '30 hours' },
          { key: 'Noise Cancellation', value: 'Active (ANC)' },
          { key: 'Connectivity', value: 'Bluetooth 5.2' },
          { key: 'Weight', value: '250g' }
        ],
        ratingAvg: 4.7,
        ratingCount: 1284
      },
      {
        name: 'Apple iPad Air M2',
        description: 'Supercharged by the M2 chip with a stunning 11-inch Liquid Retina display.',
        detailedDescription: 'The iPad Air features the powerful M2 chip delivering next-level performance. The 11-inch Liquid Retina display with P3 wide color and True Tone makes everything look stunning. Works with Apple Pencil Pro and Magic Keyboard for the ultimate creative and productivity experience.',
        category: catMap['Electronics'],
        price: 599.00,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Chip', value: 'Apple M2' },
          { key: 'Display', value: '11" Liquid Retina' },
          { key: 'Storage', value: '128GB' },
          { key: 'Camera', value: '12MP Wide' },
          { key: 'Battery', value: 'Up to 10 hours' }
        ],
        ratingAvg: 4.8,
        ratingCount: 856
      },
      {
        name: 'Samsung Galaxy Watch 6',
        description: 'Advanced health monitoring and fitness tracking in an elegant smartwatch design.',
        detailedDescription: 'The Galaxy Watch 6 combines sophisticated design with comprehensive health features. Track your heart rate, sleep patterns, body composition, and workouts with precision. Features a vibrant Super AMOLED display, Wear OS powered by Samsung, and up to 40 hours of battery life.',
        category: catMap['Electronics'],
        price: 329.99,
        stock: 25,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Display', value: '1.5" Super AMOLED' },
          { key: 'OS', value: 'Wear OS' },
          { key: 'Battery', value: '40 hours' },
          { key: 'Water Resistance', value: '5ATM + IP68' },
          { key: 'Sensors', value: 'BioActive, Temp, GPS' }
        ],
        ratingAvg: 4.5,
        ratingCount: 672
      },
      {
        name: 'JBL Charge 5 Portable Speaker',
        description: 'Powerful JBL Original Pro Sound with IP67 waterproof and dustproof rating.',
        detailedDescription: 'JBL Charge 5 delivers bold sound with its optimized long-excursion driver and dual JBL bass radiators. The IP67 waterproof and dustproof design lets you take it anywhere. With 20 hours of playtime and a built-in powerbank, the party never stops.',
        category: catMap['Electronics'],
        price: 179.95,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Output Power', value: '40W' },
          { key: 'Battery Life', value: '20 hours' },
          { key: 'Waterproof', value: 'IP67' },
          { key: 'Bluetooth', value: '5.1' },
          { key: 'Weight', value: '960g' }
        ],
        ratingAvg: 4.6,
        ratingCount: 2341
      },
      // Books
      {
        name: 'Atomic Habits by James Clear',
        description: 'An easy and proven way to build good habits and break bad ones. #1 New York Times bestseller.',
        detailedDescription: 'No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results. With over 15 million copies sold worldwide.',
        category: catMap['Books'],
        price: 15.99,
        stock: 200,
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Author', value: 'James Clear' },
          { key: 'Pages', value: '320' },
          { key: 'Format', value: 'Paperback' },
          { key: 'Language', value: 'English' },
          { key: 'ISBN', value: '978-0735211292' }
        ],
        ratingAvg: 4.9,
        ratingCount: 94521
      },
      {
        name: 'The Psychology of Money',
        description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.',
        detailedDescription: 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave. Morgan Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life\'s most important topics.',
        category: catMap['Books'],
        price: 14.49,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Author', value: 'Morgan Housel' },
          { key: 'Pages', value: '256' },
          { key: 'Format', value: 'Paperback' },
          { key: 'Language', value: 'English' },
          { key: 'ISBN', value: '978-0857197689' }
        ],
        ratingAvg: 4.7,
        ratingCount: 56230
      },
      {
        name: 'Deep Work by Cal Newport',
        description: 'Rules for focused success in a distracted world. Transform your productivity.',
        detailedDescription: 'Deep Work proposes that the ability to focus without distraction on a cognitively demanding task is becoming increasingly rare and valuable. Cal Newport flips the narrative on impact in a connected age, arguing that deep work is like a superpower in our increasingly competitive economy.',
        category: catMap['Books'],
        price: 13.99,
        stock: 120,
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Author', value: 'Cal Newport' },
          { key: 'Pages', value: '296' },
          { key: 'Format', value: 'Paperback' },
          { key: 'Language', value: 'English' },
          { key: 'ISBN', value: '978-0349411903' }
        ],
        ratingAvg: 4.6,
        ratingCount: 28450
      },
      // Accessories
      {
        name: 'Premium Leather Laptop Sleeve',
        description: 'Handcrafted genuine leather sleeve for 13-14 inch laptops. Slim and protective.',
        detailedDescription: 'Crafted from full-grain vegetable-tanned leather, this sleeve provides elegant protection for your laptop. Features a soft microfiber lining, magnetic closure, and an external pocket for accessories. Fits MacBook Air/Pro 13-14 inch and similar-sized laptops.',
        category: catMap['Accessories'],
        price: 49.99,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Material', value: 'Full-grain Leather' },
          { key: 'Compatibility', value: '13-14" Laptops' },
          { key: 'Closure', value: 'Magnetic' },
          { key: 'Lining', value: 'Microfiber' },
          { key: 'Color', value: 'Cognac Brown' }
        ],
        ratingAvg: 4.4,
        ratingCount: 342
      },
      {
        name: 'Minimalist Canvas Backpack',
        description: 'Water-resistant canvas daypack with padded laptop compartment and anti-theft design.',
        detailedDescription: 'This minimalist backpack combines style with functionality. Made from water-resistant canvas with a padded 15.6" laptop compartment, hidden anti-theft pocket, and USB charging port. Perfect for daily commute, travel, or campus life. Ergonomic shoulder straps ensure all-day comfort.',
        category: catMap['Accessories'],
        price: 64.99,
        stock: 55,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Material', value: 'Water-resistant Canvas' },
          { key: 'Capacity', value: '25L' },
          { key: 'Laptop Fit', value: 'Up to 15.6"' },
          { key: 'USB Port', value: 'Yes' },
          { key: 'Weight', value: '680g' }
        ],
        ratingAvg: 4.3,
        ratingCount: 567
      },
      {
        name: 'Classic Aviator Sunglasses',
        description: 'Polarized UV400 aviator sunglasses with titanium frame and scratch-resistant lenses.',
        detailedDescription: 'These premium aviator sunglasses feature polarized UV400 lenses that eliminate glare and protect your eyes. The ultra-lightweight titanium frame provides durability without the weight. Includes a premium leather case and microfiber cleaning cloth.',
        category: catMap['Accessories'],
        price: 89.99,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Lens Type', value: 'Polarized UV400' },
          { key: 'Frame Material', value: 'Titanium' },
          { key: 'Lens Width', value: '58mm' },
          { key: 'Weight', value: '28g' },
          { key: 'Includes', value: 'Case + Cloth' }
        ],
        ratingAvg: 4.5,
        ratingCount: 891
      },
      // Clothing
      {
        name: 'Nike Air Max 270 Running Shoes',
        description: 'Iconic lifestyle sneakers with Max Air unit for unbelievable all-day comfort.',
        detailedDescription: 'The Nike Air Max 270 delivers visible cushioning under every step. Its large window showcases Nike\'s biggest Air unit yet for a supersoft ride that feels as impossible as it looks. The sleek design and breathable mesh upper make it perfect for both running and everyday wear.',
        category: catMap['Clothing'],
        price: 129.99,
        stock: 35,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Type', value: 'Running / Lifestyle' },
          { key: 'Cushioning', value: 'Max Air 270' },
          { key: 'Upper', value: 'Breathable Mesh' },
          { key: 'Sole', value: 'Rubber' },
          { key: 'Available Sizes', value: '7-13 US' }
        ],
        ratingAvg: 4.6,
        ratingCount: 4523
      },
      {
        name: 'Premium Cotton Crew T-Shirt Pack',
        description: 'Set of 3 ultra-soft 100% organic cotton t-shirts in essential neutral colors.',
        detailedDescription: 'Upgrade your basics with our premium organic cotton crew neck t-shirts. Each pack includes 3 shirts in Black, White, and Navy. Made from 180 GSM ring-spun cotton for a perfect drape and lasting softness. Pre-shrunk and machine washable. Reinforced seams for durability.',
        category: catMap['Clothing'],
        price: 39.99,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Material', value: '100% Organic Cotton' },
          { key: 'Weight', value: '180 GSM' },
          { key: 'Pack', value: '3 Shirts' },
          { key: 'Colors', value: 'Black, White, Navy' },
          { key: 'Sizes', value: 'S - XXL' }
        ],
        ratingAvg: 4.4,
        ratingCount: 1876
      },
      {
        name: 'Slim Fit Stretch Chino Pants',
        description: 'Versatile stretch chinos with a modern slim fit. Perfect for work or weekend.',
        detailedDescription: 'These premium chinos feature a blend of cotton and elastane for comfortable stretch throughout the day. The slim fit silhouette is tailored without being tight. Available in multiple colors, these pants transition seamlessly from office to dinner.',
        category: catMap['Clothing'],
        price: 54.99,
        stock: 70,
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Material', value: '98% Cotton, 2% Elastane' },
          { key: 'Fit', value: 'Slim' },
          { key: 'Rise', value: 'Mid-Rise' },
          { key: 'Closure', value: 'Zip Fly + Button' },
          { key: 'Sizes', value: '28 - 40 Waist' }
        ],
        ratingAvg: 4.3,
        ratingCount: 923
      },
      // Sports
      {
        name: 'Professional Yoga Mat',
        description: 'Extra thick 6mm non-slip yoga mat with alignment lines and carrying strap.',
        detailedDescription: 'Elevate your practice with our professional-grade yoga mat. The 6mm thickness provides perfect cushioning for joints while maintaining stability. Dual-layer technology ensures a non-slip surface even during hot yoga. Laser-etched alignment lines help perfect your poses.',
        category: catMap['Sports'],
        price: 34.99,
        stock: 90,
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Thickness', value: '6mm' },
          { key: 'Material', value: 'TPE (Eco-friendly)' },
          { key: 'Size', value: '183cm x 61cm' },
          { key: 'Non-slip', value: 'Dual-layer' },
          { key: 'Includes', value: 'Carrying Strap' }
        ],
        ratingAvg: 4.5,
        ratingCount: 2134
      },
      {
        name: 'Adjustable Dumbbell Set 5-25 lbs',
        description: 'Space-saving adjustable dumbbells replacing 5 sets of weights. Quick-change mechanism.',
        detailedDescription: 'Transform your home gym with these innovative adjustable dumbbells. Quickly switch between 5, 10, 15, 20, and 25 lbs with the twist-lock mechanism. Compact design replaces an entire rack of dumbbells. Ergonomic handle with soft-grip coating for comfortable, secure workouts.',
        category: catMap['Sports'],
        price: 199.99,
        stock: 20,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Weight Range', value: '5-25 lbs per dumbbell' },
          { key: 'Increments', value: '5 lb' },
          { key: 'Mechanism', value: 'Twist-lock' },
          { key: 'Handle', value: 'Ergonomic Soft-grip' },
          { key: 'Set Includes', value: '2 Dumbbells + Stand' }
        ],
        ratingAvg: 4.7,
        ratingCount: 456
      },
      {
        name: 'Resistance Bands Set (5 Pack)',
        description: 'Professional-grade latex resistance bands with 5 resistance levels and accessories.',
        detailedDescription: 'Complete your home workout setup with this premium resistance bands set. Includes 5 color-coded bands ranging from 10-50 lbs of resistance. Made from natural latex for durability and snap resistance. Set includes door anchor, ankle straps, handles, and a carrying bag.',
        category: catMap['Sports'],
        price: 29.99,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Bands', value: '5 (10-50 lbs)' },
          { key: 'Material', value: 'Natural Latex' },
          { key: 'Accessories', value: 'Handles, Anchor, Straps' },
          { key: 'Carry Bag', value: 'Included' },
          { key: 'Use', value: 'Full Body Workout' }
        ],
        ratingAvg: 4.4,
        ratingCount: 3456
      },
      // Home & Kitchen
      {
        name: 'Smart LED Desk Lamp',
        description: 'Touch-controlled LED desk lamp with wireless charging pad and USB port.',
        detailedDescription: 'This multifunctional desk lamp combines brilliant illumination with modern convenience. Features 5 color temperatures, 7 brightness levels, and a built-in Qi wireless charging pad. The flexible gooseneck allows precise light positioning. Touch controls and a 1-hour auto-off timer make it effortless to use.',
        category: catMap['Home & Kitchen'],
        price: 45.99,
        stock: 65,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Light Source', value: 'LED' },
          { key: 'Color Temps', value: '5 Modes (2700K-6500K)' },
          { key: 'Wireless Charging', value: 'Qi Compatible' },
          { key: 'USB Port', value: 'Yes' },
          { key: 'Timer', value: '1-hour auto-off' }
        ],
        ratingAvg: 4.3,
        ratingCount: 789
      },
      {
        name: 'French Press Coffee Maker',
        description: 'Double-walled stainless steel French press for perfectly brewed coffee every time.',
        detailedDescription: 'Brew barista-quality coffee at home with our premium French press. The double-walled stainless steel construction keeps coffee hot for hours while staying cool to the touch. The 4-level filtration system ensures a clean, grit-free cup every time. Dishwasher safe and built to last.',
        category: catMap['Home & Kitchen'],
        price: 32.99,
        stock: 85,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Material', value: 'Stainless Steel (18/10)' },
          { key: 'Capacity', value: '34 oz / 1 Liter' },
          { key: 'Insulation', value: 'Double-walled' },
          { key: 'Filter', value: '4-level filtration' },
          { key: 'Dishwasher Safe', value: 'Yes' }
        ],
        ratingAvg: 4.6,
        ratingCount: 1567
      },
      {
        name: 'Bamboo Cutting Board Set',
        description: 'Set of 3 organic bamboo cutting boards with juice groove and easy-grip handles.',
        detailedDescription: 'Upgrade your kitchen with this beautiful set of 3 organic bamboo cutting boards. Available in small, medium, and large sizes to handle any prep task. Features deep juice grooves, easy-grip handles, and a naturally antimicrobial surface. Bamboo is 16% harder than maple, ensuring lasting durability.',
        category: catMap['Home & Kitchen'],
        price: 24.99,
        stock: 110,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
        specifications: [
          { key: 'Material', value: 'Organic Bamboo' },
          { key: 'Set', value: '3 Boards (S/M/L)' },
          { key: 'Features', value: 'Juice Groove, Handles' },
          { key: 'Antimicrobial', value: 'Natural' },
          { key: 'Maintenance', value: 'Hand Wash, Oil Monthly' }
        ],
        ratingAvg: 4.5,
        ratingCount: 2890
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`📦 ${createdProducts.length} products created`);

    // Create demo bookings
    const bookings = [
      {
        bookingId: 'BK-DM001',
        user: demoUser._id,
        items: [
          {
            product: createdProducts[0]._id,
            name: createdProducts[0].name,
            price: createdProducts[0].price,
            quantity: 1,
            image: createdProducts[0].image
          }
        ],
        totalAmount: createdProducts[0].price,
        status: 'completed'
      },
      {
        bookingId: 'BK-DM002',
        user: demoUser._id,
        items: [
          {
            product: createdProducts[4]._id,
            name: createdProducts[4].name,
            price: createdProducts[4].price,
            quantity: 2,
            image: createdProducts[4].image
          },
          {
            product: createdProducts[14]._id,
            name: createdProducts[14].name,
            price: createdProducts[14].price,
            quantity: 1,
            image: createdProducts[14].image
          }
        ],
        totalAmount: (createdProducts[4].price * 2) + createdProducts[14].price,
        status: 'confirmed'
      },
      {
        bookingId: 'BK-DM003',
        user: demoUser._id,
        items: [
          {
            product: createdProducts[10]._id,
            name: createdProducts[10].name,
            price: createdProducts[10].price,
            quantity: 1,
            image: createdProducts[10].image
          }
        ],
        totalAmount: createdProducts[10].price,
        status: 'pending'
      }
    ];

    await Booking.insertMany(bookings);
    console.log('📋 3 demo bookings created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📌 Login Credentials:');
    console.log('   Admin: admin@bookmart.com / admin123');
    console.log('   User:  user@demo.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
