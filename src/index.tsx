/// <reference types="systemjs" />

import type { BasePlugin } from 'blinko';
import plugin from '../plugin.json';

System.register([], (exports) => ({
  execute: () => {
    exports('default', class Plugin implements BasePlugin {
      constructor() {
        Object.assign(this, plugin);
      }

      private debounceTimer: any = null;
      private observer: MutationObserver | null = null;
      private processedNodes = new WeakSet();
      private styleElement: HTMLStyleElement | null = null;
      private lastUrl = '';

      async init() {
        console.log('Password Blur Plugin Initialized');
        
        // Add CSS
        this.styleElement = document.createElement('style');
        this.styleElement.textContent = `.password-field {
filter: blur(4px);
transition: filter 0.2s ease;
cursor: pointer;
user-select: none;
padding: 2px 4px;
border-radius: 3px;
display: inline-block;
}
.password-field:hover {
filter: blur(0px);
}`;
        document.head.appendChild(this.styleElement);
        
        // Track URL for page changes
        this.lastUrl = location.href;
        
        // Start observing
        this.startObserving();
        
        // Listen for URL changes (SPA navigation)
        this.watchForNavigation();
      }

      private watchForNavigation() {
        // Check for URL changes periodically (handles pushState/replaceState)
        setInterval(() => {
          if (location.href !== this.lastUrl) {
            this.lastUrl = location.href;
            console.log('Password Blur: Page changed, re-processing');
            // Clear processed nodes on page change since DOM is new
            this.processedNodes = new WeakSet();
            this.processContent();
          }
        }, 500);

        // Also listen for popstate (back/forward navigation)
        window.addEventListener('popstate', () => {
          this.processedNodes = new WeakSet();
          setTimeout(() => this.processContent(), 100);
        });
      }

      private startObserving() {
        // Process content on mutations
        this.observer = new MutationObserver(() => {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => this.processContent(), 100);
        });
        
        this.observer.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
        
        // Initial processing
        this.processContent();
      }

      private processContent() {
        // Skip if user is actively editing
        const activeEl = document.activeElement;
        const isEditing = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable ||
          activeEl.closest('[contenteditable="true"]')
        );
        
        if (isEditing) return;
        
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        const nodesToProcess: Node[] = [];
        let node;
        
        while (node = walker.nextNode()) {
          // Skip already processed password fields
          if (node.parentElement?.classList.contains('password-field')) {
            continue;
          }
          if (this.processedNodes.has(node)) continue;
          
          const text = node.textContent || '';
          if (text.includes('[[') && text.includes(']]')) {
            nodesToProcess.push(node);
          }
        }
        
        nodesToProcess.forEach((textNode) => {
          const text = textNode.textContent || '';
          const regex = /\[\[([^\[\]]+)\]\]/g;
          if (!regex.test(text)) return;
          regex.lastIndex = 0;
          
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;
          let match;
          
          while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
              fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            
            const password = match[1];
            const span = document.createElement('span');
            span.className = 'password-field';
            span.setAttribute('data-password', password);
            span.textContent = match[0];
            
            span.addEventListener('click', (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(password);
              window.Blinko.toast.success('✓ Copied');
            });
            
            fragment.appendChild(span);
            this.processedNodes.add(span);
            lastIndex = match.index + match[0].length;
          }
          
          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
          }
          
          if (textNode.parentNode) {
            textNode.parentNode.replaceChild(fragment, textNode);
          }
        });
      }

      destroy() {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
        if (this.styleElement) {
          this.styleElement.remove();
          this.styleElement = null;
        }
        clearTimeout(this.debounceTimer);
      }
    });
  }
}));
