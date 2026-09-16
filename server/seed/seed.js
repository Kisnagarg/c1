const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Booking = require('../models/Booking');

// The 8 initial categories required for the client project
const categoriesData = [
  {
    name: 'Drones',
    description: 'High-performance camera drones, mini drones, and professional aerial photography gear.',
    image: 'https://images.unsplash.com/photo-1507582020434-97210e740b79?w=800&auto=format&fit=crop&q=80',
    displayOrder: 1,
    isActive: true
  },
  {
    name: 'Toys & Monster Trucks',
    description: 'Rugged 4x4 monster trucks, die-cast vehicles, and exciting durable play sets for all ages.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    displayOrder: 2,
    isActive: true
  },
  {
    name: 'Bulbs & Tubes',
    description: 'Energy-saving LED smart bulbs, ambient tube lights, and architectural lighting solutions.',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
    displayOrder: 3,
    isActive: true
  },
  {
    name: 'Wires & Cables',
    description: 'Heavy-duty electrical wires, shielded copper conduits, and domestic wiring essentials.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    displayOrder: 4,
    isActive: true
  },
  {
    name: 'Chargers',
    description: 'Ultra-fast GaN power adapters, multi-device charging docks, and universal mobile chargers.',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    displayOrder: 5,
    isActive: true
  },
  {
    name: 'RC Toys',
    description: 'Remote-controlled racing cars, acrobatic helicopters, drift vehicles, and speed boats.',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80',
    displayOrder: 6,
    isActive: true
  },
  {
    name: 'Mixers & Kitchen Appliances',
    description: 'High-speed blender mixers, multi-jar food processors, and heavy-duty kitchen appliances.',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    displayOrder: 7,
    isActive: true
  },
  {
    name: 'Others',
    description: 'Versatile electronic accessories, everyday utility essentials, and lifestyle tech gadgets.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    displayOrder: 8,
    isActive: true
  }
];

const sampleProductsByCategory = {
  'Drones': [
    {
      name: 'SkyHawk 4K Ultra HD Drone',
      description: 'Foldable GPS camera drone with 3-axis gimbal, 35-min flight time, and auto-return feature.',
      detailedDescription: 'The SkyHawk 4K Ultra HD Drone delivers stunning cinematic aerial footage with its Sony CMOS sensor, 4K 60fps recording, and level-6 wind resistance. Equipped with smart obstacle avoidance sensors, GPS geofencing, and 10km video transmission, it is ideal for both creators and commercial surveying.',
      price: 49999,
      stock: 12,
      image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507582020434-97210e740b79?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Camera', value: '4K Ultra HD 60fps' },
        { key: 'Flight Time', value: '35 Minutes' },
        { key: 'Transmission Range', value: '10 Kilometers' },
        { key: 'Gimbal', value: '3-Axis Mechanical Stabilization' }
      ],
      ratingAvg: 4.8,
      ratingCount: 34
    },
    {
      name: 'AeroMini Pocket Stunt Drone',
      description: 'Compact beginner-friendly drone with altitude hold, 360-degree flips, and 1080p camera.',
      detailedDescription: 'Perfect for beginners and drone enthusiasts, the AeroMini features headless mode, one-key takeoff and landing, and durable propeller guards designed to survive accidental drops.',
      price: 7499,
      stock: 25,
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Resolution', value: '1080p Full HD' },
        { key: 'Flight Time', value: '18 Minutes per battery' },
        { key: 'Features', value: '360° Flips, Altitude Hold' }
      ],
      ratingAvg: 4.5,
      ratingCount: 19
    }
  ],
  'Toys & Monster Trucks': [
    {
      name: 'Titan 4WD Rock Crawler Monster Truck',
      description: 'Giant scale 1:12 off-road rock crawler with independent suspension and dual-motor torque.',
      detailedDescription: 'Conquer mud, gravel, and rough terrain with the Titan 4WD. Engineered with high-torque magnetic motors, metal shock absorbers, and anti-skid rubber oversized tires.',
      price: 3499,
      stock: 18,
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Scale', value: '1:12 Scale' },
        { key: 'Drive', value: '4-Wheel Drive (4WD)' },
        { key: 'Battery', value: '7.4V 1200mAh Li-ion' },
        { key: 'Top Speed', value: '25 km/h' }
      ],
      ratingAvg: 4.7,
      ratingCount: 42
    },
    {
      name: 'Blaze Inferno Stunt Car',
      description: 'Double-sided 360 rotation tumbler car with LED lights and crash-resistant casing.',
      detailedDescription: 'Built for intense indoor and outdoor action. Performs thrilling flips, 360-degree spins, and continues driving even when flipped upside down.',
      price: 1899,
      stock: 4, // low stock test
      image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Rotation', value: '360° Double-Sided Tumbling' },
        { key: 'Lighting', value: 'Dual LED Headlights' }
      ],
      ratingAvg: 4.3,
      ratingCount: 15
    }
  ],
  'Bulbs & Tubes': [
    {
      name: 'Lumina Smart RGBW LED Bulb (12W)',
      description: '16 Million colors, voice control with Alexa/Google Home, and dimmable warmth settings.',
      detailedDescription: 'Transform any room with Lumina Smart RGBW. Connects directly via WiFi without a hub. Supports custom schedules, music syncing, and energy monitoring.',
      price: 899,
      stock: 80,
      image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Wattage', value: '12W (Equivalent to 100W incandescent)' },
        { key: 'Base', value: 'B22 / E27' },
        { key: 'Color Spectrum', value: '16 Million Colors + Warm/Cool White' }
      ],
      ratingAvg: 4.6,
      ratingCount: 68
    },
    {
      name: 'BrightLite 20W LED Batten Tube Light',
      description: 'Glare-free cool daylight tube light with surge protection and ultra-slim aluminum housing.',
      detailedDescription: 'Industrial grade 20W LED batten delivering 2400 lumens with zero flicker. Ideal for homes, offices, retail spaces, and workshops.',
      price: 499,
      stock: 45,
      image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Lumen Output', value: '2400 Lumens' },
        { key: 'Length', value: '4 Feet (120cm)' },
        { key: 'Surge Protection', value: 'Up to 4kV' }
      ],
      ratingAvg: 4.4,
      ratingCount: 29
    }
  ],
  'Wires & Cables': [
    {
      name: 'VoltSafe 2.5 sq.mm FR Industrial Copper Wire (90m)',
      description: 'Flame retardant 100% electrolytic pure copper wire spool for domestic and commercial wiring.',
      detailedDescription: 'IS-certified 2.5mm multi-strand copper cable with advanced flame-retardant PVC insulation. Engineered to resist heat, voltage spikes, and wear.',
      price: 2699,
      stock: 30,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Gauge', value: '2.5 sq mm' },
        { key: 'Length', value: '90 Metres' },
        { key: 'Insulation', value: 'Flame Retardant (FR) Grade PVC' }
      ],
      ratingAvg: 4.9,
      ratingCount: 51
    },
    {
      name: 'ShieldPro Cat6 High-Speed Ethernet Cable (20m)',
      description: 'Gigabit 1000Mbps gold-plated RJ45 network patch cord with anti-interference shielding.',
      detailedDescription: 'High-bandwidth Cat6 patch cord capable of handling up to 10Gbps transmission with zero packet drop. Snagless design with molded strain-relief boots.',
      price: 649,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Category', value: 'Cat 6' },
        { key: 'Length', value: '20 Metres' },
        { key: 'Bandwidth', value: 'Up to 550 MHz' }
      ],
      ratingAvg: 4.7,
      ratingCount: 38
    }
  ],
  'Chargers': [
    {
      name: 'PowerVolt 65W GaN Fast Charger',
      description: 'Compact 3-port GaN III wall charger supporting Type-C PD 3.0 and QC 4.0 for laptops and phones.',
      detailedDescription: 'Powered by Gallium Nitride (GaN) technology, this ultra-portable 65W brick charges a MacBook Pro to 50% in 30 minutes, along with smartphones and tablets simultaneously.',
      price: 2499,
      stock: 22,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Total Output', value: '65W Max' },
        { key: 'Ports', value: '2x USB-C + 1x USB-A' },
        { key: 'Technology', value: 'GaN III Fast Charging' }
      ],
      ratingAvg: 4.8,
      ratingCount: 74
    },
    {
      name: 'MagCharge 3-in-1 Magnetic Wireless Station',
      description: 'Foldable 15W wireless charging stand for iPhone, Apple Watch, and AirPods simultaneously.',
      detailedDescription: 'Clean up your desk with MagCharge. Strong built-in magnets ensure snap-on alignment with horizontal and vertical viewing modes.',
      price: 3299,
      stock: 14,
      image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Wireless Output', value: '15W / 5W / 3W' },
        { key: 'Compatibility', value: 'MagSafe and Qi-enabled devices' }
      ],
      ratingAvg: 4.6,
      ratingCount: 31
    }
  ],
  'RC Toys': [
    {
      name: 'SpeedDemon 1:16 High-Speed RC Drift Car',
      description: '2.4GHz 40km/h remote control drift car with spare drift tires, gyro assist, and LED headlights.',
      detailedDescription: 'Engineered for high-speed drifting thrills. Comes with an electronic stability control gyro, proportional steering, and interchangeable rally and drift tires.',
      price: 4599,
      stock: 11,
      image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Top Speed', value: '40 km/h' },
        { key: 'Frequency', value: '2.4 GHz Anti-Jamming' },
        { key: 'Control Distance', value: 'Up to 80 Metres' }
      ],
      ratingAvg: 4.7,
      ratingCount: 26
    },
    {
      name: 'SkyHover RC Aerobatic Helicopter',
      description: 'Dual rotor indoor/outdoor alloy helicopter with auto-hover gyro and crash protection.',
      detailedDescription: 'Built with an alloy frame for superior durability against bumps and crashes. Features one-button altitude hold and emergency stop for effortless flying.',
      price: 2999,
      stock: 3, // low stock test
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Channels', value: '3.5 Channel with Gyro' },
        { key: 'Flight Time', value: '12-15 Minutes' }
      ],
      ratingAvg: 4.2,
      ratingCount: 14
    }
  ],
  'Mixers & Kitchen Appliances': [
    {
      name: 'MasterChef 1000W Heavy-Duty Mixer Grinder',
      description: 'Copper motor mixer with 3 stainless steel jars, pulse control, and overload protector.',
      detailedDescription: 'Crush the toughest spices, batters, and purees effortlessly with the MasterChef 1000W. Features stainless steel flow-breaker jars and self-lubricating nylon couplers.',
      price: 4999,
      stock: 16,
      image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Motor', value: '1000W 100% Pure Copper' },
        { key: 'Jars', value: '1.5L Wet, 1.0L Dry, 0.4L Chutney' },
        { key: 'Speed Settings', value: '3 Speeds + Pulse' }
      ],
      ratingAvg: 4.9,
      ratingCount: 88
    },
    {
      name: 'NutriBlend 500W Smoothie Maker & Blender',
      description: 'High-speed single-serve bullet blender with 2 travel cups and extract blades.',
      detailedDescription: 'Extract maximum nutrition from whole fruits, nuts, and veggies in 30 seconds. Includes 2 BPA-free portable sipper cups for active lifestyles.',
      price: 2799,
      stock: 20,
      image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'RPM', value: '22,000 RPM' },
        { key: 'Blade', value: '4-Wing Stainless Steel Cross Blade' }
      ],
      ratingAvg: 4.5,
      ratingCount: 39
    }
  ],
  'Others': [
    {
      name: 'OmniPlug Universal Travel Power Adapter',
      description: 'All-in-one worldwide international adapter with 4 USB ports and Type-C 30W output.',
      detailedDescription: 'Works in more than 150 countries including US, UK, EU, AU, and Asia. Features built-in safety shutters and dual 8A auto-resetting fuses.',
      price: 1499,
      stock: 35,
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Global Compatibility', value: 'US, UK, EU, AU & 150+ Countries' },
        { key: 'USB Output', value: '3x USB-A + 1x Type-C 30W' }
      ],
      ratingAvg: 4.6,
      ratingCount: 52
    },
    {
      name: 'SmartPlug WiFi Energy Monitoring Socket (16A)',
      description: 'Schedule appliances, track power consumption, and control via mobile app from anywhere.',
      detailedDescription: 'Turn any heavy home appliance like geysers or air conditioners into a smart device. Set automated timers and monitor real-time electricity bills.',
      price: 999,
      stock: 40,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
      ],
      specifications: [
        { key: 'Current Rating', value: '16 Amperes (Up to 3500W)' },
        { key: 'App Control', value: 'Smart Life / Tuya / Alexa / Google' }
      ],
      ratingAvg: 4.4,
      ratingCount: 22
    }
  ]
};

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookmart';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Booking.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing collections');

    // Create production admin user
    const admin = await User.create({
      name: 'Rathore Electronics Admin',
      email: 'admin@rathoreelectronics.com',
      password: 'admin123',
      phone: '+91 9876543210',
      role: 'admin',
      isActive: true
    });
    console.log('👤 Admin user created: admin@rathoreelectronics.com');

    // Create sample customer user
    const customer = await User.create({
      name: 'Rohit Sharma',
      email: 'rohit@example.com',
      password: 'password123',
      phone: '+91 9876500000',
      role: 'user',
      isActive: true
    });
    console.log('👤 Sample customer created: rohit@example.com');

    // Insert the 8 initial categories
    const createdCategories = {};
    for (const cat of categoriesData) {
      const created = await Category.create(cat);
      createdCategories[cat.name] = created;
    }
    console.log(`📂 Created ${Object.keys(createdCategories).length} initial categories`);

    // Insert sample products for each category
    let productCount = 0;
    const createdProductList = [];
    for (const [categoryName, products] of Object.entries(sampleProductsByCategory)) {
      const categoryDoc = createdCategories[categoryName];
      if (!categoryDoc) continue;

      for (const prodData of products) {
        const prod = await Product.create({
          ...prodData,
          category: categoryDoc._id,
          isAvailable: prodData.stock > 0,
          isActive: true
        });
        createdProductList.push(prod);
        productCount++;
      }
    }
    console.log(`📦 Created ${productCount} sample products across all 8 categories`);

    // Create a sample booking to populate dashboard stats
    if (createdProductList.length >= 2) {
      const booking = await Booking.create({
        bookingId: Booking.generateBookingId(),
        user: customer._id,
        items: [
          {
            product: createdProductList[0]._id,
            name: createdProductList[0].name,
            price: createdProductList[0].price,
            quantity: 1,
            image: createdProductList[0].image
          },
          {
            product: createdProductList[2]._id,
            name: createdProductList[2].name,
            price: createdProductList[2].price,
            quantity: 2,
            image: createdProductList[2].image
          }
        ],
        totalAmount: createdProductList[0].price + (createdProductList[2].price * 2),
        status: 'confirmed',
        notes: 'Please expedite delivery to home address.'
      });
      console.log(`🛒 Sample booking created: ${booking.bookingId}`);
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 Admin Credentials:');
    console.log('   Email:    admin@rathoreelectronics.com');
    console.log('   Password: admin123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
