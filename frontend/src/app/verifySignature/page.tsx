'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Assinatura {
    assinatura: string;
    dadosAssinadosHash: string;
    assinanteId: string;
    timestamp: string;
}

interface Relatorio {
    _id: string;
    titulo: string;
    conteudo: string;
    valor: number;
    data: string;
    categoria: string;
    reciboUrl: string;
    assinaturas: Assinatura[];
}

export default function VerifySignaturePage() {
    const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
    const [verificandoId, setVerificandoId] = useState<string | null>(null);
    const [mensagemResultado, setMensagemResultado] = useState<string | null>(null);

    useEffect(() => {
        const carregarRelatorios = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/relatorios?status=assinado', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRelatorios(res.data);
            } catch (error) {
                console.error('Erro ao buscar relatórios:', error);
            }
        };

        carregarRelatorios();
    }, []);

    const gerarHashSHA256 = async (texto: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(texto);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    const verificarAssinatura = async (relatorio: Relatorio) => {
        const assinatura = relatorio.assinaturas[0];
        if (!assinatura) {
            setMensagemResultado('Este relatório não possui assinatura.');
            return;
        }

        setVerificandoId(relatorio._id);
        setMensagemResultado(null);

        const dadosParaVerificar = JSON.stringify({
            _id: relatorio._id,
            titulo: relatorio.titulo,
            conteudo: relatorio.conteudo,
            valor: relatorio.valor,
            data: new Date(relatorio.data).toISOString(),
            categoria: relatorio.categoria,
            reciboUrl: relatorio.reciboUrl,
            statusNoMomentoDaAssinatura: 'validado',
            assinanteId: assinatura.assinanteId,
            timestampAssinatura: new Date(assinatura.timestamp).toISOString(),
        });

        const hash = await gerarHashSHA256(dadosParaVerificar);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `/api/relatorios/${relatorio._id}/verificar-assinatura`,
                {
                    assinatura: assinatura.assinatura,
                    dadosAssinadosHash: hash,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMensagemResultado(res.data.mensagem);
        } catch (error) {
            console.error('Erro ao verificar assinatura:', error);
            setMensagemResultado('Erro ao verificar assinatura.');
        } finally {
            setVerificandoId(null);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Verificação de Assinatura</h1>

            {relatorios.map((relatorio) => (
                <div key={relatorio._id} className="border rounded p-4 mb-4 shadow-md">
                    <h2 className="text-xl font-semibold">{relatorio.titulo}</h2>
                    <p className="text-sm text-gray-700">{relatorio.conteudo}</p>
                    <p><strong>Valor:</strong> R$ {relatorio.valor.toFixed(2)}</p>
                    <p><strong>Data:</strong> {new Date(relatorio.data).toLocaleDateString()}</p>
                    <button
                        onClick={() => verificarAssinatura(relatorio)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={verificandoId === relatorio._id}
                    >
                        {verificandoId === relatorio._id ? 'Verificando...' : 'Verificar Assinatura'}
                    </button>
                </div>
            ))}

            {mensagemResultado && (
                <div className="mt-4 p-4 rounded bg-gray-100 border">
                    <p className="font-bold">{mensagemResultado}</p>
                </div>
            )}
        </div>
    );
}
