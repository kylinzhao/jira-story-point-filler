// Jira Story Point Filler - Data Extractor

/**
 * 从页面提取任务列表数据
 */
function extractTasksFromPage() {
  console.log('[Jira Filler] Extracting tasks from page...');

  // 尝试找到任务表格
  // 根据截图,任务数据在表格中
  const tables = document.querySelectorAll('table');
  console.log(`[Jira Filler] Found ${tables.length} tables`);

  if (tables.length === 0) {
    console.error('[Jira Filler] No tables found');
    return [];
  }

  const tasks = [];
  let validTable = null;
  let headerColumns = [];
  let feStoryPointsIndex = -1;
  let storyPointsIndex = -1;

  // 找到包含"故事点"和"FE Story Points"列的表格
  for (const table of tables) {
    const headers = table.querySelectorAll('th');
    headerColumns = Array.from(headers).map(h => h.textContent.trim());

    feStoryPointsIndex = headerColumns.findIndex(h =>
      h.includes('FE Story Points') || h.includes('前端故事点')
    );
    storyPointsIndex = headerColumns.findIndex(h =>
      h.includes('故事点') && !h.includes('FE')
    );

    // 只使用同时包含两个字段的表格
    if (feStoryPointsIndex >= 0 && storyPointsIndex >= 0) {
      validTable = table;
      console.log('[Jira Filler] Found valid table with headers:', headerColumns);
      console.log('[Jira Filler] FE Story Points index:', feStoryPointsIndex);
      console.log('[Jira Filler] Story Points index:', storyPointsIndex);
      break;
    }
  }

  if (!validTable) {
    console.error('[Jira Filler] No valid table found with both field columns');
    return [];
  }

  // 提取表格中的所有数据行
  const tableRows = validTable.querySelectorAll('tr');

  // 提取任务数据
  tableRows.forEach((row, index) => {
    // 跳过表头
    if (row.querySelector('th')) {
      return;
    }

    const columns = row.querySelectorAll('td');
    if (columns.length === 0) return;

    // 提取任务 ID (通常在第一列或链接中)
    const firstColumn = columns[0];
    const link = firstColumn.querySelector('a');
    const issueIdMatch = link?.href.match(/([A-Z]+-\d+)/);
    const issueId = issueIdMatch ? issueIdMatch[1] : null;

    if (!issueId) {
      console.log('[Jira Filler] Skipping row without issue ID:', index);
      return;
    }

    // 提取任务标题
    const title = link?.textContent.trim() || firstColumn.textContent.trim();

    let feStoryPoints = '';
    let storyPoints = '';

    // 使用找到的索引提取字段值
    if (feStoryPointsIndex >= 0 && columns[feStoryPointsIndex]) {
      feStoryPoints = columns[feStoryPointsIndex].textContent.trim();
    }

    if (storyPointsIndex >= 0 && columns[storyPointsIndex]) {
      storyPoints = columns[storyPointsIndex].textContent.trim();
    }

    // 调试:显示原始值
    console.log(`[Jira Filler] Row ${index}: issueId=${issueId}, feSP="${feStoryPoints}", sp="${storyPoints}"`);

    const task = {
      issueId,
      title,
      feStoryPoints,
      storyPoints,
      rowIndex: index
    };

    tasks.push(task);
  });

  console.log('[Jira Filler] Total tasks extracted:', tasks.length);
  return tasks;
}

/**
 * 过滤需要更新的任务
 * FE Story Points 有值,且故事点为空
 */
function filterTasksNeedingUpdate(tasks) {
  return tasks.filter(task => {
    const hasFePoints = task.feStoryPoints && task.feStoryPoints !== '' && task.feStoryPoints !== '-';
    const isEmptyStoryPoints = !task.storyPoints || task.storyPoints === '' || task.storyPoints === '-';

    return hasFePoints && isEmptyStoryPoints;
  });
}

/**
 * 调试函数:在控制台显示提取的数据
 */
function debugExtractTasks() {
  const allTasks = extractTasksFromPage();
  const tasksToUpdate = filterTasksNeedingUpdate(allTasks);

  console.log('=== Jira Filler Debug ===');
  console.log('Total tasks:', allTasks.length);
  console.log('Tasks needing update:', tasksToUpdate.length);
  console.log('Tasks to update:', tasksToUpdate);

  return { allTasks, tasksToUpdate };
}

/**
 * 调试:识别页面上的所有字段
 */
function debugIdentifyFields() {
  console.log('=== Jira Filler - Field Identification ===');

  // 查找所有表格
  const tables = document.querySelectorAll('table');
  console.log(`Found ${tables.length} tables`);

  tables.forEach((table, index) => {
    console.log(`\n--- Table ${index} ---`);

    const headers = table.querySelectorAll('th');
    const headerNames = Array.from(headers).map(h => h.textContent.trim());
    console.log('Headers:', headerNames);
  });

  // 查找所有可能包含任务数据的行
  const allRows = document.querySelectorAll('table tr');
  console.log(`\nTotal rows in all tables: ${allRows.length}`);

  // 显示前几行的内容
  console.log('\nFirst 5 rows:');
  Array.from(allRows).slice(0, 5).forEach((row, i) => {
    const cells = row.querySelectorAll('td');
    const cellTexts = Array.from(cells).map(c => c.textContent.trim().substring(0, 30));
    console.log(`Row ${i}:`, cellTexts);
  });

  // 查找所有包含数字的列(可能是故事点)
  console.log('\n--- Searching for Story Point Fields ---');
  const allCells = document.querySelectorAll('table td');
  const numberPattern = /^[\d.]+$/;

  allCells.forEach(cell => {
    const text = cell.textContent.trim();
    if (numberPattern.test(text)) {
      const header = cell.closest('table')?.querySelector('th');
      const colIndex = Array.from(cell.parentNode.children).indexOf(cell);
      console.log(`Found number cell: "${text}" at column ${colIndex}`);
    }
  });
}

/**
 * 调试:显示所有 Cookie
 */
function debugShowCookies() {
  console.log('=== Cookies ===');
  console.log(document.cookie);
}

/**
 * 调试:显示所有 localStorage 和 sessionStorage
 */
function debugShowStorage() {
  console.log('=== LocalStorage ===');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)}`);
  }

  console.log('\n=== SessionStorage ===');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    console.log(`${key}: ${sessionStorage.getItem(key)}`);
  }
}

// 将调试函数暴露到全局作用域,方便在控制台调用
window.jiraFillerDebug = {
  identifyFields: debugIdentifyFields,
  showCookies: debugShowCookies,
  showStorage: debugShowStorage,
  extractTasks: () => {
    const { allTasks, tasksToUpdate } = debugExtractTasks();
    console.log('All tasks:', allTasks);
    console.log('Tasks to update:', tasksToUpdate);
    return { allTasks, tasksToUpdate };
  },
  auth: async () => {
    const auth = await extractAuthInfo();
    console.log('Auth info:', auth);
    return auth;
  }
};

console.log('[Jira Filler] Debug tools available at window.jiraFillerDebug');
