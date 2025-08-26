# AgriBasket Backend Server

A comprehensive backend server for the AgriBasket e-commerce platform built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations, categories, search, filtering
- **Order Management**: Order processing, status tracking, payment handling
- **Contact System**: Customer inquiries and support messages
- **Testimonials**: Customer feedback and testimonial management
- **Admin Panel**: Dashboard statistics, user management, order oversight
- **Security**: JWT authentication, rate limiting, input validation
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string and other settings

4. **Database Setup**
   ```bash
   # Seed the database with sample data
   node seedData.js
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Environment Variables

Create a `.env` file in the server directory with the following configuration:

```env
# Environment Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://sandbox:sandbox@localhost:27017/?authSource=sandbox_db
MONGODB_DATABASE=sandbox_db

# SSH Tunnel Configuration (optional, for remote MongoDB access)
SSH_TUNNEL_ENABLED=false
SSH_HOST=your-remote-server.com
SSH_PORT=22
SSH_USERNAME=your-ssh-username
SSH_PRIVATE_KEY_PATH=/path/to/your/private/key

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# Server Configuration
CORS_ORIGIN=http://localhost:5173
```

### MongoDB Connection Options

1. **Local MongoDB** (default):
   ```env
   MONGODB_URI=mongodb://sandbox:sandbox@localhost:27017/?authSource=sandbox_db
   SSH_TUNNEL_ENABLED=false
   ```

2. **Remote MongoDB via SSH Tunnel**:
   ```env
   MONGODB_URI=mongodb://sandbox:sandbox@localhost:27017/?authSource=sandbox_db
   SSH_TUNNEL_ENABLED=true
   SSH_HOST=your-server.com
   SSH_USERNAME=your-username
   SSH_PRIVATE_KEY_PATH=/path/to/private/key
   ```

3. **Cloud MongoDB** (MongoDB Atlas):
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sandbox_db
   SSH_TUNNEL_ENABLED=false
   ```

See `SSH_TUNNEL_SETUP.md` for detailed SSH configuration instructions.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Farmer/Admin)
- `PUT /api/products/:id` - Update product (Farmer/Admin)
- `DELETE /api/products/:id` - Delete product (Farmer/Admin)

### Orders
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Cancel order

### Users
- `GET /api/users` - Get users (Admin)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Deactivate user (Admin)

## 🗄️ Database Collections

### Users
- Authentication and profile information
- Role-based access (customer, farmer, admin)
- Address and preferences

### Products
- Product details, pricing, stock
- Farmer information
- Categories and certifications
- Images and nutritional info

### Orders
- Order items and pricing
- Shipping and payment info
- Status tracking and history

### Reviews
- Customer feedback and ratings
- Product reviews with moderation
- Helpful voting system

## 🔐 Default Credentials

After running the seed script:

- **Admin**: `admin` / `admin123`
- **Farmer**: `farmer1@agribasket.com` / `farmer123`
- **Customer**: `customer1@agribasket.com` / `customer123`

## 🧪 Testing

```bash
# Test database connection
curl http://localhost:5000/health

# Test API endpoints
curl http://localhost:5000/api/products
```

## 📊 Database Schema

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    avatar: String
  },
  role: 'customer' | 'farmer' | 'admin',
  farmerProfile: { ... },
  address: { ... },
  orderHistory: [ObjectId],
  wishlist: [ObjectId]
}
```

### Product Schema
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String,
  unit: String,
  stock: {
    quantity: Number,
    status: String
  },
  farmerId: ObjectId,
  images: [{ url: String, alt: String }]
}
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- MongoDB injection prevention

## 🚦 Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Custom business logic errors

## 📝 Logging

Development mode includes request logging for debugging.

## 🔄 Data Relationships

- Users → Orders (One-to-Many)
- Users → Products (Farmer-to-Many)
- Products → Reviews (One-to-Many)
- Orders → Reviews (One-to-Many)
- Users → Reviews (One-to-Many)

## 🎯 Future Enhancements

- File upload for images
- Email notifications
- SMS integration
- Payment gateway integration
- Advanced analytics
- Real-time chat support
