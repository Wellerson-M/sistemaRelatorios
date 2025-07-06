// pages/signedExpenses.js
'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Button, Typography, Box, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function SignedExpensesPage() {
    const [relatoriosAssinados, setRelatoriosAssinados] = useState<any[]>([])
    const [erro, setErro] = useState('')
    const [sucesso, setSucesso] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const fetchRelatoriosAssinados = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            setErro('Você precisa estar logado.')
            router.push('/login')
            return
        }
        setLoading(true)
        setErro('')
        setSucesso('')
        try {
            // Busca apenas relatórios com status 'assinado'
            const res = await axios.get('http://localhost:5000/api/relatorios?status=assinado', {
                headers: { Authorization: `Bearer ${token}` },
            })
            setRelatoriosAssinados(res.data)
        } catch (err: any) {
            console.error('Erro ao carregar relatórios assinados:', err)
            setErro(err.response?.data?.erro || 'Erro ao carregar relatórios assinados.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRelatoriosAssinados()
    }, [])

    const handleVerifySignature = async (relatorioId: string, assinaturaObj: any) => {
        const token = localStorage.getItem('token')
        if (!token) {
            setErro('Você precisa estar logado.')
            router.push('/login')
            return
        }
        setLoading(true)
        setErro('')
        setSucesso('')
        try {
            const res = await axios.post(`http://localhost:5000/api/relatorios/${relatorioId}/verificar-assinatura`,
                {
                    assinatura: assinaturaObj.assinatura,
                    dadosAssinadosHash: assinaturaObj.dadosAssinadosHash
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            )

            if (res.status === 200 && res.data.valida) {
                setSucesso(`Assinatura do relatório "${relatorioId}" é VÁLIDA!`)
                alert(`Assinatura VÁLIDA para o relatório: ${relatorioId}`)
            } else {
                setErro(`Assinatura do relatório "${relatorioId}" é INVÁLIDA! ${res.data.mensagem || ''}`)
                alert(`Assinatura INVÁLIDA para o relatório: ${relatorioId}\nDetalhes: ${res.data.mensagem || 'Verifique o console para mais informações.'}`)
            }
        } catch (error: any) {
            console.error('Erro ao verificar assinatura:', error)
            setErro(error.response?.data?.erro || 'Erro ao verificar assinatura.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box component={Paper} elevation={4} className="p-6 max-w-5xl mx-auto my-8">
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold" color="secondary">
                Relatórios Assinados
            </Typography>

            {loading && <p className="text-center text-blue-600">Carregando relatórios...</p>}
            {erro && <p className="text-red-600 text-center mb-4">{erro}</p>}
            {sucesso && <p className="text-green-600 text-center mb-4">{sucesso}</p>}

            {relatoriosAssinados.length === 0 && !loading && <p className="text-gray-600 text-center mt-4">Nenhum relatório assinado encontrado.</p>}

            <List>
                {relatoriosAssinados.map(relatorio => (
                    <ListItem key={relatorio._id} divider className="flex flex-col items-start py-4">
                        <ListItemText
                            primary={
                                <Typography variant="h6" component="span">
                                    {relatorio.titulo}
                                </Typography>
                            }
                            secondary={
                                <>
                                    <Typography variant="body2" color="textSecondary">
                                        {relatorio.conteudo}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Valor: R$ {relatorio.valor.toFixed(2)} | Data: {new Date(relatorio.data).toLocaleDateString()} | Categoria: {relatorio.categoria}
                                    </Typography>
                                    {relatorio.reciboUrl && (
                                        <a
                                            href={`http://localhost:5000${relatorio.reciboUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline text-sm"
                                        >
                                            Ver Recibo
                                        </a>
                                    )}
                                </>
                            }
                            className="w-full"
                        />
                        <Box className="w-full mt-3">
                            {relatorio.assinaturas && relatorio.assinaturas.length > 0 ? (
                                <Box className="space-y-2">
                                    <Typography variant="subtitle1" fontWeight="medium">Assinaturas:</Typography>
                                    {relatorio.assinaturas.map((ass: any, idx: number) => (
                                        <Paper key={idx} elevation={1} className="p-3 flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md">
                                            <Box>
                                                <Typography variant="body2">
                                                    Assinado por ID: <span className="font-mono text-xs text-gray-700">{ass.assinanteId}</span>
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Em: {new Date(ass.timestamp).toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <IconButton edge="end" aria-label="verify" onClick={() => handleVerifySignature(relatorio._id, ass)} disabled={loading}>
                                                <VerifiedUserIcon color="primary" />
                                            </IconButton>
                                        </Paper>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary">Nenhuma assinatura encontrada para este relatório.</Typography>
                            )}
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}