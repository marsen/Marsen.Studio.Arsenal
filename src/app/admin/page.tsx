import { redirect } from 'next/navigation';

/**
 * 後台目前只有「編輯首頁內容」這一個功能，登入後直接導向，不做多餘的中介頁。
 */
export default function AdminPage() {
  redirect('/admin/content');
}
