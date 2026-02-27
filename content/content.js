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
function handleFabClick() {
  console.log('[Jira Filler] FAB clicked, extracting tasks...');

  try {
    const { allTasks, tasksToUpdate } = debugExtractTasks();

    if (tasksToUpdate.length === 0) {
      alert('没有找到需要更新的任务!\n\n所有任务的故事点字段都已填充。');
      return;
    }

    // 显示确认对话框
    const message = `找到 ${tasksToUpdate.length} 个需要更新的任务:\n\n` +
      tasksToUpdate.map((t, i) =>
        `${i + 1}. [${t.issueId}] ${t.title}\n   FE Story Points: ${t.feStoryPoints} → 故事点: ${t.feStoryPoints}`
      ).join('\n\n') +
      '\n\n是否继续更新?';

    if (confirm(message)) {
      console.log('[Jira Filler] User confirmed update');
      // TODO: 调用更新逻辑
      alert('即将开始更新...\n(功能开发中)');
    } else {
      console.log('[Jira Filler] User cancelled');
    }
  } catch (error) {
    console.error('[Jira Filler] Error:', error);
    alert('提取任务数据时出错:\n' + error.message);
  }
}
