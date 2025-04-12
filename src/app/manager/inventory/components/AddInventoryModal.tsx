'use client';

import React, { useState } from 'react';
import { FaTimes, FaBox, FaTag, FaBalanceScale, FaRuler, FaDollarSign, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: () => void;
  categories: string[];
}

export default function AddInventoryModal({ isOpen, onClose, onItemAdded, categories }: AddInventoryModalProps) {
  // Fixing hydration error by using consistent date format across server and client
  const defaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 90); // 90 days from now
    return date.toISOString().split('T')[0];
  };
  
  const [formData, setFormData] = useState({
    name: '',
    category: categories.length > 0 ? categories[0] : '',
    quantity: '',
    unit: 'kg',
    costPerUnit: '',
    supplier: '',
    expiryDate: defaultExpiryDate(),
    location: 'Main Storage',
    minStockLevel: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    if (!formData.unit) newErrors.unit = 'Unit is required';
    
    if (!formData.costPerUnit) newErrors.costPerUnit = 'Cost per unit is required';
    else if (isNaN(Number(formData.costPerUnit)) || Number(formData.costPerUnit) < 0) {
      newErrors.costPerUnit = 'Cost per unit must be a positive number';
    }
    
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    
    if (!formData.minStockLevel) newErrors.minStockLevel = 'Minimum stock level is required';
    else if (isNaN(Number(formData.minStockLevel)) || Number(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'Minimum stock level must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        costPerUnit: Number(formData.costPerUnit),
        minStockLevel: Number(formData.minStockLevel)
      };
      
      const response = await fetch('/api/manager/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add inventory item');
      }
      
      toast.success('Inventory item added successfully');
      onItemAdded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add inventory item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Add New Inventory Item</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Item Information */}
                <div className="col-span-2">
                  <h4 className="font-medium text-sm text-gray-700 mb-3">Item Information</h4>
                </div>
                
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBox className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter item name"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaTag className="text-gray-400" />
                    </div>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>
                
                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBalanceScale className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="0"
                      step="0.01"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter quantity"
                    />
                  </div>
                  {errors.quantity && <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>}
                </div>
                
                {/* Unit */}
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRuler className="text-gray-400" />
                    </div>
                    <select
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.unit ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="liter">Liters</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="unit">Units</option>
                      <option value="dozen">Dozen</option>
                      <option value="piece">Pieces</option>
                    </select>
                  </div>
                  {errors.unit && <p className="mt-1 text-sm text-red-500">{errors.unit}</p>}
                </div>
                
                {/* Cost Per Unit */}
                <div>
                  <label htmlFor="costPerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                    Cost Per Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaDollarSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="costPerUnit"
                      name="costPerUnit"
                      min="0"
                      step="0.01"
                      value={formData.costPerUnit}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.costPerUnit ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter cost per unit"
                    />
                  </div>
                  {errors.costPerUnit && <p className="mt-1 text-sm text-red-500">{errors.costPerUnit}</p>}
                </div>
                
                {/* Supplier */}
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.supplier ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  {errors.supplier && <p className="mt-1 text-sm text-red-500">{errors.supplier}</p>}
                </div>
                
                {/* Expiry Date */}
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendarAlt className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    />
                  </div>
                  {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>}
                </div>
                
                {/* Storage Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Storage Location
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter storage location"
                    />
                  </div>
                </div>
                
                {/* Min Stock Level */}
                <div>
                  <label htmlFor="minStockLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Stock Level <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaExclamationTriangle className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="minStockLevel"
                      name="minStockLevel"
                      min="0"
                      step="0.01"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      className={`pl-10 pr-4 py-2 w-full border ${errors.minStockLevel ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                      placeholder="Enter minimum stock level"
                    />
                  </div>
                  {errors.minStockLevel && <p className="mt-1 text-sm text-red-500">{errors.minStockLevel}</p>}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 