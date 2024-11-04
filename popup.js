document.addEventListener('DOMContentLoaded', function() {
  const markdownInput = document.getElementById('markdown-input');
  const convertBtn = document.getElementById('convert-btn');
  const copyBtn = document.getElementById('copy-btn');
  const preview = document.getElementById('preview');

  // 配置 marked 选项
  marked.setOptions({
    breaks: true,
    gfm: true,
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

  // 自定义渲染器
  const renderer = new marked.Renderer();
  
  // 自定义代码块渲染
  renderer.code = function(code, language) {
    // 生成行号
    const lines = code.split('\n');
    if (lines[lines.length - 1].trim() === '') {
      lines.pop();
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

    // 修改代码块的 HTML 结构
    const lineNumbers = lines
      .map((_, i) => `<div class="line-number">${i + 1}</div>`)
      .join('');

    return `<div class="code-block">
              <div class="line-numbers">${lineNumbers}</div>
              <div class="code-content">
                <pre><code class="hljs${language ? ' language-' + language : ''}">${highlightedCode}</code></pre>
              </div>
            </div>`;
  };

  // 自定义引用块渲染
  renderer.blockquote = function(quote) {
    // 不再使用行内样式，让 CSS 文件控制样式
    return `<blockquote>${quote}</blockquote>`;
  };

  marked.setOptions({ renderer });

  convertBtn.addEventListener('click', function() {
    try {
      const markdown = markdownInput.value;
      const html = marked.parse(markdown);
      preview.innerHTML = html;
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
}); 