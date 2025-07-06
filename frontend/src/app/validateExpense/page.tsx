'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function ValidateExpensePage() {
    const [relatorios, setRelatorios] = useState<any[]>([])
    const [mensagem, setMensagem] = useState('')
    const [validando, setValidando] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios.get('http://localhost:5000/api/relatorios?status=pendente', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setRelatorios(res.data)
        }).catch(() => {
            setMensagem('Erro ao carregar relatórios pendentes')
        })
    }, [])

    // 👉 AQUI está a função que usa o axios.put corretamente
    const validarRelatorio = async (id: string) => {
        const token = localStorage.getItem('token')
        setValidando(id)
        setMensagem('')

        try {
            await axios.put(`http://localhost:5000/api/relatorios/${id}/validar`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Atualiza a lista, removendo o validado
            setRelatorios(prev => prev.filter(r => r._id !== id))
            setMensagem('Relatório validado com sucesso!')
        } catch (err) {
            setMensagem('Erro ao validar relatório')
        } finally {
            setValidando(null)
        }
    }

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Validar Relatórios Pendentes</h1>

            {mensagem && <p className="text-blue-600 mb-2">{mensagem}</p>}

            {relatorios.length === 0 ? (
                <p>Nenhum relatório pendente.</p>
            ) : (
                <ul className="space-y-3">
                    {relatorios.map(r => (
                        <li key={r._id} className="p-3 border rounded flex justify-between items-center">
                            <div>
                                <p><strong>{r.titulo}</strong></p>
                                <p>{r.conteudo}</p>
                            </div>
                            <button
                                disabled={validando === r._id}
                                onClick={() => validarRelatorio(r._id)}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                {validando === r._id ? 'Validando...' : 'Validar'}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
