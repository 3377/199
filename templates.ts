import type { UserConfig } from './types.ts';

// HTML页面模板  
export function generateMainPage(content: string, title: string = '电信套餐查询', users: UserConfig[] = [], currentUser?: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            padding: 20px;
            line-height: 1.6;
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
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
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
        }
        .actions {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            text-align: center;
            min-width: 120px;
            justify-content: center;
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
        .btn:hover {
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
            padding: 8px 16px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .quick-link:hover {
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
        }
        .refresh-btn:hover {
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
        }
        .phone-option:hover {
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
        }
        .toggle-btn:hover {
            transform: scale(1.1);
        }
        
        /* 响应式设计 */
                 @media (max-width: 768px) {
             body { padding: 15px; }
             .header h1 { font-size: 2em; }
             .content-card { padding: 25px; }
             .data-display { 
                 font-size: 14px; 
                 padding: 20px;
                 overflow-x: auto;
             }
             .actions { gap: 10px; }
             .btn { min-width: 100px; font-size: 13px; }
             .quick-links { gap: 15px; }
             .refresh-btn {
                 bottom: 20px;
                 right: 20px;
                 width: 50px;
                 height: 50px;
                 font-size: 20px;
             }
             .phone-selector {
                 left: 10px;
                 transform: translateY(-50%) scale(0.9);
             }
         }
                 @media (max-width: 480px) {
             .header h1 { font-size: 1.8em; }
             .content-card { padding: 20px; }
             .data-display { 
                 font-size: 13px; 
                 padding: 15px;
             }
             .actions { flex-direction: column; align-items: center; }
             .btn { width: 200px; }
             .quick-links { flex-direction: column; gap: 10px; }
             .phone-selector {
                 position: relative;
                 left: 0;
                 top: 0;
                 transform: none;
                 margin-bottom: 20px;
                 width: 100%;
                 max-width: 300px;
                 margin-left: auto;
                 margin-right: auto;
             }
         }
    </style>
</head>
<body>
    ${users.length > 1 ? `
    <div class="phone-selector" id="phoneSelector">
        <button class="toggle-btn" onclick="toggleSelector()" title="折叠/展开">◀</button>
        <div class="selector-content">
            <h3>📱 手机号</h3>
            ${users.map(user => `
                <a href="?phone=${user.phonenum}" class="phone-option ${currentUser === user.phonenum ? 'active' : ''}" 
                   data-phone="${user.phonenum}">
                    ${user.displayName}
                </a>
            `).join('')}
        </div>
    </div>
    ` : ''}
    
    <div class="container">
        <div class="header">
            <h1>📱 ${title}</h1>
            <div class="subtitle">实时查询 · 数据可视化 · 智能分析</div>
        </div>
        
        <div class="actions">
            <a href="/query?refresh=1" class="btn btn-primary">🔄 基础查询</a>
            <a href="/enhanced?refresh=1" class="btn btn-primary">✨ 增强查询</a>
            <a href="/json" class="btn btn-secondary">📊 原始数据</a>
            <a href="/status" class="btn btn-secondary">⚡ 系统状态</a>
        </div>
        
        <div class="content-card">
            <div class="data-display">${content}</div>
        </div>
        
        <div class="footer">
            <div class="quick-links">
                <a href="/query" class="quick-link">📱 基础</a>
                <a href="/enhanced" class="quick-link">✨ 增强</a>
                <a href="/json" class="quick-link">📊 JSON</a>
                <a href="/status" class="quick-link">⚡ 状态</a>
                <a href="/clear-cache" class="quick-link" onclick="return confirm('确定要清除缓存吗？')">🗑️ 清缓存</a>
            </div>
            <div class="status-info">
                更新时间: ${new Date().toLocaleString('zh-CN', {timeZone: 'Asia/Shanghai'})} | 
                服务版本: 2.0.0
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
            const toggleBtn = selector.querySelector('.toggle-btn');
            const content = selector.querySelector('.selector-content');
            
            if (selector.classList.contains('collapsed')) {
                selector.classList.remove('collapsed');
                toggleBtn.innerHTML = '◀';
                content.style.display = 'block';
            } else {
                selector.classList.add('collapsed');
                toggleBtn.innerHTML = '▶';
                content.style.display = 'none';
            }
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
        });
    </script>
</body>
</html>`;
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