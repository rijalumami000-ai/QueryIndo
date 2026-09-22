import React, { useState } from 'react';
import { Share2, Link, Check } from 'lucide-react';

interface Props {
  title: string;
  url?: string;
}

export default function ShareBar({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return url || window.location.href;
    }
    return url || 'https://queryindo.com';
  };

  const shareNative = async () => {
    const fullUrl = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title + ' - QUERYINDO',
          url: fullUrl
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }
    copyLink();
  };

  const copyLink = () => {
    const fullUrl = getShareUrl();
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareWhatsApp = () => {
    const fullUrl = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`*${title}*\n\nBaca selengkapnya di QUERYINDO:\n${decodeURIComponent(fullUrl)}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const fullUrl = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`${title} via @queryindo`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${fullUrl}`, '_blank');
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={shareNative}
        style={{
          background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
          border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
          color: 'var(--text-primary, #ffffff)',
          borderRadius: '6px',
          padding: '6px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.85rem',
          cursor: 'pointer'
        }}
        title="Bagikan artikel"
        aria-label="Bagikan"
      >
        <Share2 size={16} />
        <span>Bagikan</span>
      </button>

      <button
        onClick={shareWhatsApp}
        style={{
          background: 'rgba(37, 211, 102, 0.12)',
          border: '1px solid rgba(37, 211, 102, 0.3)',
          color: '#25D366',
          borderRadius: '6px',
          padding: '6px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '0.82rem',
          cursor: 'pointer',
          fontWeight: 600
        }}
        title="Bagikan ke WhatsApp"
      >
        WA
      </button>

      <button
        onClick={shareTwitter}
        style={{
          background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
          border: '1px solid var(--border-color, rgba(255,255,255,0.15))',
          color: 'var(--text-primary, #ffffff)',
          borderRadius: '6px',
          padding: '6px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: '0.82rem',
          cursor: 'pointer',
          fontWeight: 600
        }}
        title="Bagikan ke X / Twitter"
      >
        X
      </button>

      <button
        onClick={copyLink}
        style={{
          background: copied ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary, rgba(255,255,255,0.05))',
          border: '1px solid ' + (copied ? '#10B981' : 'var(--border-color, rgba(255,255,255,0.15))'),
          color: copied ? '#10B981' : 'var(--text-secondary, #94a3b8)',
          borderRadius: '6px',
          padding: '6px 10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.82rem',
          cursor: 'pointer'
        }}
        title="Salin tautan artikel"
      >
        {copied ? <Check size={14} /> : <Link size={14} />}
        <span>{copied ? 'Tersalin' : 'Salin'}</span>
      </button>
    </div>
  );
}
