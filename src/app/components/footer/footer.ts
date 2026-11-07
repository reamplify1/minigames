import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FooterColumn {
  title: string;
  links: string[];
}

interface SocialLink {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly columns: FooterColumn[] = [
    { title: 'Explore', links: ['Home', 'Library', 'Categories', 'Tournaments'] },
    { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'] },
  ];

  protected readonly socials: SocialLink[] = [
    { label: 'Share', icon: 'assets/icons/share-icon.svg' },
    { label: 'Chat', icon: 'assets/icons/chat-icon.svg' },
    { label: 'RSS feed', icon: 'assets/icons/rss_feed-icon.svg' },
  ];
}
