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
      private isEditorMode = true;

      async init() {
        console.log('Password Blur Plugin Initialized');
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `.password-field {
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
        document.head.appendChild(style);
        
        // Detect if we're in editor or viewer mode
        this.isEditorMode = !document.querySelector('[data-testid="viewer"]') && 
                           !document.body.classList.contains('viewer-mode');
        
        if (this.isEditorMode) {
          this.initEditorMode();
        } else {
          this.initViewerMode();
        }
      }

      private initEditorMode() {
        console.log('Password Blur: Editor Mode (non-invasive)');
        
        const processContent = () => {
          // Check if user is currently focused on an editable element
          const activeEl = document.activeElement;
          const isEditing = activeEl && (
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable ||
            activeEl.closest('[contenteditable="true"]')
          );
          
          // Don't process while user is actively editing
          if (isEditing) return;
          
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
          const nodesToProcess: Node[] = [];
          let node;
          
          while (node = walker.nextNode()) {
            if (node.parentElement && node.parentElement.classList.contains('password-field')) {
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
        };
        
        // Process when user clicks away from editor (blur)
        document.addEventListener('focusout', () => {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(processContent, 200);
        });
        
        // Process on page visibility change (tab switch back)
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(processContent, 200);
          }
        });
        
        // Watch for new content added (but not while editing)
        this.observer = new MutationObserver(() => {
          const activeEl = document.activeElement;
          const isEditing = activeEl && (
            activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable ||
            activeEl.closest('[contenteditable="true"]')
          );
          
          if (!isEditing) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(processContent, 100);
          }
        });
        
        this.observer.observe(document.body, { childList: true, subtree: true });
        
        // Initial run
        processContent();
      }

      private initViewerMode() {
        console.log('Password Blur: Viewer Mode (full blur)');
        
        // For viewer: process on all changes including typing
        const processContent = () => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
          const nodesToProcess: Node[] = [];
          let node;
          
          while (node = walker.nextNode()) {
            if (node.parentElement && node.parentElement.classList.contains('password-field')) {
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
        };
        
        // Watch all changes including characterData
        this.observer = new MutationObserver((mutations) => {
          let shouldUpdate = false;
          
          for (const m of mutations) {
            if (m.type === 'attributes' && (m.target as Element).classList?.contains('password-field')) continue;
            if (m.type === 'childList' || m.type === 'characterData') {
              shouldUpdate = true;
              break;
            }
          }
          
          if (shouldUpdate) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(processContent, 100);
          }
        });
        
        this.observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        processContent();
      }

      destroy() {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
        clearTimeout(this.debounceTimer);
      }
    });
  }
}));
