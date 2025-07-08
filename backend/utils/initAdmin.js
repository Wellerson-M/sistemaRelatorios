// backend/utils/initAdmin.js
const Usuario = require("../models/User");
const bcrypt = require("bcrypt");

async function criarAdminInicial() {
    try {
        const existe = await Usuario.findOne({ email: "joaozinho@admin.com" });

        if (!existe) {
            const senhaCriptografada = await bcrypt.hash("123456", 10);

            const admin = new Usuario({
                nome: "Administrador",
                email: "joaozinho@admin.com",
                senha: senhaCriptografada,
                cargo: "gerente",
            });

            await admin.save();
            console.log("✅ Usuário administrador criado com sucesso!");
        } else {
            console.log("ℹ️ Usuário administrador já existe.");
        }
    } catch (error) {
        console.error("❌ Erro ao criar usuário administrador:", error);
    }
}

module.exports = criarAdminInicial;
