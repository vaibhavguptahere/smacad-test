'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  FileText, 
  Users, 
  Download, 
  Trash2, 
  LogOut,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Eye,
  MessageSquare,
  BarChart3,
  Settings
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [downloads, setDownloads] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    class: '',
    subject: '',
    topic: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, contactsRes, downloadsRes] = await Promise.all([
        fetch('/api/admin/notes'),
        fetch('/api/admin/contacts'),
        fetch('/api/admin/downloads')
      ]);

      if (notesRes.ok) {
        const notesData = await notesRes.json();
        setNotes(notesData.notes || []);
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts || []);
      }

      if (downloadsRes.ok) {
        const downloadsData = await downloadsRes.json();
        setDownloads(downloadsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadForm.file);
    formData.append('title', uploadForm.title);
    formData.append('class', uploadForm.class);
    formData.append('subject', uploadForm.subject);
    formData.append('topic', uploadForm.topic);
    formData.append('description', uploadForm.description);

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadForm({
          title: '',
          class: '',
          subject: '',
          topic: '',
          description: '',
          file: null
        });
        fetchData();
        alert('File uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/admin/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
        alert('Note deleted successfully!');
      } else {
        alert('Failed to delete note');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete note');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/admin/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
        alert('Contact deleted successfully!');
      } else {
        alert('Failed to delete contact');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete contact');
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !filterClass || note.class === filterClass;
    const matchesSubject = !filterSubject || note.subject === filterSubject;
    
    return matchesSearch && matchesClass && matchesSubject;
  });

  const uniqueClasses = [...new Set(notes.map(note => note.class))].filter(Boolean);
  const uniqueSubjects = [...new Set(notes.map(note => note.subject))].filter(Boolean);

  const getFileTypeIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('doc')) return '📝';
    if (fileType?.includes('ppt')) return '📊';
    if (fileType?.includes('image')) return '🖼️';
    return '📎';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'upload', label: 'Upload Notes', icon: Upload },
              { id: 'notes', label: 'Manage Notes', icon: FileText },
              { id: 'contacts', label: 'Contacts', icon: MessageSquare },
              { id: 'downloads', label: 'Downloads', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Notes</p>
                    <p className="text-2xl font-semibold text-gray-900">{notes.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Download className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {downloads.stats?.totalDownloads || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Contact Messages</p>
                    <p className="text-2xl font-semibold text-gray-900">{contacts.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Notes</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {downloads.stats?.uniqueNotesCount || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Notes</h3>
                <div className="space-y-3">
                  {notes.slice(0, 5).map((note) => (
                    <div key={note._id} className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileTypeIcon(note.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{note.title}</p>
                        <p className="text-sm text-gray-500">{note.subject} - {note.class}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Contacts</h3>
                <div className="space-y-3">
                  {contacts.slice(0, 5).map((contact) => (
                    <div key={contact._id} className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{contact.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Note</h2>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter note title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.class}
                    onChange={(e) => setUploadForm({...uploadForm, class: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 10th, 12th"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadForm.subject}
                    onChange={(e) => setUploadForm({...uploadForm, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Mathematics, Physics"
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
                    onChange={(e) => setUploadForm({...uploadForm, topic: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Algebra, Mechanics"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the note content"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Upload Note</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Notes Management Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>

                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Notes ({filteredNotes.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class/Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotes.map((note) => (
                      <tr key={note._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getFileTypeIcon(note.fileType)}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{note.title}</div>
                              <div className="text-sm text-gray-500">
                                {note.size ? (note.size / 1024 / 1024).toFixed(1) + ' MB' : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{note.class}</div>
                          <div className="text-sm text-gray-500">{note.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {note.topic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {note.downloadCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {note.fileUrl && (
                            <button
                              onClick={() => window.open(note.fileUrl, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteNote(note._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Contact Messages ({contacts.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {contacts.map((contact) => (
                <div key={contact._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{contact.name}</h4>
                        <span className="text-sm text-gray-500">{contact.email}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{contact.message}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            {/* Download Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Today</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {downloads.stats?.todayDownloads || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">This Week</h3>
                <p className="text-3xl font-bold text-green-600">
                  {downloads.stats?.thisWeekDownloads || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Time</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {downloads.stats?.totalDownloads || 0}
                </p>
              </div>
            </div>

            {/* Most Downloaded */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Most Downloaded Notes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Downloaded
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {downloads.mostDownloaded?.map((note) => (
                      <tr key={note._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {note.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {note.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {note.downloadCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {note.lastDownloaded ? new Date(note.lastDownloaded).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}