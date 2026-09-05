export interface PollOption {
  id: string;
  textId: string;
  textEn: string;
  votes: number;
}

export interface PollData {
  id: string;
  questionId: string;
  questionEn: string;
  options: PollOption[];
}

export class ReaderPoll {
  private static STORAGE_KEY = 'byte_editorial_poll_data';

  private static DEFAULT_POLL: PollData = {
    id: 'poll-2026-ai-gov',
    questionId: 'Apakah regulasi dan transparansi metadata AI di Indonesia sudah cukup memadai untuk menekan penipuan deepfake?',
    questionEn: 'Is AI metadata transparency and regulation in Indonesia adequate enough to suppress deepfake scams?',
    options: [
      { id: 'opt-1', textId: 'Sangat Memadai & Siap', textEn: 'Highly Adequate & Ready', votes: 1420 },
      { id: 'opt-2', textId: 'Perlu Pengawasan Ketat', textEn: 'Needs Stricter Supervision', votes: 2890 },
      { id: 'opt-3', textId: 'Belum Memadai', textEn: 'Not Yet Adequate', votes: 3120 },
      { id: 'opt-4', textId: 'Butuh Sosialisasi Publik', textEn: 'Needs Public Outreach', votes: 850 }
    ]
  };

  public static getPollData(): PollData {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      this.savePollData(this.DEFAULT_POLL);
      return this.DEFAULT_POLL;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return this.DEFAULT_POLL;
    }
  }

  public static savePollData(poll: PollData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(poll));
  }

  public static getVotedOptionId(pollId: string): string | null {
    return localStorage.getItem(`byte_poll_vote_${pollId}`);
  }

  public static vote(optionId: string) {
    const poll = this.getPollData();
    const previousVote = this.getVotedOptionId(poll.id);
    if (previousVote) return; // Prevent duplicate voting

    const targetOpt = poll.options.find(o => o.id === optionId);
    if (targetOpt) {
      targetOpt.votes += 1;
      this.savePollData(poll);
      localStorage.setItem(`byte_poll_vote_${poll.id}`, optionId);
    }
  }

  public static renderHTML(lang: 'id' | 'en'): string {
    const poll = this.getPollData();
    const votedOptionId = this.getVotedOptionId(poll.id);
    const hasVoted = votedOptionId !== null;
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const question = lang === 'en' ? poll.questionEn : poll.questionId;
    const widgetTitle = lang === 'en' ? 'EDITORIAL POLL' : 'JAJAK PENDAPAT REDAKSI';
    const totalLabel = lang === 'en' ? `${totalVotes.toLocaleString('en-US')} total votes` : `${totalVotes.toLocaleString('id-ID')} total suara`;
    const votedNotice = lang === 'en' ? '✓ You have voted' : '✓ Terima kasih atas partisipasi Anda';
    const chooseText = lang === 'en' ? 'Vote →' : 'Pilih →';

    return `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: var(--shadow-md);">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.6rem;">
          <span style="font-size: 0.72rem; font-weight: 800; color: var(--accent-cyan); font-family: var(--font-mono); letter-spacing: 0.06em; display:inline-flex; align-items:center; gap:0.4rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            ${widgetTitle}
          </span>
          <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">${totalLabel}</span>
        </div>

        <h4 style="font-size: 0.875rem; font-weight: 700; line-height: 1.45; color: var(--text-primary); margin: 0;">${question}</h4>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          ${poll.options.map(opt => {
            const isSelected = votedOptionId === opt.id;
            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const optionText = lang === 'en' ? opt.textEn : opt.textId;

            if (hasVoted) {
              // Render Animated Progress Bar Result
              return `
                <div style="position: relative; padding: 0.65rem 0.85rem; background: var(--bg-secondary); border: 1px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-color)'}; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem;">
                  <!-- Animated Progress Background Fill -->
                  <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${percentage}%; background: ${isSelected ? 'rgba(0, 242, 254, 0.22)' : 'rgba(255, 255, 255, 0.05)'}; border-radius: 8px 0 0 8px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                  
                  <span style="position: relative; z-index: 1; font-weight: ${isSelected ? '800' : '600'}; color: ${isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)'}; display: flex; align-items: center; gap: 0.35rem;">
                    ${isSelected ? '✓ ' : ''}${optionText}
                  </span>
                  <span style="position: relative; z-index: 1; font-family: var(--font-mono); font-weight: 700; color: ${isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'};">${percentage}%</span>
                </div>
              `;
            } else {
              // Render Interactive Vote Option Button
              return `
                <button class="btn-poll-option" data-option-id="${opt.id}" style="width: 100%; text-align: left; padding: 0.65rem 0.85rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 0.825rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between;" onmouseover="this.style.borderColor='var(--accent-cyan)'" onmouseout="this.style.borderColor='var(--border-color)'">
                  <span>${optionText}</span>
                  <span style="font-size: 0.75rem; color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700;">${chooseText}</span>
                </button>
              `;
            }
          }).join('')}
        </div>

        ${hasVoted ? `
          <div style="font-size: 0.72rem; color: var(--accent-emerald); font-weight: 700; text-align: center; margin-top: 0.25rem;">
            ${votedNotice}
          </div>
        ` : ''}
      </div>
    `;
  }

  public static bindEvents(container: HTMLElement, onVoteCompleted: () => void) {
    container.querySelectorAll('.btn-poll-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const optionId = btn.getAttribute('data-option-id');
        if (optionId) {
          this.vote(optionId);
          onVoteCompleted();
        }
      });
    });
  }
}
