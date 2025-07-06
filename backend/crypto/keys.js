const fs = require("fs");
const { generateKeyPairSync } = require("crypto");

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "spki",
        format: "pem",
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
    },
});

fs.writeFileSync("backend/crypto/private.pem", privateKey);
fs.writeFileSync("backend/crypto/public.pem", publicKey);

console.log("Chaves geradas com sucesso.");
