'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, FileText, ArrowLeft, Clock, Search } from 'lucide-react';

export default function SubjectNotes() {
  const params = useParams();
  const className = decodeURIComponent(params.className);
  const subjectName = decodeURIComponent(params.subjectName);

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjectNotes();
  }, [className, subjectName]);

  const fetchSubjectNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      const allNotes = data.notes || [];

      // Filter notes for this class and subject
      const subjectNotes = allNotes.filter(note => 
        (note.class || 'General') === className && note.subject === subjectName
      );
      setNotes(subjectNotes);
    } catch (error) {
      console.error('Error fetching subject notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (noteId, filename) => {
    try {
      const response = await fetch(`/api/notes/download/${noteId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group notes by topic
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const topic = note.topic;
    if (!acc[topic]) {
      acc[topic] = [];
    }
    acc[topic].push(note);
    return acc;
  }, {});

  const getFileTypeColor = (fileType) => {
    if (fileType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType?.includes('doc')) return 'bg-blue-100 text-blue-800';
    if (fileType?.includes('ppt')) return 'bg-orange-100 text-orange-800';
    if (fileType?.includes('image')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('doc')) return '📝';
    if (fileType?.includes('ppt')) return '📊';
    if (fileType?.includes('image')) return '🖼️';
    return '📎';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/notes/class/${encodeURIComponent(className)}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Class {className} Subjects
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Class {className} - {subjectName}
              </h1>
              <p className="text-gray-600">
                {notes.length} study materials available across {Object.keys(groupedNotes).length} topics
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search notes and topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Notes by Topic */}
        {Object.keys(groupedNotes).length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Notes Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new materials!'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedNotes).map(([topic, topicNotes]) => (
              <div key={topic} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className="text-3xl mr-3">📚</span>
                    {topic}
                  </h2>
                  <p className="text-gray-600 bg-gray-50 px-3 py-1 rounded-full inline-block text-sm">
                    {topicNotes.length} materials available
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topicNotes.map((note) => (
                    <div key={note._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-200 transform hover:-translate-y-1 relative overflow-hidden group">
                      {/* Background Pattern */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-3xl transform group-hover:scale-110 transition-transform duration-300">{getFileTypeIcon(note.fileType)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getFileTypeColor(note.fileType)}`}>
                            {note.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                          {(note.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">{note.title}</h3>

                      {note.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-lg">{note.description}</p>
                      )}

                      <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-1 rounded-full w-fit">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => handleDownload(note._id, note.filename)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}