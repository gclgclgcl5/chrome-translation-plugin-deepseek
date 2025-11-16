// 悬浮工具栏元素
let toolbar = null;
let translationResult = null;
let selectedText = '';
let targetLang = 'en'; // 默认翻译目标语言

// 创建悬浮工具栏
function createToolbar() {
  if (toolbar) return;

  // 创建工具栏容器
  toolbar = document.createElement('div');
  toolbar.id = 'text-assistant-toolbar';
  toolbar.className = 'text-assistant-toolbar';
  
  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'toolbar-buttons';
  
  // 翻译按钮
  const translateBtn = document.createElement('button');
  translateBtn.className = 'toolbar-btn translate-btn';
  translateBtn.innerHTML = '🌐 翻译';
  translateBtn.onclick = handleTranslate;
  
  // 语言切换按钮
  const langSwitchBtn = document.createElement('button');
  langSwitchBtn.className = 'toolbar-btn lang-switch-btn';
  langSwitchBtn.id = 'lang-switch-btn';
  langSwitchBtn.innerHTML = '→ EN';
  langSwitchBtn.onclick = toggleTargetLanguage;
  
  // 朗读按钮
  const speakBtn = document.createElement('button');
  speakBtn.className = 'toolbar-btn speak-btn';
  speakBtn.innerHTML = '🔊 朗读';
  speakBtn.onclick = handleSpeak;
  
  buttonContainer.appendChild(translateBtn);
  buttonContainer.appendChild(langSwitchBtn);
  buttonContainer.appendChild(speakBtn);
  toolbar.appendChild(buttonContainer);
  
  // 创建翻译结果区域
  translationResult = document.createElement('div');
  translationResult.className = 'translation-result';
  translationResult.style.display = 'none';
  toolbar.appendChild(translationResult);
  
  document.body.appendChild(toolbar);
}

// 检测文本语言
function detectLanguage(text) {
  // 检测是否包含中文字符
  const chineseRegex = /[\u4e00-\u9fa5]/;
  return chineseRegex.test(text) ? 'zh' : 'en';
}

// 显示工具栏
function showToolbar(x, y, text) {
  if (!toolbar) createToolbar();
  
  selectedText = text.trim();
  if (!selectedText) return;
  
  // 自动检测语言并设置翻译目标
  const sourceLang = detectLanguage(selectedText);
  targetLang = sourceLang === 'zh' ? 'en' : 'zh';
  updateLanguageButton();
  
  // 隐藏之前的翻译结果
  translationResult.style.display = 'none';
  translationResult.innerHTML = '';
  
  // 计算位置
  const toolbarHeight = 50;
  const padding = 10;
  
  let top = y - toolbarHeight - padding;
  let left = x;
  
  // 边界检查
  if (top < 0) {
    top = y + padding;
  }
  
  if (left + 300 > window.innerWidth) {
    left = window.innerWidth - 310;
  }
  
  if (left < 0) {
    left = 10;
  }
  
  toolbar.style.top = `${top + window.scrollY}px`;
  toolbar.style.left = `${left + window.scrollX}px`;
  toolbar.style.display = 'block';
}

// 隐藏工具栏
function hideToolbar() {
  if (toolbar) {
    toolbar.style.display = 'none';
  }
}

// 更新语言切换按钮显示
function updateLanguageButton() {
  const langBtn = document.getElementById('lang-switch-btn');
  if (langBtn) {
    langBtn.innerHTML = targetLang === 'zh' ? '→ 中文' : '→ EN';
  }
}

// 切换翻译目标语言
function toggleTargetLanguage() {
  targetLang = targetLang === 'zh' ? 'en' : 'zh';
  updateLanguageButton();
}

// 处理翻译
async function handleTranslate() {
  if (!selectedText) return;
  
  // 显示加载状态
  translationResult.style.display = 'block';
  translationResult.innerHTML = '<div class="loading">翻译中...</div>';
  
  try {
    // 发送消息给background script
    const response = await chrome.runtime.sendMessage({
      action: 'translate',
      text: selectedText,
      targetLang: targetLang
    });
    
    if (response.success) {
      translationResult.innerHTML = `<div class="result-text">${response.translation}</div>`;
    } else {
      translationResult.innerHTML = `<div class="error">${response.error || '翻译失败'}</div>`;
    }
  } catch (error) {
    translationResult.innerHTML = `<div class="error">翻译出错: ${error.message}</div>`;
  }
}

// 处理朗读
function handleSpeak() {
  if (!selectedText) return;
  
  // 停止之前的朗读
  speechSynthesis.cancel();
  
  // 创建语音合成实例
  const utterance = new SpeechSynthesisUtterance(selectedText);
  
  // 根据文本语言设置语音
  const textLang = detectLanguage(selectedText);
  utterance.lang = textLang === 'zh' ? 'zh-CN' : 'en-US';
  utterance.rate = 1.0; // 语速
  utterance.pitch = 1.0; // 音调
  utterance.volume = 1.0; // 音量
  
  // 开始朗读
  speechSynthesis.speak(utterance);
}

// 监听文本选择
document.addEventListener('mouseup', (e) => {
  // 如果点击在工具栏上，不处理
  if (e.target.closest('#text-assistant-toolbar')) {
    return;
  }
  
  setTimeout(() => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      showToolbar(rect.left + rect.width / 2, rect.top, text);
    } else {
      hideToolbar();
    }
  }, 10);
});

// 监听点击事件，点击其他地方隐藏工具栏
document.addEventListener('mousedown', (e) => {
  if (!e.target.closest('#text-assistant-toolbar')) {
    hideToolbar();
  }
});

// 监听滚动事件，隐藏工具栏
document.addEventListener('scroll', () => {
  hideToolbar();
});

// 初始化
createToolbar();

