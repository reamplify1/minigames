import './developer-cta.scss';
import uploadIcon from '../../assets/icons/upload-icon.svg';
import illustration from '../../assets/images/illustration-side.png';

const description = [
  "Want to see your game on MiniGames? We're always looking for fun,",
  'engaging mini games to add to our platform. Submit your game',
  'and reach thousands of players!',
].join('\n');

export function createDeveloperCta(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'developer-cta';
  section.setAttribute('aria-labelledby', 'developer-cta-title');
  section.innerHTML = `
    <img class="developer-cta__illustration" src="${illustration}" alt="" />
    <div class="developer-cta__card">
      <h2 class="developer-cta__title" id="developer-cta-title">Are You a Game Developer?</h2>
      <p class="developer-cta__text">${description}</p>
      <button class="developer-cta__button" type="button">
        <img class="developer-cta__button-icon" src="${uploadIcon}" alt="" />
        Submit Form
      </button>
      <address class="developer-cta__contact">or contact us at developers@minigames.com</address>
    </div>
  `;

  return section;
}
