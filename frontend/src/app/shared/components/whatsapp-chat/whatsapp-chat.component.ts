import { Component, inject } from '@angular/core';
import { StoreConfigService } from '../../../core/services/store-config.service';

@Component({
  selector: 'app-whatsapp-chat',
  standalone: true,
  template: `
    <a
      [href]="store.whatsappUrl()"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-[4.75rem] right-4 lg:bottom-6 z-40 flex items-center gap-2 bg-[#25D366] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg hover:scale-105 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <span class="text-xl leading-none">💬</span>
      <span class="text-sm font-semibold hidden sm:inline">Chat with us</span>
    </a>
  `,
})
export class WhatsappChatComponent {
  readonly store = inject(StoreConfigService);
}
