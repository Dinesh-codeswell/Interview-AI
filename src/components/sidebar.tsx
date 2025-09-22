"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  Settings,
  HelpCircle,
  User,
  BookOpen,
  Trophy,
  BarChart3,
  MessageSquare,
  Plus,
  Calendar,
  Target,
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
        w-72 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm fixed left-0 top-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Sidebar Header - Enhanced Visual Separation */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">IA</span>
            </div>
            <div>
              <h2 className="text-primary-heading font-semibold text-gray-900">Interview Ace</h2>
              <p className="text-xs text-gray-500">Professional Edition</p>
            </div>
          </div>
        </div>

      {/* Navigation Menu - Enhanced Design */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Main Menu
          </h3>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-lg border-l-4 border-primary transition-all duration-200 hover:bg-primary/15"
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
              <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary text-xs">
                Active
              </Badge>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <MessageSquare className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              Mock Interviews
              <Badge variant="outline" className="ml-auto text-xs">
                12
              </Badge>
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <BarChart3 className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              Analytics
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <BookOpen className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              Resources
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700 text-xs">
                New
              </Badge>
            </a>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Plus className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              New Interview
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Calendar className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              Schedule Practice
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
            >
              <Target className="mr-3 h-5 w-5 group-hover:text-primary transition-colors" />
              Set Goals
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs font-medium text-gray-900">Google Interview</p>
              <p className="text-xs text-gray-500">Completed 2 hours ago</p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs font-medium text-gray-900">Meta Prep Session</p>
              <p className="text-xs text-gray-500">Scheduled for tomorrow</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Footer - Enhanced Design */}
      <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-8 w-8 ring-2 ring-gray-200">
            <AvatarImage src="/avatars/01.png" alt="User" />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Pro Member</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-600">Monthly Goal</span>
            <span className="text-xs text-gray-500">8/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}