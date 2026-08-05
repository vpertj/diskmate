use sha2::{Digest, Sha256};
use std::fs::File;
use std::io::{BufReader, Read};
use std::path::Path;

/// 部分哈希读取的字节数（前 4KB）
const PARTIAL_HASH_SIZE: u64 = 4096;

/// 计算文件的部分哈希（前 4KB）
pub fn partial_hash(path: &Path) -> Option<String> {
    let file = File::open(path).ok()?;
    let mut reader = BufReader::with_capacity(8192, file);
    let mut buf = vec![0u8; PARTIAL_HASH_SIZE as usize];
    let n = reader.read(&mut buf).ok()?;
    if n == 0 {
        return None;
    }
    buf.truncate(n);

    let mut hasher = Sha256::new();
    hasher.update(&buf);
    Some(format!("{:x}", hasher.finalize()))
}

/// 计算文件的完整 SHA256 哈希
pub fn full_hash(path: &Path) -> Option<String> {
    let file = File::open(path).ok()?;
    let mut reader = BufReader::with_capacity(65536, file);
    let mut hasher = Sha256::new();
    let mut buf = [0u8; 65536];

    loop {
        let n = reader.read(&mut buf).ok()?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }

    Some(format!("{:x}", hasher.finalize()))
}

/// 多阶段哈希检测策略：
/// 1. 先按 size 分组（O(1) 过滤）
/// 2. 再按前 4KB 部分哈希（快速排除）
/// 3. 最后全文件 SHA256（精确确认）
pub fn is_likely_duplicate(path_a: &Path, path_b: &Path) -> bool {
    // 阶段 1：size 比对
    let meta_a = match path_a.metadata() {
        Ok(m) => m,
        Err(_) => return false,
    };
    let meta_b = match path_b.metadata() {
        Ok(m) => m,
        Err(_) => return false,
    };

    if meta_a.len() != meta_b.len() {
        return false;
    }

    // 阶段 2：部分哈希
    let hash_a = match partial_hash(path_a) {
        Some(h) => h,
        None => return false,
    };
    let hash_b = match partial_hash(path_b) {
        Some(h) => h,
        None => return false,
    };

    if hash_a != hash_b {
        return false;
    }

    // 阶段 3：完整哈希
    let full_a = match full_hash(path_a) {
        Some(h) => h,
        None => return false,
    };
    let full_b = match full_hash(path_b) {
        Some(h) => h,
        None => return false,
    };

    full_a == full_b
}
