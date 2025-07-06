'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        senha
      })

      const token = response.data.token
      localStorage.setItem('token', token)
      

      router.push('/dashboard')
    } catch (err: any) {
      setErro(err.response?.data?.mensagem || 'Erro ao fazer login')
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <button type="submit" className="bg-red-700 text-white w-full p-2 rounded">
          Entrar
        </button>
      </form>
      {erro && <p className="text-red-600 mt-2">{erro}</p>}
    </div>
  )
}
