(function() {
  const name = "blinko-plugin-password-blur";
  const author = "User";
  const url = "https://github.com/blinko-space/blinko-plugin-password-blur";
  const version = "1.0.0";
  const minAppVersion = "0.0.1";
  const displayName = {
    "default": "Password Blur",
    zh: "密码模糊"
  };
  const description = {
    "default": "Blur sensitive passwords in your notes. Use [[password]] format to automatically blur text. Hover to reveal, click to copy.",
    zh: "在笔记中模糊敏感密码。使用 [[密码]] 格式自动模糊文本。悬停显示，点击复制。"
  };
  const readme = {
    "default": "README.md"
  };
  const icon = "🔐";
  const plugin = {
    name,
    author,
    url,
    version,
    minAppVersion,
    displayName,
    description,
    readme,
    icon
  };
  System.register([], (exports$1) => ({
    execute: () => {
      exports$1("default", class Plugin {
        constructor() {
          Object.assign(this, plugin);
        }
        debounceTimer = null;
        processedNodes = /* @__PURE__ */ new WeakSet();
        async init() {
          console.log("Password Block Plugin Initialized");
          const style = document.createElement("style");
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
          const processContent = () => {
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              null
            );
            const nodesToReplace = [];
            let node;
            while (node = walker.nextNode()) {
              if (this.processedNodes.has(node)) continue;
              const text = node.textContent || "";
              if (text.includes("[[") && text.includes("]]")) {
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
            nodesToReplace.forEach(({ node: node2, match, password }) => {
              const span = document.createElement("span");
              span.className = "password-field";
              span.setAttribute("data-password", password);
              span.textContent = match;
              span.addEventListener("click", (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(password);
                window.Blinko.toast.success("✓ Copied");
              });
              const parent = node2.parentNode;
              if (parent) {
                const text = node2.textContent || "";
                const idx = text.indexOf(match);
                const before = text.substring(0, idx);
                const after = text.substring(idx + match.length);
                if (before) parent.insertBefore(document.createTextNode(before), node2);
                parent.insertBefore(span, node2);
                if (after) parent.insertBefore(document.createTextNode(after), node2);
                parent.removeChild(node2);
                this.processedNodes.add(span);
              }
            });
          };
          setTimeout(processContent, 500);
          document.addEventListener("input", () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(processContent, 300);
          }, true);
        }
        destroy() {
        }
      });
    }
  }));
})();
