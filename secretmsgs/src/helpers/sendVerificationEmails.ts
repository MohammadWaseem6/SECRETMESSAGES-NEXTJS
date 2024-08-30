import { resend } from '@/lib/resend'
import VerificationEmail from '../../emails/VerificationEmails'
import { ApiResponse } from '@/types/ApiResopnse'

export async function sendVerificationEmail (
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'MystryMessages verification code',
      react: VerificationEmail({ username: username, otp: verifyCode })
    })

    return {
      success: true,
      message: 'Verification email sent successfully',
      isAcceptingMessages: false
    }
  } catch (emailError) {
    console.error('Error sending verification', emailError)
    return {
      success: false,
      message: 'Error sending verification email'
    }
  }
}
