"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        } else {
            setUser({ nome: "Usuário logado" }); // futuramente substituir por dados reais
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    if (!user) {
        return null; // evita exibir conteúdo durante redirecionamento
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Dashboard</h1>
            <p>Bem-vindo, {user.nome}!</p>
            <button onClick={handleLogout} style={{ marginTop: 10 }}>
                Sair
            </button>

            <hr style={{ margin: "20px 0" }} />

            <ul>
                <li><a href="/submitExpense">➕ Criar novo relatório</a></li>
                <li><a href="/sign-expense"> 📄 Ver relatórios não assinados</a></li>
                <li><a href="/signedExpenses">📄 Ver relatórios assinados</a></li>
                <li><a href="/validateExpense"> 📄 Validar relatorio</a></li>
                <li><a href="/verifySignature"> 📄 Verificar integridade</a></li>
            </ul>
        </div>
    );
}
