import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useEffect, useRef } from 'react';

const MRIScan = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Function to create a proxy request with the required header
    const loadMRIScanner = async () => {
      try {
        const response = await fetch('https://2bqox2omzsf8.share.zrok.io/', {
          headers: {
            'skip_zrok_interstitial': 'true'
          }
        });

        if (response.ok && iframeRef.current) {
          const html = await response.text();
          
          // Write the content to the iframe
          const iframeDoc = iframeRef.current.contentDocument;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(html);
            iframeDoc.close();
          }
        }
      } catch (error) {
        console.error('Error loading MRI Scanner:', error);
      }
    };

    loadMRIScanner();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Brain MRI Analysis
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Upload and analyze brain MRI scans for instant results
              </p>
            </div>
          </div>
        </motion.div>

        {/* MRI Scanner Iframe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <iframe 
            ref={iframeRef}
            className="w-full h-[800px] border-none"
            title="MRI Scanner"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MRIScan; 