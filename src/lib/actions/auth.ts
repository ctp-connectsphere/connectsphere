'use server'
import { prisma } from '@/lib/db/connection'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const registerSchema = z.object({
  email: z.string().email().refine(v => v.endsWith('.edu'), 'Must use university email'),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  university: z.string().min(1)
})

export async function registerUser(formData: FormData) {
  try {
    const data = registerSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      university: formData.get('university')
    })

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return { success: false, message: 'User already exists' }

    const hash = await bcrypt.hash(data.password, 12)
    await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hash,
        firstName: data.firstName,
        lastName: data.lastName,
        university: data.university,
        isVerified: true
      }
    })

    return { success: true, message: 'Registration successful. Please login.' }
  } catch (e: any) {
    if (e instanceof z.ZodError) return { success: false, errors: e.flatten().fieldErrors }
    return { success: false, message: e?.message || 'Registration failed' }
  }
}


