import NextAuth from 'next-auth'
import { authOptions } from './config'

export const handlers = NextAuth(authOptions)


