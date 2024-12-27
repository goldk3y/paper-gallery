'use client';
import Image from 'next/image';
import PaperSVG from './components/PaperSVG';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

const BUFFER_SIZE = 15;
const LOAD_THRESHOLD = 10;

export default function Home() {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);

  const generateImageUrl = useCallback(() => {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    return `https://picsum.photos/seed/${randomId}/1000/1200`;
  }, []);

  const preloadImage = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = url;
      img.onload = () => resolve(url);
      img.onerror = reject;
    });
  };

  const loadMoreImages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      const newUrls = Array.from({ length: BUFFER_SIZE }, () => generateImageUrl());
      const loadedUrls = await Promise.all(
        newUrls.map(url => preloadImage(url))
      );
      setImages(prev => [...prev, ...(loadedUrls as string[])]);
      if (images[currentIndex + 1]) {
        setNextImageLoaded(true);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    } finally {
      loadingRef.current = false;
    }
  }, [generateImageUrl, currentIndex, images]);

  useEffect(() => {
    loadMoreImages().then(() => setIsLoading(false));
  }, [loadMoreImages]);

  useEffect(() => {
    if (images.length - currentIndex <= LOAD_THRESHOLD) {
      loadMoreImages();
    }
  }, [currentIndex, images.length, loadMoreImages]);

  const nextImage = useCallback(() => {
    if (nextImageLoaded) {
      setCurrentIndex(prev => prev + 1);
      setNextImageLoaded(false);
      const nextImageUrl = images[currentIndex + 2];
      if (nextImageUrl) {
        preloadImage(nextImageUrl).then(() => setNextImageLoaded(true));
      }
    }
  }, [currentIndex, images, nextImageLoaded]);

  const previousImage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="absolute inset-0">
          <PaperSVG />
        </div>
        <main className="relative h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <div>Loading images...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative">
      <div className="absolute inset-0">
        <PaperSVG />
      </div>
      <main className="relative h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <div className="relative mix-blend-multiply max-h-[85vh] flex items-center">
            <div 
              className="relative" 
              style={{ 
                boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.15), 0 0 40px rgba(0, 0, 0, 0.05) inset',
                mixBlendMode: 'multiply',
                transform: 'perspective(1000px) rotateX(1deg)',
                background: 'white',
                padding: '1px'
              }}
            >
              <Image
                src={images[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                width={1000}
                height={1200}
                className="opacity-95 max-h-[85vh] w-auto"
                priority
                style={{
                  filter: 'contrast(1.05) brightness(0.98) saturate(0.95)',
                  objectFit: 'contain',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>
            {images[currentIndex + 1] && (
              <Image
                src={images[currentIndex + 1]}
                alt={`Next photo`}
                width={1000}
                height={1200}
                className="hidden"
                onLoad={() => setNextImageLoaded(true)}
                priority
              />
            )}
          </div>
          <div className="flex gap-8">
            <button
              onClick={previousImage}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              aria-label="Previous image"
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={32} className={currentIndex === 0 ? 'opacity-50' : ''} />
            </button>
            <button
              onClick={nextImage}
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              aria-label="Next image"
              disabled={!nextImageLoaded}
            >
              <ChevronRight size={32} className={!nextImageLoaded ? 'opacity-50' : ''} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
