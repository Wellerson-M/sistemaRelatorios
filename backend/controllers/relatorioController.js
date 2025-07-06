const Relatorio = require('../models/Relatorio');
const crypto = require('crypto');
const path = require('path');

// Criar relatório com upload de recibo
exports.createRelatorio = async (req, res) => {
    try {
        const { titulo, conteudo } = req.body;
        const reciboPath = req.file ? req.file.filename : null;

        const hash = crypto.createHash('sha256').update(conteudo).digest('hex');

        const novoRelatorio = new Relatorio({
            titulo,
            conteudo,
            autor: req.usuarioId,
            hashAssinatura: hash,
            recibo: reciboPath
        });

        await novoRelatorio.save();
        res.status(201).json(novoRelatorio);
    } catch (err) {
        console.error(err);
        res.status(500).json({ erro: 'Erro ao criar relatório' });
    }
};

// Listar relatórios do usuário logado
exports.getRelatorios = async (req, res) => {
    try {
        const relatorios = await Relatorio.find({ autor: req.usuarioId });
        res.json(relatorios);
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar relatórios' });
    }
};

// Ver relatório por ID + verificar integridade
exports.getRelatorioById = async (req, res) => {
    try {
        const relatorio = await Relatorio.findById(req.params.id);
        if (!relatorio) return res.status(404).json({ erro: 'Relatório não encontrado' });

        const hashAtual = crypto.createHash('sha256').update(relatorio.conteudo).digest('hex');
        const assinaturaValida = hashAtual === relatorio.hashAssinatura;

        res.json({ relatorio, assinaturaValida });
    } catch (err) {
        res.status(500).json({ erro: 'Erro ao buscar relatório' });
    }
};
