import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export default NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    }),
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials, req) {
        if (credentials.username === "demo@demo.com" && credentials.password === "demo") {
            return { success: true, email: "demo@demo.com" };  
        }
        return null; 
    }
    })
  ],
  callbacks: {
    async session({ session, token, user, result }) {
      return session
    }
  },
  secret: "bsPDwIA5FPy9FHm+PiVxrk+tEbHj8/w/e2ayIAX3RbU="
})