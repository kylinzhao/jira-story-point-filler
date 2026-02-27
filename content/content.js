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
  console.log('[Jira Filler] FAB clicked');
  // TODO: 实现任务检查逻辑
  alert('插件已激活!即将实现任务检查功能。');
}
