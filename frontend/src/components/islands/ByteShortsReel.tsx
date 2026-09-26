import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Article } from '../../types/news';

interface StorySlide {
  id: string;
  articleId: string;
  articleSlug: string;
  title: string;
  caption: string;
  imageUrl: string;
  category: string;
}

interface ByteStory {
  id: string;
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  articleImage: string;
  authorName: string;
  authorAvatar: string;
  badge: string;
  slides: StorySlide[];
}

export default function ByteShortsReel() {
  const [stories, setStories] = useState<ByteStory[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Load articles from localStorage
    let articles: Article[] = [];
    try {
      const raw = localStorage.getItem('queryindo_articles_v5');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(a => a && a.id && !a.id.startsWith('qi-art-') && !a.id.startsWith('mock-'));
          if (clean.length > 0) articles = clean;
        }
      }
    } catch {}

    const generatedStories: ByteStory[] = articles.slice(0, 8).map((art) => ({
      id: `story-${art.id}`,
      articleId: art.id,
      articleSlug: art.slug || art.id,
      articleTitle: art.title,
      articleImage: art.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      authorName: art.author?.name ? art.author.name.split(' ')[0] : 'Redaksi',
      authorAvatar: art.author?.avatar || '/premium_3d_avatar.png',
      badge: (art.category || 'AI').toUpperCase(),
      slides: [
        {
          id: `slide-${art.id}-1`,
          articleId: art.id,
          articleSlug: art.slug || art.id,
          title: art.title,
          caption: art.subtitle || art.title,
          imageUrl: art.imageUrl,
          category: (art.category || 'AI').toUpperCase(),
        }
      ]
    }));

    setStories(generatedStories);
  }, []);

  const closeViewer = useCallback(() => {
    setActiveStoryIndex(null);
    setActiveSlideIndex(0);
    setProgress(0);
    document.body.style.overflow = '';
  }, []);

  const nextSlide = useCallback(() => {
    if (activeStoryIndex === null) return;
    const currentStory = stories[activeStoryIndex];
    if (!currentStory) return;

    if (activeSlideIndex < currentStory.slides.length - 1) {
      setActiveSlideIndex(prev => prev + 1);
      setProgress(0);
    } else if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(prev => (prev !== null ? prev + 1 : null));
      setActiveSlideIndex(0);
      setProgress(0);
    } else {
      closeViewer();
    }
  }, [activeStoryIndex, activeSlideIndex, stories, closeViewer]);

  const prevSlide = useCallback(() => {
    if (activeStoryIndex === null) return;

    if (activeSlideIndex > 0) {
      setActiveSlideIndex(prev => prev - 1);
      setProgress(0);
    } else if (activeStoryIndex > 0) {
      const prevStory = stories[activeStoryIndex - 1];
      setActiveStoryIndex(prev => (prev !== null ? prev - 1 : null));
      setActiveSlideIndex(prevStory ? prevStory.slides.length - 1 : 0);
      setProgress(0);
    }
  }, [activeStoryIndex, activeSlideIndex, stories]);

  // Handle timer & auto progress
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const interval = 50; // update every 50ms
    const totalDuration = 4500; // 4.5s
    const step = (interval / totalDuration) * 100;

    timerRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, activeSlideIndex, isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    if (activeStoryIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStoryIndex, closeViewer, nextSlide, prevSlide]);

  const handleOpenStory = (idx: number) => {
    setActiveStoryIndex(idx);
    setActiveSlideIndex(0);
    setProgress(0);
    document.body.style.overflow = 'hidden';
  };

  const handleReadFullStory = (articleIdOrSlug: string) => {
    closeViewer();
    window.location.href = `/berita/${articleIdOrSlug}`;
  };

  if (stories.length === 0) return null;

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const currentSlide = currentStory ? currentStory.slides[activeSlideIndex] : null;

  return (
    <>
      <section className="byteshorts-wrapper" aria-label="Visual Stories">
        <div className="byteshorts-header">
          <span className="byteshorts-kicker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            KILAS VISUAL • LIPUTAN RINGKAS
          </span>
          <span className="byteshorts-hint">Ketuk untuk putar cerita →</span>
        </div>

        <div className="byteshorts-track">
          {stories.map((story, idx) => (
            <div
              key={story.id}
              className="byte-story-item byteshorts-card"
              onClick={() => handleOpenStory(idx)}
              title={story.articleTitle}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={story.articleImage}
                alt={story.articleTitle}
                className="byteshorts-card-img"
                loading="lazy"
              />
              <div className="byteshorts-card-overlay">
                <span className="byteshorts-cat-pill">{story.badge}</span>
                <span className="byteshorts-card-title">{story.articleTitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* React Story Viewer Modal */}
      {currentStory && currentSlide && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0,0,0,0.94)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.25s ease-out'
          }}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '420px',
              height: '90vh',
              maxHeight: '750px',
              background: '#0a0f1d',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)',
              border: '1px solid rgba(255,255,255,0.12)'
            }}
          >
            {/* Progress Bars Header */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                display: 'flex',
                gap: '4px',
                zIndex: 30
              }}
            >
              {currentStory.slides.map((_, sIdx) => {
                let fill = '0%';
                if (sIdx < activeSlideIndex) fill = '100%';
                else if (sIdx === activeSlideIndex) fill = `${progress}%`;
                return (
                  <div
                    key={sIdx}
                    style={{
                      flex: 1,
                      height: '3px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: fill,
                        background: 'var(--brand-cyan, #00f2fe)',
                        transition: sIdx === activeSlideIndex ? 'none' : 'width 0.1s linear'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Author Header Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '24px',
                left: '14px',
                right: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                zIndex: 30,
                color: '#fff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src={currentStory.authorAvatar}
                  alt={currentStory.authorName}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #fff'
                  }}
                />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {currentStory.authorName}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--brand-cyan, #00f2fe)',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700
                    }}
                  >
                    {currentSlide.category}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeViewer();
                }}
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(6px)',
                  fontSize: '1rem',
                  fontWeight: 700
                }}
                aria-label="Tutup Story"
              >
                ✕
              </button>
            </div>

            {/* Main Slide Media */}
            <div style={{ position: 'relative', flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 25%, transparent 55%, rgba(0,0,0,0.95) 100%)'
                }}
              />

              {/* Tap Navigation Zones */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                style={{
                  position: 'absolute',
                  top: '70px',
                  bottom: '140px',
                  left: 0,
                  width: '40%',
                  zIndex: 25,
                  cursor: 'pointer'
                }}
                title="Slide Sebelumnya"
              />
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                style={{
                  position: 'absolute',
                  top: '70px',
                  bottom: '140px',
                  right: 0,
                  width: '60%',
                  zIndex: 25,
                  cursor: 'pointer'
                }}
                title="Slide Berikutnya"
              />
            </div>

            {/* Slide Caption & CTA */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '1.25rem 1.25rem 1.5rem',
                zIndex: 30,
                color: '#fff'
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.65rem',
                  background: 'var(--brand-cyan, #00f2fe)',
                  color: '#000',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  borderRadius: '9999px',
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}
              >
                {currentSlide.category}
              </span>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  lineHeight: 1.35,
                  marginBottom: '0.45rem',
                  textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                }}
              >
                {currentSlide.title}
              </h2>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: 1.45,
                  marginBottom: '1.1rem',
                  textShadow: '0 1px 4px rgba(0,0,0,0.8)'
                }}
              >
                {currentSlide.caption}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadFullStory(currentSlide.articleSlug || currentSlide.articleId);
                }}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(0, 242, 254, 0.4)'
                }}
              >
                <span>Baca Berita Selengkapnya →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
