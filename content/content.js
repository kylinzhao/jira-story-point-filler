// Jira Story Point Filler - Content Script
console.log('[Jira Filler] Content script loaded');

// 检测页面是否为目标 Jira 看板
function isTargetDashboard() {
  return window.location.href.includes('cjira.guazi-corp.com/secure/Dashboard.jspa');
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

function initialize() {
  console.log('[Jira Filler] Initializing...');
  if (!isTargetDashboard()) {
    console.log('[Jira Filler] Not a target dashboard, skipping');
    return;
  }

  console.log('[Jira Filler] Target dashboard detected');

  // 延迟一点以确保页面完全加载
  setTimeout(() => {
    createFloatingButton();
  }, 1000);
}

// 创建浮动按钮
function createFloatingButton() {
  // 检查按钮是否已存在
  if (document.getElementById('jira-filler-fab')) {
    return;
  }

  const button = document.createElement('div');
  button.id = 'jira-filler-fab';
  button.innerHTML = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
    </svg>
  `;
  button.title = '检查并填充故事点';

  button.addEventListener('click', handleFabClick);

  document.body.appendChild(button);
  button.style.display = 'flex';

  console.log('[Jira Filler] Floating button created');
}

// 处理按钮点击
async function handleFabClick() {
  console.log('[Jira Filler] FAB clicked, starting process...');

  try {
    // 显示加载提示
    showLoadingIndicator();

    // 提取认证信息
    const authInfo = await extractAuthInfo();

    if (!authInfo) {
      hideLoadingIndicator();
      showAuthErrorDialog();
      return;
    }

    // 提取任务数据
    const { allTasks, tasksToUpdate } = debugExtractTasks();

    hideLoadingIndicator();

    if (tasksToUpdate.length === 0) {
      alert('没有找到需要更新的任务!\n\n所有任务的故事点字段都已填充。');
      return;
    }

    // 显示确认对话框
    const confirmed = showConfirmDialog(tasksToUpdate, authInfo.method);

    if (!confirmed) {
      console.log('[Jira Filler] User cancelled');
      return;
    }

    // 执行更新
    console.log('[Jira Filler] Starting batch update...');
    showProgressIndicator(0, tasksToUpdate.length);

    const updateData = {
      tasks: tasksToUpdate,
      auth: authInfo,
      cookie: getCookieString(),
      csrfToken: getCsrfToken()
    };

    // 调用 background script
    const response = await chrome.runtime.sendMessage({
      action: 'batchUpdate',
      data: updateData
    });

    hideProgressIndicator();

    if (response.success) {
      showResultDialog(response.data);
    } else {
      showErrorDialog(response.error);
    }

  } catch (error) {
    hideLoadingIndicator();
    hideProgressIndicator();
    console.error('[Jira Filler] Error:', error);
    showErrorDialog(error.message);
  }
}

// 显示加载指示器
function showLoadingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'jira-filler-loading';
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    z-index: 10000;
  `;
  indicator.textContent = '正在分析任务...';
  document.body.appendChild(indicator);
}

// 隐藏加载指示器
function hideLoadingIndicator() {
  const indicator = document.getElementById('jira-filler-loading');
  if (indicator) {
    indicator.remove();
  }
}

// 显示确认对话框
function showConfirmDialog(tasks, authMethod) {
  const taskList = tasks.map((t, i) =>
    `${i + 1}. [${t.issueId}] ${t.title}\n   ${t.feStoryPoints} → ${t.feStoryPoints}`
  ).join('\n\n');

  const message = `找到 ${tasks.length} 个需要更新的任务\n\n` +
    `认证方式: ${authMethod}\n\n` +
    `${taskList}\n\n` +
    `是否继续更新?`;

  return confirm(message);
}

// 显示进度指示器
function showProgressIndicator(current, total) {
  let indicator = document.getElementById('jira-filler-progress');

  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'jira-filler-progress';
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 10000;
      min-width: 300px;
    `;
    document.body.appendChild(indicator);
  }

  indicator.textContent = `正在更新任务... ${current}/${total}`;
}

// 隐藏进度指示器
function hideProgressIndicator() {
  const indicator = document.getElementById('jira-filler-progress');
  if (indicator) {
    indicator.remove();
  }
}

// 显示结果对话框
function showResultDialog(result) {
  const message = `更新完成!\n\n` +
    `总计: ${result.total}\n` +
    `成功: ${result.succeeded}\n` +
    `失败: ${result.failed}`;

  if (result.errors.length > 0) {
    const errorList = result.errors.map(e => `- ${e.task}: ${e.error}`).join('\n');
    alert(message + '\n\n失败任务:\n' + errorList);
  } else {
    alert(message);
  }

  // 刷新页面以显示更新后的数据
  if (result.succeeded > 0) {
    setTimeout(() => {
      location.reload();
    }, 2000);
  }
}

// 显示错误对话框
function showErrorDialog(error) {
  alert('更新失败!\n\n错误信息: ' + error);
}

// 显示认证错误对话框
function showAuthErrorDialog() {
  alert('无法获取认证信息!\n\n' +
    '请确保:\n' +
    '1. 您已登录 Jira\n' +
    '2. 页面已完全加载\n\n' +
    '如果问题持续,请联系管理员。');
}
