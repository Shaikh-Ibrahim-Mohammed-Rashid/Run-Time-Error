import { useState, useEffect } from 'react';
import { 
  Upload, Search, Download, Trash2,
  FileText, FilePlus, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { toast, Toaster } from 'sonner';
import { Cloudinary } from "@cloudinary/url-gen";
import axios from 'axios';
import sha1 from 'crypto-js/sha1';
import { initDB, saveToIndexedDB, getAllFromIndexedDB, deleteFromIndexedDB } from '../utils/indexedDB';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: Date;
  fileUrl?: string;
  fileSize: string;
  cloudinaryId?: string;
  localUrl?: string;
  fileType?: string;
}

interface DocumentResponse {
  id: string;
  name: string;
  type: string;
  cloudinaryId: string;
  fileUrl: string;
  fileSize: string;
  uploadDate: string;
  userId: string;
}

interface NewDocument {
  name: string;
  type: string;
  file: File | null;
  localUrl?: string;
}

const documentTypes = [
  'Lab Report',
  'Medical Certificate',
  'Prescription',
  'Vaccination Record',
  'Insurance Document',
  'X-Ray Report',
  'MRI Scan',
  'CT Scan',
  'Dental Record',
  'Other'
] as const;

// Add category icons and colors
const categoryConfig = {
  'Lab Report': { icon: FileText, color: 'blue' },
  'Medical Certificate': { icon: FileText, color: 'green' },
  'Prescription': { icon: FileText, color: 'purple' },
  'Vaccination Record': { icon: FileText, color: 'yellow' },
  'Insurance Document': { icon: FileText, color: 'red' },
  'X-Ray Report': { icon: FileText, color: 'indigo' },
  'MRI Scan': { icon: FileText, color: 'pink' },
  'CT Scan': { icon: FileText, color: 'orange' },
  'Dental Record': { icon: FileText, color: 'teal' },
  'Other': { icon: FileText, color: 'gray' }
} as const;

const generateSignature = (folder: string, timestamp: number) => {
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;
  const paramsToSign = {
    timestamp: timestamp,
    folder: folder
  };
  
  const stringToSign = Object.entries(paramsToSign)
    .sort()
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return sha1(stringToSign + apiSecret).toString();
};

const Reports = () => {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocument, setNewDocument] = useState<NewDocument>({
    name: '',
    type: '',
    file: null
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Initialize Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }
  });

  // Initialize IndexedDB when component mounts
  useEffect(() => {
    initDB().catch(error => {
      console.error('Failed to initialize IndexedDB:', error);
      toast.error('Failed to initialize local storage');
    });
  }, []);

  // Fetch documents from both API and IndexedDB
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Fetch from API
        const response = await axios.get<DocumentResponse[]>(
          `${import.meta.env.VITE_API_URL}/documents/${user?.id}`
        );
        
        // Transform API response
        const apiDocs = response.data.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          category: doc.type,
          uploadDate: new Date(doc.uploadDate),
          fileUrl: doc.fileUrl,
          fileSize: doc.fileSize,
          cloudinaryId: doc.cloudinaryId
        }));

        // Fetch from IndexedDB
        const localDocs = await getAllFromIndexedDB();

        // Merge documents, preferring local versions if they exist
        const mergedDocs = [...apiDocs];
        localDocs.forEach(localDoc => {
          const index = mergedDocs.findIndex(doc => doc.id === localDoc.id);
          if (index !== -1) {
            mergedDocs[index] = { ...mergedDocs[index], ...localDoc };
          } else {
            mergedDocs.push(localDoc);
          }
        });

        setDocuments(mergedDocs);
      } catch (error) {
        console.error('Fetch error:', error);
        // toast.error('Failed to fetch documents');
        
        // If API fails, still try to load from IndexedDB
        try {
          const localDocs = await getAllFromIndexedDB();
          setDocuments(localDocs);
        } catch (dbError) {
          console.error('IndexedDB error:', dbError);
        setDocuments([]);
        }
      }
    };

    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Create preview and store file data
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        if (file.type.startsWith('image/')) {
          setNewDocument(prev => ({ 
            ...prev, 
            file,
            localUrl: reader.result as string // Store the base64 data
          }));
        } else {
          setNewDocument(prev => ({ ...prev, file }));
        }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleCloseModal = () => {
    setIsUploadModalOpen(false);
    setFilePreview(null);
    setNewDocument({ name: '', type: '', file: null });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocument.file || !newDocument.name || !newDocument.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const loadingToast = toast.loading('Uploading document...');

    try {
      // Generate a unique ID for the document
      const documentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare document data
      const documentData: Document = {
        id: documentId,
        name: newDocument.name,
        type: newDocument.type,
        category: newDocument.type,
        uploadDate: new Date(),
        fileSize: `${(newDocument.file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileType: newDocument.file.type,
        localUrl: newDocument.file.type.startsWith('image/') ? newDocument.localUrl : undefined
      };

      // Save to IndexedDB
      await saveToIndexedDB(documentData);

      // Update local state
      setDocuments(prev => [documentData, ...prev]);
      handleCloseModal();
      
      // Try to upload to Cloudinary in background
      try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = `medical_documents/${user?.id}`;
      const signature = generateSignature(folder, timestamp);

      const formData = new FormData();
      formData.append('file', newDocument.file);
      formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
        formData
      );

        // Update document with Cloudinary URL
        const updatedDocument: Document = {
          ...documentData,
        cloudinaryId: cloudinaryResponse.data.public_id,
          fileUrl: cloudinaryResponse.data.secure_url
        };

        // Save updated document to IndexedDB
        await saveToIndexedDB(updatedDocument);

        // Update local state
        setDocuments(prev => prev.map(doc => 
          doc.id === documentId ? updatedDocument : doc
        ));

        // Save to backend
        await axios.post(
        `${import.meta.env.VITE_API_URL}/documents/save`,
          {
            ...updatedDocument,
            userId: user?.id
          }
        );
      } catch (uploadError) {
        console.error('Background upload error:', uploadError);
        // Don't show error to user as the document is already saved locally
      }
      
      toast.dismiss(loadingToast);
      toast.success('Document saved successfully!');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Save error:', error);
      toast.error('Failed to save document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string, cloudinaryId?: string) => {
    try {
      // Delete from IndexedDB first
      await deleteFromIndexedDB(id);

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== id));

      // Try to delete from Cloudinary and backend
      if (cloudinaryId) {
        try {
        await axios.post(`${import.meta.env.VITE_API_URL}/documents/delete`, {
          cloudinaryId,
          userId: user?.id
        });
          await axios.delete(`${import.meta.env.VITE_API_URL}/documents/${id}`);
        } catch (error) {
          console.error('Remote delete error:', error);
          // Don't show error to user as the document is already deleted locally
        }
      }

      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <Toaster richColors />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Medical Reports & Documents
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage and organize your medical documents securely
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 sm:mt-0 w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg 
              hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FilePlus className="w-5 h-5" />
            <span>Upload Document</span>
          </motion.button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white 
                dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="all">All Categories</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Updated Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const { color, icon: Icon } = categoryConfig[doc.type as keyof typeof categoryConfig];
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 border-b border-${color}-100 dark:border-${color}-800`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/30 rounded-lg`}>
                          <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{doc.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id, doc.cloudinaryId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    {doc.localUrl && doc.fileType?.startsWith('image/') && (
                      <div className="mb-4">
                        <img
                          src={doc.localUrl}
                          alt={doc.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500 dark:text-gray-400">
                        <p>{new Date(doc.uploadDate).toLocaleDateString()}</p>
                        <p>{doc.fileSize}</p>
                      </div>
                      <button
                        onClick={() => window.open(doc.fileUrl || doc.localUrl, '_blank')}
                        className={`flex items-center space-x-1 text-${color}-600 hover:text-${color}-700 
                          dark:text-${color}-400 dark:hover:text-${color}-300`}
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Documents Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? `No documents match your search "${searchQuery}"`
                : selectedCategory !== 'all'
                  ? `No documents found in the "${selectedCategory}" category`
                  : 'Upload your first document to get started'}
            </p>
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 relative
                  border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Upload Medical Document
                  </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Add your medical records, reports, or any health-related documents
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 
                      p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  {/* Document Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Document Name *
                      </label>
                      <input
                        type="text"
                        value={newDocument.name}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900
                          placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                        placeholder="Enter a descriptive name for your document"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Document Type *
                      </label>
                      <select
                        value={newDocument.type}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 
                          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900
                          transition-all"
                        required
                      >
                        <option value="">Select Document Type</option>
                        {documentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload File *
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          // Validate file size
                          if (file.size > 10 * 1024 * 1024) {
                            toast.error('File size must be less than 10MB');
                            return;
                          }
                          
                          // Create preview
                          if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFilePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setFilePreview('file');
                          }
                          
                          setNewDocument(prev => ({ ...prev, file }));
                        }
                      }}
                      className={`relative mt-2 ${
                        filePreview ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'
                      } border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl 
                        transition-all duration-200 group hover:border-blue-500 dark:hover:border-blue-400
                        cursor-pointer`}
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.csv,.xlsx,.xls';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            // Validate file size
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error('File size must be less than 10MB');
                              return;
                            }
                            
                            // Create preview
                            if (file.type.startsWith('image/')) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFilePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            } else {
                              setFilePreview('file');
                            }
                            
                            setNewDocument(prev => ({ ...prev, file }));
                          }
                        };
                        input.click();
                      }}
                    >
                      <div className="p-8 text-center">
                        {filePreview ? (
                          <div className="space-y-4">
                            {filePreview === 'file' ? (
                              <div className="relative mx-auto w-32 h-32 flex flex-col items-center 
                                justify-center bg-blue-50 dark:bg-blue-900/30 rounded-2xl">
                                <FileText className="h-16 w-16 text-blue-500" />
                                <span className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] 
                                  truncate px-4">
                                  {newDocument.file?.name}
                                </span>
                              </div>
                            ) : (
                              <div className="relative">
                                <img 
                                  src={filePreview} 
                                  alt="Preview" 
                                  className="mx-auto h-48 w-auto rounded-lg shadow-lg"
                                />
                              </div>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFilePreview(null);
                                setNewDocument(prev => ({ ...prev, file: null }));
                              }}
                              className="inline-flex items-center px-4 py-2 text-sm text-red-600 
                                dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg 
                                transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove file
                            </motion.button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="mx-auto h-32 w-32 flex items-center justify-center rounded-2xl 
                              bg-blue-50 dark:bg-blue-900/30 transition-colors group-hover:bg-blue-100 
                              dark:group-hover:bg-blue-900/50">
                              <Upload className="h-16 w-16 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-blue-600 dark:text-blue-400 hover:text-blue-500">
                                <span className="inline-flex items-center">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Click to upload or drag and drop
                                </span>
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Drop your file here
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex flex-col items-center text-xs text-gray-500 dark:text-gray-400">
                          <p>Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT, CSV, XLSX, XLS</p>
                          <p className="mt-1">Maximum file size: 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                        dark:hover:bg-gray-700 rounded-xl transition-all font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 
                        hover:to-blue-700 text-white rounded-xl transition-all font-medium flex items-center 
                        shadow-lg hover:shadow-xl"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports; 