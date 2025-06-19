// 认证管理模块
export class AuthManager {
  private sessions = new Map<string, number>(); // sessionId -> timestamp
  private sessionTimeout = 24 * 60 * 60 * 1000; // 24小时过期

  // 生成session ID
  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  // 验证密码
  validatePassword(password: string): boolean {
    const correctPassword = this.getEnvPassword();
    return password === correctPassword;
  }

  // 获取环境变量中的密码
  private getEnvPassword(): string {
    try {
      return globalThis.Deno?.env?.get?.('WEB_PASSWORD') || 'admin123';
    } catch {
      return 'admin123';
    }
  }

  // 创建session
  createSession(): string {
    const sessionId = this.generateSessionId();
    this.sessions.set(sessionId, Date.now());
    this.cleanExpiredSessions();
    return sessionId;
  }

  // 验证session
  validateSession(sessionId: string): boolean {
    if (!sessionId || !this.sessions.has(sessionId)) {
      return false;
    }

    const timestamp = this.sessions.get(sessionId)!;
    const now = Date.now();
    
    if (now - timestamp > this.sessionTimeout) {
      this.sessions.delete(sessionId);
      return false;
    }

    // 更新session时间
    this.sessions.set(sessionId, now);
    return true;
  }

  // 清理过期session
  private cleanExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, timestamp] of this.sessions.entries()) {
      if (now - timestamp > this.sessionTimeout) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // 生成登录页面HTML
  generateLoginPage(error?: string): string {
    const errorMessage = error ? `<div class="error">${error}</div>` : '';
    
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>电信套餐查询 - 登录验证</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .logo {
            font-size: 3em;
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 30px;
            font-size: 1.8em;
            font-weight: 300;
        }
        .form-group {
            margin-bottom: 25px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        input[type="password"] {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e5e9;
            border-radius: 10px;
            font-size: 16px;
            transition: border-color 0.3s ease;
            background: #f8f9fa;
        }
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            background: white;
        }
        .submit-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
        }
        .error {
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #fcc;
        }
        .footer {
            margin-top: 30px;
            color: #666;
            font-size: 0.9em;
        }
        @media (max-width: 480px) {
            .login-container { padding: 30px 20px; }
            h1 { font-size: 1.5em; }
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">📱</div>
        <h1>电信套餐查询系统</h1>
        ${errorMessage}
        <form method="POST" action="/auth/login">
            <div class="form-group">
                <label for="password">访问密码</label>
                <input type="password" id="password" name="password" required 
                       placeholder="请输入访问密码" autocomplete="current-password">
            </div>
            <button type="submit" class="submit-btn">登录访问</button>
        </form>
        <div class="footer">
            <p>🔒 安全验证 | 保护您的数据隐私</p>
        </div>
    </div>
</body>
</html>`;
  }
}

// 全局认证管理器
export const authManager = new AuthManager(); 