import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface SlideViewerProps {
  url: string;
  title: string;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ url, title }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Process URL and update embedUrl state
  useEffect(() => {
    if (!url) {
      setEmbedUrl(null);
      return;
    }

    let processedUrl: string | null = null;

    if (url.includes('docs.google.com/presentation')) {
      // Handle Google Slides URLs
      // Convert view/edit URLs to embed URLs
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const presentationId = match[1];
        processedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=false&delayms=3000`;
      }
    } else if (url.includes('gamma.app')) {
      // Handle Gamma presentation URLs
      processedUrl = url;
    } else {
      // For any other URL, use it directly
      processedUrl = url;
    }

    setEmbedUrl(processedUrl);
  }, [url]);

  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
          title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="fullscreen; picture-in-picture"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <p className="text-gray-600">
            {!url ? 'No presentation URL provided' : 'Unsupported presentation format'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SlideViewer;