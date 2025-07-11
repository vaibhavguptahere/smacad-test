'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, FileText, Trash2, Plus, X, LogOut, BarChart3, BookOpen, Users, TrendingUp, ArrowRight, Search, Mail, MessageSquare, Clock, CheckCircle, AlertCircle, ArrowLeft, Edit3, Download, Eye, Calendar, Activity } from 'lucide-react';
import { ReactLenis, useLenis } from 'lenis/react'
export default function AdminDashboard() {
  const lenis = useLenis((lenis) => {
    // called every scroll
    console.log(lenis)
  })
  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [downloadData, setDownloadData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subjects');
  const [searchTerm, setSearchTerm] = useState('');
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    subject: '',
    topic: '',
    description: '',
    file: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalSubjects: 0,
    totalTopics: 0,
    recentUploads: 0,
    totalContacts: 0,
    unreadContacts: 0,
    totalDownloads: 0,
    todayDownloads: 0,
    thisWeekDownloads: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
    fetchContacts();
    fetchDownloadData();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/admin/notes');
      const data = await response.json();
      const notesData = data.notes || [];
      setNotes(notesData);

      // Group notes by subject and calculate stats
      const subjectData = notesData.reduce((acc, note) => {
        const subject = note.subject;
        if (!acc[subject]) {
          acc[subject] = {
            name: subject,
            noteCount: 0,
            topics: new Set(),
            latestNote: note.createdAt,
            totalSize: 0,
            notes: []
          };
        }
        acc[subject].noteCount++;
        acc[subject].topics.add(note.topic);
        acc[subject].totalSize += note.size || 0;
        acc[subject].notes.push(note);

        if (new Date(note.createdAt) > new Date(acc[subject].latestNote)) {
          acc[subject].latestNote = note.createdAt;
        }

        return acc;
      }, {});

      const subjectsArray = Object.values(subjectData).map(subject => ({
        ...subject,
        topicCount: subject.topics.size,
        topics: undefined
      }));

      setSubjects(subjectsArray);

      // Calculate overall stats
      const subjects = new Set(notesData.map(note => note.subject));
      const topics = new Set(notesData.map(note => note.topic));
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 7);
      const recentUploads = notesData.filter(note => new Date(note.createdAt) > recentDate);

      setStats({
        totalNotes: notesData.length,
        totalSubjects: subjects.size,
        totalTopics: topics.size,
        recentUploads: recentUploads.length,
        totalContacts: stats.totalContacts,
        unreadContacts: stats.unreadContacts,
        totalDownloads: stats.totalDownloads,
        todayDownloads: stats.todayDownloads,
        thisWeekDownloads: stats.thisWeekDownloads
      });
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts');
      const data = await response.json();
      const contactsData = data.contacts || [];
      setContacts(contactsData);

      // Update contact stats
      const unreadContacts = contactsData.filter(contact => contact.status !== 'read');

      setStats(prevStats => ({
        ...prevStats,
        totalContacts: contactsData.length,
        unreadContacts: unreadContacts.length
      }));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchDownloadData = async () => {
    try {
      const response = await fetch('/api/admin/downloads');
      const data = await response.json();
      setDownloadData(data);

      // Update stats with download data
      setStats(prevStats => ({
        ...prevStats,
        totalDownloads: data.stats?.totalDownloads || 0,
        todayDownloads: data.stats?.todayDownloads || 0,
        thisWeekDownloads: data.stats?.thisWeekDownloads || 0
      }));
    } catch (error) {
      console.error('Error fetching download data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('subject', uploadForm.subject);
    formData.append('topic', uploadForm.topic);
    formData.append('description', uploadForm.description);
    formData.append('file', uploadForm.file);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowUploadModal(false);
        setUploadForm({
          title: '',
          subject: '',
          topic: '',
          description: '',
          file: null
        });
        fetchNotes();
      } else {
        const error = await response.json();
        alert(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (confirm('Are you sure you want to delete this note?')) {
      try {
        const response = await fetch(`/api/admin/notes/${noteId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchNotes();
        } else {
          alert('Failed to delete note');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete note');
      }
    }
  };

  const handleContactStatusUpdate = async (contactId, status) => {
    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchContacts();
      } else {
        alert('Failed to update contact status');
      }
    } catch (error) {
      console.error('Update contact status error:', error);
      alert('Failed to update contact status');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (confirm('Are you sure you want to delete this contact message?')) {
      try {
        const response = await fetch(`/api/admin/contacts/${contactId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchContacts();
        } else {
          alert('Failed to delete contact');
        }
      } catch (error) {
        console.error('Delete contact error:', error);
        alert('Failed to delete contact');
      }
    }
  };

  const handleCreateNewSubject = () => {
    if (newSubjectName.trim()) {
      setUploadForm({
        ...uploadForm,
        subject: newSubjectName.trim()
      });
      setShowNewSubjectModal(false);
      setShowUploadModal(true);
      setNewSubjectName('');
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    setActiveTab('subject-detail');
  };

  const handleAddNoteToSubject = (subjectName) => {
    setUploadForm({
      ...uploadForm,
      subject: subjectName
    });
    setShowUploadModal(true);
  };

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('doc')) return '📝';
    if (fileType?.includes('ppt')) return '📊';
    if (fileType?.includes('image')) return '🖼️';
    return '📎';
  };

  const getFileTypeColor = (fileType) => {
    if (fileType?.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType?.includes('doc')) return 'bg-blue-100 text-blue-800';
    if (fileType?.includes('ppt')) return 'bg-orange-100 text-orange-800';
    if (fileType?.includes('image')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    contact.message.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <ReactLenis root />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your educational content and monitor activity</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowNewSubjectModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Plus className="h-5 w-5" />
                <span>New Subject</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalNotes}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSubjects}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Topics</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTopics}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent</p>
                <p className="text-3xl font-bold text-gray-900">{stats.recentUploads}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Mail className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-3xl font-bold text-gray-900">{stats.unreadContacts}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayDownloads}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisWeekDownloads}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('subjects');
                  setSelectedSubject(null);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'subjects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Subjects
              </button>
              <button
                onClick={() => setActiveTab('downloads')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'downloads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Downloads Analytics
              </button>
              <button
                onClick={() => setActiveTab('contacts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'contacts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Contact Messages
                {stats.unreadContacts > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.unreadContacts}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'subjects' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Subject Management</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {filteredSubjects.length === 0 ? (
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? 'No subjects found' : 'No subjects yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first subject to start adding educational materials'}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowNewSubjectModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Create First Subject
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map((subject) => (
                      <div key={subject.name} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                        <div className="text-center">
                          <div className="text-4xl mb-4">{getSubjectIcon(subject.name)}</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {subject.name}
                          </h3>

                          <div className="space-y-3 mb-6">
                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <FileText className="h-4 w-4" />
                                <span>{subject.noteCount} Notes</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{subject.topicCount} Topics</span>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500">
                              Updated {new Date(subject.latestNote).toLocaleDateString()}
                            </div>

                            <div className="text-xs text-gray-500">
                              Total Size: {(subject.totalSize / 1024 / 1024).toFixed(1)} MB
                            </div>
                          </div>

                          <div className="space-y-3">
                            <button
                              onClick={() => handleSubjectClick(subject)}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Edit3 className="h-4 w-4" />
                              <span>Manage Notes</span>
                            </button>

                            <button
                              onClick={() => handleAddNoteToSubject(subject.name)}
                              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Note</span>
                            </button>

                            <Link
                              href={`/notes/${encodeURIComponent(subject.name)}`}
                              target="_blank"
                              className="w-full inline-flex items-center justify-center text-blue-600 font-medium hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300"
                            >
                              <span>View Public Page</span>
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subject-detail' && selectedSubject && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => {
                        setActiveTab('subjects');
                        setSelectedSubject(null);
                      }}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                        <span className="text-3xl">{getSubjectIcon(selectedSubject.name)}</span>
                        <span>{selectedSubject.name}</span>
                      </h2>
                      <p className="text-gray-600">{selectedSubject.noteCount} notes across {selectedSubject.topicCount} topics</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddNoteToSubject(selectedSubject.name)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Note</span>
                  </button>
                </div>

                {selectedSubject.notes.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes in this subject yet</h3>
                    <p className="text-gray-600 mb-6">Start by adding your first educational material</p>
                    <button
                      onClick={() => handleAddNoteToSubject(selectedSubject.name)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add First Note
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedSubject.notes.map((note) => (
                      <div key={note._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getFileTypeIcon(note.fileType)}</span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getFileTypeColor(note.fileType)}`}>
                              {note.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{note.title}</h3>

                        <div className="space-y-1 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">Topic:</span>
                            <span className="ml-2">{note.topic}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium">Downloads:</span>
                            <span className="ml-2 text-green-600 font-semibold">{note.downloadCount || 0}</span>
                          </div>
                        </div>

                        {note.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.description}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          <span>{(note.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'downloads' && downloadData && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Download Analytics</h2>
                </div>

                {/* Download Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Total Downloads</p>
                        <p className="text-3xl font-bold">{downloadData.stats.totalDownloads}</p>
                      </div>
                      <Download className="h-8 w-8 text-blue-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Unique Files</p>
                        <p className="text-3xl font-bold">{downloadData.stats.uniqueNotesCount}</p>
                      </div>
                      <FileText className="h-8 w-8 text-green-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Today</p>
                        <p className="text-3xl font-bold">{downloadData.stats.todayDownloads}</p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-200" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">This Week</p>
                        <p className="text-3xl font-bold">{downloadData.stats.thisWeekDownloads}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-orange-200" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Most Downloaded Files */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Most Downloaded Files
                    </h3>
                    <div className="space-y-3">
                      {downloadData.mostDownloaded.slice(0, 5).map((note, index) => (
                        <div key={note._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                              <span className="text-sm font-medium text-gray-900 truncate">{note.title}</span>
                            </div>
                            <div className="text-xs text-gray-500">{note.subject} • {note.topic}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-600">{note.downloadCount}</div>
                            <div className="text-xs text-gray-500">downloads</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Downloads by Subject */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                      Downloads by Subject
                    </h3>
                    <div className="space-y-3">
                      {downloadData.downloadsBySubject.slice(0, 5).map((subject, index) => (
                        <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{subject.subject}</div>
                            <div className="text-xs text-gray-500">{subject.uniqueNotesCount} unique files</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">{subject.downloads}</div>
                            <div className="text-xs text-gray-500">downloads</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Downloads */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Recent Downloads
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600">File</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Topic</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600">Downloaded</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloadData.recentDownloads.slice(0, 10).map((download, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {download.noteTitle}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{download.subject}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-600">{download.topic}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm text-gray-500">
                                {new Date(download.downloadedAt).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Contact Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={contactSearchTerm}
                      onChange={(e) => setContactSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {filteredContacts.length === 0 ? (
                  <div className="text-center py-16">
                    <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contactSearchTerm ? 'No messages found' : 'No contact messages yet'}
                    </h3>
                    <p className="text-gray-600">
                      {contactSearchTerm ? 'Try adjusting your search terms' : 'Messages from the contact form will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContacts.map((contact) => (
                      <div key={contact._id} className={`border rounded-lg p-6 transition-all ${contact.status === 'read' ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                        }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${contact.status === 'read' ? 'bg-gray-100' : 'bg-blue-100'
                              }`}>
                              <MessageSquare className={`h-5 w-5 ${contact.status === 'read' ? 'text-gray-600' : 'text-blue-600'
                                }`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                              <p className="text-sm text-gray-600">{contact.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                            </div>

                            {contact.status !== 'read' && (
                              <button
                                onClick={() => handleContactStatusUpdate(contact._id, 'read')}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteContact(contact._id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700 leading-relaxed">{contact.message}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status === 'read'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {contact.status === 'read' ? 'Read' : 'Unread'}
                            </span>
                          </div>

                          <a
                            href={`mailto:${contact.email}?subject=Re: Your message to SM Academy`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                          >
                            Reply via Email
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Subject Modal */}
      {showNewSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create New Subject</h3>
              <button
                onClick={() => setShowNewSubjectModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCreateNewSubject}
                  disabled={!newSubjectName.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create & Add First Note
                </button>
                <button
                  onClick={() => setShowNewSubjectModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Add Note to {uploadForm.subject}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={uploadForm.subject}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.topic}
                  onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                  placeholder="e.g., Algebra, Mechanics, Organic Chemistry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-colors"
                  placeholder="Brief description of the content (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}