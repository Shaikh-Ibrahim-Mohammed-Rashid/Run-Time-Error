import { useState } from 'react';
import { motion } from 'framer-motion';

const LiveHealth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full"
        >
          <iframe 
            src="https://labs.heygen.com/interactive-avatar/share?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJEZXh0ZXJfRG9jdG9yX1NpdHRpbmcyX3B1%0D%0AYmxpYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzL2Y4%0D%0AM2ZmZmM0NWZhYTQzNjhiNmRiOTU5N2U2YjMyM2NhXzQ1NTkwL3ByZXZpZXdfdGFsa18zLndlYnAi%0D%0ALCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImNkYjk3OTE5%0D%0AMWIwYzRjZGY5NzRiZjljOTMwNWY5ZDdiIiwidXNlcm5hbWUiOiI0M2JlMTMxMTk5OWM0NzdkOTZj%0D%0AZmU1NzgyZDA5MWRkOSJ9"
            allow="microphone"
            allowFullScreen
            className="w-full h-full border-none"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default LiveHealth; 