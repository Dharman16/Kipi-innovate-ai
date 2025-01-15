import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, Mail, MessageSquare } from 'lucide-react';

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Lightbulb className="h-12 w-12 text-indigo-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-ping" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Join Kipi Innovate
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Contact the TSC team to get your account set up
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-2xl rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-gray-700">
                Please reach out to one of our TSC team members:
              </p>
              <div className="space-y-4 mt-4">
                <a 
                  href="mailto:dharman.d.joshi@kipi.ai"
                  className="flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-colors group"
                >
                  <Mail className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="border-b border-indigo-200 group-hover:border-indigo-600">
                    dharman.d.joshi@kipi.ai
                  </span>
                </a>
                <a 
                  href="mailto:veeranjaneya.a.tiruveedhula@kipi.ai"
                  className="flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-colors group"
                >
                  <Mail className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  <span className="border-b border-indigo-200 group-hover:border-indigo-600">
                    veeranjaneya.a.tiruveedhula@kipi.ai
                  </span>
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}