const mongoose = require('mongoose');

const relatorioSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    conteudo: { type: String, required: true },
    valor: { type: Number, required: true },
    data: { type: Date, required: true }, // Campo 'data' para a despesa
    categoria: { type: String, required: true }, // Campo 'categoria'
    reciboUrl: { type: String, default: null }, // Caminho do arquivo de recibo (opcional)

    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Quem submeteu o relatório
    status: { type: String, enum: ['pendente', 'validado', 'assinado', 'rejeitado'], default: 'pendente' },

    // Array para armazenar múltiplas assinaturas
    assinaturas: [
        {
            assinatura: { type: String, required: true }, // A assinatura criptográfica
            assinanteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Quem assinou
            dadosAssinadosHash: { type: String, required: true }, // Hash do conteúdo exato que foi assinado
            timestamp: { type: Date, default: Date.now } // Quando a assinatura foi feita
        }
    ]
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('Relatorio', relatorioSchema);