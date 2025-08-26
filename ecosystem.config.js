module.exports = {
  apps: [
    {
      name: 'agribasket-api',
      script: './server/server.js',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        CORS_ORIGIN: 'https://israt18.cse.pstu.ac.bd' // Replace with your actual domain
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ],
  
  deploy: {
    production: {
      user: 'ug2002056',
      host: 'your-server-host', // Replace with your server IP/hostname
      ref: 'origin/main',
      repo: 'https://github.com/SumonaSupto/AgriBusket.git',
      path: '/home/ug2002056/agribasket',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --prefix server && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};