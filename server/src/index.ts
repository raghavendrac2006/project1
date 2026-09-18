import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

app.use(cors())
app.use(express.json())

// Health check endpoint
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SAMAGRA Sovereign Civic Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
})

// Mock Citizen Database
const mockUser = {
  id: 'usr_samagra_99182',
  name: 'Rajesh K. Sharma',
  email: 'rajesh.sharma@civic.gov.in',
  phone: '+91 98450 12345',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  nationalId: '9918-2049-8812',
  verificationLevel: 'Level 3 - Biometric Sovereign',
  state: 'Karnataka',
  city: 'Bengaluru',
  pincode: '560001',
  memberSince: '2024-01-15',
  securityScore: 94,
}

// Auth endpoints
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { identifier } = req.body
  const token = `samagra_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  res.json({
    success: true,
    data: {
      user: { ...mockUser, email: identifier || mockUser.email },
      token,
    },
    message: 'Authentication successful',
  })
})

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const { fullName, email, phone, nationalId } = req.body
  res.json({
    success: true,
    data: {
      pendingVerification: true,
      phone: phone || '+91 98450 12345',
      user: {
        ...mockUser,
        name: fullName || mockUser.name,
        email: email || mockUser.email,
        phone: phone || mockUser.phone,
        nationalId: nationalId || mockUser.nationalId,
      },
    },
    message: 'Citizen registration initiated. Verification OTP sent.',
  })
})

app.post('/api/v1/auth/verify-otp', (req: Request, res: Response) => {
  const { otp } = req.body
  if (otp && otp !== '123456' && !/^\d{6}$/.test(otp)) {
    res.status(400).json({ success: false, message: 'Invalid OTP. Please enter a valid 6-digit OTP.' })
    return
  }
  const token = `samagra_tok_verified_${Date.now()}`
  res.json({
    success: true,
    data: { user: mockUser, token },
    message: 'OTP verified successfully.',
  })
})

app.get('/api/v1/auth/me', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      user: mockUser,
      token: `samagra_tok_session_${Date.now()}`,
    },
  })
})

app.post('/api/v1/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Session logged out successfully' })
})

// Identity endpoints
app.get('/api/v1/identity', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      id: 'id_samagra_001',
      fullName: mockUser.name,
      dateOfBirth: '1988-08-14',
      gender: 'Male',
      nationalId: mockUser.nationalId,
      maskedNationalId: 'XXXX-XXXX-8812',
      qrCodeData: `SAMAGRA-VERIFIED-IDENTITY:${mockUser.nationalId}`,
      digitalSignature: '0x8F92A7C3120E9B44F671',
      issueDate: '2024-01-01',
      expiryDate: '2034-01-01',
      status: 'verified',
      address: '102, Royal Palms, Indiranagar, Bengaluru - 560038',
      bloodGroup: 'O+',
      photoUrl: mockUser.avatar,
    },
  })
})

// Documents endpoints
app.get('/api/v1/documents', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      {
        id: 'doc_aadhaar_01',
        title: 'Aadhaar Sovereign Identity Card',
        name: 'Aadhaar Sovereign Identity Card',
        category: 'identity',
        documentNumber: '9918-2049-8812',
        issueDate: '2023-01-10',
        issuer: 'Unique Identification Authority of India',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        verificationStatus: 'verified',
        isFavorite: true,
        tags: ['Primary ID', 'Biometric'],
      },
      {
        id: 'doc_pan_02',
        title: 'Permanent Account Number (PAN Card)',
        name: 'Permanent Account Number (PAN Card)',
        category: 'revenue',
        documentNumber: 'ABCDE1234F',
        issueDate: '2022-05-18',
        issuer: 'Income Tax Department',
        fileSize: '850 KB',
        fileType: 'PDF',
        verificationStatus: 'verified',
        isFavorite: true,
        tags: ['Tax', 'Finance'],
      },
    ],
  })
})

// Start Express server
app.listen(PORT, () => {
  console.log(`[SAMAGRA Backend Server] Running on http://localhost:${PORT}`)
  console.log(`[SAMAGRA Backend Server] Health check: http://localhost:${PORT}/api/v1/health`)
})
