'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Box,
  Paper,
} from '@mui/material';

const categorias = [
  'Alimentação',
  'Transporte',
  'Hospedagem',
  'Material de Escritório',
  'Outros',
];

export default function SubmitExpensePage() {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('');
  const [recibo, setRecibo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Verificação de autenticação ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setUser({ nome: 'Usuário logado' }); // pode ser substituído por dados reais depois
    }
    setCheckingAuth(false);
  }, []);

  // Redirecionando...
  if (checkingAuth) {
    return <p>Verificando autenticação...</p>;
  }

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado.');
      router.push('/login');
      setLoading(false);
      return;
    }

    if (!categoria) {
      alert('Por favor, selecione uma categoria.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('conteudo', conteudo);
    formData.append('valor', valor);
    formData.append('data', data);
    formData.append('categoria', categoria);
    if (recibo) {
      formData.append('recibo', recibo);
    }

    try {
      const response = await fetch('http://localhost:5000/api/relatorios', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert('Relatório enviado com sucesso!');
        setTitulo('');
        setConteudo('');
        setValor('');
        setData('');
        setCategoria('');
        setRecibo(null);
        router.push('/dashboard');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.erro || 'Falha ao enviar relatório'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar relatório:', error);
      alert('Erro de conexão ou servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component={Paper}
      elevation={4}
      className="max-w-xl mx-auto mt-10 p-8 bg-white rounded-xl"
      sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
    >
      <Typography variant="h4" gutterBottom color="primary" fontWeight="bold" align="center">
        Enviar Relatório de Despesa
      </Typography>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label="Título"
          variant="outlined"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Descrição / Conteúdo"
          variant="outlined"
          multiline
          rows={4}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Valor (R$)"
          variant="outlined"
          type="number"
          inputProps={{ min: 0, step: '0.01' }}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Data da Despesa"
          variant="outlined"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          fullWidth
        />

        <FormControl fullWidth required>
          <InputLabel id="categoria-label">Categoria</InputLabel>
          <Select
            labelId="categoria-label"
            value={categoria}
            label="Categoria"
            onChange={(e) => setCategoria(e.target.value)}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box>
          <InputLabel htmlFor="upload-recibo" sx={{ mb: 1 }}>
            Upload do Recibo (imagem ou PDF)
          </InputLabel>
          <input
            id="upload-recibo"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setRecibo(e.target.files?.[0] || null)}
            style={{ cursor: 'pointer' }}
          />
          {recibo && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'gray' }}>
              Arquivo selecionado: {recibo.name}
            </Typography>
          )}
        </Box>

        <Button 
          variant="contained" 
          color="primary" 
          type="submit" 
          size="large" 
          fullWidth
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </form>
    </Box>
  );
}
