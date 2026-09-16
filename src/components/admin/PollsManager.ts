import { ReaderPoll, type PollData } from '../ReaderPoll';
import { Toast } from '../../utils/toast';

export class PollsManager {
  public static render(): string {
    const poll = ReaderPoll.getPollData();
    const totalVotes = poll.options.reduce((acc, opt) => acc + opt.votes, 0);

    return `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 800px;">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 0.3rem 0; letter-spacing: -0.02em; color: var(--text-primary);">Jajak Pendapat & Polling Redaksi</h2>
          <p style="font-size: 0.825rem; color: var(--text-muted); margin: 0;">Sesuaikan pertanyaan dan opsi pilihan opini pembaca yang ditampilkan secara realtime di sidebar portal.</p>
        </div>

        <form id="form-manage-poll" style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Pertanyaan Polling (Bahasa Indonesia)</label>
            <input type="text" id="poll-question-id" required value="${poll.questionId}" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem;" />
          </div>

          <div>
            <label style="display: block; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-secondary);">Pertanyaan Polling (English Translation)</label>
            <input type="text" id="poll-question-en" required value="${poll.questionEn}" style="width: 100%; padding: 0.65rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.875rem;" />
          </div>

          <div style="border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <label style="display: block; font-size: 0.8rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 0.75rem;">Pilihan Respon (${totalVotes} Total Suara)</label>
            
            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              ${poll.options.map((opt, idx) => `
                <div style="display: grid; grid-template-columns: 1fr 1fr 100px; gap: 0.75rem; align-items: center;">
                  <input type="text" class="poll-opt-id" data-idx="${idx}" value="${opt.textId}" placeholder="Teks Pilihan (ID)" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.8rem;" />
                  <input type="text" class="poll-opt-en" data-idx="${idx}" value="${opt.textEn}" placeholder="Option Text (EN)" style="padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.8rem;" />
                  <span style="font-size: 0.78rem; font-family: var(--font-mono); color: var(--text-muted);">${opt.votes} suara</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button type="button" id="btn-reset-poll-votes" style="padding: 0.55rem 1rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: var(--radius-md); color: var(--accent-rose); font-size: 0.78rem; font-weight: 600; cursor: pointer;">
              Reset Total Suara ke 0
            </button>
            <button type="submit" style="padding: 0.55rem 1.35rem; background: var(--accent-primary); color: #ffffff; font-weight: 600; border-radius: var(--radius-md); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.15); cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              Simpan & Publikasikan Polling
            </button>
          </div>
        </form>
      </div>
    `;
  }

  public static bindEvents(modalElem: HTMLElement, refreshCallback: () => void) {
    const form = modalElem.querySelector('#form-manage-poll') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const qId = (modalElem.querySelector('#poll-question-id') as HTMLInputElement).value;
        const qEn = (modalElem.querySelector('#poll-question-en') as HTMLInputElement).value;

        const currentPoll = ReaderPoll.getPollData();
        const newOptions = currentPoll.options.map((opt, idx) => {
          const idInput = modalElem.querySelector(`.poll-opt-id[data-idx="${idx}"]`) as HTMLInputElement;
          const enInput = modalElem.querySelector(`.poll-opt-en[data-idx="${idx}"]`) as HTMLInputElement;
          return {
            ...opt,
            textId: idInput ? idInput.value : opt.textId,
            textEn: enInput ? enInput.value : opt.textEn
          };
        });

        const updatedPoll: PollData = {
          id: `poll-${Date.now()}`,
          questionId: qId,
          questionEn: qEn,
          options: newOptions
        };

        ReaderPoll.savePollData(updatedPoll);
        Toast.show('Polling editorial baru berhasil dirilis ke beranda!');
        refreshCallback();
      });
    }

    // Reset votes button
    modalElem.querySelector('#btn-reset-poll-votes')?.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mereset total perolehan suara polling ke 0?')) {
        const currentPoll = ReaderPoll.getPollData();
        currentPoll.options.forEach(opt => { opt.votes = 0; });
        ReaderPoll.savePollData(currentPoll);
        Toast.show('Total suara polling telah direset ke 0.');
        refreshCallback();
      }
    });
  }
}
