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
    // 移除最后一个空行（如果存在）
    if (lines[lines.length - 1].trim() === '') {
      lines.pop();
    }
    
    const lineNumbers = lines
      .map((_, index) => `<span class="line-number">${index + 1}</span>`)
      .join('');
    
    // 添加语言类名
    const languageClass = language ? ` language-${language}` : '';
    
    // 使用 highlight.js 处理代码
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
    
    return `<div class="code-block">
              <div class="line-numbers">${lineNumbers}</div>
              <div class="code-content">
                <pre><code class="hljs${languageClass}">${highlightedCode}</code></pre>
              </div>
            </div>`;
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

  copyBtn.addEventListener('click', function() {
    const tempDiv = document.createElement('div');
    tempDiv.contentEditable = true;
    document.body.appendChild(tempDiv);
    
    // 复制前移除行号
    const previewContent = preview.cloneNode(true);
    previewContent.querySelectorAll('.line-numbers').forEach(el => el.remove());
    previewContent.querySelectorAll('.code-block').forEach(el => {
      const codeContent = el.querySelector('.code-content');
      if (codeContent) {
        el.parentNode.replaceChild(codeContent, el);
      }
    });
    
    tempDiv.innerHTML = previewContent.innerHTML;
    
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
      document.execCommand('copy');
      alert('内容已复制到剪贴板！');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请重试');
    }
    
    document.body.removeChild(tempDiv);
    selection.removeAllRanges();
  });
}); 