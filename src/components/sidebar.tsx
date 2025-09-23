"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  Settings,
  BookOpen,
  Trophy,
  BarChart3,
  MessageSquare,
  Plus,
  Calendar,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md border border-gray-200 hover:bg-gray-50"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-80 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm fixed left-0 top-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Sidebar Header - Removed Logo */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Navigation Menu</h3>
            <p className="text-xs text-gray-500">Quick Access</p>
          </div>
        </div>

      {/* Navigation Menu - Compact Design */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Main Menu
          </h3>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg border-l-4 border-primary transition-all duration-200 hover:bg-primary/15"
            >
              <Home className="mr-3 h-4 w-4" />
              Dashboard
              <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary text-xs">
                Active
              </Badge>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <MessageSquare className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
              Mock Interviews
              <Badge variant="outline" className="ml-auto text-xs">
                12
              </Badge>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <BookOpen className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
              Resources
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 text-xs">
                New
              </Badge>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <BarChart3 className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
              Analytics
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Trophy className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
              Achievements
            </a>
          </div>
        </div>

        {/* Quick Actions Section - Compact */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Plus className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
              New Interview
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Calendar className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
              Schedule Practice
            </a>
          </div>
        </div>
      </nav>

      {/* Sidebar Footer - Compact Design */}
      <div className="p-3 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-center">
          <Avatar className="h-8 w-8 ring-2 ring-gray-200">
            <AvatarImage src="/avatars/01.png" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 ml-2">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
      </aside>
    </>
  );
}