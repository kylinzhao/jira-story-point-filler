// Jira Filler - Config Page

document.addEventListener('DOMContentLoaded', () => {
  // 加载已保存的配置
  loadConfig();

  // 保存按钮
  document.getElementById('saveBtn').addEventListener('click', saveConfig);
});

// 加载配置
function loadConfig() {
  chrome.storage.local.get(['storyPointFieldId', 'apiToken'], (result) => {
    if (result.storyPointFieldId) {
      document.getElementById('storyPointFieldId').value = result.storyPointFieldId;
    }
    if (result.apiToken) {
      document.getElementById('apiToken').value = result.apiToken;
    }
  });
}

// 保存配置
function saveConfig() {
  const storyPointFieldId = document.getElementById('storyPointFieldId').value.trim();
  const apiToken = document.getElementById('apiToken').value.trim();

  chrome.storage.local.set({
    storyPointFieldId,
    apiToken
  }, () => {
    showStatus('配置已保存!', 'success');
  });
}

// 显示状态消息
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';

  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
