# photo2url.com 需求文档

> 基于 PRD v5.0 和需求分析决策，2026-07-21

---

## 1. 产品定位

轻量级图片托管 SaaS，上传图片 → 获取 URL → 分享到任何平台（Notion、Reddit、GitHub 等）。Cloudflare 全栈部署，Lemon Squeezy 收款。

---

## 2. 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Next.js 15 App Router + Tailwind CSS + shadcn/ui + Lucide |
| 部署 | Cloudflare Pages（@cloudflare/next-on-pages） |
| API | Cloudflare Workers（Edge Runtime） |
| 存储 | Cloudflare R2（photo2url-bucket） |
| 数据库 | Cloudflare D1（SQLite at Edge） |
| 认证 | Clerk（Email + Google OAuth） |
| 支付 | Lemon Squeezy（Hosted Overlay Checkout + Webhook） |
| 安全 | Cloudflare Turnstile + Cookie+IP 限流 |

---

## 3. 数据库表结构

```sql
-- 1. 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',  -- 'free' | 'plus' | 'enterprise'
    storage_used INTEGER DEFAULT 0,
    api_key TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 文件表
CREATE TABLE files (
    id TEXT PRIMARY KEY,
    user_id TEXT,           -- NULL = 访客
    cookie_id TEXT,          -- 访客追踪
    r2_key TEXT NOT NULL,
    original_name TEXT,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,    -- 30天（Free），NULL（付费）
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 3. 订阅表
CREATE TABLE subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lemon_sub_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_end DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 4. 上传计数表（限流用）
CREATE TABLE upload_counts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cookie_id TEXT NOT NULL,
    ip TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    UNIQUE(cookie_id, ip, upload_date)
);
```

---

## 4. 定价与限额

**排列顺序：高→低（Enterprise → Plus → Free）**

|      | Enterprise       | Plus       | Free       |
| ---- | ---------------- | ---------- | ---------- |
| 价格   | $93.90/年         | $9.90/月    | $0         |
| 文件大小 | ≤256 MB          | ≤50 MB     | ≤2 MB      |
| 每日上传 | 无限               | 1,000 次    | 10 次       |
| 存储上限 | 200 GB（硬顶）       | 100 GB（硬顶） | 200 MB（硬顶） |
| 到期清理 | 永久               | 永久         | 180 天      |
| 格式   | PNG/JPG/WEBP/GIF | 同          | 同          |
| 差异化  | 年付更便宜 + 限额更高     | —          | —          |

**策略：** Enterprise 为目标套餐。年付 $94.9 比 Plus 月付 $9.9×12=$118.8 更便宜，但限额翻倍不止。

---

## 5. 核心工作流

### 5.1 访客上传流程（POST /api/upload）

```
1. 接收 FormData（file + cf-turnstile-response）
2. Cookie 追踪：读取/设置 p2u_guest_id（UUID）
3. 限流检查：
   a. Cookie 今日上传次数 >= 5 → 校验 Turnstile
   b. Cookie 今日 >= 10 或 IP 今日 >= 50 → 429
4. 文件校验：
   a. MIME Type 白名单
   b. Magic Bytes（防扩展名冒充）
   c. 文件大小按套餐限制
5. 存储限额检查
6. R2 上传（路径：uploads/{YYYY}/{MM}/{UUID}.{ext}）
7. D1 写入 files 表
8. 更新上传计数
9. 返回 JSON：
   {
     "url":      "https://cdn.photo2url.com/uploads/2026/07/{UUID}.jpg",
     "preview":  "https://photo2url.com/i/{UUID}",
     "markdown": "![image](url)",
     "html":     "<img src=\"url\" />"
   }
```

### 5.2 Lemon Squeezy Webhook（POST /api/webhook/lemon）

```
1. 验证 X-Signature（HMAC-SHA256）
2. subscription_created/updated → 更新 users.plan_type
3. subscription_cancelled/expired → 恢复 plan_type = 'free'
4. 返回 200
```

### 5.3 过期清理（Workers Cron Trigger）

- 每天 3:00 UTC 执行
- 查 files WHERE expires_at < now
- 删除 R2 对象 + D1 记录 + 更新 users.storage_used

---

## 6. 关键决策记录

| # | 决策 | 结论 | 原因 |
|---|---|---|---|
| 1 | Next.js 路由方式 | App Router + next-on-pages | 项目不需要 SSR/ISR，兼容性够用 |
| 2 | 认证方案 | Clerk（Email + Google） | 外包认证复杂度，省开发时间 |
| 3 | Dashboard 程度 | 极简版（文件列表+复制+删除） | 覆盖底线体验，不拖进度 |
| 4 | 定价排列 | 高→低（Enterprise→Plus→Free） | 引导用户首选 Enterprise |
| 5 | Pro 改名 | 改为 Plus | 与原 PRD 方案一致 |
| 6 | 存储含义 | 总存储硬上限 | 满则拒传，简单明确 |
| 7 | Enterprise 差异化 | 价格本身就是策略 | 年付更便宜但给更多 |
| 8 | 访客限流 | Cookie(ID) + IP 组合 | Cookie 主限 + IP 兜底 |
| 9 | 过期清理 | Workers Cron Trigger | 代码量小、免费、不操心 |
| 10 | Turnstile 策略 | 前 5 次无感，6-10 次验证 | 正常用户无感知，拦机器人 |
| 11 | Tools 导航 | 下拉菜单占位 | 后续迭代加工具 |
| 12 | 图片 URL | UUID + 双 URL（直链+预览页） | 安全 + 两种场景覆盖 |
| 13 | 上传结果 | 上传框旁即时结果卡片 | 不限流、不跳转 |

---

## 7. 页面结构

| 路由 | 类型 | 说明 |
|---|---|---|
| `/` | 静态 | 首页：Hero 上传区 + 三步指南 + 用例 + 定价 + 合作伙伴 + Footer |
| `/sign-in` | Edge | Clerk 登录 |
| `/sign-up` | Edge | Clerk 注册 |
| `/dashboard` | Edge | 用户后台：存储用量 + 文件列表 + 复制/删除 |
| `/i/[id]` | Edge | 图片预览页：大图 + 四种复制按钮 |
| `/privacy` | 静态 | 隐私政策 |
| `/terms` | 静态 | 服务条款 |
| `/refund` | 静态 | 退款政策 |

---

## 8. API 路由

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/upload` | 核心上传 |
| GET | `/api/files` | 文件列表（需登录或 Cookie） |
| DELETE | `/api/files/[id]` | 删除文件（所有权校验） |
| POST | `/api/webhook/lemon` | Lemon Squeezy 订阅回调 |

---

## 9. 文件结构

```
photo2url/
├── app/
│   ├── layout.tsx                  # ClerkProvider + SEO
│   ├── page.tsx                    # 首页
│   ├── not-found.tsx               # 404
│   ├── error.tsx                   # 错误边界
│   ├── sign-in/                    # Clerk 登录
│   ├── sign-up/                    # Clerk 注册
│   ├── dashboard/page.tsx          # 用户后台
│   ├── i/[id]/page.tsx             # 图片预览
│   ├── privacy|terms|refund/       # 法律页面
│   └── api/
│       ├── upload/route.ts         # POST 上传
│       ├── files/route.ts          # GET 列表
│       ├── files/[id]/route.ts     # DELETE 删除
│       └── webhook/lemon/route.ts  # 支付回调
├── components/
│   ├── Navbar.tsx                  # 导航栏
│   ├── UploadZone.tsx              # 上传区（拖拽/点击/粘贴）
│   ├── ResultCard.tsx              # 结果卡片
│   ├── HowItWorks.tsx              # 三步指南
│   ├── UseCases.tsx                # 用例展示
│   ├── PricingSection.tsx          # 定价卡片
│   ├── PartnerBanner.tsx           # 合作伙伴
│   ├── Footer.tsx                  # 页脚
│   ├── FileList.tsx                # 文件列表
│   └── ui/                         # shadcn 组件
├── db/
│   ├── schema.ts                   # Drizzle schema
│   ├── index.ts                    # D1 client
│   └── migrations/0001_init.sql    # 建表 SQL
├── utils/
│   ├── magic-bytes.ts              # 文件头校验
│   ├── upload-limit.ts             # 限额常量
│   └── id-generator.ts             # UUID 生成
├── workers/cleanup.ts              # 过期清理 Worker
├── middleware.ts                   # 路由保护
├── wrangler.toml                   # CF 配置
└── .env.example                    # 环境变量清单
```

---

## 10. 环境变量

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_WEBHOOK_SECRET=
LEMON_SQUEEZY_PLUS_VARIANT_ID=
LEMON_SQUEEZY_ENTERPRISE_VARIANT_ID=
NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID=

# Cloudflare
R2_BUCKET_NAME=photo2url-bucket
CDN_DOMAIN=cdn.photo2url.com
APP_URL=https://photo2url.com
```

---

## 11. 降级策略

| 服务 | 未配置时的行为 |
|---|---|
| Clerk | 跳过认证，全部以访客身份运行 |
| Turnstile | 跳过验证，不拦截上传 |
| Lemon Squeezy | 定价页正常显示，点击提示"即将上线" |

---

## 12. 后续迭代（MVP 不做）

- API Key 程序化上传
- 图片缩略图 / 格式转换
- 自定义域名绑定
- 团队多人账号
- Tools 页面实际工具（压缩/转换/水印）
- 暗色模式
- PDF / Word 文档上传
