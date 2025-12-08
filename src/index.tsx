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
      private processedNodes = new WeakSet();

      async init() {
        console.log('Password Block Plugin Initialized');
        
        // Add CSS for blur effect
        const style = document.createElement('style');
        style.textContent = `
          .password-field {
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
          }
        `;
        document.head.appendChild(style);
        
        // Process editor content to find [[password]] patterns
        const processContent = () => {
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          const nodesToReplace: any[] = [];
          let node;
          
          while (node = walker.nextNode()) {
            // Skip already processed nodes
            if (this.processedNodes.has(node)) continue;
            
            const text = node.textContent || '';
            if (text.includes('[[') && text.includes(']]')) {
              const regex = /\[\[([^\[\]]+)\]\]/g;
              let match;
              
              while ((match = regex.exec(text)) !== null) {
                nodesToReplace.push({
                  node,
                  match: match[0],
                  password: match[1]
                });
              }
            }
          }
          
          // Replace found patterns
          nodesToReplace.forEach(({ node, match, password }) => {
            const span = document.createElement('span');
            span.className = 'password-field';
            span.setAttribute('data-password', password);
            span.textContent = match;
            
            span.addEventListener('click', (e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(password);
              window.Blinko.toast.success('✓ Copied');
            });
            
            const parent = node.parentNode;
            if (parent) {
              const text = node.textContent || '';
              const idx = text.indexOf(match);
              const before = text.substring(0, idx);
              const after = text.substring(idx + match.length);
              
              if (before) parent.insertBefore(document.createTextNode(before), node);
              parent.insertBefore(span, node);
              if (after) parent.insertBefore(document.createTextNode(after), node);
              parent.removeChild(node);
              
              this.processedNodes.add(span);
            }
          });
        };
        
        // Process on init
        setTimeout(processContent, 500);
        
        // Debounced input handler
        document.addEventListener('input', () => {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(processContent, 300);
        }, true);
      }

      destroy() {
        // Cleanup if necessary
      }
    });
  }
}));