"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Users,
  Clock,
  X,
  Code,
  Database,
  Calculator,
  FileText,
  DollarSign,
  Grid
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import InterviewPopup from "@/components/interview-popup";

const interviewTypes = [
  {
    id: 1,
    company: "Amazon",
    role: "SDE Technical Interview",
    difficulty: "Medium",
    description: "Designed to evaluate a candidate's technical depth, problem-solving ability, and behavioral fit.",
    icon: <Code className="w-6 h-6" />,
    logo: "/avatars/amazon.png",
    category: "Software Engineering"
  },
  {
    id: 2,
    company: "Zomato",
    role: "Data Analyst",
    difficulty: "Medium",
    description: "Evaluate your data handling, SQL, and insight generation skills in real-world product and growth scenarios",
    icon: <Database className="w-6 h-6" />,
    logo: "/avatars/zomato-logo-slogan-tagline.png",
    category: "Data Analyst"
  },
  {
    id: 3,
    company: "General Prep",
    role: "Guesstimate",
    difficulty: "Medium",
    description: "Estimate real-world quantities using logical breakdowns and assumptions to showcase structured thinking",
    icon: <Calculator className="w-6 h-6" />,
    logo: "/avatars/732221.png",
    category: "Product Management"
  },
  {
    id: 4,
    company: "BCG",
    role: "Consultant",
    difficulty: "Medium",
    description: "Test your structured thinking, business acumen, and case-solving ability through consulting-style interviews",
    icon: <Users className="w-6 h-6" />,
    logo: "/avatars/bcg.png",
    category: "Consulting"
  },
  {
    id: 5,
    company: "General Prep",
    role: "CV Grilling",
    difficulty: "Medium",
    description: "Dive deep into your resume to test self-awareness, clarity of experience, and alignment with your career story",
    icon: <FileText className="w-6 h-6" />,
    logo: "/avatars/732221.png",
    category: "Product Management"
  },
  {
    id: 6,
    company: "JPMorgan Chase & Co",
    role: "Finance Analyst",
    difficulty: "Medium",
    description: "Assess your financial knowledge, modeling fundamentals, and market intuition for high-stakes finance roles",
    icon: <DollarSign className="w-6 h-6" />,
    logo: "/avatars/JP-Morgan-Logo-PNG-Photos.png",
    category: "Data Scientist"
  }
];

const categories = ["All", "Software Engineering", "Data Analyst", "Product Management", "Consulting", "Data Scientist"];
const filterTabs = ["All Interviews", "Recent", "Favorites", "Completed"];

export default function MainContent({ searchTerm, setSearchTerm, clearSearch }: { 
  searchTerm: string; 
  setSearchTerm: (term: string) => void; 
  clearSearch: () => void; 
}) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("All Interviews");
  const [selectedInterview, setSelectedInterview] = useState<typeof interviewTypes[0] | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Get unique companies and difficulties for filter options
  const companies = ["All", ...Array.from(new Set(interviewTypes.map(interview => interview.company)))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredInterviews = interviewTypes.filter((interview) => {
    const matchesSearch = interview.company.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         interview.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         interview.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || interview.category === activeCategory;
    const matchesDifficulty = selectedDifficulty === "All" || interview.difficulty === selectedDifficulty;
    const matchesCompany = selectedCompany === "All" || interview.company === selectedCompany;
    return matchesSearch && matchesCategory && matchesDifficulty && matchesCompany;
  }).sort((a, b) => {
    switch (sortBy) {
      case "company-asc":
        return a.company.localeCompare(b.company);
      case "company-desc":
        return b.company.localeCompare(a.company);
      case "difficulty-asc":
        const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
        return difficultyOrder[a.difficulty as keyof typeof difficultyOrder] - difficultyOrder[b.difficulty as keyof typeof difficultyOrder];
      case "difficulty-desc":
        const difficultyOrderDesc = { "Easy": 3, "Medium": 2, "Hard": 1 };
        return difficultyOrderDesc[a.difficulty as keyof typeof difficultyOrderDesc] - difficultyOrderDesc[b.difficulty as keyof typeof difficultyOrderDesc];
      case "reviews":
        // Simulate review sorting (in real app, this would be based on actual review data)
        return Math.random() - 0.5;
      case "top-rated":
        // Simulate top-rated sorting (in real app, this would be based on actual rating data)
        return Math.random() - 0.5;
      default:
        return 0;
    }
  });

  const handleInterviewClick = (interview: typeof interviewTypes[0]) => {
    setSelectedInterview(interview);
    setIsPopupOpen(true);
  };

  const handleStartInterview = () => {
    // This will be implemented when we create the permission screen
    console.log("Starting interview for:", selectedInterview?.company);
  };

  return (
    <main className="flex-1 ml-0 md:ml-80 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 transition-all duration-300">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Mobile Search Bar - Only visible on mobile */}
        <div className="mb-6 sm:mb-8 lg:hidden">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg shadow-gray-200/50">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" 
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search interviews by company, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm rounded-lg shadow-sm border-gray-200 focus:border-primary focus:ring-primary w-full"
                aria-label="Search interviews"
                role="searchbox"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                  aria-label="Clear search"
                  type="button"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Filter Tabs */}
        <div className="flex overflow-x-auto space-x-1 bg-gray-100 p-1 rounded-lg mb-6 scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mobile-Optimized Filter Tags with Accessibility */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-8" role="group" aria-label="Filter interviews by category">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              className={`btn-enhanced rounded-full px-4 sm:px-6 py-2 text-xs sm:text-sm transition-all duration-200 mx-1 shadow-sm hover:shadow-md ${
                activeCategory === category
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:scale-105 shadow-gray-200/50'
              }`}
              onClick={() => setActiveCategory(category)}
              onMouseEnter={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              aria-pressed={activeCategory === category}
              aria-describedby={`filter-${category.toLowerCase()}-desc`}
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{category}</span>
              {activeCategory === category && (
                <div className="ml-1 sm:ml-2 w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0" aria-hidden="true" />
              )}
              <span id={`filter-${category.toLowerCase()}-desc`} className="sr-only">
                {activeCategory === category ? 'Currently selected filter' : 'Click to filter by'} {category}
              </span>
            </Button>
          ))}
        </div>

        {/* Interview Cards Grid - Enhanced Visual Hierarchy */}
        <div className="space-y-8">
          {/* Mobile-Optimized Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Available Interviews</h2>
              <p className="text-xs sm:text-sm text-gray-600">Choose from {filteredInterviews.length} curated interview experiences</p>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-3 py-2 h-8 sm:h-9"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">More </span>Filters
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs px-3 py-2 h-8 sm:h-9 border border-gray-200 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="default">Sort by</option>
                <option value="company-asc">Company A-Z</option>
                <option value="company-desc">Company Z-A</option>
                <option value="difficulty-asc">Difficulty ↑</option>
                <option value="difficulty-desc">Difficulty ↓</option>
                <option value="reviews">Most Reviews</option>
                <option value="top-rated">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {companies.map((company) => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCompany("All");
                      setSelectedDifficulty("All");
                      setSortBy("default");
                      setActiveCategory("All");
                      setSearchTerm("");
                    }}
                    className="w-full text-xs"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Cards Grid with Enhanced Mobile-First Responsive Design */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredInterviews.map((interview, index) => (
                <Card
                  key={interview.id}
                  className="group relative overflow-hidden border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm transform hover:scale-[1.015] hover:z-10 w-full shadow-md shadow-gray-200/40 hover:shadow-gray-200/50"
                  tabIndex={0}
                  role="article"
                  aria-label={`${interview.company} ${interview.role} interview card`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Interactive Overlay for Professional Polish */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Animated Border Effect */}
                    <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" style={{ background: 'linear-gradient(45deg, transparent, transparent), linear-gradient(45deg, var(--primary), var(--purple-500), var(--primary))', backgroundClip: 'padding-box, border-box' }} />

                    {/* Card Header with Enhanced Visual Hierarchy - Reduced padding by 20% */}
                  <CardHeader className="pb-1.5 px-4 pt-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow overflow-hidden">
                          <img 
                            src={interview.logo} 
                            alt={`${interview.company} logo`}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'block';
                              }
                            }}
                          />
                          <span className="text-xs hidden">{interview.company.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                            {interview.company}
                          </CardTitle>
                          <p className="text-xs text-gray-600 font-medium mt-0.5">
                            {interview.role}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={interview.difficulty === 'Hard' ? 'destructive' : interview.difficulty === 'Medium' ? 'secondary' : 'outline'}
                        className="text-xs font-medium shrink-0 px-2 py-0.5"
                      >
                        {interview.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>

                  {/* Card Content with Better Organization - Reduced padding by 20% */}
                  <CardContent className="pt-0 pb-2.5 px-4">
                    <CardDescription className="text-xs text-gray-600 line-clamp-2 mb-2.5 leading-relaxed">
                      {interview.description}
                    </CardDescription>
                    
                    {/* Performance Indicators with Visual Enhancement - Reduced spacing by 20% */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mb-2.5">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          <span>Active</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-2.5 h-2.5 mr-1" />
                          45-60 min
                        </div>
                        <div className="flex items-center">
                          <Users className="w-2.5 h-2.5 mr-1" />
                          {Math.floor(Math.random() * 500) + 100}+ taken
                        </div>
                      </div>
                      <div className="flex items-center space-x-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-0.5 h-2.5 rounded-full transition-all duration-300 ${
                              i < Math.floor(Math.random() * 5) + 1
                                ? 'bg-gradient-to-t from-primary to-purple-500'
                                : 'bg-gray-200'
                            }`}
                            style={{ animationDelay: `${i * 100}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Call-to-Action Button - Properly Contained - Reduced size by 20% */}
                    <Button
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-medium transition-all duration-300 transform hover:scale-[1.015] hover:shadow-md group-hover:shadow-primary/25 h-8"
                      size="sm"
                      onClick={() => handleInterviewClick(interview)}
                    >
                      <span className="flex items-center justify-center text-xs">
                        Start Interview
                        <div className="ml-1.5 transform transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </div>
                      </span>
                    </Button>
                  </CardContent>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </Card>
              ))}
          </div>

          {/* Enhanced Empty State */}
          {filteredInterviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Try adjusting your search terms or filters to find the perfect interview practice session.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setActiveCategory("All");
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    
    {/* Interview Popup */}
    {selectedInterview && (
      <InterviewPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onStartInterview={handleStartInterview}
        company={selectedInterview.company}
        role={selectedInterview.role}
        duration="45-60 min"
        type="Technical"
        difficulty={selectedInterview.difficulty}
        logo={selectedInterview.logo}
      />
    )}
    </main>
  );
}
