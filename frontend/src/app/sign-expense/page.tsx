'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function SignExpensePage() {
    const [relatorios, setRelatorios] = useState<any[]>([])
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [assinandoId, setAssinandoId] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setErro('Você precisa estar logado')
            return
        }

        axios.get('http://localhost:5000/api/relatorios?status=validado', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                setRelatorios(res.data)
            })
            .catch(() => {
                setErro('Erro ao carregar relatórios')
            })
    }, [])

    const assinarRelatorio = async (id: string) => {
        const token = localStorage.getItem('token')
        if (!token) {
            setErro('Você precisa estar logado')
            return
        }
        setErro('')
        setSucesso('')
        setAssinandoId(id)

        try {
            const res = await axios.post(`http://localhost:5000/api/relatorios/${id}/assinar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (res.status === 200) {
                setSucesso(`Relatório ${id} assinado com sucesso!`)
                // Atualiza lista (remove ou marca como assinado)
                setRelatorios(prev => prev.filter(r => r._id !== id))
            }
        } catch {
            setErro('Erro ao assinar relatório')
        } finally {
            setAssinandoId(null)
        }
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Assinar Relatórios Validados</h1>

            {erro && <p className="text-red-600">{erro}</p>}
            {sucesso && <p className="text-green-600">{sucesso}</p>}

            {relatorios.length === 0 && <p>Nenhum relatório pendente de assinatura.</p>}

            <ul className="space-y-3">
                {relatorios.map(relatorio => (
                    <li key={relatorio._id} className="p-3 border rounded flex justify-between items-center">
                        <div>
                            <p><strong>{relatorio.titulo}</strong></p>
                            <p>{relatorio.conteudo}</p>
                        </div>
                        <button
                            disabled={assinandoId === relatorio._id}
                            onClick={() => assinarRelatorio(relatorio._id)}
                            className="bg-red-700 text-white px-4 py-2 rounded disabled:opacity-50"
                        >
                            {assinandoId === relatorio._id ? "Assinando..." : "Assinar"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
