'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaShoppingCart, FaSpinner, FaMinus, FaPlus, FaTrash, FaArrowRight } from 'react-icons/fa';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { API_URL } from '@/config/constants';
import Link from 'next/link';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  preparationTime: number;
}

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, addItem, updateQuantity, removeItem, total, itemCount } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobile, setIsMobile] = useState(false);

  // Get search query from URL params
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    // Check if guest info exists
    const guestInfo = localStorage.getItem('guestInfo');
    if (!guestInfo) {
      router.push('/guest');
      return;
    }

    fetchMenuItems();
  }, [router]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/menu-items`);
      setMenuItems(response.data.menuItems);
    } catch (err) {
      setError('Failed to load menu items');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    });
    toast.success(`${item.name} added to cart`);
  };

  const getItemQuantity = (menuItemId: string) => {
    const cartItem = items.find(item => item.menuItemId === menuItemId);
    return cartItem?.quantity || 0;
  };

  const handleUpdateQuantity = (menuItemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(menuItemId);
    } else {
      updateQuantity(menuItemId, newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-amber-500 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-32">
      <div className="max-w-7xl mx-auto mb-8">
        {/* Categories */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const quantity = getItemQuantity(item._id);
            
            return (
              <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {item.image && (
                  <div className="relative h-48">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-500">
                      {formatCurrency(item.price)}
                    </span>
                    {quantity === 0 ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 flex items-center gap-2"
                      >
                        <FaShoppingCart />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item._id, quantity - 1)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          {quantity === 1 ? <FaTrash className="text-red-500" /> : <FaMinus className="text-gray-500" />}
                        </button>
                        <span className="w-8 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item._id, quantity + 1)}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <FaPlus className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Prep time: {item.preparationTime} mins
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No menu items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Sticky Cart Total */}
      {itemCount > 0 && (
        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg ${
          isMobile ? 'mb-16' : ''
        }`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaShoppingCart className="text-amber-500" />
                  <span className="font-medium">{itemCount} items</span>
                </div>
                <div className="text-lg font-bold text-amber-500">
                  {formatCurrency(total)}
                </div>
              </div>
              <Link
                href="/guest/cart"
                className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 flex items-center gap-2"
              >
                Checkout <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 