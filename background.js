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
    // 从存储中获取字段 ID 配置
    const config = await getStoredConfig();

    // 构造 API 请求
    const apiUrl = `https://cjira.guazi-corp.com/rest/api/2/issue/${issueId}`;

    const requestBody = {
      fields: {}
    };

    // 使用配置的字段 ID,如果没有配置则使用默认值
    const fieldId = config.storyPointFieldId || 'customfield_10110';
    requestBody.fields[fieldId] = feStoryPoints;

    console.log('[Jira Filler] API Request:', {
      url: apiUrl,
      method: 'PUT',
      fieldId,
      feStoryPoints,
      requestBody
    });

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Atlassian-Token': csrfToken || 'no-check',
        'Cookie': cookie
      },
      body: JSON.stringify(requestBody)
    });

    console.log('[Jira Filler] API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Jira Filler] API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    console.log('[Jira Filler] Issue updated successfully:', issueId);
    return { issueId, success: true };
  } catch (error) {
    console.error('[Jira Filler] Error updating issue:', issueId, error);
    console.error('[Jira Filler] Error stack:', error.stack);
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

// 获取存储的配置
async function getStoredConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['storyPointFieldId', 'apiToken'], (result) => {
      resolve({
        storyPointFieldId: result.storyPointFieldId || '',
        apiToken: result.apiToken || ''
      });
    });
  });
}
