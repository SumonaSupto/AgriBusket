// Suppress deprecation warnings for production
if (process.env.NODE_ENV === 'production') {
  process.noDeprecation = true;
}

// Alternative: Filter out specific deprecation warnings
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.name === 'DeprecationWarning'
  ) {
    // Suppress punycode deprecation warning
    if (data.message.includes('punycode')) {
      return false;
    }
    // Suppress MongoDB driver deprecation warnings
    if (data.message.includes('useNewUrlParser') || data.message.includes('useUnifiedTopology')) {
      return false;
    }
  }
  
  // Suppress Mongoose duplicate index warnings
  if (
    name === 'warning' &&
    typeof data === 'object' &&
    data.message && 
    data.message.includes('Duplicate schema index')
  ) {
    return false;
  }
  
  return originalEmit.apply(process, arguments);
};

module.exports = {
  suppressPunycodeWarning: true,
  suppressMongooseWarnings: true,
  suppressMongoDriverWarnings: true
};
