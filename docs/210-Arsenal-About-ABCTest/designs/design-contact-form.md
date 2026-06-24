# Design: 聯絡表單

**來源**：[story-20260621-02](../stories/story-20260621-02.md)

## 新增套件

```
drizzle-orm
drizzle-kit
@neondatabase/serverless
resend
```

## 環境變數（新增至 env.ts）

```
DATABASE_URL        # Neon connection string
RESEND_API_KEY      # Resend API key
ADMIN_EMAIL         # 收通知的信箱（Marsen）
```

## 資料庫 Schema

```ts
// src/infrastructure/db/schema.ts
contact_submissions (
  id            serial PRIMARY KEY,
  email         varchar(255) NOT NULL,
  message       text NOT NULL,
  submitted_at  timestamp DEFAULT now() NOT NULL,
  is_read       boolean DEFAULT false NOT NULL
)
```

## 層次對應

| 層 | 檔案 | 說明 |
|----|------|------|
| Domain | `src/domain/contact/ContactSubmission.ts` | entity：id, email, message, submittedAt, isRead |
| Domain | `src/domain/contact/IContactRepository.ts` | port：`save(submission)` |
| Domain | `src/domain/contact/IEmailNotifier.ts` | port：`notifyNewContact(submission)` |
| Application | `src/application/contact/SubmitContactUseCase.ts` | 驗證 → save → notify |
| Infrastructure | `src/infrastructure/db/index.ts` | Neon 連線 |
| Infrastructure | `src/infrastructure/db/schema.ts` | Drizzle schema |
| Infrastructure | `src/infrastructure/contact/DrizzleContactRepository.ts` | implements IContactRepository |
| Infrastructure | `src/infrastructure/contact/ResendEmailNotifier.ts` | implements IEmailNotifier |
| Presentation | `src/presentation/contact/ContactForm.tsx` | client component |
| API | `src/app/api/contact/route.ts` | POST，thin handler |

## 流程

1. 使用者填 email + message，點送出
2. `POST /api/contact` → Zod 驗證（server side）
3. 驗證失敗 → 回傳 400 + 錯誤訊息，顯示在欄位下方
4. 驗證通過 → `SubmitContactUseCase.execute()`
5. 存入 DB（`DrizzleContactRepository.save()`）
6. 寄 email 通知（`ResendEmailNotifier.notifyNewContact()`）
7. 回傳 200 → 前端以成功訊息**永久取代**表單（不恢復）

## Zod 驗證規則

- `email`：非空 + 合法 email 格式
- `message`：非空，最少 10 字（防止垃圾送出）

## ContactForm 元件狀態

```
idle → submitting → success
                 → error（顯示錯誤，可重送）
```

- `success` 狀態：顯示成功訊息，不再顯示表單
- `error` 狀態：欄位保留已填內容，顯示錯誤提示

## Email 通知格式（Resend）

- Subject：`[Arsenal] 新聯絡：{email}`
- Body：email + message + 送出時間
- From：Resend 驗證的寄件地址
- To：`ADMIN_EMAIL`

## 待釐清

- [ ] Resend From 地址：實作前確認 Marsen 在 Resend 已驗證的 domain

## 驗證規則（確認）

- `email`：必填 + 合法格式
- `message`：必填，不限最少字數
