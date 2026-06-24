export interface ContactSubmission {
  id: number
  name: string
  email: string
  message: string
  submittedAt: Date
  isRead: boolean
}

export interface NewContactSubmission {
  name: string
  email: string
  message: string
}
