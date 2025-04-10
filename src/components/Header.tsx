'use client';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated' && session?.user) {
      // Redirect to appropriate dashboard based on role
      switch (session.user.role) {
        case 'manager':
          router.push('/manager');
          break;
        case 'waiter':
          router.push('/waiter');
          break;
        case 'chef':
          router.push('/chef');
          break;
        default:
          router.push('/guest');
      }
    } else {
      // Not authenticated, redirect to login
      router.push('/login');
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header className="bg-[#1e4972] px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 flex justify-between items-center text-white w-full sticky top-0 z-10">
      <div className="flex items-center">
        <FaHome className="text-xl sm:text-2xl mr-3 sm:mr-4" />
        <span className="font-medium text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap">Restaurant Management System</span>
      </div>
      <div className="flex gap-3 sm:gap-4">
       
        <button className="flex items-center bg-[#2c5f95] px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-[#244b76] transition-colors text-xs sm:text-sm" 
          onClick={handleLogout}>
          <FaSignOutAlt className="mr-2 text-sm sm:text-base" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;