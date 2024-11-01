chrome.action.onClicked.addListener((tab) => {
  // 获取屏幕尺寸
  const width = 650;
  const height = 800;
  
  // 获取当前屏幕的尺寸
  chrome.windows.getCurrent((window) => {
    const left = Math.round((window.width - width) / 2 + window.left);
    const top = Math.round((window.height - height) / 2 + window.top);
    
    chrome.windows.create({
      url: 'popup.html',
      type: 'popup',
      width: width,
      height: height,
      left: left,
      top: top,
      focused: true
    });
  });
}); 