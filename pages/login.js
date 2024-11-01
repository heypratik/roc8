
import { useState } from 'react';
import { signIn } from "next-auth/react"
import { useRouter } from 'next/router';
import {AiOutlineLoading3Quarters} from 'react-icons/ai'

export default function Login() {
    const router = useRouter()

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(null)

  async function submitFunction(e) {
    e.preventDefault()
    setLoading(true)
    const status = await signIn("credentials", {
        redirect: true,
        email: "demo@demo.com",
        password:"demo",
        callbackUrl: "/charts"
    })

    if (status.ok) {
        router.push(status.url)
    } else {
      notify('error')
    }
}


  return (
    <div className='bg-white flex items-center justify-center min-h-screen text-black'>
        <form className='flex flex-col gap-5'>
     <span className='flex items-start justify-center flex-col'>
     <label className='text-sm mb-2 font-bold' htmlFor="username">Username:</label>
      <input
        type="text"
        id="username"
        value="demo@demo.com"
        disabled
        className='bg-gray-100 border border-[#636363] rounded p-2'
        onChange={(e) => setUsername(e.target.value)}
      />
     </span>

      <span  className='flex items-start justify-center flex-col'>
      <label className='text-sm mb-2 font-bold' htmlFor="password">Password:</label>
      <input
        type="password"
        id="password"
        value="demo@demo.com"
        disabled
        className='bg-gray-100 border border-[#636363] rounded p-2'
        onChange={(e) => setPassword(e.target.value)}
      />
      </span>

      <button className='bg-black text-white p-2 rounded flex items-center justify-center gap-2' type="submit" onClick={(e) => submitFunction(e)}>{loading && <AiOutlineLoading3Quarters className='spinner'/>}Login</button>
    </form>
    </div>
  );
}
