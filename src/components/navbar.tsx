"use client";

import { Button } from "@/components/ui/button";
import { Plus, Menu, ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm ml-72" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Spacer for better alignment with fixed sidebar */}
          <div className="flex-1"></div>

          {/* Navigation Links - Enhanced Spacing and Active States */}
          <div className="hidden md:block flex-1">
            <div className="flex items-baseline justify-center space-x-8">
              <a
                href="#"
                className="text-body font-medium text-primary bg-primary/10 px-3 py-2 rounded-md relative group transition-all duration-200"
                aria-current="page"
              >
                Dashboard
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-100 transition-transform duration-200" aria-hidden="true"></span>
              </a>
              <a
                href="#"
                className="text-body font-medium text-gray-600 hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Practice
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" aria-hidden="true"></span>
              </a>
              <a
                href="#"
                className="text-body font-medium text-gray-600 hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Analytics
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" aria-hidden="true"></span>
              </a>
              <a
                href="#"
                className="text-body font-medium text-gray-600 hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md relative group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Resources
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" aria-hidden="true"></span>
              </a>
            </div>
          </div>

          {/* Right side - Enhanced CTA and Profile with Better Spacing */}
          <div className="flex items-center space-x-6 flex-1 justify-end">
            <Button 
              variant="outline" 
              size="sm"
              className="btn-enhanced border-primary text-primary hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Upgrade to Pro version"
            >
              Upgrade Pro
            </Button>
            <Button 
              className="btn-enhanced btn-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Start a new interview session"
            >
              <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
              New Interview
            </Button>
            
            {/* User Profile - Enhanced Design with Accessibility */}
            <div className="relative ml-4">
              <button 
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Open user menu"
                aria-expanded="false"
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-900">John Doe</p>
                  <p className="text-xs text-gray-500">Premium User</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Mobile menu button with Accessibility */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-50 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
              aria-label="Open main menu"
            >
              <Menu className="block h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Enhanced with Accessibility */}
      <div className="md:hidden" id="mobile-menu" role="menu" aria-orientation="vertical" aria-labelledby="mobile-menu-button">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
          <a
            href="#"
            className="text-primary bg-primary/10 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
            aria-current="page"
            role="menuitem"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            role="menuitem"
          >
            Practice
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            role="menuitem"
          >
            Analytics
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-primary hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            role="menuitem"
          >
            Resources
          </a>
          <div className="border-t border-gray-200 pt-4 pb-3">
            <div className="flex items-center px-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">John Doe</div>
                <div className="text-sm text-gray-500">Premium User</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-center btn-enhanced border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Upgrade Pro
              </Button>
              <Button 
                className="w-full justify-center btn-enhanced btn-primary mt-2"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                New Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}