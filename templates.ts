import type { UserConfig } from './types.ts';

// HTML页面模板  
export function generateMainPage(content: string, title: string = '电信套餐查询', users: UserConfig[] = [], currentUser: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>${title}</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
            -webkit-tap-highlight-color: transparent;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 20px;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }
        .header h1 {
            font-size: 2.5em;
            font-weight: 300;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        .header .subtitle {
            font-size: 1.1em;
            opacity: 0.9;
            font-weight: 400;
        }
        .content-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
            flex: 1;
            overflow: auto;
        }
        .data-display {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
            font-size: 16px;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
            color: #2c3e50;
            background: #f8f9fa;
            padding: 30px;
            border-radius: 15px;
            border-left: 5px solid #667eea;
            box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
            overflow-x: auto;
        }
        .actions {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            text-align: center;
            min-width: 140px;
            min-height: 50px;
            justify-content: center;
            touch-action: manipulation;
            user-select: none;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.9);
            color: #667eea;
            border: 2px solid rgba(102, 126, 234, 0.3);
        }
        .btn:hover, .btn:active {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        .footer {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            color: white;
            margin-top: 20px;
        }
        .quick-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .quick-link {
            color: rgba(255, 255, 255, 0.9);
            text-decoration: none;
            font-size: 14px;
            padding: 12px 20px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
            min-height: 44px;
            display: flex;
            align-items: center;
            touch-action: manipulation;
        }
        .quick-link:hover, .quick-link:active {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
        }
        .status-info {
            font-size: 12px;
            opacity: 0.8;
        }
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            z-index: 1000;
            touch-action: manipulation;
            user-select: none;
        }
        .refresh-btn:hover, .refresh-btn:active {
            transform: scale(1.1) rotate(180deg);
        }
        
        /* 手机号选择器 */
        .phone-selector {
            position: fixed;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 15px;
            padding: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            transition: all 0.3s ease;
            min-width: 160px;
        }
        .phone-selector.collapsed {
            width: 60px;
            padding: 15px 10px;
        }
        .phone-selector h3 {
            margin: 0 0 15px 0;
            font-size: 14px;
            color: #333;
            text-align: center;
            font-weight: 500;
        }
        .phone-option {
            display: block;
            width: 100%;
            padding: 12px;
            margin: 5px 0;
            background: rgba(102, 126, 234, 0.1);
            border: 2px solid transparent;
            border-radius: 10px;
            text-decoration: none;
            color: #667eea;
            font-size: 13px;
            font-weight: 500;
            text-align: center;
            transition: all 0.2s ease;
            cursor: pointer;
            min-height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            touch-action: manipulation;
        }
        .phone-option:hover, .phone-option:active {
            background: rgba(102, 126, 234, 0.2);
            border-color: #667eea;
            transform: translateX(3px);
        }
        .phone-option.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
        }
        .phone-option.collapsed {
            padding: 8px;
            font-size: 12px;
        }
        .toggle-btn {
            position: absolute;
            right: -15px;
            top: 10px;
            width: 30px;
            height: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            touch-action: manipulation;
        }
        .toggle-btn:hover, .toggle-btn:active {
            transform: scale(1.1);
        }
        
        /* 移动端选择器样式 */
        .mobile-phone-selector {
            display: none;
            width: 100%;
            padding: 15px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(15px);
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .mobile-phone-selector select {
            width: 100%;
            padding: 15px;
            border: 2px solid rgba(102, 126, 234, 0.3);
            border-radius: 10px;
            font-size: 16px;
            background: white;
            color: #333;
            outline: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 12px center;
            background-repeat: no-repeat;
            background-size: 16px;
            padding-right: 40px;
        }
        .mobile-phone-selector select:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        /* 响应式设计 */
        @media (max-width: 768px) {
            body { 
                padding: 15px; 
                font-size: 16px;
            }
            .header h1 { 
                font-size: 2.2em; 
            }
            .header .subtitle {
                font-size: 1.0em;
            }
            .content-card { 
                padding: 25px; 
                border-radius: 15px;
            }
            .data-display { 
                font-size: 15px; 
                padding: 20px;
                overflow-x: auto;
                line-height: 1.6;
                border-radius: 10px;
            }
            .actions { 
                gap: 12px; 
                margin-bottom: 25px;
            }
            .btn { 
                min-width: 130px; 
                font-size: 15px; 
                padding: 14px 24px;
                min-height: 48px;
            }
            .quick-links { 
                gap: 15px; 
            }
            .quick-link {
                font-size: 13px;
                padding: 10px 16px;
                min-height: 44px;
            }
            .refresh-btn {
                bottom: 25px;
                right: 25px;
                width: 56px;
                height: 56px;
                font-size: 22px;
            }
            .phone-selector {
                display: none !important;
            }
            .mobile-phone-selector {
                display: block;
            }
        }
        
        @media (max-width: 480px) {
            body {
                padding: 12px;
                font-size: 17px;
            }
            .header h1 { 
                font-size: 2.0em; 
                line-height: 1.2;
            }
            .header .subtitle {
                font-size: 0.95em;
            }
            .content-card { 
                padding: 20px; 
                border-radius: 12px;
                margin-bottom: 20px;
            }
            .data-display { 
                font-size: 16px; 
                padding: 18px;
                line-height: 1.7;
                word-break: break-all;
            }
            .actions { 
                flex-direction: column; 
                align-items: center; 
                gap: 12px;
                margin-bottom: 20px;
            }
            .btn { 
                width: 100%; 
                max-width: 280px;
                min-height: 50px;
                font-size: 16px;
                padding: 16px 20px;
            }
            .quick-links { 
                flex-direction: column; 
                gap: 10px; 
                align-items: center;
            }
            .quick-link {
                width: 100%;
                max-width: 200px;
                text-align: center;
                justify-content: center;
                min-height: 46px;
                font-size: 14px;
            }
            .refresh-btn {
                bottom: 20px;
                right: 20px;
                width: 52px;
                height: 52px;
                font-size: 20px;
            }
            .footer {
                border-radius: 12px;
                padding: 18px;
            }
            .status-info {
                font-size: 13px;
                line-height: 1.4;
            }
            .mobile-phone-selector {
                padding: 12px;
                margin-bottom: 15px;
            }
            .mobile-phone-selector select {
                padding: 16px;
                font-size: 17px;
            }
        }
        
        /* 超小屏幕优化 */
        @media (max-width: 360px) {
            body {
                padding: 10px;
            }
            .header h1 {
                font-size: 1.8em;
            }
            .content-card {
                padding: 16px;
            }
            .data-display {
                padding: 15px;
                font-size: 15px;
            }
            .btn {
                min-height: 48px;
                font-size: 15px;
            }
        }
        
        /* 高DPI屏幕优化 */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            .data-display {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        }
        
        /* 暗色模式适配 */
        @media (prefers-color-scheme: dark) {
            .content-card {
                background: rgba(30, 30, 30, 0.95);
                color: #e0e0e0;
            }
            .data-display {
                background: #2a2a2a;
                color: #e0e0e0;
                border-left-color: #667eea;
            }
            .mobile-phone-selector select {
                background: #333;
                color: #e0e0e0;
                border-color: rgba(102, 126, 234, 0.5);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📱 ${title}</h1>
            <div class="subtitle">实时查询 · 美观显示 · 多用户支持</div>
        </div>
        
        <!-- 桌面端手机号选择器 -->
        ${users.length > 1 ? `
        <div class="phone-selector" id="phoneSelector">
            <button class="toggle-btn" onclick="toggleSelector()">◀</button>
            <div class="selector-content">
                <h3>选择号码</h3>
                ${users.map(user => `
                    <a href="?phone=${user.phonenum}" 
                       class="phone-option ${currentUser === user.phonenum ? 'active' : ''}"
                       data-phone="${user.phonenum}">
                        ${user.displayName}
                    </a>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <!-- 移动端手机号选择器 -->
        ${users.length > 1 ? `
        <div class="mobile-phone-selector">
            <select onchange="switchPhoneNumber(this.value)">
                ${users.map(user => `
                    <option value="${user.phonenum}" ${currentUser === user.phonenum ? 'selected' : ''}>
                        ${user.displayName}
                    </option>
                `).join('')}
            </select>
        </div>
        ` : ''}
        
        <div class="content-card">
            <div class="actions">
                <a href="/query${currentUser ? '?phone=' + currentUser : ''}" class="btn btn-primary">📊 基础查询</a>
                <a href="/enhanced${currentUser ? '?phone=' + currentUser : ''}" class="btn btn-primary">🚀 增强查询</a>
                <a href="/json${currentUser ? '?phone=' + currentUser : ''}" class="btn btn-secondary">📋 JSON数据</a>
                <a href="/status" class="btn btn-secondary">🔍 服务状态</a>
            </div>
            
            <div class="data-display">${content}</div>
        </div>
        
        <div class="footer">
            <div class="quick-links">
                <a href="/query?refresh=1${currentUser ? '&phone=' + currentUser : ''}" class="quick-link">🔄 强制刷新</a>
                <a href="/clear-cache" class="quick-link">🗑️ 清空缓存</a>
                <a href="/api/query" class="quick-link">🔗 API接口</a>
            </div>
            <div class="status-info">
                服务版本: 2.0.0 Enhanced | 缓存时间: 2分钟<br>
                服务时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
            </div>
        </div>
    </div>
    
    <button class="refresh-btn" onclick="window.location.reload()" title="刷新页面">
        🔄
    </button>
    
    <script>
        // 手机号选择器控制
        function toggleSelector() {
            const selector = document.getElementById('phoneSelector');
            const toggleBtn = selector?.querySelector('.toggle-btn');
            const content = selector?.querySelector('.selector-content');
            
            if (selector?.classList.contains('collapsed')) {
                selector.classList.remove('collapsed');
                if (toggleBtn) toggleBtn.innerHTML = '◀';
                if (content) content.style.display = 'block';
            } else {
                selector?.classList.add('collapsed');
                if (toggleBtn) toggleBtn.innerHTML = '▶';
                if (content) content.style.display = 'none';
            }
        }
        
        // 移动端手机号切换
        function switchPhoneNumber(phonenum) {
            const currentPath = window.location.pathname;
            const currentSearch = new URLSearchParams(window.location.search);
            currentSearch.set('phone', phonenum);
            window.location.href = currentPath + '?' + currentSearch.toString();
        }
        
        // 自动刷新功能
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('auto')) {
            const interval = parseInt(urlParams.get('auto')) * 1000 || 30000;
            setTimeout(() => {
                window.location.reload();
            }, interval);
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r': case 'R':
                        e.preventDefault();
                        window.location.reload();
                        break;
                    case '1':
                        e.preventDefault();
                        window.location.href = '/query' + (urlParams.get('phone') ? '?phone=' + urlParams.get('phone') : '');
                        break;
                    case '2':
                        e.preventDefault();
                        window.location.href = '/enhanced' + (urlParams.get('phone') ? '?phone=' + urlParams.get('phone') : '');
                        break;
                    case '3':
                        e.preventDefault();
                        window.location.href = '/json' + (urlParams.get('phone') ? '?phone=' + urlParams.get('phone') : '');
                        break;
                }
            }
        });
        
        // 手机号切换时保持当前页面
        document.addEventListener('DOMContentLoaded', function() {
            const phoneOptions = document.querySelectorAll('.phone-option');
            phoneOptions.forEach(option => {
                option.addEventListener('click', function(e) {
                    e.preventDefault();
                    const currentPath = window.location.pathname;
                    const currentSearch = new URLSearchParams(window.location.search);
                    currentSearch.set('phone', this.dataset.phone);
                    window.location.href = currentPath + '?' + currentSearch.toString();
                });
            });
            
            // 防止双击缩放
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function (event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        });
        
        // 性能优化：减少重绘
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
                document.body.style.opacity = '1';
            });
        }
    </script>
</body>
</html>
`;
}

export function generateJsonPage(data: any): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON数据 - 电信套餐查询</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1e1e1e;
            color: #fff;
            padding: 20px;
            line-height: 1.5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            font-size: 2em;
            margin-bottom: 10px;
            color: #61dafb;
        }
        .json-container {
            background: #2d3748;
            border-radius: 10px;
            padding: 20px;
            overflow-x: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        pre {
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .actions {
            text-align: center;
            margin-bottom: 20px;
        }
        .btn {
            padding: 10px 20px;
            margin: 0 10px;
            background: #61dafb;
            color: #1e1e1e;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            font-weight: 500;
        }
        .btn:hover { background: #4fa8c5; }
        .back-btn {
            background: #718096;
            color: white;
        }
        .back-btn:hover { background: #4a5568; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 原始JSON数据</h1>
        </div>
        <div class="actions">
            <a href="/" class="btn back-btn">← 返回主页</a>
            <button class="btn" onclick="copyToClipboard()">📋 复制数据</button>
            <button class="btn" onclick="downloadJson()">💾 下载JSON</button>
        </div>
        <div class="json-container">
            <pre id="json-data">${JSON.stringify(data, null, 2)}</pre>
        </div>
    </div>
    
    <script>
        function copyToClipboard() {
            const jsonData = document.getElementById('json-data').textContent;
            navigator.clipboard.writeText(jsonData).then(() => {
                alert('JSON数据已复制到剪贴板！');
            });
        }
        
        function downloadJson() {
            const jsonData = document.getElementById('json-data').textContent;
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'telecom-data-' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
} 