(function() {
  const m = {
    name: "blinko-plugin-password-blur",
    author: "User",
    url: "https://github.com/blinko-space/blinko-plugin-password-blur",
    version: "1.0.0",
    minAppVersion: "0.0.1",
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
  System.register([], (f) => ({
    execute: () => {
      f("default", class {
        constructor() {
          Object.assign(this, m);
        }
        debounceTimer = null;
        processedNodes = /* @__PURE__ */ new WeakSet();
        async init() {
          console.log("Password Block Plugin Initialized");
          const c = document.createElement("style");
          c.textContent = `
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
        `, document.head.appendChild(c);
          const a = () => {
            const h = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null
            ), d = [];
            let r;
            for (; r = h.nextNode(); ) {
              if (this.processedNodes.has(r)) continue;
              const e = r.textContent || "";
              if (e.includes("[[") && e.includes("]]")) {
                const o = /\[\[([^\[\]]+)\]\]/g;
                let t;
                for (; (t = o.exec(e)) !== null; )
                  d.push({
                    node: r,
                    match: t[0],
                    password: t[1]
                  });
              }
            }
            d.forEach(({ node: e, match: o, password: t }) => {
              const s = document.createElement("span");
              s.className = "password-field", s.setAttribute("data-password", t), s.textContent = o, s.addEventListener("click", (i) => {
                i.stopPropagation(), navigator.clipboard.writeText(t), window.Blinko.toast.success("✓ Copied");
              });
              const n = e.parentNode;
              if (n) {
                const i = e.textContent || "", l = i.indexOf(o), u = i.substring(0, l), p = i.substring(l + o.length);
                u && n.insertBefore(document.createTextNode(u), e), n.insertBefore(s, e), p && n.insertBefore(document.createTextNode(p), e), n.removeChild(e), this.processedNodes.add(s);
              }
            });
          };
          setTimeout(a, 500), document.addEventListener("input", () => {
            clearTimeout(this.debounceTimer), this.debounceTimer = setTimeout(a, 300);
          }, !0);
        }
        destroy() {
        }
      });
    }
  }));
})();
