(function() {
  const h = {
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
  System.register([], (b) => ({
    execute: () => {
      b("default", class {
        constructor() {
          Object.assign(this, h);
        }
        debounceTimer = null;
        observer = null;
        processedNodes = /* @__PURE__ */ new WeakSet();
        isEditorMode = !0;
        async init() {
          console.log("Password Blur Plugin Initialized");
          const r = document.createElement("style");
          r.textContent = `.password-field {
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
}`, document.head.appendChild(r), this.isEditorMode = !document.querySelector('[data-testid="viewer"]') && !document.body.classList.contains("viewer-mode"), this.isEditorMode ? this.initEditorMode() : this.initViewerMode();
        }
        initEditorMode() {
          console.log("Password Blur: Editor Mode (non-invasive)");
          const r = () => {
            const e = document.activeElement;
            if (e && (e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable || e.closest('[contenteditable="true"]'))) return;
            const s = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), d = [];
            let n;
            for (; n = s.nextNode(); ) {
              if (n.parentElement && n.parentElement.classList.contains("password-field") || this.processedNodes.has(n)) continue;
              const i = n.textContent || "";
              i.includes("[[") && i.includes("]]") && d.push(n);
            }
            d.forEach((i) => {
              const c = i.textContent || "", a = /\[\[([^\[\]]+)\]\]/g;
              if (!a.test(c)) return;
              a.lastIndex = 0;
              const o = document.createDocumentFragment();
              let l = 0, t;
              for (; (t = a.exec(c)) !== null; ) {
                t.index > l && o.appendChild(document.createTextNode(c.slice(l, t.index)));
                const m = t[1], p = document.createElement("span");
                p.className = "password-field", p.setAttribute("data-password", m), p.textContent = t[0], p.addEventListener("click", (f) => {
                  f.stopPropagation(), navigator.clipboard.writeText(m), window.Blinko.toast.success("✓ Copied");
                }), o.appendChild(p), this.processedNodes.add(p), l = t.index + t[0].length;
              }
              l < c.length && o.appendChild(document.createTextNode(c.slice(l))), i.parentNode && i.parentNode.replaceChild(o, i);
            });
          };
          document.addEventListener("focusout", () => {
            clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(r, 200);
          }), document.addEventListener("visibilitychange", () => {
            document.hidden || (clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(r, 200));
          }), this.observer = new MutationObserver(() => {
            const e = document.activeElement;
            e && (e.tagName === "INPUT" || e.tagName === "TEXTAREA" || e.isContentEditable || e.closest('[contenteditable="true"]')) || (clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(r, 100));
          }), this.observer.observe(document.body, { childList: !0, subtree: !0 }), r();
        }
        initViewerMode() {
          console.log("Password Blur: Viewer Mode (full blur)");
          const r = () => {
            const e = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), u = [];
            let s;
            for (; s = e.nextNode(); ) {
              if (s.parentElement && s.parentElement.classList.contains("password-field") || this.processedNodes.has(s)) continue;
              const d = s.textContent || "";
              d.includes("[[") && d.includes("]]") && u.push(s);
            }
            u.forEach((d) => {
              const n = d.textContent || "", i = /\[\[([^\[\]]+)\]\]/g;
              if (!i.test(n)) return;
              i.lastIndex = 0;
              const c = document.createDocumentFragment();
              let a = 0, o;
              for (; (o = i.exec(n)) !== null; ) {
                o.index > a && c.appendChild(document.createTextNode(n.slice(a, o.index)));
                const l = o[1], t = document.createElement("span");
                t.className = "password-field", t.setAttribute("data-password", l), t.textContent = o[0], t.addEventListener("click", (m) => {
                  m.stopPropagation(), navigator.clipboard.writeText(l), window.Blinko.toast.success("✓ Copied");
                }), c.appendChild(t), this.processedNodes.add(t), a = o.index + o[0].length;
              }
              a < n.length && c.appendChild(document.createTextNode(n.slice(a))), d.parentNode && d.parentNode.replaceChild(c, d);
            });
          };
          this.observer = new MutationObserver((e) => {
            let u = !1;
            for (const s of e)
              if (!(s.type === "attributes" && s.target.classList?.contains("password-field")) && (s.type === "childList" || s.type === "characterData")) {
                u = !0;
                break;
              }
            u && (clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(r, 100));
          }), this.observer.observe(document.body, { childList: !0, subtree: !0, characterData: !0 }), r();
        }
        destroy() {
          this.observer && (this.observer.disconnect(), this.observer = null), clearTimeout(this.debounceTimer);
        }
      });
    }
  }));
})();
