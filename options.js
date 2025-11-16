// 页面加载时读取已保存的API Key
document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');
  
  // 读取已保存的API Key
  try {
    const result = await chrome.storage.sync.get(['deepseekApiKey']);
    if (result.deepseekApiKey) {
      apiKeyInput.value = result.deepseekApiKey;
    }
  } catch (error) {
    console.error('读取API Key失败:', error);
  }
  
  // 保存按钮点击事件
  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('请输入API Key', 'error');
      return;
    }
    
    try {
      // 保存到chrome.storage
      await chrome.storage.sync.set({ deepseekApiKey: apiKey });
      showStatus('设置保存成功！', 'success');
    } catch (error) {
      showStatus('保存失败: ' + error.message, 'error');
    }
  });
  
  // 显示状态消息
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // 3秒后自动隐藏
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});

