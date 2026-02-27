// Jira Story Point Filler - Background Service Worker
console.log('[Jira Filler] Background service worker loaded');

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Jira Filler] Received message:', request);

  if (request.action === 'updateIssue') {
    handleUpdateIssue(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'batchUpdate') {
    handleBatchUpdate(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// 处理单个任务更新
async function handleUpdateIssue(data) {
  console.log('[Jira Filler] Updating issue:', data);

  const { issueId, feStoryPoints, auth, cookie, csrfToken } = data;

  try {
    // 构造 API 请求
    const apiUrl = `https://cjira.guazi-corp.com/rest/api/2/issue/${issueId}`;

    // 注意:需要知道故事点字段的实际 ID
    // 这里使用占位符,需要根据实际情况调整
    const requestBody = {
      fields: {
        // 常见的 Jira 故事点字段 ID
        // customfield_10101, customfield_10102 等
        // 需要根据实际情况确定
        'customfield_10101': feStoryPoints
      }
    };

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Atlassian-Token': csrfToken || 'no-check',
        'Cookie': cookie
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    console.log('[Jira Filler] Issue updated successfully:', issueId);
    return { issueId, success: true };
  } catch (error) {
    console.error('[Jira Filler] Error updating issue:', error);
    throw error;
  }
}

// 处理批量更新
async function handleBatchUpdate(data) {
  console.log('[Jira Filler] Batch updating issues:', data.tasks.length);

  const results = [];
  const errors = [];

  for (const task of data.tasks) {
    try {
      const result = await handleUpdateIssue({
        ...task,
        auth: data.auth,
        cookie: data.cookie,
        csrfToken: data.csrfToken
      });
      results.push(result);
    } catch (error) {
      console.error('[Jira Filler] Failed to update:', task.issueId, error);
      errors.push({ task: task.issueId, error: error.message });
    }

    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return {
    total: data.tasks.length,
    succeeded: results.length,
    failed: errors.length,
    results,
    errors
  };
}
