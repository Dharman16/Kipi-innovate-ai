import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, Menu, X, Plus, Sparkles, Shield, UserCircle, LogOut, LogIn, Trophy } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useProfile } from '../../lib/api/users';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { cn } from '../../lib/utils';

interface HeaderProps {
  showAdminLink?: boolean;
}

export function Header({ showAdminLink = false }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile(user?.id || '');
  const isAdmin = user?.email?.endsWith('@kipi.ai');

  const navigation = [
    { name: 'Home', href: '/', emoji: '🏠' },
    { name: 'FAQ', href: '/faq', emoji: '❓' },
    { name: 'Contact', href: '/contact', emoji: '📧' },
  ];

  const authenticatedNavigation = [
    { name: 'Leaderboard', href: '/leaderboard', emoji: '🏆' },
    { name: 'Browse Ideas', href: '/browse', emoji: '🔍' },
    { name: 'My Ideas', href: '/my-ideas', emoji: '💡' },
  ];

  const allNavigation = [
    ...navigation,
    ...(user ? authenticatedNavigation : []),
    ...(showAdminLink ? [{ name: 'Admin', href: '/admin', emoji: '🛡️' }] : [])
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-md" 
          : "bg-white shadow-sm"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center group transition-transform duration-300 hover:scale-105"
              onClick={() => setIsOpen(false)}
            >
              <div className="relative">
                <Lightbulb className="h-8 w-8 text-indigo-600 transition-all duration-500 group-hover:text-yellow-500" />
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
              <div className="ml-2 flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  Kipi
                </span>
                <span className="text-sm font-medium text-gray-600 -mt-1">
                  Innovate
                </span>
              </div>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            {user && <NotificationDropdown />}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "relative text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-1 py-2",
                  location.pathname === item.href
                    ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 after:transform after:scale-x-100 after:transition-transform"
                    : "text-gray-500 hover:text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 after:transform after:scale-x-0 hover:after:scale-x-100 after:transition-transform"
                )}
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            {user && !isAdmin && (
              <Link
                to="/submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Plus className="h-4 w-4 mr-1" />
                Submit Idea ✨
              </Link>
            )}
            {user && (
              <NotificationDropdown />
            )}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-all duration-300 hover:scale-105 p-1 rounded-full hover:bg-gray-100"
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-8 w-8" />
                )}
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 focus:outline-none transform transition-all duration-200 origin-top-right">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-2" />
                          Profile Settings
                        </div>
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </div>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </div>
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-2" />
                          Create Account
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "absolute left-0 right-0 top-16 z-50 transform transition-all duration-300 ease-in-out md:hidden",
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none",
            "bg-white border-b border-gray-200 shadow-lg"
          )}
        >
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* User info for mobile */}
            {user && (
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCircle className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation items */}
            <div className="px-4 py-3">
              <div className="grid gap-2">
                {allNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-300",
                      location.pathname === item.href
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3">{item.emoji}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Action buttons for mobile */}
            <div className="px-4 py-3 border-t border-gray-200">
              {user ? (
                <div className="space-y-2">
                  {!isAdmin && (
                    <Link
                      to="/submit"
                      className="flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Idea ✨
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}