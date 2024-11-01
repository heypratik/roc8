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
        return {success: true, email: 'demo@demo.com'}
      }
    })
  ],
  callbacks: {
    async session({ session, token, user, result }) {
      // Send properties to the client, like an access_token and user id from a provider.
      return session
    }
  },
  secret: "bsPDwIA5FPy9FHm+PiVxrk+tEbHj8/w/e2ayIAX3RbU="
})