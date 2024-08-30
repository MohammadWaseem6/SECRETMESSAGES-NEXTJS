import dbConnect from '@/lib/dbConnect'
import UserModel from '@/Models/User'
import bcrypt from 'bcrypt'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'email', type: 'text', placeholder: 'email' },
                password: {
                    label: 'Password',
                    type: 'password',
                   
                }
            },
            async authorize(Credentials: any): Promise<any> {
                await dbConnect()
                try {   
                    const user = await UserModel.findOne({
                        $or: [
                            { email: Credentials.identifier },
                            { username: Credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error('User not found with this emai address')
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verify your account first before logging in')
                    }
                    const isPasswordCorrect = await bcrypt.compare(Credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error('Invalid password')
                    }
                } catch (error: any) {
                    throw new Error(error)
                }
            }
        })
    ],
    callbacks:{
        async session({ session, token }) {
            if(token){
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
            },
            async jwt({ token, user}) {
            if (user) {
                token.id = user._id?.toString()
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
            }
    },
    pages: {
        signIn: '/sign-in',
      
    },
    session:{
        strategy:"jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
    

}

