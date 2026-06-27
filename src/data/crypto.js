// カジュアルな秘匿目的（著作権・プライバシー保護）
// キーはアプリ固定。完全なDRM保護は対象外。
const KEY_MATERIAL = 'quiz-app-secret-v1-abac';
let _key = null;
async function getKey() {
    if (_key)
        return _key;
    // パスフレーズをSHA-256でハッシュして 256bit(32byte) の鍵素材にする
    // （AES-GCMの鍵は 128 or 256bit ちょうどでなければならない）
    const material = new TextEncoder().encode(KEY_MATERIAL);
    const hash = await crypto.subtle.digest('SHA-256', material);
    _key = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
    return _key;
}
export async function encryptText(text) {
    const key = await getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
    // IV(12byte) + 暗号文 を連結して返す
    const result = new Uint8Array(12 + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), 12);
    return result.buffer;
}
export async function decryptToText(buffer) {
    const key = await getKey();
    const data = new Uint8Array(buffer);
    const iv = data.slice(0, 12);
    const cipher = data.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(decrypted);
}
