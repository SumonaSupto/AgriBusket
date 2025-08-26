const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const AuthUser = require('./models/AuthUser');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Contact = require('./models/Contact');
const Testimonial = require('./models/Testimonial');
const Farm = require('./models/Farm');

// Connect to database
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sandbox_db';
    const dbName = process.env.MONGODB_DATABASE || 'sandbox_db';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: dbName
    });

    console.log(`✅ Connected to MongoDB: ${dbName}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Clear all existing data
const clearDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    
    await AuthUser.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Contact.deleteMany({});
    await Testimonial.deleteMany({});
    await Farm.deleteMany({});
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
};

// Seed Users (AuthUser collection) - Following current patterns
const seedUsers = async () => {
  try {
    console.log('👥 Seeding Users...');
    
    const users = [
      // Keep existing pattern users
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@framtohome.com',
        phone: '+8801712345678',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        isEmailVerified: true,
        profile: {
          bio: 'System Administrator',
          avatar: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=ADMIN',
          dateOfBirth: new Date('1985-06-15'),
          gender: 'male'
        },
        addresses: [{
          type: 'home',
          street: '123 Admin Street',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1000',
          country: 'Bangladesh',
          isDefault: true
        }],
        preferences: {
          language: 'en',
          currency: 'BDT',
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        }
      },
      // Primary farm owner (following current pattern)
      {
        firstName: 'Rahim',
        lastName: 'Uddin',
        email: 'farmowner@agribasket.com',
        phone: '+8801712345679',
        password: await bcrypt.hash('farmer123', 12),
        role: 'farm_owner',
        isEmailVerified: true,
        profile: {
          bio: 'Owner of AgriBasket Fresh Farm - Providing fresh organic produce',
          avatar: 'https://via.placeholder.com/150/8BC34A/FFFFFF?text=FARMER',
          dateOfBirth: new Date('1975-04-12'),
          gender: 'male'
        },
        addresses: [{
          type: 'farm',
          street: 'Savar Upazila, Agro Farm Area',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1340',
          country: 'Bangladesh',
          isDefault: true
        }]
      },
      // Regular users following current naming patterns
      {
        firstName: 'Israt',
        lastName: 'Jahan',
        email: 'israt18@cse.pstu.ac.bd',
        phone: '+8801712345680',
        password: await bcrypt.hash('user123', 12),
        role: 'user',
        isEmailVerified: true,
        profile: {
          bio: 'Student and health-conscious food lover',
          avatar: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=ISRAT',
          dateOfBirth: new Date('1998-07-22'),
          gender: 'female'
        },
        addresses: [{
          type: 'home',
          street: 'PSTU Campus, Dumki',
          city: 'Patuakhali',
          state: 'Barisal',
          zipCode: '8602',
          country: 'Bangladesh',
          isDefault: true
        }],
        cart: [],
        wishlist: []
      },
      {
        firstName: 'Mir Suhail',
        lastName: 'Asarat',
        email: 'mir18@cse.pstu.ac.bd',
        phone: '+8801712345681',
        password: await bcrypt.hash('user123', 12),
        role: 'user',
        isEmailVerified: true,
        profile: {
          bio: 'Tech enthusiast and organic food advocate',
          avatar: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=MIR',
          dateOfBirth: new Date('1997-11-15'),
          gender: 'male'
        },
        addresses: [{
          type: 'home',
          street: 'Computer Science Department, PSTU',
          city: 'Patuakhali',
          state: 'Barisal',
          zipCode: '8602',
          country: 'Bangladesh',
          isDefault: true
        }]
      },
      // Additional users similar to current pattern
      {
        firstName: 'Fatema',
        lastName: 'Khatun',
        email: 'fatema@gmail.com',
        phone: '+8801712345682',
        password: await bcrypt.hash('user123', 12),
        role: 'user',
        isEmailVerified: true,
        profile: {
          bio: 'Homemaker focused on healthy family nutrition',
          avatar: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=FATEMA',
          dateOfBirth: new Date('1985-03-08'),
          gender: 'female'
        },
        addresses: [{
          type: 'home',
          street: '45 Gulshan Avenue',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1212',
          country: 'Bangladesh',
          isDefault: true
        }]
      },
      // Secondary farm owner
      {
        firstName: 'Karim',
        lastName: 'Miah',
        email: 'karim.farmer@gmail.com',
        phone: '+8801712345683',
        password: await bcrypt.hash('farmer123', 12),
        role: 'farm_owner',
        isEmailVerified: true,
        profile: {
          bio: 'Traditional farmer specializing in seasonal vegetables and fruits',
          avatar: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=KARIM',
          dateOfBirth: new Date('1970-09-25'),
          gender: 'male'
        },
        addresses: [{
          type: 'farm',
          street: 'Village: Sreepur, Upazila: Sreepur',
          city: 'Gazipur',
          state: 'Dhaka',
          zipCode: '1740',
          country: 'Bangladesh',
          isDefault: true
        }]
      },
      {
        firstName: 'Rashida',
        lastName: 'Begum',
        email: 'rashida.begum@yahoo.com',
        phone: '+8801712345684',
        password: await bcrypt.hash('user123', 12),
        role: 'user',
        isEmailVerified: true,
        profile: {
          bio: 'Teacher and mother of two, loves fresh organic produce',
          avatar: 'https://via.placeholder.com/150/607D8B/FFFFFF?text=RASHIDA',
          dateOfBirth: new Date('1982-12-18'),
          gender: 'female'
        },
        addresses: [{
          type: 'home',
          street: '78 Dhanmondi Road 15',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1209',
          country: 'Bangladesh',
          isDefault: true
        }]
      },
      {
        firstName: 'Sabbir',
        lastName: 'Ahmed',
        email: 'sabbir.ahmed@outlook.com',
        phone: '+8801712345685',
        password: await bcrypt.hash('user123', 12),
        role: 'user',
        isEmailVerified: true,
        profile: {
          bio: 'Software engineer passionate about sustainable farming',
          avatar: 'https://via.placeholder.com/150/3F51B5/FFFFFF?text=SABBIR',
          dateOfBirth: new Date('1990-06-30'),
          gender: 'male'
        },
        addresses: [{
          type: 'home',
          street: '123 Banani DOHS',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1213',
          country: 'Bangladesh',
          isDefault: true
        }]
      }
    ];

    const createdUsers = await AuthUser.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    throw error;
  }
};

// Seed Farms - Following current pattern
const seedFarms = async (users) => {
  try {
    console.log('🚜 Seeding Farms...');
    
    const farmOwners = users.filter(user => user.role === 'farm_owner');
    
    const farms = [
      // Main farm following current pattern
      {
        farmName: 'AgriBasket Fresh Farm',
        ownerUserId: farmOwners[0]._id,
        description: 'Leading organic farm in Dhaka region, providing fresh vegetables, dairy, eggs, and honey directly to consumers. Committed to sustainable farming practices.',
        establishedYear: 2015,
        contactInfo: {
          primaryPhone: '+8801712345679',
          email: 'info@agribasket.com',
          website: 'www.agribasket.com'
        },
        location: {
          address: {
            street: 'Savar Upazila, Agro Farm Complex',
            city: 'Dhaka',
            state: 'Dhaka',
            zipCode: '1340',
            country: 'Bangladesh'
          },
          coordinates: {
            latitude: 23.8103,
            longitude: 90.4125
          },
          areaSize: 25,
          areaUnit: 'acres'
        },
        specializations: ['vegetables', 'dairy', 'eggs', 'honey'],
        certifications: ['Organic', 'Pesticide Free', 'Local'],
        isActive: true,
        isVerified: true
      },
      // Secondary farm
      {
        farmName: 'Green Valley Organic Farm',
        ownerUserId: farmOwners[1]._id,
        description: 'Traditional farming methods combined with modern organic practices. Specializing in seasonal vegetables and fruits in Gazipur region.',
        establishedYear: 2012,
        contactInfo: {
          primaryPhone: '+8801712345683',
          email: 'contact@greenvalley.com'
        },
        location: {
          address: {
            street: 'Village: Sreepur, Upazila: Sreepur',
            city: 'Gazipur',
            state: 'Dhaka',
            zipCode: '1740',
            country: 'Bangladesh'
          },
          coordinates: {
            latitude: 24.0085,
            longitude: 90.4153
          },
          areaSize: 18,
          areaUnit: 'acres'
        },
        specializations: ['vegetables', 'fruits'],
        certifications: ['Non-GMO', 'Local', 'Pesticide Free'],
        isActive: true,
        isVerified: true
      }
    ];

    const createdFarms = await Farm.insertMany(farms);
    console.log(`✅ Created ${createdFarms.length} farms`);
    return createdFarms;
  } catch (error) {
    console.error('❌ Error seeding farms:', error.message);
    throw error;
  }
};

// Seed Products - Following current patterns and prices
const seedProducts = async (users, farms) => {
  try {
    console.log('🥬 Seeding Products...');
    
    const farmOwners = users.filter(user => user.role === 'farm_owner');
    
    const products = [
      // Existing pattern products - vegetables
      {
        name: 'Organic Tomatoes',
        description: 'Fresh, vine-ripened organic tomatoes grown without any chemicals. Perfect for cooking, salads, and sauces. Rich in vitamins and antioxidants.',
        pricing: {
          basePrice: 40,
          currency: 'BDT',
          unit: 'kg'
        },
        category: {
          primary: 'vegetables',
          secondary: 'nightshades'
        },
        inventory: {
          availableQuantity: 150,
          reservedQuantity: 0,
          reorderLevel: 20,
          maxOrderQuantity: 50,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Organic+Tomatoes',
          alt: 'Fresh Organic Tomatoes',
          isPrimary: true
        }],
        farmerId: farmOwners[0]._id,
        farmId: farms[0]._id,
        farmerInfo: {
          name: 'AgriBasket Fresh Farm',
          location: 'Dhaka, Bangladesh',
          experience: 'Organic farming specialist'
        },
        nutritionalInfo: {
          calories: 18,
          protein: 0.9,
          carbs: 3.9,
          fat: 0.2,
          fiber: 1.2,
          vitamins: ['Vitamin C', 'Vitamin K', 'Lycopene']
        },
        certifications: ['Organic', 'Pesticide Free'],
        features: ['Vine-ripened', 'Chemical-free', 'Hand-picked'],
        status: 'active',
        tags: ['organic', 'fresh', 'local', 'healthy'],
        seasonality: {
          availableMonths: ['October', 'November', 'December', 'January', 'February'],
          peakSeason: 'Winter'
        }
      },
      {
        name: 'Crunchy Carrots',
        description: 'Sweet and crunchy carrots, freshly harvested and packed with beta-carotene. Great for snacking, cooking, and juicing.',
        pricing: {
          basePrice: 50,
          currency: 'BDT',
          unit: 'bunch'
        },
        category: {
          primary: 'vegetables',
          secondary: 'root vegetables'
        },
        inventory: {
          availableQuantity: 120,
          reservedQuantity: 5,
          reorderLevel: 15,
          maxOrderQuantity: 30,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/FF9500/FFFFFF?text=Crunchy+Carrots',
          alt: 'Fresh Crunchy Carrots',
          isPrimary: true
        }],
        farmerId: farmOwners[0]._id,
        farmId: farms[0]._id,
        farmerInfo: {
          name: 'AgriBasket Fresh Farm',
          location: 'Dhaka, Bangladesh',
          experience: 'Organic farming specialist'
        },
        nutritionalInfo: {
          calories: 41,
          protein: 0.9,
          carbs: 9.6,
          fat: 0.2,
          fiber: 2.8,
          vitamins: ['Beta-carotene', 'Vitamin K', 'Vitamin C']
        },
        certifications: ['Organic', 'Pesticide Free'],
        features: ['Sweet variety', 'Chemical-free', 'Fresh harvested'],
        status: 'active',
        tags: ['carrots', 'organic', 'crunchy', 'beta-carotene'],
        seasonality: {
          availableMonths: ['November', 'December', 'January', 'February', 'March'],
          peakSeason: 'Winter'
        }
      },
      {
        name: 'Fresh Spinach Leaves',
        description: 'Tender, dark green spinach leaves rich in iron and vitamins. Perfect for salads, smoothies, and cooking.',
        pricing: {
          basePrice: 15,
          currency: 'BDT',
          unit: 'bunch'
        },
        category: {
          primary: 'vegetables',
          secondary: 'leafy greens'
        },
        inventory: {
          availableQuantity: 200,
          reservedQuantity: 10,
          reorderLevel: 25,
          maxOrderQuantity: 20,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Fresh+Spinach',
          alt: 'Fresh Spinach Leaves',
          isPrimary: true
        }],
        farmerId: farmOwners[0]._id,
        farmId: farms[0]._id,
        farmerInfo: {
          name: 'AgriBasket Fresh Farm',
          location: 'Dhaka, Bangladesh',
          experience: 'Organic farming specialist'
        },
        nutritionalInfo: {
          calories: 23,
          protein: 2.9,
          carbs: 3.6,
          fat: 0.4,
          fiber: 2.2,
          vitamins: ['Iron', 'Vitamin K', 'Folate', 'Vitamin A']
        },
        certifications: ['Organic', 'Pesticide Free'],
        features: ['Baby spinach', 'Chemical-free', 'Fresh picked'],
        status: 'active',
        tags: ['spinach', 'organic', 'leafy', 'iron-rich'],
        seasonality: {
          availableMonths: ['November', 'December', 'January', 'February', 'March'],
          peakSeason: 'Winter'
        }
      },
      // Following current pattern - eggs
      {
        name: 'Farm-Fresh Eggs (Dozen)',
        description: 'Free-range chicken eggs from healthy, naturally fed hens. Rich in protein and essential nutrients.',
        pricing: {
          basePrice: 130,
          currency: 'BDT',
          unit: 'dozen'
        },
        category: {
          primary: 'eggs',
          secondary: 'protein'
        },
        inventory: {
          availableQuantity: 100,
          reservedQuantity: 0,
          reorderLevel: 20,
          maxOrderQuantity: 10,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/D4A574/FFFFFF?text=Farm+Fresh+Eggs',
          alt: 'Farm Fresh Eggs',
          isPrimary: true
        }],
        farmerId: farmOwners[0]._id,
        farmId: farms[0]._id,
        farmerInfo: {
          name: 'AgriBasket Fresh Farm',
          location: 'Dhaka, Bangladesh',
          experience: 'Organic farming specialist'
        },
        nutritionalInfo: {
          calories: 70,
          protein: 6,
          carbs: 0.6,
          fat: 5,
          fiber: 0,
          vitamins: ['Vitamin B12', 'Choline', 'Selenium']
        },
        certifications: ['Local', 'Free-range'],
        features: ['Free-range', 'Natural feed', 'Daily fresh'],
        status: 'active',
        tags: ['eggs', 'free-range', 'protein', 'fresh'],
        seasonality: {
          availableMonths: ['All year round'],
          peakSeason: 'All seasons'
        }
      },
      // Following current pattern - dairy
      {
        name: 'Organic Cow Milk',
        description: 'Pure, fresh cow milk from grass-fed cows. Rich in calcium and protein, perfect for drinking and cooking.',
        pricing: {
          basePrice: 80,
          currency: 'BDT',
          unit: 'liter'
        },
        category: {
          primary: 'dairy',
          secondary: 'milk'
        },
        inventory: {
          availableQuantity: 80,
          reservedQuantity: 5,
          reorderLevel: 15,
          maxOrderQuantity: 20,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/FFFFFF/2196F3?text=Fresh+Cow+Milk',
          alt: 'Organic Cow Milk',
          isPrimary: true
        }],
        farmerId: farmOwners[0]._id,
        farmId: farms[0]._id,
        farmerInfo: {
          name: 'AgriBasket Fresh Farm',
          location: 'Dhaka, Bangladesh',
          experience: 'Organic farming specialist'
        },
        nutritionalInfo: {
          calories: 42,
          protein: 3.4,
          carbs: 5,
          fat: 1,
          fiber: 0,
          vitamins: ['Calcium', 'Vitamin D', 'Vitamin B12']
        },
        certifications: ['Organic', 'Local'],
        features: ['Grass-fed cows', 'No hormones', 'Fresh daily'],
        status: 'active',
        tags: ['milk', 'organic', 'calcium', 'fresh'],
        seasonality: {
          availableMonths: ['All year round'],
          peakSeason: 'All seasons'
        }
      },
      // Following current pattern - honey
      {
        name: 'Raw Forest Honey',
        description: 'Pure, unprocessed honey from local beehives. Sweet, natural, and packed with antioxidants and enzymes.',
        pricing: {
          basePrice: 800,
          currency: 'BDT',
          unit: 'jar'
        },
        category: {
          primary: 'honey',
          secondary: 'sweetener'
        },
        inventory: {
          availableQuantity: 60,
          reservedQuantity: 3,
          reorderLevel: 10,
          maxOrderQuantity: 5,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/FFA500/FFFFFF?text=Raw+Forest+Honey',
          alt: 'Raw Forest Honey',
          isPrimary: true
        }],
        farmerId: farmOwners[0]._id,
        farmId: farms[0]._id,
        farmerInfo: {
          name: 'AgriBasket Fresh Farm',
          location: 'Dhaka, Bangladesh',
          experience: 'Organic farming specialist'
        },
        nutritionalInfo: {
          calories: 304,
          protein: 0.3,
          carbs: 82,
          fat: 0,
          fiber: 0.2,
          vitamins: ['Antioxidants', 'Enzymes']
        },
        certifications: ['Local', 'Raw'],
        features: ['Unprocessed', 'Raw honey', 'Local beehives'],
        status: 'active',
        tags: ['honey', 'raw', 'natural', 'antioxidants'],
        seasonality: {
          availableMonths: ['All year round'],
          peakSeason: 'Spring and Summer'
        }
      },
      // Additional products from second farm
      {
        name: 'Red Onions',
        description: 'Fresh red onions with strong flavor, perfect for cooking and salads. Grown using traditional organic methods.',
        pricing: {
          basePrice: 35,
          currency: 'BDT',
          unit: 'kg'
        },
        category: {
          primary: 'vegetables',
          secondary: 'alliums'
        },
        inventory: {
          availableQuantity: 180,
          reservedQuantity: 15,
          reorderLevel: 30,
          maxOrderQuantity: 25,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/8E24AA/FFFFFF?text=Red+Onions',
          alt: 'Fresh Red Onions',
          isPrimary: true
        }],
        farmerId: farmOwners[1]._id,
        farmId: farms[1]._id,
        farmerInfo: {
          name: 'Green Valley Organic Farm',
          location: 'Gazipur, Dhaka',
          experience: 'Traditional farming methods'
        },
        nutritionalInfo: {
          calories: 40,
          protein: 1.1,
          carbs: 9.3,
          fat: 0.1,
          fiber: 1.7,
          vitamins: ['Vitamin C', 'Folate', 'Antioxidants']
        },
        certifications: ['Non-GMO', 'Pesticide Free'],
        features: ['Strong flavor', 'Traditional grown', 'Long storage'],
        status: 'active',
        tags: ['onions', 'red', 'organic', 'cooking'],
        seasonality: {
          availableMonths: ['December', 'January', 'February', 'March', 'April'],
          peakSeason: 'Winter'
        }
      },
      {
        name: 'Green Capsicum',
        description: 'Fresh green bell peppers, crisp and flavorful. Rich in vitamin C and perfect for stir-fries and salads.',
        pricing: {
          basePrice: 60,
          currency: 'BDT',
          unit: 'kg'
        },
        category: {
          primary: 'vegetables',
          secondary: 'peppers'
        },
        inventory: {
          availableQuantity: 90,
          reservedQuantity: 8,
          reorderLevel: 15,
          maxOrderQuantity: 20,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Green+Capsicum',
          alt: 'Fresh Green Capsicum',
          isPrimary: true
        }],
        farmerId: farmOwners[1]._id,
        farmId: farms[1]._id,
        farmerInfo: {
          name: 'Green Valley Organic Farm',
          location: 'Gazipur, Dhaka',
          experience: 'Traditional farming methods'
        },
        nutritionalInfo: {
          calories: 20,
          protein: 0.9,
          carbs: 4.6,
          fat: 0.2,
          fiber: 1.7,
          vitamins: ['Vitamin C', 'Vitamin A', 'Folate']
        },
        certifications: ['Non-GMO', 'Pesticide Free'],
        features: ['Crisp texture', 'High vitamin C', 'Versatile cooking'],
        status: 'active',
        tags: ['capsicum', 'green', 'vitamin-c', 'crisp'],
        seasonality: {
          availableMonths: ['November', 'December', 'January', 'February', 'March'],
          peakSeason: 'Winter'
        }
      },
      {
        name: 'Fresh Cauliflower',
        description: 'White, compact cauliflower heads perfect for curries, soups, and roasting. Rich in vitamins and minerals.',
        pricing: {
          basePrice: 25,
          currency: 'BDT',
          unit: 'piece'
        },
        category: {
          primary: 'vegetables',
          secondary: 'cruciferous'
        },
        inventory: {
          availableQuantity: 50,
          reservedQuantity: 3,
          reorderLevel: 10,
          maxOrderQuantity: 15,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/FFFFFF/757575?text=Fresh+Cauliflower',
          alt: 'Fresh Cauliflower',
          isPrimary: true
        }],
        farmerId: farmOwners[1]._id,
        farmId: farms[1]._id,
        farmerInfo: {
          name: 'Green Valley Organic Farm',
          location: 'Gazipur, Dhaka',
          experience: 'Traditional farming methods'
        },
        nutritionalInfo: {
          calories: 25,
          protein: 1.9,
          carbs: 5,
          fat: 0.3,
          fiber: 2,
          vitamins: ['Vitamin C', 'Vitamin K', 'Folate']
        },
        certifications: ['Non-GMO', 'Pesticide Free'],
        features: ['Compact heads', 'White variety', 'Versatile cooking'],
        status: 'active',
        tags: ['cauliflower', 'white', 'cruciferous', 'healthy'],
        seasonality: {
          availableMonths: ['December', 'January', 'February', 'March'],
          peakSeason: 'Winter'
        }
      },
      {
        name: 'Fresh Broccoli',
        description: 'Dark green broccoli florets packed with nutrients. Excellent source of vitamins and perfect for healthy meals.',
        pricing: {
          basePrice: 120,
          currency: 'BDT',
          unit: 'kg'
        },
        category: {
          primary: 'vegetables',
          secondary: 'cruciferous'
        },
        inventory: {
          availableQuantity: 40,
          reservedQuantity: 2,
          reorderLevel: 8,
          maxOrderQuantity: 10,
          isInStock: true
        },
        images: [{
          url: 'https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Fresh+Broccoli',
          alt: 'Fresh Broccoli',
          isPrimary: true
        }],
        farmerId: farmOwners[1]._id,
        farmId: farms[1]._id,
        farmerInfo: {
          name: 'Green Valley Organic Farm',
          location: 'Gazipur, Dhaka',
          experience: 'Traditional farming methods'
        },
        nutritionalInfo: {
          calories: 34,
          protein: 2.8,
          carbs: 7,
          fat: 0.4,
          fiber: 2.6,
          vitamins: ['Vitamin C', 'Vitamin K', 'Folate', 'Iron']
        },
        certifications: ['Non-GMO', 'Pesticide Free'],
        features: ['Dark green', 'Nutrient dense', 'Fresh florets'],
        status: 'active',
        tags: ['broccoli', 'green', 'superfood', 'vitamins'],
        seasonality: {
          availableMonths: ['December', 'January', 'February', 'March'],
          peakSeason: 'Winter'
        }
      }
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);
    return createdProducts;
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    throw error;
  }
};

// Seed Testimonials - Following current pattern
const seedTestimonials = async () => {
  try {
    console.log('💬 Seeding Testimonials...');
    
    const testimonials = [
      // Following current style - Chaiti Haldar pattern
      {
        name: 'Chaiti Haldar',
        email: 'chaiti@example.com',
        image: 'https://via.placeholder.com/150/1E88E5/FFFFFF?text=CH',
        text: 'Amazing quality vegetables and dairy products! Everything was fresh and delivered on time. Highly recommended for healthy living.',
        rating: 5,
        isApproved: true,
        isActive: true,
        location: 'Dhaka, Bangladesh',
        occupation: 'Nutritionist'
      },
      // Following current style - Mehtab S. pattern
      {
        name: 'Mehtab S.',
        email: 'mehtab@example.com',
        image: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=MS',
        text: 'The organic tomatoes and spinach are incredibly fresh. Best quality produce I have found in Chittagong area.',
        rating: 5,
        isApproved: true,
        isActive: true,
        location: 'Chittagong, Bangladesh',
        occupation: 'Doctor'
      },
      // Additional testimonials following similar pattern
      {
        name: 'Rahman Ahmed',
        email: 'rahman@example.com',
        image: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=RA',
        text: 'Farm-to-home delivery service is excellent. Fresh eggs and milk directly from the farm. Great quality and service!',
        rating: 5,
        isApproved: true,
        isActive: true,
        location: 'Dhaka, Bangladesh',
        occupation: 'Business Owner'
      },
      {
        name: 'Sultana Begum',
        email: 'sultana@example.com',
        image: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=SB',
        text: 'The raw forest honey is authentic and delicious. My family loves the fresh vegetables too. Keep up the good work!',
        rating: 4,
        isApproved: true,
        isActive: true,
        location: 'Sylhet, Bangladesh',
        occupation: 'Teacher'
      },
      {
        name: 'Mizanur Rahman',
        email: 'mizan@example.com',
        image: 'https://via.placeholder.com/150/FF5722/FFFFFF?text=MR',
        text: 'Excellent organic products! The carrots and capsicum are so fresh and crunchy. Perfect for healthy family meals.',
        rating: 5,
        isApproved: true,
        isActive: true,
        location: 'Gazipur, Bangladesh',
        occupation: 'Engineer'
      },
      {
        name: 'Nasreen Akter',
        email: 'nasreen@example.com',
        image: 'https://via.placeholder.com/150/607D8B/FFFFFF?text=NA',
        text: 'Love the farm fresh eggs and organic cow milk. The quality is consistent and the delivery is always on time.',
        rating: 5,
        isApproved: true,
        isActive: true,
        location: 'Dhaka, Bangladesh',
        occupation: 'Homemaker'
      },
      {
        name: 'Hasan Ali',
        email: 'hasan@example.com',
        image: 'https://via.placeholder.com/150/795548/FFFFFF?text=HA',
        text: 'Great initiative for connecting farmers directly with consumers. Fresh broccoli and cauliflower are top quality.',
        rating: 4,
        isApproved: true,
        isActive: true,
        location: 'Chittagong, Bangladesh',
        occupation: 'Chef'
      },
      {
        name: 'Ruma Khatun',
        email: 'ruma@example.com',
        image: 'https://via.placeholder.com/150/E91E63/FFFFFF?text=RK',
        text: 'The organic spinach and other leafy greens are so fresh. My kids now enjoy eating vegetables thanks to AgriBasket!',
        rating: 5,
        isApproved: true,
        isActive: true,
        location: 'Barisal, Bangladesh',
        occupation: 'Banker'
      }
    ];

    const createdTestimonials = await Testimonial.insertMany(testimonials);
    console.log(`✅ Created ${createdTestimonials.length} testimonials`);
    return createdTestimonials;
  } catch (error) {
    console.error('❌ Error seeding testimonials:', error.message);
    throw error;
  }
};

// Seed Contacts - Following current pattern
const seedContacts = async () => {
  try {
    console.log('📞 Seeding Contacts...');
    
    const contacts = [
      // Following current test pattern
      {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Product Quality Inquiry',
        message: 'Hi, I would like to know more about your organic certification process. Do you have third-party verification for your organic products?',
        phone: '+8801712345690',
        status: 'new',
        priority: 'medium',
        category: 'product-inquiry',
        source: 'website'
      },
      {
        name: 'Tester',
        email: 'tester@example.com',
        subject: 'Delivery Area Expansion',
        message: 'Hello, I live in Rangpur and would love to order your fresh vegetables. Do you have plans to expand delivery to our area?',
        phone: '+8801712345691',
        status: 'new',
        priority: 'high',
        category: 'delivery',
        source: 'phone'
      },
      {
        name: 'Admin Test',
        email: 'admin@test.com',
        subject: 'Testing Admin Panel',
        message: 'Testing the contact form functionality through admin panel. Please confirm if this message is received properly.',
        phone: '+8801712345692',
        status: 'new',
        priority: 'low',
        category: 'technical',
        source: 'admin-panel'
      },
      // Additional contacts following similar pattern
      {
        name: 'Sabbir Ahmed',
        email: 'sabbir@example.com',
        subject: 'Bulk Order for Restaurant',
        message: 'I own a restaurant in Dhaka and interested in regular bulk orders for fresh vegetables. Please share your wholesale pricing and minimum order requirements.',
        phone: '+8801712345693',
        company: 'Spice Garden Restaurant',
        status: 'in-progress',
        priority: 'urgent',
        category: 'business',
        source: 'email'
      },
      {
        name: 'Taslima Khatun',
        email: 'taslima@example.com',
        subject: 'Partnership Opportunity',
        message: 'We are a cooperative of women farmers and would like to discuss partnership opportunities to sell our products through your platform.',
        phone: '+8801712345694',
        company: 'Women Farmers Cooperative',
        status: 'new',
        priority: 'high',
        category: 'partnership',
        source: 'website'
      },
      {
        name: 'Rahim Uddin',
        email: 'rahim@example.com',
        subject: 'Product Return Request',
        message: 'I received some vegetables that were not up to the expected quality. Please advise on the return process and replacement policy.',
        phone: '+8801712345695',
        status: 'resolved',
        priority: 'medium',
        category: 'support',
        source: 'phone'
      },
      {
        name: 'Marium Begum',
        email: 'marium@example.com',
        subject: 'Subscription Service Inquiry',
        message: 'Do you offer any weekly or monthly subscription services for regular delivery of fresh vegetables and dairy products?',
        phone: '+8801712345696',
        status: 'new',
        priority: 'medium',
        category: 'product-inquiry',
        source: 'website'
      }
    ];

    const createdContacts = await Contact.insertMany(contacts);
    console.log(`✅ Created ${createdContacts.length} contact messages`);
    return createdContacts;
  } catch (error) {
    console.error('❌ Error seeding contacts:', error.message);
    throw error;
  }
};

// Seed Orders - Following current patterns
const seedOrders = async (users, products) => {
  try {
    console.log('📦 Seeding Orders...');
    
    const customers = users.filter(user => user.role === 'user');
    
    const orders = [
      // Order pattern similar to current (with proper orderSummary structure)
      {
        userId: customers[0]._id, // Israt Jahan
        customerInfo: {
          name: 'Israt Jahan',
          email: 'israt18@cse.pstu.ac.bd',
          phone: '+8801712345680'
        },
        items: [
          {
            productId: products[0]._id, // Organic Tomatoes
            productName: 'Organic Tomatoes',
            productImage: 'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Organic+Tomatoes',
            quantity: 2,
            unit: 'kg',
            unitPrice: 40,
            totalPrice: 80
          },
          {
            productId: products[2]._id, // Fresh Spinach Leaves
            productName: 'Fresh Spinach Leaves',
            productImage: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Fresh+Spinach',
            quantity: 3,
            unit: 'bunch',
            unitPrice: 15,
            totalPrice: 45
          }
        ],
        orderSummary: {
          subtotal: 125,
          deliveryFee: 50,
          tax: 12.5,
          discount: 0,
          total: 187.5
        },
        shippingAddress: {
          name: 'Israt Jahan',
          phone: '+8801712345680',
          street: 'PSTU Campus, Dumki',
          city: 'Patuakhali',
          state: 'Barisal',
          zipCode: '8602',
          country: 'Bangladesh'
        },
        paymentInfo: {
          method: 'cash_on_delivery',
          status: 'pending',
          currency: 'BDT'
        },
        orderStatus: 'pending',
        deliveryInfo: {
          method: 'standard',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          instructions: 'Please call before delivery'
        }
      },
      {
        userId: customers[1]._id, // Mir Suhail Asarat
        customerInfo: {
          name: 'Mir Suhail Asarat',
          email: 'mir18@cse.pstu.ac.bd',
          phone: '+8801712345681'
        },
        items: [
          {
            productId: products[3]._id, // Farm-Fresh Eggs
            productName: 'Farm-Fresh Eggs (Dozen)',
            productImage: 'https://via.placeholder.com/400x300/D4A574/FFFFFF?text=Farm+Fresh+Eggs',
            quantity: 2,
            unit: 'dozen',
            unitPrice: 130,
            totalPrice: 260
          },
          {
            productId: products[4]._id, // Organic Cow Milk
            productName: 'Organic Cow Milk',
            productImage: 'https://via.placeholder.com/400x300/FFFFFF/2196F3?text=Fresh+Cow+Milk',
            quantity: 3,
            unit: 'liter',
            unitPrice: 80,
            totalPrice: 240
          }
        ],
        orderSummary: {
          subtotal: 500,
          deliveryFee: 60,
          tax: 50,
          discount: 25,
          total: 585
        },
        shippingAddress: {
          name: 'Mir Suhail Asarat',
          phone: '+8801712345681',
          street: 'Computer Science Department, PSTU',
          city: 'Patuakhali',
          state: 'Barisal',
          zipCode: '8602',
          country: 'Bangladesh'
        },
        paymentInfo: {
          method: 'mobile_banking',
          status: 'completed',
          currency: 'BDT',
          transactionId: 'TXN123456789'
        },
        orderStatus: 'confirmed',
        deliveryInfo: {
          method: 'express',
          estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          trackingNumber: 'EXP789012345'
        }
      },
      {
        userId: customers[2]._id, // Fatema Khatun
        customerInfo: {
          name: 'Fatema Khatun',
          email: 'fatema@gmail.com',
          phone: '+8801712345682'
        },
        items: [
          {
            productId: products[5]._id, // Raw Forest Honey
            productName: 'Raw Forest Honey',
            productImage: 'https://via.placeholder.com/400x300/FFA500/FFFFFF?text=Raw+Forest+Honey',
            quantity: 1,
            unit: 'jar',
            unitPrice: 800,
            totalPrice: 800
          },
          {
            productId: products[1]._id, // Crunchy Carrots
            productName: 'Crunchy Carrots',
            productImage: 'https://via.placeholder.com/400x300/FF9500/FFFFFF?text=Crunchy+Carrots',
            quantity: 2,
            unit: 'bunch',
            unitPrice: 50,
            totalPrice: 100
          }
        ],
        orderSummary: {
          subtotal: 900,
          deliveryFee: 80,
          tax: 90,
          discount: 50,
          total: 1020
        },
        shippingAddress: {
          name: 'Fatema Khatun',
          phone: '+8801712345682',
          street: '45 Gulshan Avenue',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1212',
          country: 'Bangladesh'
        },
        paymentInfo: {
          method: 'card',
          status: 'completed',
          currency: 'BDT',
          transactionId: 'CARD987654321'
        },
        orderStatus: 'delivered',
        deliveryInfo: {
          method: 'standard',
          actualDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          deliveredBy: 'AgriBasket Delivery Team',
          trackingNumber: 'STD456789012'
        }
      },
      {
        userId: customers[3]._id, // Rashida Begum
        customerInfo: {
          name: 'Rashida Begum',
          email: 'rashida.begum@yahoo.com',
          phone: '+8801712345684'
        },
        items: [
          {
            productId: products[6]._id, // Red Onions
            productName: 'Red Onions',
            productImage: 'https://via.placeholder.com/400x300/8E24AA/FFFFFF?text=Red+Onions',
            quantity: 5,
            unit: 'kg',
            unitPrice: 35,
            totalPrice: 175
          },
          {
            productId: products[7]._id, // Green Capsicum
            productName: 'Green Capsicum',
            productImage: 'https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Green+Capsicum',
            quantity: 2,
            unit: 'kg',
            unitPrice: 60,
            totalPrice: 120
          },
          {
            productId: products[8]._id, // Fresh Cauliflower
            productName: 'Fresh Cauliflower',
            productImage: 'https://via.placeholder.com/400x300/FFFFFF/757575?text=Fresh+Cauliflower',
            quantity: 3,
            unit: 'piece',
            unitPrice: 25,
            totalPrice: 75
          }
        ],
        orderSummary: {
          subtotal: 370,
          deliveryFee: 60,
          tax: 37,
          discount: 20,
          total: 447
        },
        shippingAddress: {
          name: 'Rashida Begum',
          phone: '+8801712345684',
          street: '78 Dhanmondi Road 15',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1209',
          country: 'Bangladesh'
        },
        paymentInfo: {
          method: 'mobile_banking',
          status: 'completed',
          currency: 'BDT',
          transactionId: 'TXN456789123'
        },
        orderStatus: 'shipped',
        deliveryInfo: {
          method: 'standard',
          estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          trackingNumber: 'STD789123456'
        }
      },
      {
        userId: customers[4]._id, // Sabbir Ahmed
        customerInfo: {
          name: 'Sabbir Ahmed',
          email: 'sabbir.ahmed@outlook.com',
          phone: '+8801712345685'
        },
        items: [
          {
            productId: products[9]._id, // Fresh Broccoli
            productName: 'Fresh Broccoli',
            productImage: 'https://via.placeholder.com/400x300/2E7D32/FFFFFF?text=Fresh+Broccoli',
            quantity: 1,
            unit: 'kg',
            unitPrice: 120,
            totalPrice: 120
          }
        ],
        orderSummary: {
          subtotal: 120,
          deliveryFee: 50,
          tax: 12,
          discount: 0,
          total: 182
        },
        shippingAddress: {
          name: 'Sabbir Ahmed',
          phone: '+8801712345685',
          street: '123 Banani DOHS',
          city: 'Dhaka',
          state: 'Dhaka',
          zipCode: '1213',
          country: 'Bangladesh'
        },
        paymentInfo: {
          method: 'cash_on_delivery',
          status: 'pending',
          currency: 'BDT'
        },
        orderStatus: 'pending',
        deliveryInfo: {
          method: 'standard',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          instructions: 'Deliver in the evening after 6 PM'
        }
      }
    ];

    const createdOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${createdOrders.length} orders`);
    
    // Update user cart/wishlist with some sample data
    await updateUserCartWishlist(customers, products);
    
    return createdOrders;
  } catch (error) {
    console.error('❌ Error seeding orders:', error.message);
    throw error;
  }
};

// Update user cart and wishlist with sample data
const updateUserCartWishlist = async (customers, products) => {
  try {
    // Add items to Israt's cart
    await AuthUser.findByIdAndUpdate(customers[0]._id, {
      cart: [
        {
          productId: products[0]._id, // Organic Tomatoes
          quantity: 1,
          addedAt: new Date()
        },
        {
          productId: products[4]._id, // Organic Cow Milk
          quantity: 2,
          addedAt: new Date()
        }
      ],
      wishlist: [
        {
          productId: products[5]._id, // Raw Forest Honey
          addedAt: new Date()
        },
        {
          productId: products[7]._id, // Green Capsicum
          addedAt: new Date()
        }
      ]
    });

    // Add items to Mir Suhail's cart and wishlist
    await AuthUser.findByIdAndUpdate(customers[1]._id, {
      cart: [
        {
          productId: products[1]._id, // Crunchy Carrots
          quantity: 2,
          addedAt: new Date()
        }
      ],
      wishlist: [
        {
          productId: products[3]._id, // Farm-Fresh Eggs
          addedAt: new Date()
        },
        {
          productId: products[9]._id, // Fresh Broccoli
          addedAt: new Date()
        }
      ]
    });

    // Add items to Fatema's wishlist
    await AuthUser.findByIdAndUpdate(customers[2]._id, {
      wishlist: [
        {
          productId: products[2]._id, // Fresh Spinach Leaves
          addedAt: new Date()
        },
        {
          productId: products[8]._id, // Fresh Cauliflower
          addedAt: new Date()
        }
      ]
    });

    console.log('✅ Updated user cart and wishlist');
  } catch (error) {
    console.error('❌ Error updating user cart/wishlist:', error.message);
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('==========================================');
    
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    const farms = await seedFarms(users);
    const products = await seedProducts(users, farms);
    const testimonials = await seedTestimonials();
    const contacts = await seedContacts();
    const orders = await seedOrders(users, products);
    
    console.log('==========================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🚜 Farms: ${farms.length}`);
    console.log(`   🥬 Products: ${products.length}`);
    console.log(`   💬 Testimonials: ${testimonials.length}`);
    console.log(`   📞 Contacts: ${contacts.length}`);
    console.log(`   📦 Orders: ${orders.length}`);
    console.log('');
    console.log('🔐 Admin Credentials:');
    console.log('   Email: admin@framtohome.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 Test User Credentials:');
    console.log('   Email: israt18@cse.pstu.ac.bd');
    console.log('   Password: user123');
    console.log('');
    console.log('🚜 Farm Owner Credentials:');
    console.log('   Email: farmowner@agribasket.com');
    console.log('   Password: farmer123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
