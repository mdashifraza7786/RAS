'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaUtensils, 
  FaShoppingCart, 
  FaSearch,
  FaLeaf, 
  FaFire, 
  FaStar, 
  FaPlus,
  FaMinus,
  FaUser,
  FaPhoneAlt,
  FaArrowLeft
} from 'react-icons/fa';

// Types
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular: boolean;
}

interface GuestInfo {
  name: string;
  phone: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

// Sample menu data
const menuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Butter Chicken',
    category: 'Main Course',
    price: 250,
    description: 'Tender chicken cooked in a rich and creamy tomato-based sauce.',
    image: '/images/butter-chicken.jpg',
    isVegetarian: false,
    isSpicy: true,
    isPopular: true
  },
  {
    id: 2,
    name: 'Paneer Tikka',
    category: 'Appetizers',
    price: 180,
    description: 'Marinated cottage cheese cubes grilled to perfection.',
    image: '/images/paneer-tikka.jpg',
    isVegetarian: true,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 3,
    name: 'Vegetable Biryani',
    category: 'Rice',
    price: 200,
    description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices.',
    image: '/images/veg-biryani.jpg',
    isVegetarian: true,
    isSpicy: true,
    isPopular: false
  },
  {
    id: 4,
    name: 'Chicken Tikka',
    category: 'Appetizers',
    price: 220,
    description: 'Marinated chicken pieces grilled in a tandoor.',
    image: '/images/chicken-tikka.jpg',
    isVegetarian: false,
    isSpicy: true,
    isPopular: true
  },
  {
    id: 5,
    name: 'Gulab Jamun',
    category: 'Desserts',
    price: 120,
    description: 'Deep-fried milk solids soaked in sugar syrup.',
    image: '/images/gulab-jamun.jpg',
    isVegetarian: true,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 6,
    name: 'Malai Kofta',
    category: 'Main Course',
    price: 220,
    description: 'Potato and paneer dumplings served in a creamy sauce.',
    image: '/images/malai-kofta.jpg',
    isVegetarian: true,
    isSpicy: false,
    isPopular: false
  },
  {
    id: 7,
    name: 'Garlic Naan',
    category: 'Breads',
    price: 70,
    description: 'Soft leavened bread topped with garlic and butter.',
    image: '/images/garlic-naan.jpg',
    isVegetarian: true,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 8,
    name: 'Tandoori Chicken',
    category: 'Main Course',
    price: 300,
    description: 'Chicken marinated in yogurt and spices, cooked in a tandoor.',
    image: '/images/tandoori-chicken.jpg',
    isVegetarian: false,
    isSpicy: true,
    isPopular: true
  }
];

// Available categories
const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

export default function MenuPage() {
  const router = useRouter();
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);

  // Load guest info from localStorage on component mount
  useEffect(() => {
    const storedGuestInfo = localStorage.getItem('guestInfo');
    if (storedGuestInfo) {
      setGuestInfo(JSON.parse(storedGuestInfo));
    } else {
      // Redirect to guest login if no guest info found
      router.push('/guest');
    }

    // Load cart from localStorage if exists
    const storedCart = localStorage.getItem('guestCart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [router]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart]);

  // Filter menu items based on search, category, and veg filter
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesVegFilter = !vegOnly || item.isVegetarian;
    
    return matchesSearch && matchesCategory && matchesVegFilter;
  });

  // Cart functions
  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Item already in cart, increase quantity
        return prevCart.map((cartItem, index) => 
          index === existingItemIndex 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        // Item not in cart, add it
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === itemId);
      
      if (existingItemIndex >= 0 && prevCart[existingItemIndex].quantity > 1) {
        // Decrease quantity if more than 1
        return prevCart.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        // Remove item from cart
        return prevCart.filter(item => item.id !== itemId);
      }
    });
  };

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <nav className="bg-white shadow-md py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/guest')}
                className="text-gray-600 hover:text-amber-500 mr-3"
              >
                <FaArrowLeft size={18} />
              </button>
              <div className="text-xl font-semibold text-gray-800 flex items-center">
                <FaUtensils className="text-amber-500 mr-2" />
                <span>Our Menu</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {guestInfo && (
                <div className="hidden md:flex items-center text-sm text-gray-600">
                  <div className="flex items-center mr-4">
                    <FaUser className="text-gray-400 mr-1" />
                    <span>{guestInfo.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhoneAlt className="text-gray-400 mr-1" />
                    <span>{guestInfo.phone}</span>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => router.push('/guest/cart')}
                className="relative bg-amber-500 text-white p-2 rounded-full hover:bg-amber-600"
              >
                <FaShoppingCart size={18} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and filter section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Search menu..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegOnly"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="vegOnly" className="ml-2 text-sm text-gray-700 flex items-center">
                  <FaLeaf className="text-green-500 mr-1" />
                  Vegetarian Only
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Category tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeCategory === category
                    ? 'bg-amber-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Menu items grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <div 
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image || '/images/placeholder.jpg'})` }}
                  ></div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <span className="text-amber-600 font-semibold">₹{item.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {item.category}
                    </span>
                    
                    {item.isVegetarian && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <FaLeaf className="mr-1" />
                        Veg
                      </span>
                    )}
                    
                    {item.isSpicy && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        <FaFire className="mr-1" />
                        Spicy
                      </span>
                    )}
                    
                    {item.isPopular && (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        <FaStar className="mr-1" />
                        Popular
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center">
                    {cart.some(cartItem => cartItem.id === item.id) ? (
                      <div className="flex items-center">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="bg-gray-200 text-gray-700 p-2 rounded-l hover:bg-gray-300"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="bg-gray-100 px-4 py-2">
                          {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-gray-200 text-gray-700 p-2 rounded-r hover:bg-gray-300"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-amber-500 text-white px-4 py-2 rounded flex items-center hover:bg-amber-600"
                      >
                        <FaPlus className="mr-2" size={12} />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-6 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No menu items found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Cart summary bar - visible when items in cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white shadow-md border-t border-gray-200 py-4 px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{cartItemCount} item{cartItemCount !== 1 ? 's' : ''} in cart</p>
              <p className="text-lg font-bold text-amber-600">₹{totalPrice.toFixed(2)}</p>
            </div>
            
            <button
              onClick={() => router.push('/guest/cart')}
              className="bg-amber-500 text-white px-6 py-2 rounded-md font-medium flex items-center hover:bg-amber-600"
            >
              <FaShoppingCart className="mr-2" />
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 