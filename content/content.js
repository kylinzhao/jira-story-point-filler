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

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    showActionMenu();
  });

  document.body.appendChild(button);
  button.style.display = 'flex';

  console.log('[Jira Filler] Floating button created');

  // 点击其他地方关闭菜单
  document.addEventListener('click', () => {
    hideActionMenu();
  });
}

// 显示功能菜单
function showActionMenu() {
  // 如果菜单已存在,先移除
  hideActionMenu();

  const menu = document.createElement('div');
  menu.id = 'jira-filler-menu';
  menu.innerHTML = `
    <div class="menu-title">🚀 Jira 故事点工具</div>
    <div class="menu-item" data-action="update">
      <span class="menu-icon">⚡</span>
      <div class="menu-text">
        <div class="menu-title-text">更新故事点</div>
        <div class="menu-desc">将 FE Story Points 填充到故事点字段</div>
      </div>
    </div>
    <div class="menu-item" data-action="copy">
      <span class="menu-icon">📋</span>
      <div class="menu-text">
        <div class="menu-title-text">复制未填写需求</div>
        <div class="menu-desc">复制 FE Story Points 为空的需求列表</div>
      </div>
    </div>
  `;

  // 计算菜单位置
  const fab = document.getElementById('jira-filler-fab');
  const fabRect = fab.getBoundingClientRect();

  // 菜单应该显示在按钮上方
  const menuTop = fabRect.top - 10; // 按钮上方 10px

  menu.style.cssText = `
    position: fixed;
    top: ${menuTop}px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 8px;
    min-width: 280px;
    z-index: 10001;
    animation: slideUp 0.2s ease-out;
    transform-origin: bottom right;
  `;

  // 添加点击事件
  const menuItems = menu.querySelectorAll('.menu-item');
  console.log('[Jira Filler] Menu created with', menuItems.length, 'items');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = item.getAttribute('data-action');
      console.log('[Jira Filler] Menu item clicked:', action);
      hideActionMenu();

      if (action === 'update') {
        handleUpdateStoryPoints();
      } else if (action === 'copy') {
        handleCopyEmptyFePoints();
      }
    });
  });

  document.body.appendChild(menu);
  console.log('[Jira Filler] Menu appended to body at position:', menuTop);
}

// 隐藏功能菜单
function hideActionMenu() {
  const menu = document.getElementById('jira-filler-menu');
  if (menu) {
    menu.remove();
  }
}

// 处理更新故事点
async function handleUpdateStoryPoints() {
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
      showResultDialog(response.data, tasksToUpdate);
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
function showResultDialog(result, tasksToUpdate) {
  let message = `✨ 更新完成!\n\n` +
    `📊 统计信息:\n` +
    `• 总计: ${result.total}\n` +
    `• 成功: ${result.succeeded} ✅\n` +
    `• 失败: ${result.failed} ❌`;

  // 显示成功更新的任务列表
  if (result.succeeded > 0 && result.results && result.results.length > 0) {
    message += `\n\n✅ 成功更新的任务:\n`;
    const successList = result.results.map((r, i) =>
      `${i + 1}. ${r.issueId}`
    ).join('\n');
    message += successList;
  }

  // 在控制台输出详细结果
  console.log('[Jira Filler] Update result:', result);

  if (result.errors.length > 0) {
    const errorList = result.errors.map(e => `- ${e.task}: ${e.error}`).join('\n');
    console.error('[Jira Filler] Failed tasks:', result.errors);
    message += '\n\n❌ 失败任务:\n' + errorList;
  }

  alert(message);

  // 刷新页面以显示更新后的数据
  if (result.succeeded > 0) {
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
}

// 显示错误对话框
function showErrorDialog(error) {
  // 在控制台输出详细错误
  console.error('[Jira Filler] Error occurred:', error);
  console.error('[Jira Filler] Error stack:', new Error().stack);

  alert('更新失败!\n\n错误信息: ' + error + '\n\n(详细信息已输出到控制台,请按 F12 查看)');
}

// 显示认证错误对话框
function showAuthErrorDialog() {
  alert('无法获取认证信息!\n\n' +
    '请确保:\n' +
    '1. 您已登录 Jira\n' +
    '2. 页面已完全加载\n\n' +
    '如果问题持续,请联系管理员。');
}

// 处理复制未填写 FE Story Points 的需求
async function handleCopyEmptyFePoints() {
  console.log('[Jira Filler] Copying tasks without FE Story Points...');

  try {
    showLoadingIndicator();

    // 提取所有任务
    const { allTasks } = debugExtractTasks();

    hideLoadingIndicator();

    // 过滤出 FE Story Points 为空的任务
    const emptyFeTasks = allTasks.filter(task => {
      const hasNoFePoints = !task.feStoryPoints ||
                           task.feStoryPoints === '' ||
                           task.feStoryPoints === '-';
      return hasNoFePoints;
    });

    if (emptyFeTasks.length === 0) {
      alert('✅ 所有任务都已填写 FE Story Points!\n\n无需复制。');
      return;
    }

    // 格式化复制内容
    const copyText = emptyFeTasks.map(task =>
      `${task.issueId} - ${task.title}`
    ).join('\n');

    // 复制到剪贴板
    await navigator.clipboard.writeText(copyText);

    // 显示成功提示
    const message = `✅ 已复制 ${emptyFeTasks.length} 个未填写 FE Story Points 的需求\n\n` +
                    `📋 格式: 任务ID - 任务名称\n\n` +
                    `预览前 5 个:\n${emptyFeTasks.slice(0, 5).map(t => `• ${t.issueId} - ${t.title}`).join('\n')}` +
                    (emptyFeTasks.length > 5 ? `\n... 还有 ${emptyFeTasks.length - 5} 个` : '');

    alert(message);
    console.log('[Jira Filler] Copied tasks:', emptyFeTasks);
  } catch (error) {
    hideLoadingIndicator();
    console.error('[Jira Filler] Error copying tasks:', error);
    alert('复制失败!\n\n错误信息: ' + error.message);
  }
}
