// Jira Story Point Filler - Auth Extractor

/**
 * 尝试从页面提取认证信息
 */
async function extractAuthInfo() {
  console.log('[Jira Filler] Extracting auth info...');

  const methods = {
    cookie: extractCookieAuth(),
    localStorage: extractLocalStorageAuth(),
    sessionStorage: extractSessionStorageAuth()
  };

  console.log('[Jira Filler] Auth extraction results:', methods);

  // 返回第一个成功的方法
  for (const [method, data] of Object.entries(methods)) {
    if (data && data.token) {
      console.log('[Jira Filler] Using auth method:', method);
      return { method, ...data };
    }
  }

  console.warn('[Jira Filler] No auth info found');
  return null;
}

/**
 * 从 Cookie 提取认证信息
 */
function extractCookieAuth() {
  const cookies = document.cookie;

  // 常见的 Jira session cookie 名称
  const sessionKeys = [
    'JSESSIONID',
    'atlassian.xsrf.token',
    'seraph.rememberme.cookie'
  ];

  for (const key of sessionKeys) {
    const match = cookies.match(`${key}=([^;]+)`);
    if (match) {
      console.log(`[Jira Filler] Found cookie: ${key}`);
      return {
        type: 'cookie',
        token: match[1],
        cookieName: key
      };
    }
  }

  return null;
}

/**
 * 从 LocalStorage 提取认证信息
 */
function extractLocalStorageAuth() {
  try {
    // 常见的 Jira localStorage 键
    const keys = [
      'jira.auth.token',
      'jira.session.token',
      'user.token'
    ];

    for (const key of keys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`[Jira Filler] Found localStorage token: ${key}`);
        return {
          type: 'localStorage',
          token: token,
          key: key
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Jira Filler] Error reading localStorage:', error);
    return null;
  }
}

/**
 * 从 SessionStorage 提取认证信息
 */
function extractSessionStorageAuth() {
  try {
    const keys = [
      'jira.auth.token',
      'jira.session.token'
    ];

    for (const key of keys) {
      const token = sessionStorage.getItem(key);
      if (token) {
        console.log(`[Jira Filler] Found sessionStorage token: ${key}`);
        return {
          type: 'sessionStorage',
          token: token,
          key: key
        };
      }
    }

    return null;
  } catch (error) {
    console.error('[Jira Filler] Error reading sessionStorage:', error);
    return null;
  }
}

/**
 * 获取当前页面的 Cookie 字符串(用于 API 请求)
 */
function getCookieString() {
  return document.cookie;
}

/**
 * 获取 CSRF Token (如果存在)
 */
function getCsrfToken() {
  // 从 meta 标签获取
  const metaTag = document.querySelector('meta[name="atlassian-token"]');
  if (metaTag) {
    return metaTag.content;
  }

  // 从 cookie 获取
  const match = document.cookie.match('atlassian.xsrf.token=([^;]+)');
  if (match) {
    return match[1];
  }

  return null;
}
