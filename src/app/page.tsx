import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import MainContent from "@/components/main-content";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 ml-72">
          <MainContent />
        </div>
      </div>
    </div>
  );
}
