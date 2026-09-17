import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Enter a valid registered email or 10-digit mobile number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Full legal name must be at least 3 characters')
      .max(80, 'Name is too long'),
    email: z
      .string()
      .email('Enter a valid email address'),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    nationalId: z
      .string()
      .min(12, 'National ID must be at least 12 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    consentTerms: z
      .boolean()
      .refine((val) => val === true, 'You must consent to the Citizen Data Charter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'Enter the 6-digit secure code')
    .regex(/^\d{6}$/, 'Must be numbers only'),
})

export type OtpFormData = z.infer<typeof otpSchema>

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Enter registered email address or mobile number'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const documentUploadSchema = z.object({
  title: z.string().min(3, 'Document title is required'),
  category: z.enum(['identity', 'property', 'revenue', 'legal', 'education', 'health']),
  documentNumber: z.string().min(4, 'Document registration / reference number required'),
  issuer: z.string().min(2, 'Issuing authority name is required'),
  expiryDate: z.string().optional(),
})

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>

export const applicationSubmissionSchema = z.object({
  applicantName: z.string().min(3, 'Full legal name is required'),
  contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  address: z.string().min(5, 'Delivery / residential address is required'),
  notes: z.string().optional(),
  declarationConsent: z
    .boolean()
    .refine((val) => val === true, 'You must confirm the truth of this declaration'),
})

export type ApplicationSubmissionFormData = z.infer<typeof applicationSubmissionSchema>

export const profileUpdateSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit phone required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Valid 6-digit postal pincode required'),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>
