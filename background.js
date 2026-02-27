// Jira Story Point Filler - Background Service Worker
console.log('[Jira Filler] Background service worker loaded');

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Jira Filler] Received message:', request);

  if (request.action === 'updateIssue') {
    handleUpdateIssue(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开启以支持异步响应
  }

  if (request.action === 'extractAuth') {
    handleExtractAuth(sender.tab.url)
      .then(auth => sendResponse({ success: true, data: auth }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// 处理任务更新
async function handleUpdateIssue(data) {
  console.log('[Jira Filler] Updating issue:', data);
  // TODO: 实现 API 调用
  return { issueId: data.issueId, updated: true };
}

// 提取认证信息
async function handleExtractAuth(url) {
  console.log('[Jira Filler] Extracting auth from:', url);
  // TODO: 实现认证信息提取
  return { method: 'cookie', token: 'placeholder' };
}
