import './footer.scss';
import logoIcon from '../../assets/icons/minigames-icon.svg';
import shareIcon from '../../assets/icons/share-icon.svg';
import chatIcon from '../../assets/icons/chat-icon.svg';
import rssIcon from '../../assets/icons/rss_feed-icon.svg';
import rsSchoolIcon from '../../assets/icons/rs-icon.svg';
import githubIcon from '../../assets/icons/github-icon.svg';

const HOME_URL = '/';
const RS_SCHOOL_URL = 'https://rs.school';
const GITHUB_URL = 'https://github.com/reamplify1';
const GITHUB_NICKNAME = '@reamplify1';

interface FooterColumn {
  title: string;
  links: string[];
}

interface SocialLink {
  label: string;
  icon: string;
}

const columns: FooterColumn[] = [
  { title: 'Explore', links: ['Home', 'Library', 'Categories', 'Tournaments'] },
  { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
];

const socials: SocialLink[] = [
  { label: 'Share', icon: shareIcon },
  { label: 'Chat', icon: chatIcon },
  { label: 'RSS feed', icon: rssIcon },
];

function createLinkItem(label: string): string {
  return `<li><a class="footer__link" href="${HOME_URL}">${label}</a></li>`;
}

function createColumn(column: FooterColumn): string {
  const items = column.links.map((label) => createLinkItem(label)).join('');

  return `
    <div class="footer__column">
      <h3 class="footer__heading">${column.title}</h3>
      <ul class="footer__list">${items}</ul>
    </div>
  `;
}

function createSocialItem(social: SocialLink): string {
  return `
    <li>
      <a class="footer__social" href="${HOME_URL}" aria-label="${social.label}">
        <img class="footer__social-icon" src="${social.icon}" alt="" />
      </a>
    </li>
  `;
}

export function createFooter(): HTMLElement {
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <a class="footer__logo" href="${HOME_URL}">
            <img class="footer__logo-icon" src="${logoIcon}" alt="" />
            <span>MiniGames</span>
          </a>
          <p class="footer__description">
            Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.
          </p>
        </div>
        <nav class="footer__columns" aria-label="Footer navigation">
          ${columns.map((column) => createColumn(column)).join('')}
          <div class="footer__column">
            <h3 class="footer__heading">Community</h3>
            <ul class="footer__socials">${socials.map((social) => createSocialItem(social)).join('')}</ul>
          </div>
        </nav>
      </div>
      <div class="footer__bottom">
        <p class="footer__copyright">© 2026 MiniGames. All rights reserved.</p>
        <a class="footer__bottom-link" href="${RS_SCHOOL_URL}" target="_blank" rel="noopener noreferrer">
          <img class="footer__bottom-icon" src="${rsSchoolIcon}" alt="" />
          RS School
        </a>
        <a class="footer__bottom-link" href="${GITHUB_URL}" target="_blank" rel="noopener noreferrer">
          <img class="footer__bottom-icon" src="${githubIcon}" alt="" />
          ${GITHUB_NICKNAME}
        </a>
        <p class="footer__credit">Designed with love</p>
      </div>
    </div>
  `;

  return footer;
}