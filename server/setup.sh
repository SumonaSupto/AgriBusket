#!/bin/bash

echo "🚀 Setting up AgriBasket Backend Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "You can start it with: sudo systemctl start mongod"
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://sandbox:sandbox@localhost:27017/?authSource=sandbox_db
DB_NAME=agribasket_db
JWT_SECRET=agribasket_super_secure_jwt_secret_key_$(date +%s)
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
EOL
    echo "✅ Environment file created"
else
    echo "✅ Environment file already exists"
fi

echo "🌱 Seeding database with sample data..."
node seedData.js

echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the server: npm run dev"
echo "2. Server will run on: http://localhost:5000"
echo "3. Test health check: curl http://localhost:5000/health"
echo ""
echo "🔐 Default login credentials:"
echo "Admin: admin / admin123"
echo "Farmer: farmer1@agribasket.com / farmer123"
echo "Customer: customer1@agribasket.com / customer123"
echo ""
echo "📚 API documentation available at: http://localhost:5000"
