const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

let seedChecked = false;

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

const sampleProducts = [
  {
    name: 'SkyHawk 4K Ultra HD Drone',
    categoryName: 'Drones',
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
    name: 'Titan 4WD Rock Crawler Monster Truck',
    categoryName: 'Toys & Monster Trucks',
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
    name: 'Lumina Smart RGBW LED Bulb (12W)',
    categoryName: 'Bulbs & Tubes',
    description: '16 Million colors, voice control with Alexa/Google Home, and dimmable warmth settings.',
    detailedDescription: 'Transform any room with Lumina Smart RGBW. Connects directly via WiFi without a hub. Supports custom schedules, music syncing, and energy monitoring.',
    price: 899,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Wattage', value: '12W (Equivalent to 100W incandescent)' },
      { key: 'Base', value: 'B22 / E27' }
    ],
    ratingAvg: 4.6,
    ratingCount: 68
  },
  {
    name: 'VoltSafe 2.5 sq.mm FR Industrial Copper Wire (90m)',
    categoryName: 'Wires & Cables',
    description: 'Flame retardant 100% electrolytic pure copper wire spool for domestic and commercial wiring.',
    detailedDescription: 'IS-certified 2.5mm multi-strand copper cable with advanced flame-retardant PVC insulation.',
    price: 2699,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Gauge', value: '2.5 sq mm' },
      { key: 'Length', value: '90 Metres' }
    ],
    ratingAvg: 4.9,
    ratingCount: 51
  },
  {
    name: 'PowerVolt 65W GaN Fast Charger',
    categoryName: 'Chargers',
    description: 'Compact 3-port GaN III wall charger supporting Type-C PD 3.0 and QC 4.0 for laptops and phones.',
    detailedDescription: 'Powered by Gallium Nitride (GaN) technology, this ultra-portable 65W brick charges laptops, smartphones, and tablets simultaneously.',
    price: 2499,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Total Output', value: '65W Max' },
      { key: 'Ports', value: '2x USB-C + 1x USB-A' }
    ],
    ratingAvg: 4.8,
    ratingCount: 74
  },
  {
    name: 'MasterChef 1000W Heavy-Duty Mixer Grinder',
    categoryName: 'Mixers & Kitchen Appliances',
    description: 'Copper motor mixer with 3 stainless steel jars, pulse control, and overload protector.',
    detailedDescription: 'Crush the toughest spices, batters, and purees effortlessly with the MasterChef 1000W.',
    price: 4999,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80'
    ],
    specifications: [
      { key: 'Motor', value: '1000W 100% Pure Copper' },
      { key: 'Jars', value: '1.5L Wet, 1.0L Dry, 0.4L Chutney' }
    ],
    ratingAvg: 4.9,
    ratingCount: 88
  }
];

const ensureSeedData = async () => {
  if (seedChecked) return;
  seedChecked = true;

  try {
    // 1. Ensure Store Settings exist with exact client information
    let settings = await Settings.findOne();
    if (!settings) {
      await Settings.create({
        businessName: 'Rathore Electronics',
        ownerName: 'Mahendra Rathore',
        address: 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh',
        primaryPhone: '8435930113',
        secondaryPhone: '7067586087',
        whatsappNumber: '8435930113',
        email: 'support@rathoreelectronics.com',
        upiId: '8435930113@upi',
        upiQrImage: '',
        instagramUrl: 'https://www.instagram.com/rathore_electronics_/',
        instagramHandle: '@rathore_electronics_',
        advanceAmount: 200,
        currency: 'INR'
      });
      console.log('✅ Created default Store Settings for Rathore Electronics');
    } else {
      // If default address, phones, or social links need updating
      let updated = false;
      if (!settings.primaryPhone || settings.primaryPhone === '+91 98765 43210') {
        settings.primaryPhone = '8435930113';
        updated = true;
      }
      if (!settings.secondaryPhone) {
        settings.secondaryPhone = '7067586087';
        updated = true;
      }
      if (!settings.ownerName) {
        settings.ownerName = 'Mahendra Rathore';
        updated = true;
      }
      if (!settings.address || settings.address.includes('Main Market')) {
        settings.address = 'Main Bus Stand, Atari Khejda, Vidisha, Madhya Pradesh';
        updated = true;
      }
      if (!settings.upiId) {
        settings.upiId = '8435930113@upi';
        updated = true;
      }
      if (!settings.instagramUrl) {
        settings.instagramUrl = 'https://www.instagram.com/rathore_electronics_/';
        updated = true;
      }
      if (!settings.instagramHandle) {
        settings.instagramHandle = '@rathore_electronics_';
        updated = true;
      }
      if (settings.advanceAmount === undefined || settings.advanceAmount === null) {
        settings.advanceAmount = 200;
        updated = true;
      }
      if (updated) {
        await settings.save();
        console.log('✅ Synchronized Store Settings with client business details');
      }
    }

    // 2. Ensure Admin User exists
    let admin = await User.findOne({ email: 'admin@rathoreelectronics.com' });
    if (!admin) {
      // Check legacy admin
      const legacyAdmin = await User.findOne({ email: 'admin@bookmart.com' });
      if (legacyAdmin) {
        legacyAdmin.email = 'admin@rathoreelectronics.com';
        legacyAdmin.name = 'Rathore Electronics Admin';
        legacyAdmin.role = 'admin';
        legacyAdmin.phone = '8435930113';
        legacyAdmin.password = 'admin123';
        await legacyAdmin.save();
        console.log('✅ Migrated admin account to admin@rathoreelectronics.com');
      } else {
        await User.create({
          name: 'Rathore Electronics Admin',
          email: 'admin@rathoreelectronics.com',
          password: 'admin123',
          phone: '8435930113',
          role: 'admin',
          isActive: true
        });
        console.log('✅ Created default admin: admin@rathoreelectronics.com');
      }
    }

    // 3. Ensure Categories exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('📂 Seeding initial 8 categories...');
      const createdMap = {};
      for (const cat of categoriesData) {
        const created = await Category.create(cat);
        createdMap[cat.name] = created;
      }

      // 4. Ensure Sample Products exist
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('📦 Seeding sample products...');
        for (const prod of sampleProducts) {
          const cat = createdMap[prod.categoryName];
          if (cat) {
            await Product.create({
              ...prod,
              category: cat._id,
              isAvailable: prod.stock > 0,
              isActive: true
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Auto-seed check notice:', err.message);
  }
};

module.exports = ensureSeedData;
