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
  
  // 自定义标题渲染
  renderer.heading = function(text, level) {
    // 使用微信支持的样式
    const fontSize = {
      1: 'font-size: 24px; font-weight: bold; text-align: center; margin: 1em 0;',
      2: 'font-size: 20px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; margin: 1em 0;',
      3: 'font-size: 18px; font-weight: bold; padding-left: 10px; border-left: 4px solid #63b3ed; margin: 1em 0;',
      4: 'font-size: 16px; font-weight: bold; margin: 1em 0; padding-left: 10px; position: relative;',
      5: 'font-size: 15px; font-weight: bold; color: #666; margin: 1em 0; padding-left: 10px; position: relative;',
      6: 'font-size: 14px; font-weight: bold; color: #666; margin: 1em 0; padding-left: 10px; font-style: italic;'
    }[level];

    // 为 h4 和 h5 添加特殊标记
    let prefix = '';
    if (level === 4) {
      prefix = '<span style="color: #63b3ed; position: absolute; left: 0;">•</span>';
    } else if (level === 5) {
      prefix = '<span style="color: #a0aec0; position: absolute; left: 0;">◦</span>';
    }

    return `<h${level} style="${fontSize}">${prefix}${text}</h${level}>`;
  };
  
  // 自定义代码块渲染
  renderer.code = function(code, language) {
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

    // 简化的代码块结构
    return `<section style="margin: 0.5em 0;">
              <section style="background-color: #282c34; padding: 0.8em; border-radius: 4px;">
                <pre style="margin: 0; font-family: Consolas, monospace; font-size: 12px; color: #abb2bf; white-space: pre;">${highlightedCode}</pre>
              </section>
            </section>`;
  };

  // 自定义引用块渲染
  renderer.blockquote = function(quote) {
    return `<blockquote style="margin: 1em 0; padding: 0.8em 1em; background-color: #f7fafc; border-left: 4px solid #a0aec0; color: #718096;">${quote}</blockquote>`;
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