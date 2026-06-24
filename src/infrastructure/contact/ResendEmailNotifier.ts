import { Resend } from 'resend'
import type { IEmailNotifier } from '@/domain/contact/IEmailNotifier'
import type { ContactSubmission } from '@/domain/contact/ContactSubmission'
import { env } from '@/lib/env'

function formatDate(date: Date): string {
  return date.toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildHtml(submission: ContactSubmission): string {
  const replyUrl = `mailto:${submission.email}?subject=Re: 你的想法`
  const date = formatDate(submission.submittedAt)

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">

        <!-- header -->
        <tr>
          <td style="padding:32px 40px 24px;border-bottom:1px solid #f0f0f0;">
            <p style="margin:0;font-size:13px;color:#999;">Arsenal 聯絡表單</p>
            <h1 style="margin:8px 0 0;font-size:20px;color:#111;font-weight:600;">
              有人找你了
            </h1>
          </td>
        </tr>

        <!-- sender info -->
        <tr>
          <td style="padding:24px 40px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:8px;">
                  <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">稱呼</span>
                  <span style="font-size:15px;color:#111;font-weight:500;">${submission.name}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span style="font-size:12px;color:#999;display:block;margin-bottom:2px;">Email</span>
                  <a href="mailto:${submission.email}" style="font-size:15px;color:#2563eb;text-decoration:none;">${submission.email}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- message -->
        <tr>
          <td style="padding:24px 40px;">
            <p style="margin:0 0 8px;font-size:12px;color:#999;">他說</p>
            <blockquote style="margin:0;padding:16px 20px;background:#f8f8f8;border-left:3px solid #d1d5db;border-radius:4px;">
              <p style="margin:0;font-size:15px;color:#333;line-height:1.7;white-space:pre-wrap;">${submission.message}</p>
            </blockquote>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;">
            <a href="${replyUrl}"
               style="display:inline-block;padding:10px 20px;background:#111;color:#fff;font-size:14px;font-weight:500;border-radius:6px;text-decoration:none;">
              回覆 ${submission.name}
            </a>
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f0f0f0;">
            <p style="margin:0;font-size:12px;color:#bbb;">收到時間：${date} (台灣時間)</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildText(submission: ContactSubmission): string {
  const date = formatDate(submission.submittedAt)
  return `有人找你了

稱呼：${submission.name}
Email：${submission.email}

他說：
${submission.message}

收到時間：${date} (台灣時間)
`
}

export class ResendEmailNotifier implements IEmailNotifier {
  private readonly resend = new Resend(env.resendApiKey)

  async notifyNewContact(submission: ContactSubmission): Promise<void> {
    const preview = submission.message.slice(0, 40)
    const ellipsis = submission.message.length > 40 ? '…' : ''

    await this.resend.emails.send({
      from: env.resendFromEmail,
      to: env.adminEmail,
      subject: `${submission.name} 來信，想跟你聊聊 ${preview}${ellipsis}`,
      html: buildHtml(submission),
      text: buildText(submission),
    })
  }
}
