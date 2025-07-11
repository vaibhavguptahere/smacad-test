'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, FileText, ArrowRight, Search, Filter, Calendar, TrendingUp } from 'lucide-react';

export default function Notes() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, notes, topics, date

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      const notes = data.notes || [];

      // Group notes by subject and count them
      const subjectData = notes.reduce((acc, note) => {
        const subject = note.subject;
        if (!acc[subject]) {
          acc[subject] = {
            name: subject,
            noteCount: 0,
            topics: new Set(),
            latestNote: note.createdAt,
            totalSize: 0
          };
        }
        acc[subject].noteCount++;
        acc[subject].topics.add(note.topic);
        acc[subject].totalSize += note.size || 0;

        // Keep track of the latest note date
        if (new Date(note.createdAt) > new Date(acc[subject].latestNote)) {
          acc[subject].latestNote = note.createdAt;
        }

        return acc;
      }, {});

      // Convert to array and add topic count
      const subjectsArray = Object.values(subjectData).map(subject => ({
        ...subject,
        topicCount: subject.topics.size,
        topics: undefined // Remove the Set object
      }));

      setSubjects(subjectsArray);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (subjectName) => {
    const name = subjectName.toLowerCase();
    if (name.includes('math') || name.includes('algebra') || name.includes('calculus')) {
      return '📐';
    } else if (name.includes('physics')) {
      return '⚛️';
    } else if (name.includes('chemistry')) {
      return '🧪';
    } else if (name.includes('biology')) {
      return '🧬';
    } else if (name.includes('english') || name.includes('literature')) {
      return '📚';
    } else if (name.includes('history')) {
      return '🏛️';
    } else if (name.includes('geography')) {
      return '🌍';
    } else if (name.includes('computer') || name.includes('programming')) {
      return '💻';
    }
    return '📖';
  };

  const getSubjectGradient = (subjectName) => {
    const name = subjectName.toLowerCase();
    if (name.includes('math') || name.includes('algebra') || name.includes('calculus')) {
      return 'from-blue-500 to-purple-600';
    } else if (name.includes('physics')) {
      return 'from-indigo-500 to-blue-600';
    } else if (name.includes('chemistry')) {
      return 'from-green-500 to-teal-600';
    } else if (name.includes('biology')) {
      return 'from-emerald-500 to-green-600';
    } else if (name.includes('english') || name.includes('literature')) {
      return 'from-orange-500 to-red-600';
    } else if (name.includes('history')) {
      return 'from-amber-500 to-orange-600';
    } else if (name.includes('geography')) {
      return 'from-cyan-500 to-blue-600';
    } else if (name.includes('computer') || name.includes('programming')) {
      return 'from-violet-500 to-purple-600';
    }
    return 'from-gray-500 to-slate-600';
  };

  // Filter and sort subjects
  const filteredAndSortedSubjects = subjects
    .filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'notes':
          return b.noteCount - a.noteCount;
        case 'topics':
          return b.topicCount - a.topicCount;
        case 'date':
          return new Date(b.latestNote) - new Date(a.latestNote);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subjects...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-4">
            Study Notes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your subject to access comprehensive study materials organized by topics.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-all duration-200"
              >
                <option value="name">Sort by Name</option>
                <option value="notes">Sort by Notes Count</option>
                <option value="topics">Sort by Topics Count</option>
                <option value="date">Sort by Latest Update</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredAndSortedSubjects.length} subject{filteredAndSortedSubjects.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
            </div>
          )}
        </div>

        {/* Subjects Grid */}
        {filteredAndSortedSubjects.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No subjects found' : 'No Subjects Available'}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new study materials!'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedSubjects.map((subject, index) => (
              <Link
                key={subject.name}
                href={`/notes/${encodeURIComponent(subject.name)}`}
                className="group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-transparent transform hover:-translate-y-3 hover:scale-105 relative overflow-hidden animate-fade-in-up">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getSubjectGradient(subject.name)} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-200 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <div className="absolute top-8 -right-2 w-4 h-4 bg-purple-200 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500"></div>

                  <div className="relative z-10">
                    {/* Subject Icon */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${getSubjectGradient(subject.name)} text-white text-3xl mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        {getSubjectIcon(subject.name)}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                        {subject.name}
                      </h3>
                    </div>

                    {/* Stats */}
                    <div className="space-y-4 mb-8">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200 group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-800">{subject.noteCount}</span>
                          </div>
                          <div className="text-xs text-blue-600 mt-1">Notes</div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl border border-green-200 group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-800">{subject.topicCount}</span>
                          </div>
                          <div className="text-xs text-green-600 mt-1">Topics</div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Updated</span>
                          </div>
                          <span className="font-medium">{new Date(subject.latestNote).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Size</span>
                          </div>
                          <span className="font-medium">{(subject.totalSize / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className={`bg-gradient-to-r ${getSubjectGradient(subject.name)} text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg group-hover:shadow-xl transform group-hover:scale-105`}>
                      <span>Explore Notes</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Section */}
        {subjects.length > 0 && (
          <div className="mt-20 bg-white rounded-3xl shadow-xl p-10 border border-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-50"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Platform Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="group">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <div className="text-4xl font-bold mb-2">
                      {subjects.length}
                    </div>
                    <div className="text-blue-100 font-medium">Subjects Available</div>
                  </div>
                </div>
                <div className="group">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <div className="text-4xl font-bold mb-2">
                      {subjects.reduce((total, subject) => total + subject.topicCount, 0)}
                    </div>
                    <div className="text-green-100 font-medium">Topics Covered</div>
                  </div>
                </div>
                <div className="group">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    <div className="text-4xl font-bold mb-2">
                      {subjects.reduce((total, subject) => total + subject.noteCount, 0)}
                    </div>
                    <div className="text-purple-100 font-medium">Study Materials</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}