/**
 * 加密工具模块
 * 支持 RSA 公钥加密和 Caesar 密码
 */

// Caesar 密码转换字符映射表
const TRANS_MAP: Record<string, string> = {
  '0': 'c', '1': 'a', '2': 'b', '3': 'f', '4': 'd', '5': 'e', '6': 'i', '7': 'g', '8': 'h', '9': 'l',
  'a': '1', 'b': '2', 'c': '0', 'd': '4', 'e': '5', 'f': '3', 'g': '7', 'h': '8', 'i': '6', 'j': 'n',
  'k': 'o', 'l': '9', 'm': 'r', 'n': 'j', 'o': 'k', 'p': 's', 'q': 't', 'r': 'm', 's': 'p', 't': 'q',
  'u': 'v', 'v': 'u', 'w': 'z', 'x': 'y', 'y': 'x', 'z': 'w',
  'A': '1', 'B': '2', 'C': '0', 'D': '4', 'E': '5', 'F': '3', 'G': '7', 'H': '8', 'I': '6', 'J': 'n',
  'K': 'o', 'L': '9', 'M': 'r', 'N': 'j', 'O': 'k', 'P': 's', 'Q': 't', 'R': 'm', 'S': 'p', 'T': 'q',
  'U': 'v', 'V': 'u', 'W': 'z', 'X': 'y', 'Y': 'x', 'Z': 'w'
};

/**
 * Caesar 密码转换函数
 * 实现与Python版本完全相同的字符映射逻辑
 */
export function transNumber(input: string): string {
  let result = '';
  for (const char of input) {
    result += TRANS_MAP[char] || char;
  }
  return result;
}

/**
 * RSA 公钥加密
 * 使用 Web Crypto API 实现 RSA-OAEP 加密
 */
export async function encryptRSA(data: string, publicKeyPem: string): Promise<string> {
  try {
    // 清理 PEM 格式
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    
    const pemContents = publicKeyPem
      .replace(pemHeader, "")
      .replace(pemFooter, "")
      .replace(/\s/g, "");
    
    // 解码 Base64
    const binaryDer = atob(pemContents);
    const keyBytes = new Uint8Array(binaryDer.length);
    for (let i = 0; i < binaryDer.length; i++) {
      keyBytes[i] = binaryDer.charCodeAt(i);
    }
    
    // 导入公钥
    const publicKey = await crypto.subtle.importKey(
      "spki",
      keyBytes.buffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-1"
      },
      false,
      ["encrypt"]
    );
    
    // 加密数据
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      encodedData
    );
    
    // 转换为 Base64
    const encryptedArray = new Uint8Array(encryptedBuffer);
    let binaryString = '';
    for (let i = 0; i < encryptedArray.length; i++) {
      binaryString += String.fromCharCode(encryptedArray[i]);
    }
    
    return btoa(binaryString);
  } catch (error) {
    console.error('RSA 加密失败:', error);
    throw new Error(`RSA加密失败: ${error.message}`);
  }
}

/**
 * 生成时间戳字符串
 * 格式: YYYY-MM-DD HH:MM:SS
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 生成13位时间戳
 */
export function generateTimestamp13(): string {
  return Date.now().toString();
}

/**
 * 默认 RSA 公钥
 * 与原 Python 版本使用相同的公钥
 */
export const DEFAULT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDc+CZK9bRA9m8YRQD4NeRBhRWA
J0VE6opNGGNoPg+r1YAGkfkuJWSvGJyVnG3+1R5AqiPfNy7Nj1YVrS0AhHhZvG7a
Wc7wlx6fRZFyCkTi0CSkQ/yCY6NjZOVd8Qb6SFw7UXhInMFN5SU0+ZPCJo1Qk7eR
7TA/VrPOiMKklHQIDAQAB
-----END PUBLIC KEY-----`; 