import { ARTICLES } from '../data/mockNews';
import { ApiService } from '../services/apiService';

export class ByteAIChatbot {
  private isOpen: boolean = false;
  private messages: Array<{ sender: 'user' | 'ai'; text: string }> = [
    {
      sender: 'ai',
      text: 'Halo! Saya **QueryAI Assistant**, pakar kecerdasan buatan QUERYINDO. Ada isu teknologi, gadget, atau kedaulatan digital yang ingin Anda tanyakan?'
    }
  ];

  public renderChatbotHTML(): string {
    return `
      <!-- Floating Trigger Button -->
      <button id="byte-ai-trigger-btn" style="position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 990; padding: 0.65rem 1.15rem; background: var(--bg-tertiary); color: var(--text-primary); font-weight: 700; border-radius: var(--radius-full); border: 1px solid var(--border-active); box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 0.55rem; cursor: pointer; font-size: 0.825rem; transition: transform 0.2s ease, border-color 0.2s ease;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-cyan);"></div>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <span>QueryAI Copilot</span>
      </button>

      <!-- Chat Window Widget -->
      <div id="byte-ai-window" style="position: fixed; bottom: 4.8rem; right: 1.5rem; z-index: 999; width: 380px; max-width: calc(100vw - 2rem); height: 520px; max-height: calc(100vh - 7rem); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); display: ${this.isOpen ? 'flex' : 'none'}; flex-direction: column; overflow: hidden; backdrop-filter: blur(16px);">
        
        <!-- Header -->
        <div style="padding: 0.85rem 1.15rem; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 1.85rem; height: 1.85rem; background: rgba(6, 182, 212, 0.12); border: 1px solid var(--accent-cyan); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--accent-cyan);">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <h4 style="font-weight: 800; font-size: 0.88rem; color: var(--text-primary); margin: 0;">QueryAI Copilot</h4>
              <span style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono);">RAG Neural Assistant • RAG-v2.4</span>
            </div>
          </div>
          <button id="byte-ai-close-btn" style="color: var(--text-muted); font-size: 1.1rem; cursor: pointer; border: none; background: none; transition: color 0.2s;">✕</button>
        </div>

        <!-- Suggestion Chips Bar -->
        <div style="padding: 0.6rem 0.85rem; background: var(--bg-primary); border-bottom: 1px solid var(--border-color); overflow-x: auto; display: flex; gap: 0.4rem; scrollbar-width: none;">
          <button class="ai-chip-btn" data-query="Jelaskan tentang Superkomputer AI IKN">Superkomputer IKN</button>
          <button class="ai-chip-btn" data-query="Apa isi RUU Kedaulatan AI?">RUU Kedaulatan AI</button>
          <button class="ai-chip-btn" data-query="Bagaimana roaming satelit Starlink?">Roaming Satelit</button>
        </div>

        <!-- Messages Area -->
        <div id="ai-chat-messages" style="flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.875rem;">
          ${this.renderMessagesHTML()}
        </div>

        <!-- Input Bar -->
        <form id="ai-chat-form" style="padding: 0.75rem 1rem; background: var(--bg-tertiary); border-top: 1px solid var(--border-color); display: flex; gap: 0.5rem;">
          <input type="text" id="ai-chat-input" placeholder="Tanyakan seputar isu tekno..." required style="flex: 1; padding: 0.6rem 0.9rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-full); color: var(--text-primary); font-size: 0.85rem; outline: none;" />
          <button type="submit" style="padding: 0.6rem 1rem; background: var(--gradient-brand); color: #000; font-weight: 800; border-radius: var(--radius-full); font-size: 0.8rem; border: none; cursor: pointer;">Kirim</button>
        </form>
      </div>
    `;
  }

  private renderMessagesHTML(): string {
    return this.messages.map(msg => `
      <div style="display: flex; justify-content: ${msg.sender === 'user' ? 'flex-end' : 'flex-start'};">
        <div style="max-width: 85%; padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.85rem; line-height: 1.45; ${
          msg.sender === 'user'
            ? 'background: var(--gradient-brand); color: #000; font-weight: 600; border-bottom-right-radius: 2px;'
            : 'background: var(--bg-tertiary); border: 1px solid var(--border-color); color: var(--text-primary); border-bottom-left-radius: 2px;'
        }">
          ${msg.text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="chat-link" style="color:var(--accent-cyan); text-decoration:underline; font-weight:700;">$1</a>')
          }
        </div>
      </div>
    `).join('');
  }

  public bindEvents(container: HTMLElement) {
    const triggerBtn = container.querySelector('#byte-ai-trigger-btn');
    const windowWidget = container.querySelector('#byte-ai-window') as HTMLElement;
    const closeBtn = container.querySelector('#byte-ai-close-btn');
    const form = container.querySelector('#ai-chat-form') as HTMLFormElement;
    const input = container.querySelector('#ai-chat-input') as HTMLInputElement;
    const messagesBox = container.querySelector('#ai-chat-messages') as HTMLElement;

    const toggleWindow = () => {
      this.isOpen = !this.isOpen;
      if (windowWidget) windowWidget.style.display = this.isOpen ? 'flex' : 'none';
      if (this.isOpen && input) input.focus();
    };

    triggerBtn?.addEventListener('click', toggleWindow);
    closeBtn?.addEventListener('click', toggleWindow);

    // Suggestion Chips
    container.querySelectorAll('.ai-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (query) this.handleUserQuery(query, messagesBox);
      });
    });

    // Form Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (query) {
        input.value = '';
        this.handleUserQuery(query, messagesBox);
      }
    });
  }

  private handleUserQuery(query: string, messagesBox: HTMLElement) {
    this.messages.push({ sender: 'user', text: query });
    messagesBox.innerHTML = this.renderMessagesHTML();
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Add Loading message
    const loadingIdx = this.messages.push({ sender: 'ai', text: 'Sedang memproses wawasan...' }) - 1;
    messagesBox.innerHTML = this.renderMessagesHTML();
    messagesBox.scrollTop = messagesBox.scrollHeight;

    const finalizeResponse = (replyText: string) => {
      this.messages[loadingIdx] = { sender: 'ai', text: replyText };
      messagesBox.innerHTML = this.renderMessagesHTML();
      messagesBox.scrollTop = messagesBox.scrollHeight;
    };

    // Ask Go Backend (RAG DB + Gemini Proxy)
    ApiService.askByteAI(query).then(backendReply => {
      if (backendReply) {
        finalizeResponse(backendReply);
      } else {
        // Fallback to client-side API call or Local Fallback
        const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
        if (apiKey) {
          fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Kamu adalah QueryAI Assistant, jurnalis AI dari media teknologi QUERYINDO. Jawablah pertanyaan pembaca secara informatif, terpercaya, dan ringkas: \n\n${query}`
                }]
              }]
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                finalizeResponse(data.candidates[0].content.parts[0].text);
              } else {
                finalizeResponse(this.getLocalFallbackResponse(query));
              }
            })
            .catch(() => {
              finalizeResponse(this.getLocalFallbackResponse(query));
            });
        } else {
          setTimeout(() => {
            finalizeResponse(this.getLocalFallbackResponse(query));
          }, 500);
        }
      }
    });
  }

  private getLocalFallbackResponse(query: string): string {
    let responseText = 'Terima kasih atas pertanyaannya. Redaksi QUERYINDO terus memantau perkembangan teknologi terkini di Indonesia.';
    const queryLower = query.toLowerCase();

    const matchedArticle = ARTICLES.find(a => 
      a.title.toLowerCase().includes(queryLower) || 
      a.tags.some(t => t.toLowerCase().includes(queryLower)) ||
      a.category.toLowerCase().includes(queryLower)
    );

    if (matchedArticle) {
      responseText = `Berdasarkan analisis berita **QUERYINDO**:\n\n**${matchedArticle.title}**\n\n${matchedArticle.aiSummary.map(s => `• ${s}`).join('\n')}\n\nAnda dapat membaca artikel lengkapnya di kategori **${matchedArticle.category.toUpperCase()}**.`;
    } else if (queryLower.includes('ikn') || queryLower.includes('superkomputer')) {
      responseText = 'Pusat Data Nasional (PDN) di IKN telah resmi mengoperasikan superkomputer AI **Ganesha-1** berkapasitas 100 Petaflops ditenagai 100% PLTS ramah lingkungan.';
    } else if (queryLower.includes('ruu') || queryLower.includes('hukum') || queryLower.includes('regulasi')) {
      responseText = 'RUU Kedaulatan AI mewajibkan transparansi metadata C2PA pada media sintetis (deepfake) dan audit keamanan algoritma sebelum produk AI dirilis ke publik.';
    } else if (queryLower.includes('starlink') || queryLower.includes('satelit')) {
      responseText = 'Operator seluler Indonesia menyepakati roaming Direct-to-Cell satelit LEO untuk menghapus blindspot di kawasan pelosok 3T tanpa perlu ganti kartu SIM.';
    }

    return responseText;
  }
}
