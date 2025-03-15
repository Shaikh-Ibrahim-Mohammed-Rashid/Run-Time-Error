import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, Volume2, VolumeX, Mic, MicOff, X, 
  Phone, Video, Search, File, Check, FileUp,
  Globe, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Attachment {
  type: 'image' | 'document';
  file: File;
  preview?: string;
  caption?: string;
}

interface Message {
  type: 'user' | 'bot';
  content: string | string[];
  timestamp: Date;
  isThinking?: boolean;
  isTyping?: boolean;
  attachments?: Attachment[];
  sender?: {
    name: string;
    avatar: string;
  };
  id: string;
  role: 'user' | 'assistant';
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const thinkingPhrases = [
  "Analyzing your symptoms...",
  "Reviewing medical information...",
  "Checking health patterns...",
  "Processing health data...",
  "Consulting medical knowledge base...",
  "Examining health history...",
  "Evaluating potential causes...",
  "Generating health insights..."
];

const highlightSearchText = (text: string, searchQuery: string) => {
  if (!searchQuery) return text;
  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === searchQuery.toLowerCase() ? 
      <span key={i} className="bg-yellow-200 dark:bg-yellow-900">{part}</span> : part
  );
};

const CallAnimation = () => (
  <div className="relative w-16 h-16 mx-auto mb-4">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-full"
    />
    <motion.div
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.3,
      }}
      className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-full"
    />
    <div className="relative w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Phone className="w-8 h-8 text-white" />
      </motion.div>
    </div>
  </div>
);

const CallBookingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'input' | 'loading' | 'calling' | 'success'>('input');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.match(/^\d{10}$/)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setStatus('loading');
    setError('');

    try {
      const formData = new FormData();
      formData.append('number', phoneNumber);

      const response = await fetch(`${SERVER_URL}/api/make_call`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      const data = await response.json();
      
      if (data.message === "Call initiated") {
        // First show the calling animation
        setStatus('calling');
        
        // After 5 seconds, show success and auto close
        setTimeout(() => {
          setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus('input');
        setPhoneNumber('');
          }, 2000); // Close 2 seconds after showing success
        }, 5000); // Show calling animation for 5 seconds
      } else {
        throw new Error(data.message || 'Failed to initiate call');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to book call. Please try again.');
      setStatus('input');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 relative"
      >
        <button
          onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 
                dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        {status === 'input' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
            <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full 
                    flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Book a Call
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Enter your phone number and we'll call you back shortly
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 
                        dark:border-gray-700 focus:ring-2 focus:ring-blue-500 
                        dark:focus:ring-blue-400 bg-white dark:bg-gray-800 
                        text-gray-900 dark:text-white"
                />
                {error && (
                  <p className="text-sm text-red-500 mt-1">{error}</p>
                )}
              </div>
              <button
                type="submit"
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 
                      text-white rounded-lg transition-colors duration-200"
              >
                Book Call
              </button>
            </form>
              </motion.div>
        )}

        {status === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <CallAnimation />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Initiating Call...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                  Please wait while we connect you
                </p>
              </motion.div>
            )}

            {status === 'calling' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <CallAnimation />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Calling {phoneNumber}...
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your phone will ring shortly
                </p>
              </motion.div>
        )}

        {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full 
                    flex items-center justify-center mx-auto mb-4"
                >
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Call Initiated Successfully!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
                  You will receive a call at {phoneNumber}
            </p>
              </motion.div>
        )}
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};

const suggestedPrompts = {
  en: [
    "What are the symptoms of diabetes?",
    "How can I improve my sleep quality?",
    "Tell me about heart disease prevention"
  ],
  hi: [
    "मधुमेह के लक्षण क्या हैं?",
    "मैं अपनी नींद की गुणवत्ता कैसे सुधार सकता हूं?",
    "हृदय रोग की रोकथाम के बारे में बताएं"
  ],
  es: [
    "¿Cuáles son los síntomas de la diabetes?",
    "¿Cómo puedo mejorar la calidad del sueño?",
    "Háblame sobre la prevención de enfermedades cardíacas"
  ]
};

const Chatbot = () => {
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'bot',
      content: "Hello! I'm your AI Health Assistant. I can help you understand symptoms, provide general health information, and offer wellness tips. How can I assist you today?",
      timestamp: new Date(),
      id: Date.now().toString(),
      role: 'assistant'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentThinkingIndex, setCurrentThinkingIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    caption?: string;
  } | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'es'>('en');
  const [speechSupported] = useState('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let thinkingInterval: number;
    
    if (isTyping) {
      thinkingInterval = setInterval(() => {
        setCurrentThinkingIndex((prev) => {
          const nextIndex = (prev + 1) % thinkingPhrases.length;
          setMessages(messages => {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.isThinking) {
              const currentContent = Array.isArray(lastMessage.content) 
                ? lastMessage.content 
                : [lastMessage.content];
              return [
                ...messages.slice(0, -1),
                {
                  ...lastMessage,
                  content: [...currentContent, thinkingPhrases[nextIndex]]
                }
              ];
            }
            return messages;
          });
          return nextIndex;
        });
      }, 2000);
    }

    return () => {
      if (thinkingInterval) {
        clearInterval(thinkingInterval);
      }
    };
  }, [isTyping]);

  const speak = (text: string, messageIndex: number) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (isSpeaking === messageIndex) {
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Set to Indian English
    utterance.rate = 0.9; // Slightly slower than default
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(messageIndex);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && attachments.length === 0) return;

    try {
      setIsLoading(true);

      // If there's a PDF attachment, handle it first
      if (attachments.length > 0 && attachments[0].file.type === 'application/pdf') {
        const file = attachments[0].file;
        const formData = new FormData();
        formData.append('file', file);

        // Upload file to RAG endpoint
        const uploadResponse = await fetch('https://helping-cockatoo-neatly.ngrok-free.app/api/rag_upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        // Add user message with the file and query
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          role: 'user',
          content: input ? `${input} (Uploaded: ${file.name})` : `Uploaded file: ${file.name}`,
          timestamp: new Date(),
          attachments: [...attachments]
        };

        setMessages(prev => [...prev, userMessage]);

        // If there's a query, send it to the API
        if (input.trim()) {
          const queryFormData = new FormData();
          queryFormData.append('query', input);

          const queryResponse = await axios.post(
            'http://helping-cockatoo-neatly.ngrok-free.app/api/chat_agent',
            queryFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          const responseMessage: Message = {
            id: Date.now().toString(),
            type: 'bot',
            role: 'assistant',
            content: queryResponse.data.response,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, responseMessage]);
        }
      } else {
        // Handle regular text message without file
    // Add user message with attachments
    const userMessage: Message = {
      type: 'user',
      content: input || 'Sent attachments',
      timestamp: new Date(),
          attachments: attachments.length > 0 ? [...attachments] : undefined,
          id: Date.now().toString(),
          role: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]); // Clear attachments after sending
    setIsTyping(true);
    setCurrentThinkingIndex(0);

    // Add initial thinking message
    setMessages(prev => [...prev, {
      type: 'bot',
      content: [thinkingPhrases[0]],
      timestamp: new Date(),
          isThinking: true,
          id: Date.now().toString(),
          role: 'assistant'
        }]);

    try {
      const formData = new FormData();
      formData.append('query', input);

      const response = await axios.post(
        'http://helping-cockatoo-neatly.ngrok-free.app/api/chat_agent',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setIsTyping(false);
      
      // Update messages with the response
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.isThinking) {
          return [
            ...prev.slice(0, -1),
            {
              type: 'bot',
              content: response.data.response,
                  timestamp: new Date(),
                  id: Date.now().toString(),
                  role: 'assistant'
            }
          ];
        }
        return prev;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.isThinking) {
          return [
            ...prev.slice(0, -1),
            {
              type: 'bot',
              content: "Sorry, I encountered an error. Please try again.",
                  timestamp: new Date(),
                  id: Date.now().toString(),
                  role: 'assistant'
            }
          ];
        }
        return prev;
      });
    }
      }

      // Clear input and attachments
      setInput('');
      setAttachments([]);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeechToText = () => {
    if (!speechSupported) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                       selectedLanguage === 'hi' ? 'hi-IN' : 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Failed to recognize speech. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const SpeechModal = () => {
    if (!isSpeechModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
          <button
            onClick={() => {
              setIsSpeechModalOpen(false);
              setIsListening(false);
              setTranscript('');
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Voice Input
            </h3>
            <div className="mb-6">
              <button
                onClick={() => {
                  if (isListening) {
                    setIsListening(false);
                  } else {
                    handleSpeechToText();
                  }
                }}
                className={`p-4 rounded-full ${
                  isListening
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                } hover:opacity-80 transition-opacity`}
              >
                {isListening ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </button>
            </div>
            <div className="min-h-[100px] p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 text-sm mb-4">
              {transcript || 'Start speaking...'}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setInput(transcript);
                  setIsSpeechModalOpen(false);
                  setIsListening(false);
                  setTranscript('');
                }}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Use Text
              </button>
              <button
                onClick={() => {
                  setTranscript('');
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      toast.error('Please upload only PDF files');
      return;
    }

    // Store the file temporarily without uploading
    const newAttachment: Attachment = {
      type: 'document',
      file: file,
      preview: URL.createObjectURL(file),
    };
    setAttachments([newAttachment]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Add filtered messages state
  const filteredMessages = messages.filter(message => {
    if (!searchQuery) return true;
    const content = Array.isArray(message.content) 
      ? message.content.join(' ') 
      : message.content;
    return content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const ImagePreviewModal = () => {
    if (!previewImage) return null;

    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-5xl w-full"
        >
          {/* Close button */}
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Image container */}
          <div className="relative rounded-lg overflow-hidden bg-black">
            <img 
              src={previewImage.url} 
              alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {/* Caption */}
            {previewImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                <p className="text-center">{previewImage.caption}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-2rem)] p-2 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-full flex flex-col">
        {/* Enhanced Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">AI Health Assistant</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your 24/7 health companion
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={() => setIsCallModalOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <Link 
                to="/dashboard/live"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Video className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
              </Link>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 
                    focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messages with enhanced styling */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[80%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className="flex-shrink-0 hidden sm:block">
                  {message.role === 'user' ? (
                    <img 
                      src={user?.imageUrl} 
                      alt="User"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 
                      flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`relative p-3 sm:p-4 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <div className="text-sm whitespace-pre-line">
                    {Array.isArray(message.content) ? (
                      message.content.map((line, i) => (
                        <motion.div
                          key={i}
                          initial={message.isThinking ? { opacity: 0 } : { opacity: 1 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className={`${
                            line.startsWith('🤔') ? 'font-semibold text-blue-600 dark:text-blue-400' :
                            line.startsWith('───') ? 'text-gray-400 dark:text-gray-500' :
                            message.isThinking && i === message.content.length - 1 ? 'text-gray-600 dark:text-gray-400' :
                            ''
                          }`}
                        >
                          {message.isThinking ? 
                            highlightSearchText(line, searchQuery) :
                            <ReactMarkdown className="prose dark:prose-invert max-w-none">
                              {line}
                            </ReactMarkdown>
                          }
                        </motion.div>
                      ))
                    ) : (
                      message.role === 'bot' ? (
                        <ReactMarkdown className="prose dark:prose-invert max-w-none">
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        highlightSearchText(message.content, searchQuery)
                      )
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    {message.role === 'bot' && !message.isThinking && (
                      <button
                        onClick={() => speak(
                          Array.isArray(message.content) 
                            ? message.content.join('\n') 
                            : message.content,
                          index
                        )}
                        className={`ml-2 p-1 rounded-full transition-colors ${
                          isSpeaking === index
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {isSpeaking === index ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {message.attachments.map((attachment, i) => (
                        <div key={i} className="relative group">
                          {attachment.type === 'image' ? (
                            <div 
                              className="relative cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage({
                                url: attachment.preview || '',
                                caption: attachment.caption
                              })}
                            >
                              <img 
                                src={attachment.preview} 
                                alt="Attachment"
                                className="rounded-lg w-full h-24 sm:h-32 object-cover"
                              />
                              {attachment.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white 
                                  p-2 text-sm rounded-b-lg">
                                  {attachment.caption}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-2 sm:p-3 flex items-center">
                              <File className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                              <span className="text-xs sm:text-sm truncate">
                                {attachment.file.name}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md max-w-2xl">
                <div className="flex items-center space-x-3">
                  <div className="animate-pulse flex space-x-4">
                    <div className="h-3 w-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    <div className="h-3 w-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
                    <div className="h-3 w-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Language and Suggestions Section */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Language Selector */}
          <div className="mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedLanguage === 'en'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedLanguage === 'hi'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setSelectedLanguage('es')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedLanguage === 'es'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Español
              </button>
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>Suggested Questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts[selectedLanguage].map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 
                    text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 
                    dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Attachment Preview */}
          {attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative group">
                  {attachment.type === 'image' ? (
                    <div className="relative w-20 h-20">
                      <img 
                        src={attachment.preview} 
                        alt="Preview"
                        className="rounded-lg w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeAttachment(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex items-center">
                      <File className="h-4 w-4 mr-2" />
                      <span className="text-sm truncate max-w-[100px]">
                        {attachment.file.name}
                      </span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-2 text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-4">
            <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg border 
              border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedLanguage === 'en' ? "Ask about your health concerns..." :
                  selectedLanguage === 'hi' ? "अपनी स्वास्थ्य चिंताओं के बारे में पूछें..." :
                  "Pregunte sobre sus problemas de salud..."
                }
                className="flex-1 bg-transparent text-sm sm:text-base text-gray-900 dark:text-white 
                  focus:outline-none"
              />
              
              {/* Speech to Text Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleSpeechToText}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500 animate-pulse' 
                      : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              )}
              
              {/* File Upload Button */}
              <label className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 
                dark:hover:text-blue-400 cursor-pointer group relative flex-shrink-0">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FileUp className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs 
                  bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Attach PDF
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </form>
        </div>
      </div>
      <SpeechModal />
      <AnimatePresence>
        {previewImage && <ImagePreviewModal />}
        <CallBookingModal 
          isOpen={isCallModalOpen} 
          onClose={() => setIsCallModalOpen(false)} 
        />
      </AnimatePresence>
    </div>
  );
};

export default Chatbot; 