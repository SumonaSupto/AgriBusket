import React from 'react';

const UnitPrice = ({ 
  price, 
  unit, 
  className = '', 
  showLabel = true, 
  variant = 'default',
  size = 'md'
}) => {
  const formatPrice = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0.00';
    }
    return Number(amount).toFixed(2);
  };

  const getUnitLabel = (unit) => {
    const unitLabels = {
      'kg': 'kilogram',
      'liter': 'liter',
      'dozen': 'dozen',
      'piece': 'piece',
      'gram': 'gram',
      'pound': 'pound',
      'bunch': 'bunch',
      'jar': 'jar'
    };
    return unitLabels[unit] || unit;
  };

  const getSizeClasses = (size) => {
    const sizeClasses = {
      'sm': 'text-sm',
      'md': 'text-base',
      'lg': 'text-lg',
      'xl': 'text-xl'
    };
    return sizeClasses[size] || 'text-base';
  };

  const getVariantClasses = (variant) => {
    const variantClasses = {
      'default': 'text-gray-600',
      'primary': 'text-[#1D7603]',
      'secondary': 'text-gray-500',
      'muted': 'text-gray-400',
      'highlight': 'text-green-700 bg-green-50 px-2 py-1 rounded'
    };
    return variantClasses[variant] || 'text-gray-600';
  };

  return (
    <span className={`${getSizeClasses(size)} ${getVariantClasses(variant)} ${className}`}>
      {showLabel && <span className="font-medium">Unit Price: </span>}
      ৳{formatPrice(price)} per {unit}
      {variant === 'highlight' && (
        <span className="block text-xs text-green-600 mt-1">
          Price per {getUnitLabel(unit)}
        </span>
      )}
    </span>
  );
};

export default UnitPrice;
