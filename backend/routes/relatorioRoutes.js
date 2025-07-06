const express = require("express");
const router = express.Router();
const Relatorio = require("../models/Relatorio");
const verifyToken = require("../middleware/verifyToken");
const { assinarTexto, verificarAssinatura } = require("../utils/assinatura");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// --- Configuração do Multer para armazenamento de recibos ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/recibos");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Tipo de arquivo não permitido. Apenas imagens (JPG, PNG, GIF) ou PDF."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

// --- Rota para CRIAR relatório ---
router.post("/", verifyToken, upload.single("recibo"), async (req, res) => {
  const { titulo, conteudo, valor, data, categoria } = req.body;
  const reciboPath = req.file ? req.file.path : null;

  if (!titulo || !conteudo || !valor || !data || !categoria) {
    if (reciboPath) fs.unlinkSync(reciboPath);
    return res
      .status(400)
      .json({ erro: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    const novoRelatorio = new Relatorio({
      titulo,
      conteudo,
      valor: parseFloat(valor),
      data: new Date(data),
      categoria,
      reciboUrl: reciboPath
        ? `/uploads/recibos/${path.basename(reciboPath)}`
        : null,
      usuario: req.user.id,
      status: "pendente",
    });

    await novoRelatorio.save();
    res.status(201).json(novoRelatorio);
  } catch (err) {
    console.error("Erro ao salvar relatório:", err);
    if (reciboPath) fs.unlinkSync(reciboPath);
    res.status(500).json({ erro: "Erro ao salvar relatório" });
  }
});

// --- Rota para LISTAR relatórios ---
router.get("/", verifyToken, async (req, res) => {
  try {
    let query = { usuario: req.user.id };
if (req.query.status) {
  query.status = req.query.status.split(':')[0];
}

    const relatorios = await Relatorio.find(query).sort({ createdAt: -1 });
    res.json(relatorios);
  } catch (err) {
    console.error("Erro ao buscar relatórios:", err);
    res.status(500).json({ erro: "Erro ao buscar relatórios" });
  }
});

// --- Rota para VALIDAR relatório ---
router.put("/:id/validar", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const relatorio = await Relatorio.findById(id);
    if (!relatorio)
      return res.status(404).json({ erro: "Relatório não encontrado." });

    if (relatorio.status !== "pendente")
      return res
        .status(400)
        .json({ erro: "Relatório não está pendente para validação." });

    relatorio.status = "validado";
    await relatorio.save();

    res.status(200).json({ mensagem: "Relatório validado com sucesso!" });
  } catch (error) {
    console.error("Erro ao validar relatório:", error);
    res
      .status(500)
      .json({ erro: "Erro interno do servidor ao validar relatório." });
  }
});

// --- Rota para ASSINAR relatório ---
router.post("/:id/assinar", verifyToken, async (req, res) => {
  const relatorioId = req.params.id;
  const userId = req.user.id;

  try {
    const relatorio = await Relatorio.findById(relatorioId);
    if (!relatorio)
      return res.status(404).json({ erro: "Relatório não encontrado." });

    if (relatorio.status !== "validado")
      return res.status(400).json({
        erro: 'Relatório não está no status "validado" para assinatura.',
      });

    if (
      relatorio.assinaturas &&
      relatorio.assinaturas.some(
        (s) => s.assinanteId.toString() === userId
      )
    )
      return res
        .status(409)
        .json({ erro: "Relatório já assinado por este usuário." });

    const dadosParaAssinar = JSON.stringify({
      _id: relatorio._id.toString(),
      titulo: relatorio.titulo,
      conteudo: relatorio.conteudo,
      valor: relatorio.valor,
      data: relatorio.data.toISOString(),
      categoria: relatorio.categoria,
      reciboUrl: relatorio.reciboUrl,
      statusNoMomentoDaAssinatura: relatorio.status,
      assinanteId: userId,
      timestampAssinatura: new Date().toISOString(),
    });

    const assinaturaGerada = assinarTexto(dadosParaAssinar);
    const dadosAssinadosHash = crypto
      .createHash("sha256")
      .update(dadosParaAssinar)
      .digest("hex");

    if (!relatorio.assinaturas) relatorio.assinaturas = [];

    relatorio.assinaturas.push({
      assinatura: assinaturaGerada,
      assinanteId: userId,
      dadosAssinadosHash,
      timestamp: new Date(),
    });

    relatorio.status = "assinado";

    await relatorio.save();

    res
      .status(200)
      .json({ mensagem: "Relatório assinado com sucesso!", assinatura: assinaturaGerada });
  } catch (err) {
    console.error("Erro ao assinar relatório:", err);
    res
      .status(500)
      .json({ erro: "Erro interno do servidor ao assinar relatório." });
  }
});

// --- Rota para VERIFICAR assinatura ---
router.post("/:id/verificar-assinatura", verifyToken, async (req, res) => {
  const relatorioId = req.params.id;
  const { assinatura, dadosAssinadosHash } = req.body;

  try {
    const relatorio = await Relatorio.findById(relatorioId);
    if (!relatorio)
      return res.status(404).json({ erro: "Relatório não encontrado." });

    const assinaturaDoBanco = relatorio.assinaturas.find(
      (a) =>
        a.assinatura === assinatura &&
        a.dadosAssinadosHash === dadosAssinadosHash
    );

    if (!assinaturaDoBanco)
      return res.status(400).json({
        erro:
          "Assinatura não encontrada para este relatório ou dados de verificação inconsistentes.",
      });

    const dadosParaVerificar = JSON.stringify({
      _id: relatorio._id.toString(),
      titulo: relatorio.titulo,
      conteudo: relatorio.conteudo,
      valor: relatorio.valor,
      data: relatorio.data.toISOString(),
      categoria: relatorio.categoria,
      reciboUrl: relatorio.reciboUrl,
      statusNoMomentoDaAssinatura: "validado",
      assinanteId: assinaturaDoBanco.assinanteId.toString(),
      timestampAssinatura: assinaturaDoBanco.timestamp.toISOString(),
    });

    const currentDataHash = crypto
      .createHash("sha256")
      .update(dadosParaVerificar)
      .digest("hex");

    if (currentDataHash !== assinaturaDoBanco.dadosAssinadosHash) {
      console.log("ALERTA: Conteúdo do relatório modificado desde a assinatura!");
      return res.status(200).json({
        valida: false,
        mensagem: "Assinatura INVÁLIDA: Conteúdo modificado.",
      });
    }

    const valido = verificarAssinatura(
      dadosParaVerificar,
      assinaturaDoBanco.assinatura
    );

    res.status(200).json({
      valida: valido,
      mensagem: valido ? "Assinatura Válida!" : "Assinatura Inválida!",
    });
  } catch (err) {
    console.error("Erro ao verificar assinatura:", err);
    res
      .status(500)
      .json({ erro: "Erro interno do servidor ao verificar assinatura." });
  }
});

// --- Exporta o router ---
module.exports = router;
