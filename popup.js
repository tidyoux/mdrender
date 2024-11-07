document.addEventListener('DOMContentLoaded', function() {
  const markdownInput = document.getElementById('markdown-input');
  const convertBtn = document.getElementById('convert-btn');
  const copyBtn = document.getElementById('copy-btn');
  const preview = document.getElementById('preview');

  // 配置 marked 选项
  const renderer = new marked.Renderer();

  // 自定义标题渲染
  renderer.heading = function(text, level) {
    const fontSize = {
      1: 'font-size: 24px; font-weight: bold; text-align: center; margin: 0.4em 0;',
      2: 'font-size: 20px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; margin: 0.4em 0;',
      3: 'font-size: 18px; font-weight: bold; padding-left: 10px; border-left: 4px solid #63b3ed; margin: 0.4em 0;',
      4: 'font-size: 16px; font-weight: bold; margin: 0.3em 0; padding-left: 10px; position: relative;',
      5: 'font-size: 15px; font-weight: bold; color: #666; margin: 0.3em 0; padding-left: 10px; position: relative;',
      6: 'font-size: 14px; font-weight: bold; color: #666; margin: 0.3em 0; padding-left: 10px; font-style: italic;'
    }[level];

    let prefix = '';
    if (level === 4) {
      prefix = '<span style="color: #63b3ed; position: absolute; left: 0;">•</span>';
    } else if (level === 5) {
      prefix = '<span style="color: #a0aec0; position: absolute; left: 0;">◦</span>';
    }

    return `<h${level} style="${fontSize}">${prefix}${text}</h${level}>`;
  };

  // 自定义表格渲染
  renderer.table = function(header, body) {
    return `<table>
              ${header ? `<thead>${header}</thead>` : ''}
              ${body ? `<tbody>${body}</tbody>` : ''}
            </table>`;
  };

  renderer.tablerow = function(content) {
    return `<tr>${content}</tr>`;
  };

  renderer.tablecell = function(content, flags) {
    const type = flags.header ? 'th' : 'td';
    const align = flags.align ? ` style="text-align: ${flags.align}"` : '';
    return `<${type}${align}>${content}</${type}>`;
  };

  // 自定义引用块渲染
  renderer.blockquote = function(quote) {
    return `<blockquote style="margin: 1em 0; padding: 0.8em 1em; background-color: #f7fafc; border-left: 4px solid #a0aec0; color: #718096;">${quote}</blockquote>`;
  };

  // 自定义代码块渲染
  renderer.code = function(code, language) {
    if (language === 'mermaid') {
      const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
      const cleanCode = code.trim();
      
      return `<div class="mermaid" style="text-align: center; background-color: white; padding: 1em; border-radius: 4px; margin: 1em 0;">
                ${cleanCode}
              </div>`;
    }

    let highlightedCode;
    try {
      if (language && hljs.getLanguage(language)) {
        highlightedCode = hljs.highlight(code, { language }).value;
      } else {
        highlightedCode = hljs.highlightAuto(code).value;
      }
    } catch (err) {
      console.error('代码高亮错误:', err);
      highlightedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    return `<section style="margin: 0.5em 0;">
              <section style="background-color: #282c34; padding: 0.8em; border-radius: 4px;">
                <pre style="margin: 0; font-family: Consolas, monospace; font-size: 12px; color: #abb2bf; white-space: pre;">${highlightedCode}</pre>
              </section>
            </section>`;
  };

  // 配置 marked
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true,
    tables: true,
    headerIds: true,
    mangle: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
    highlight: function(code, lang) {
      try {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
      } catch (err) {
        console.error('代码高亮错误:', err);
        return code;
      }
    }
  });

  // 图片点击处理函数
  function handleImageClick(event) {
    event.stopPropagation();
    
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    
    const img = document.createElement('img');
    img.src = event.target.src;
    img.className = 'overlay-image';
    
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    
    // 点击遮罩层关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }

  // 设置图片点击处理函数
  function setupImageClickHandlers() {
    const preview = document.getElementById('preview');
    const images = preview.getElementsByTagName('IMG');
    
    for (const img of images) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', handleImageClick);
    }
  }

  // 转换按钮点击事件
  convertBtn.addEventListener('click', async function() {
    try {
      const markdown = markdownInput.value;
      const html = marked.parse(markdown);
      preview.innerHTML = html;

      // 重新渲染所有 Mermaid 图表
      const mermaidDivs = document.querySelectorAll('.mermaid');
      mermaid.init(undefined, mermaidDivs);

      // 处理所有渲染后的 SVG
      mermaidDivs.forEach(div => {
        const svg = div.querySelector('svg');
        if (svg) {
          // 设置 SVG 样式
          svg.style.maxWidth = '100%';
          svg.style.height = 'auto';
          
          // 添加内联样式
          const style = document.createElement('style');
          style.textContent = `
            .node rect { fill: #E8F1FF; stroke: #326CE5; }
            .node circle { fill: #E8F1FF; stroke: #326CE5; }
            .node ellipse { fill: #E8F1FF; stroke: #326CE5; }
            .node polygon { fill: #E8F1FF; stroke: #326CE5; }
            .edgePath path { stroke: #666; }
            .edgeLabel { background-color: white; }
            .label { font-family: "Microsoft YaHei", sans-serif; }
            .label text { fill: #333; }
          `;
          svg.insertBefore(style, svg.firstChild);
        }
      });

      // 设置图片点击处理
      setupImageClickHandlers();
    } catch (err) {
      console.error('转换错误:', err);
      alert('转换失败，请检查 Markdown 格式是否正确');
    }
  });

  // 添加提示元素
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = '已复制到剪贴板';
  document.body.appendChild(notification);

  // 复制按钮点击事件
  copyBtn.addEventListener('click', async function() {
    try {
      // 直接使用预览区域的内容
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 执行复制
      const successful = document.execCommand('copy');
      
      // 清理选择
      selection.removeAllRanges();
      
      if (successful) {
        // 显示轻量提示
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
      } else {
        throw new Error('复制失败');
      }
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请重试');
    }
  });

  // 在其他渲染器后添加列表渲染器
  renderer.list = function(body, ordered) {
    const type = ordered ? 'ol' : 'ul';
    return `<${type} style="padding-left: 1.5em; margin: 0.3em 0;">${body}</${type}>`;
  };

  renderer.listitem = function(text) {
    return `<li style="margin: 0.2em 0;">${text}</li>`;
  };

  // 其他代码保持不变...
}); 