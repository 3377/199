// HTML页面模板
export function generateMainPage(content: string, title: string = '电信套餐查询'): string {
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
        }
    </style>
</head>
<body>
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
                        window.location.href = '/query';
                        break;
                    case '2':
                        e.preventDefault();
                        window.location.href = '/enhanced';
                        break;
                    case '3':
                        e.preventDefault();
                        window.location.href = '/json';
                        break;
                }
            }
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