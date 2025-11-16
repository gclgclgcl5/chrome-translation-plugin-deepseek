// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request.text, request.targetLang)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放以支持异步响应
  }
});

// 处理翻译请求
async function handleTranslation(text, targetLang) {
  try {
    // 从storage读取API key
    const result = await chrome.storage.sync.get(['deepseekApiKey']);
    const apiKey = result.deepseekApiKey;
    
    if (!apiKey) {
      return {
        success: false,
        error: '请先在插件设置中配置DeepSeek API Key'
      };
    }
    
    // 构建翻译提示词
    const targetLanguage = targetLang === 'zh' ? '中文' : '英文';
    const prompt = `请将以下文本翻译成${targetLanguage}，只返回翻译结果，不要添加任何解释：\n\n${text}`;
    
    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    const translation = data.choices[0].message.content.trim();
    
    return {
      success: true,
      translation: translation
    };
    
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: error.message || '翻译请求失败'
    };
  }
}

