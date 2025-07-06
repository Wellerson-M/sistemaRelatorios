const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    const userExistente = await User.findOne({ email });
    if (userExistente) {
      return res.status(400).json({ mensagem: 'Usuário já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({
      nome,
      email,
      senha: senhaHash,
      cargo
    });

    await novoUsuario.save();

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar usuário', detalhes: err.message });
  }
});

module.exports = router;


// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensagem: 'Usuário não encontrado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'Senha incorreta' });
    }

    const token = jwt.sign(
      { id: usuario._id, cargo: usuario.cargo },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      mensagem: 'Login bem-sucedido',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      }
    });

  } catch (err) {
    res.status(500).json({ erro: 'Erro no login', detalhes: err.message });
  }
});
