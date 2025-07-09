const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

const criarAdminInicial = require('./utils/initAdmin'); // 👈 adicionado aqui

console.log('MONGO_URI carregado:', process.env.MONGO_URI);

const app = express();

// Permitir requisições do frontend na porta 3000
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

// Servir arquivos da pasta uploads (para ver recibos no frontend)
app.use('/uploads', express.static('uploads'));

// Rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rotas de relatórios
const relatorioRoutes = require('./routes/relatorioRoutes');
app.use('/api/relatorios', relatorioRoutes);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB conectado');

        criarAdminInicial(); // 👈 chamada aqui
        app.listen(5000, () => console.log('Servidor rodando na porta 5000'));
    })
    .catch((err) => console.error('Erro ao conectar:', err));
