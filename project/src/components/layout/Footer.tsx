import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link to="/faq" className="text-gray-400 hover:text-gray-500">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-gray-500">
              Contact
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <div className="flex items-center justify-center">
              <Lightbulb className="h-6 w-6 text-indigo-600" />
              <p className="ml-2 text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Kipi Innovate. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}