import { TECH_GLOSSARY } from '../data/techGlossary';
import { Toast } from '../utils/toast';

export class TechGlossary {
  // Highlight terms in article HTML content
  public static highlightTermsInHTML(html: string): string {
    let result = html;
    TECH_GLOSSARY.forEach(item => {
      const regex = new RegExp(`\\b(${item.term})\\b`, 'gi');
      result = result.replace(regex, `<mark class="tech-term-tag" data-term="$1">$1</mark>`);
    });
    return result;
  }

  // Render Full Glossary Modal Content
  public static renderGlossaryModalHTML(): string {
    return `
      <div style="padding: 1.5rem;">
        <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
          <h2 style="font-weight: 800; font-size: 1.3rem; color: var(--text-primary);">Pustaka Glosarium Istilah Tekno & AI</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Kamus istilah penting untuk membantu Anda memahami jargon teknologi terkini.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 60vh; overflow-y: auto; padding-right: 0.5rem;">
          ${TECH_GLOSSARY.map(g => `
            <div style="background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 800; font-size: 1.1rem; color: var(--accent-cyan); font-family: var(--font-mono);">${g.term}</span>
                <span class="tag-badge" style="font-size: 0.7rem;">${g.category}</span>
              </div>
              <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 0.6rem;">${g.definition}</p>
              <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; background: var(--bg-primary); padding: 0.5rem 0.75rem; border-radius: 6px;">
                Contoh Penggunaan: "${g.example}"
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Bind Tooltip Click Events inside Article Reader
  public static bindTermEvents(container: HTMLElement) {
    container.querySelectorAll('.tech-term-tag').forEach(tag => {
      tag.addEventListener('click', (e) => {
        e.stopPropagation();
        const termName = tag.getAttribute('data-term');
        const found = TECH_GLOSSARY.find(g => g.term.toLowerCase() === termName?.toLowerCase());
        if (found) {
          Toast.showGlossaryCard(found.term, found.category, found.definition, found.example);
        }
      });
    });
  }
}
