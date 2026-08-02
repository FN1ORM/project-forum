export const ALLOWED_EMAIL_DOMAIN = '@iiitg.ac.in'
export const ADMIN_EMAIL = 'fn1orm@gmail.com'
export const TEACHER_EMAIL = 'anuradha@iiitg.ac.in'

export function isEmailAllowed(email: string): boolean {
  return email.endsWith(ALLOWED_EMAIL_DOMAIN) || email === ADMIN_EMAIL
}
