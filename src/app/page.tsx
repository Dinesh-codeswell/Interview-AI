"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import MainContent from "@/components/main-content";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            clearSearch={clearSearch} 
          />
          <MainContent 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            clearSearch={clearSearch} 
          />
        </div>
      </div>
    </div>
  );
}
