(function() {
  const u = {
    name: "blinko-plugin-password-blur",
    author: "User",
    url: "https://github.com/sparkz-technology/blinko-plugin-password-blur",
    version: "v1.0.0",
    minAppVersion: "v1.0.0",
    displayName: {
      default: "Password Blur",
      zh: "密码模糊"
    },
    description: {
      default: "Blur sensitive passwords in your notes. Use [[password]] format to automatically blur text. Hover to reveal, click to copy.",
      zh: "在笔记中模糊敏感密码。使用 [[密码]] 格式自动模糊文本。悬停显示，点击复制。"
    },
    readme: {
      default: "README.md"
    },
    icon: "🔐"
  };
  System.register([], (p) => ({
    execute: () => {
      p("default", class {
        constructor() {
          Object.assign(this, u);
        }
        debounceTimer = null;
        observer = null;
        processedNodes = /* @__PURE__ */ new WeakSet();
        styleElement = null;
        lastUrl = "";
        async init() {
          console.log("Password Blur Plugin Initialized"), this.styleElement = document.createElement("style"), this.styleElement.textContent = `.password-field {
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
}`, document.head.appendChild(this.styleElement), this.lastUrl = location.href, this.startObserving(), this.watchForNavigation();
        }
        watchForNavigation() {
          setInterval(() => {
            location.href !== this.lastUrl && (this.lastUrl = location.href, console.log("Password Blur: Page changed, re-processing"), this.processedNodes = /* @__PURE__ */ new WeakSet(), this.processContent());
          }, 500), window.addEventListener("popstate", () => {
            this.processedNodes = /* @__PURE__ */ new WeakSet(), setTimeout(() => this.processContent(), 100);
          });
        }
        startObserving() {
          this.observer = new MutationObserver(() => {
            clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(() => this.processContent(), 100);
          }), this.observer.observe(document.body, {
            childList: !0,
            subtree: !0
          }), this.processContent();
        }
        processContent() {
          const n = document.activeElement;
          if (n && (n.tagName === "INPUT" || n.tagName === "TEXTAREA" || n.isContentEditable || n.closest('[contenteditable="true"]'))) return;
          const h = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), c = [];
          let o;
          for (; o = h.nextNode(); ) {
            if (o.parentElement?.classList.contains("password-field") || this.processedNodes.has(o)) continue;
            const e = o.textContent || "";
            e.includes("[[") && e.includes("]]") && c.push(o);
          }
          c.forEach((e) => {
            const i = e.textContent || "", a = /\[\[([^\[\]]+)\]\]/g;
            if (!a.test(i)) return;
            a.lastIndex = 0;
            const l = document.createDocumentFragment();
            let r = 0, t;
            for (; (t = a.exec(i)) !== null; ) {
              t.index > r && l.appendChild(document.createTextNode(i.slice(r, t.index)));
              const d = t[1], s = document.createElement("span");
              s.className = "password-field", s.setAttribute("data-password", d), s.textContent = t[0], s.addEventListener("click", (m) => {
                m.stopPropagation(), navigator.clipboard.writeText(d), window.Blinko.toast.success("✓ Copied");
              }), l.appendChild(s), this.processedNodes.add(s), r = t.index + t[0].length;
            }
            r < i.length && l.appendChild(document.createTextNode(i.slice(r))), e.parentNode && e.parentNode.replaceChild(l, e);
          });
        }
        destroy() {
          this.observer && (this.observer.disconnect(), this.observer = null), this.styleElement && (this.styleElement.remove(), this.styleElement = null), clearTimeout(this.debounceTimer);
        }
      });
    }
  }));
})();
