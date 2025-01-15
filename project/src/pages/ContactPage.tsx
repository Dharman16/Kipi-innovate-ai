import React from 'react';
import { Mail, MessageSquare } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            Get in touch with the TSC team for any questions or support
          </p>
        </div>

        <div className="card p-8">
          <div className="text-center space-y-6">
            <MessageSquare className="h-12 w-12 text-indigo-600 mx-auto" />
            <p className="text-lg text-gray-600">
              Please reach out to the TSC team for more details or write to us at:
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:dharman.d.joshi@kipi.ai"
                className="flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                dharman.d.joshi@kipi.ai
              </a>
              <a 
                href="mailto:veeranjaneya.a.tiruveedhula@kipi.ai"
                className="flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                veeranjaneya.a.tiruveedhula@kipi.ai
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}