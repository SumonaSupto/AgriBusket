import React from 'react';
import UnitPrice from './UnitPrice';

const PricingBreakdown = ({ 
  items, 
  subtotal, 
  deliveryFee = 0, 
  tax = 0, 
  discount = 0, 
  total,
  showItemDetails = true,
  className = ''
}) => {
  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '৳0.00';
    }
    return `৳${Number(amount).toFixed(2)}`;
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
      
      {/* Item Details */}
      {showItemDetails && items && items.length > 0 && (
        <div className="mb-4 space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <div className="flex-1">
                <span className="font-medium">{item.title || item.productName}</span>
                <div className="text-gray-600">
                  <span>Qty: {item.quantity} × </span>
                  <UnitPrice 
                    price={item.price || item.unitPrice} 
                    unit={item.unit} 
                    showLabel={false}
                    variant="muted"
                    size="sm"
                    className="inline"
                  />
                </div>
              </div>
              <span className="font-medium">
                {formatCurrency((item.price || item.unitPrice) * item.quantity)}
              </span>
            </div>
          ))}
          <hr className="my-3" />
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="text-gray-800">{formatCurrency(subtotal)}</span>
        </div>
        
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="text-gray-800">{formatCurrency(deliveryFee)}</span>
          </div>
        )}
        
        {deliveryFee === 0 && subtotal >= 500 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Delivery Fee:</span>
            <span className="text-green-600">Free (Order ≥ ৳500)</span>
          </div>
        )}
        
        {tax > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="text-gray-800">{formatCurrency(tax)}</span>
          </div>
        )}
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount:</span>
            <span className="text-green-600">-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <hr className="my-2" />
        
        <div className="flex justify-between font-bold text-lg">
          <span className="text-gray-800">Total:</span>
          <span className="text-[#1D7603]">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default PricingBreakdown;
