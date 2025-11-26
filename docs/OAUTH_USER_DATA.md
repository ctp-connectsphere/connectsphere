# OAuth 用户数据获取和存储

## 概述

本文档说明如何从 Google 和 GitHub OAuth 提供商获取用户信息并存储到数据库。

## OAuth 信息获取

### Google OAuth

Google OAuth 提供以下用户信息（通过 `profile` 参数）：

- `email` - 用户邮箱
- `name` - 全名
- `given_name` - 名字
- `family_name` - 姓氏
- `picture` - 头像URL
- `locale` - 语言区域
- `email_verified` - 邮箱是否已验证

**当前实现：**
- 使用 `given_name` 和 `family_name` 分别作为 `firstName` 和 `lastName`
- 使用 `picture` 作为 `profileImageUrl`
- 如果 `given_name`/`family_name` 不可用，则从 `name` 字段拆分

### GitHub OAuth

GitHub OAuth 提供以下用户信息（通过 `profile` 参数）：

- `email` - 用户邮箱
- `name` - 全名（可能为空）
- `login` - GitHub 用户名
- `avatar_url` - 头像URL
- `bio` - 个人简介
- `company` - 公司
- `location` - 位置
- `blog` - 博客URL

**当前实现：**
- 从 `name` 字段拆分获取 `firstName` 和 `lastName`
- 如果 `name` 为空，使用 `login` 作为 `firstName`
- 使用 `avatar_url` 作为 `profileImageUrl`

## 数据库存储

### 用户创建流程

1. **检查用户是否存在**
   - 使用 `email` 查询现有用户
   - 使用 `select` 明确指定字段，避免查询可能不存在的列

2. **创建新用户**（如果不存在）
   ```typescript
   {
     email: string,
     firstName: string,
     lastName: string,
     university: string, // 从邮箱域名提取
     passwordHash: '', // OAuth用户不需要密码
     profileImageUrl: string | null,
     isVerified: true, // OAuth邮箱已预验证
     emailVerifiedAt: Date,
     isActive: true,
     major: null, // 可选字段
     settings: null, // 可选字段
   }
   ```

3. **创建用户配置文件**
   - 自动创建 `UserProfile` 记录
   - `onboardingCompleted: false` - 需要完成引导流程

4. **更新现有用户**（如果已存在）
   - 更新头像（如果有新的）
   - 确保 `isVerified: true`
   - 更新 `lastLoginAt`

5. **链接 OAuth 账户**
   - 在 `Account` 表中存储 OAuth 提供商信息
   - 存储 access token、refresh token 等

## 数据库迁移

### 添加缺失的列

如果遇到 "The column `users.major` does not exist" 错误，需要运行迁移脚本：

```bash
# 运行 TypeScript 脚本（推荐）
npx tsx scripts/add-missing-user-columns.ts

# 或直接运行 SQL
psql $DATABASE_URL -f scripts/add-missing-columns.sql
```

### 生产环境迁移

在生产环境，确保运行迁移：

1. **使用迁移脚本**（推荐用于生产）：
   ```bash
   npx tsx scripts/add-missing-user-columns.ts
   ```

2. **或使用 Prisma migrate**（如果迁移历史一致）：
   ```bash
   npx prisma migrate deploy
   ```

## 错误处理

### 列不存在错误

代码已实现容错机制：
- 使用 `select` 明确指定需要的字段
- 如果查询失败，会尝试使用最小字段集重试
- 记录警告日志，但不会阻止用户登录

### 连接错误

- 自动重试机制（最多2次）
- 延迟重试（500ms）
- 区分连接错误和其他错误

## 最佳实践

1. **始终使用 `select` 明确指定字段**
   - 避免查询可能不存在的列
   - 提高查询性能

2. **处理 OAuth 信息缺失**
   - 提供合理的默认值
   - 记录警告日志

3. **验证邮箱**
   - OAuth 邮箱通常已预验证
   - 自动设置 `isVerified: true`

4. **更新登录时间**
   - 每次 OAuth 登录时更新 `lastLoginAt`

5. **错误日志**
   - 记录所有 OAuth 相关错误
   - 包含提供商信息和用户邮箱（不包含敏感信息）

## 测试

测试 OAuth 登录流程：

1. **Google OAuth**
   - 使用 Google 账号登录
   - 验证用户信息正确存储
   - 检查 `firstName`、`lastName`、`profileImageUrl`

2. **GitHub OAuth**
   - 使用 GitHub 账号登录
   - 验证用户信息正确存储
   - 检查头像和用户名

3. **现有用户**
   - 使用已存在的邮箱登录
   - 验证信息更新而不是创建新用户

4. **错误场景**
   - 测试数据库列缺失的情况
   - 验证容错机制正常工作

