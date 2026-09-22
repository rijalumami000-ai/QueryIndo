import React, { useState, useEffect } from 'react';

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorRole?: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likesCount: number;
  userLiked?: boolean;
  replies?: CommentItem[];
}

interface Props {
  articleId: string;
}

const DEFAULT_SEEDS: Record<string, CommentItem[]> = {
  'art-001': [
    {
      id: 'cmt-1',
      articleId: 'art-001',
      authorName: 'Dr. Ilham Ramadhan',
      authorRole: 'Peneliti Mikroelektronika ITB',
      avatar: '/premium_3d_avatar.png',
      content: 'Inisiatif pusat data superkomputer AI di IKN ini sangat krusial bagi kemandirian teknologi nasional. Tantangan terbesarnya ada pada kesiapan infrastruktur pendingin dan keandalan pasokan listrik hijau.',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      likesCount: 24,
      userLiked: false,
      replies: [
        {
          id: 'cmt-1-1',
          articleId: 'art-001',
          authorName: 'Rijal Umami',
          authorRole: 'Editor in Chief',
          avatar: '/premium_3d_avatar.png',
          content: 'Benar sekali Dr. Ilham. Penggunaan Direct-to-Chip liquid cooling dan PLTS 50 MW di IKN disiapkan untuk menjamin PUE hijau.',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          likesCount: 12,
          userLiked: false
        }
      ]
    },
    {
      id: 'cmt-2',
      articleId: 'art-001',
      authorName: 'Budi Santoso',
      authorRole: 'Data Center Architect',
      avatar: '/premium_3d_avatar.png',
      content: 'Efisiensi termal 34% pada inferensi AI di iklim tropis akan sangat menghemat biaya operasional PUE data center skala besar di Cikarang dan Batam.',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      likesCount: 8,
      userLiked: false
    }
  ]
};

export default function ReaderComments({ articleId }: Props) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [content, setContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Load comments
  useEffect(() => {
    try {
      const storageKey = `byte_comments_${articleId}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setComments(parsed);
          return;
        }
      }
      // Seed default comments if available
      const seed = DEFAULT_SEEDS[articleId] || [];
      setComments(seed);
      if (seed.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(seed));
      }
    } catch {}
  }, [articleId]);

  const saveComments = (newComments: CommentItem[]) => {
    setComments(newComments);
    try {
      localStorage.setItem(`byte_comments_${articleId}`, JSON.stringify(newComments));
    } catch {}
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newComment: CommentItem = {
      id: `cmt-${Date.now()}`,
      articleId,
      authorName: authorName.trim() || 'Pembaca Terverifikasi',
      authorRole: authorRole.trim() || 'Praktisi Teknologi',
      avatar: '/premium_3d_avatar.png',
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      userLiked: false,
      replies: []
    };

    saveComments([newComment, ...comments]);
    setContent('');
  };

  const handleAddReply = (parentId: string) => {
    if (!replyContent.trim()) return;

    const newReply: CommentItem = {
      id: `reply-${Date.now()}`,
      articleId,
      authorName: authorName.trim() || 'Pembaca Terverifikasi',
      authorRole: authorRole.trim() || 'Kontributor Diskusi',
      avatar: '/premium_3d_avatar.png',
      content: replyContent.trim(),
      createdAt: new Date().toISOString(),
      likesCount: 0,
      userLiked: false
    };

    const updated = comments.map(c => {
      if (c.id === parentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    saveComments(updated);
    setReplyingToId(null);
    setReplyContent('');
  };

  const handleToggleLike = (commentId: string, isReply: boolean = false, parentId?: string) => {
    let updated: CommentItem[];
    if (isReply && parentId) {
      updated = comments.map(c => {
        if (c.id === parentId && c.replies) {
          return {
            ...c,
            replies: c.replies.map(r => {
              if (r.id === commentId) {
                const userLiked = !r.userLiked;
                return {
                  ...r,
                  userLiked,
                  likesCount: userLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1)
                };
              }
              return r;
            })
          };
        }
        return c;
      });
    } else {
      updated = comments.map(c => {
        if (c.id === commentId) {
          const userLiked = !c.userLiked;
          return {
            ...c,
            userLiked,
            likesCount: userLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1)
          };
        }
        return c;
      });
    }
    saveComments(updated);
  };

  const countTotal = comments.reduce((sum, c) => sum + 1 + (c.replies ? c.replies.length : 0), 0);

  return (
    <section className="comments-section-v2" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color, rgba(255,255,255,0.1))' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary, #ffffff)' }}>
            Diskusi & Tanggapan Pembaca
          </h3>
          <span style={{ background: 'rgba(0, 242, 254, 0.12)', color: 'var(--brand-cyan, #00f2fe)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
            {countTotal} Komentar
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
          Aturan Komunitas: Hormati etika & data teknis valid
        </span>
      </div>

      {/* Form Input Komentar Baru */}
      <form onSubmit={handleAddComment} style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.03))', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Nama Anda (opsional)..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-surface, #0f172a)', color: 'var(--text-primary, #fff)', fontSize: '0.85rem' }}
          />
          <input
            type="text"
            placeholder="Profesi / Institusi (mis. Engineer, Peneliti)..."
            value={authorRole}
            onChange={(e) => setAuthorRole(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-surface, #0f172a)', color: 'var(--text-primary, #fff)', fontSize: '0.85rem' }}
          />
        </div>
        <textarea
          rows={3}
          placeholder="Tuliskan argumen teknis, analisis, atau sudut pandang Anda..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.15))', background: 'var(--bg-surface, #0f172a)', color: 'var(--text-primary, #fff)', fontSize: '0.9rem', resize: 'vertical', marginBottom: '12px', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#000', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.88rem' }}
          >
            Kirim Tanggapan
          </button>
        </div>
      </form>

      {/* List Komentar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{ background: 'var(--bg-surface, #0f172a)', border: '1px solid var(--border-color, rgba(255,255,255,0.08))', borderRadius: '10px', padding: '16px' }}
          >
            {/* Header Komentar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={comment.avatar || '/premium_3d_avatar.png'}
                  alt={comment.authorName}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary, #ffffff)' }}>
                    {comment.authorName}
                  </div>
                  {comment.authorRole && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-cyan, #00f2fe)' }}>
                      {comment.authorRole}
                    </div>
                  )}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {/* Isi Komentar */}
            <p style={{ margin: '0 0 12px', fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-secondary, #cbd5e1)' }}>
              {comment.content}
            </p>

            {/* Aksi Suka & Balas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem' }}>
              <button
                onClick={() => handleToggleLike(comment.id)}
                style={{ background: 'none', border: 'none', color: comment.userLiked ? '#ff334b' : 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                <span>{comment.userLiked ? '❤️' : '🤍'}</span>
                <span>{comment.likesCount} Suka</span>
              </button>
              <button
                onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                style={{ background: 'none', border: 'none', color: 'var(--brand-cyan, #00f2fe)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
              >
                {replyingToId === comment.id ? 'Batal' : 'Balas'}
              </button>
            </div>

            {/* Form Balasan */}
            {replyingToId === comment.id && (
              <div style={{ marginTop: '12px', paddingLeft: '16px', borderLeft: '2px solid var(--brand-cyan, #00f2fe)' }}>
                <textarea
                  rows={2}
                  placeholder={`Tulis balasan untuk ${comment.authorName}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color, rgba(255,255,255,0.2))', background: 'var(--bg-secondary, #1e293b)', color: '#fff', fontSize: '0.85rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '8px' }}
                />
                <button
                  onClick={() => handleAddReply(comment.id)}
                  style={{ padding: '6px 14px', background: 'var(--brand-cyan, #00f2fe)', color: '#000', fontWeight: 700, border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Kirim Balasan
                </button>
              </div>
            )}

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div style={{ marginTop: '14px', paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {comment.replies.map((reply) => (
                  <div key={reply.id} style={{ background: 'var(--bg-secondary, rgba(255,255,255,0.02))', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary, #fff)' }}>
                        {reply.authorName} <span style={{ fontSize: '0.72rem', color: 'var(--brand-cyan, #00f2fe)', fontWeight: 400 }}>({reply.authorRole})</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>
                        {new Date(reply.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--text-secondary, #cbd5e1)', lineHeight: 1.5 }}>
                      {reply.content}
                    </p>
                    <button
                      onClick={() => handleToggleLike(reply.id, true, comment.id)}
                      style={{ background: 'none', border: 'none', color: reply.userLiked ? '#ff334b' : 'var(--text-muted, #94a3b8)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                    >
                      <span>{reply.userLiked ? '❤️' : '🤍'}</span>
                      <span>{reply.likesCount}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
