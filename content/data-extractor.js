// Jira Story Point Filler - Data Extractor

/**
 * 从页面提取任务列表数据
 */
function extractTasksFromPage() {
  console.log('[Jira Filler] Extracting tasks from page...');

  // 尝试找到任务表格
  // 根据截图,任务数据在表格中
  const tableRows = document.querySelectorAll('table[data-entity-id] tr, .ghx-issues tr, table tr');

  if (tableRows.length === 0) {
    console.error('[Jira Filler] No table rows found');
    return [];
  }

  const tasks = [];
  let headerColumns = [];

  // 首先找到表头,确定列的索引
  tableRows.forEach((row, index) => {
    const isHeader = row.querySelector('th') || row.classList.contains('ghx-column-header');

    if (isHeader) {
      // 提取表头列名
      const headers = row.querySelectorAll('th, td');
      headerColumns = Array.from(headers).map(h => h.textContent.trim());
      console.log('[Jira Filler] Found headers:', headerColumns);

      // 查找关键字段的索引
      const feStoryPointsIndex = headerColumns.findIndex(h =>
        h.includes('FE Story Points') || h.includes('前端故事点')
      );
      const storyPointsIndex = headerColumns.findIndex(h =>
        h.includes('故事点') && !h.includes('FE')
      );

      console.log('[Jira Filler] FE Story Points index:', feStoryPointsIndex);
      console.log('[Jira Filler] Story Points index:', storyPointsIndex);
    }
  });

  // 提取任务数据
  tableRows.forEach((row, index) => {
    // 跳过表头
    if (row.querySelector('th') || row.classList.contains('ghx-column-header')) {
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

    // 根据表头索引提取字段
    const feStoryPointsIndex = headerColumns.findIndex(h =>
      h.includes('FE Story Points') || h.includes('前端故事点')
    );
    const storyPointsIndex = headerColumns.findIndex(h =>
      h.includes('故事点') && !h.includes('FE')
    );

    let feStoryPoints = null;
    let storyPoints = null;

    if (feStoryPointsIndex >= 0 && columns[feStoryPointsIndex]) {
      feStoryPoints = columns[feStoryPointsIndex].textContent.trim();
    }

    if (storyPointsIndex >= 0 && columns[storyPointsIndex]) {
      storyPoints = columns[storyPointsIndex].textContent.trim();
    }

    const task = {
      issueId,
      title,
      feStoryPoints: feStoryPoints || '',
      storyPoints: storyPoints || '',
      rowIndex: index
    };

    console.log('[Jira Filler] Extracted task:', task);
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
