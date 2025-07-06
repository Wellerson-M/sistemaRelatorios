const fs = require("fs");
const crypto = require("crypto");

const privateKey = fs.readFileSync("backend/crypto/private.pem", "utf8");
const publicKey = fs.readFileSync("backend/crypto/public.pem", "utf8");

function assinarTexto(texto) {
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(texto);
    signer.end();
    return signer.sign(privateKey, "base64");
}

function verificarAssinatura(texto, assinatura) {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(texto);
    verifier.end();
    return verifier.verify(publicKey, assinatura, "base64");
}

module.exports = {
    assinarTexto,
    verificarAssinatura,
};
