# 📄 sistemaRelatorios

**🔐 Projeto prático da disciplina de Segurança da Informação**  
Sistema web desenvolvido com Node.js, Next.js e MongoDB, com foco em autenticação, criptografia e assinatura digital de relatórios.

---

## 🚧 Status do Projeto

> ✅ Entregue como atividade da disciplina  
> ⚠️ Algumas funcionalidades previstas no enunciado ainda não foram implementadas por limitação de tempo, mas o projeto continua em desenvolvimento

---

## 🧩 Funcionalidades implementadas

- ✅ Registro e login de usuários com autenticação via JWT  
- ✅ Criação automática de um usuário administrador no primeiro acesso ao backend  
- ✅ Upload de relatórios e recibos  
- ✅ Assinatura digital dos relatórios usando Web Crypto API  
- ✅ Verificação da assinatura no frontend  
- ✅ Proteção de rotas com autenticação JWT  
- ✅ Helmet para reforço da segurança no backend  
- ✅ Envio de e-mails com Nodemailer  
- ✅ Integração completa com MongoDB  
- ✅ Interface em Next.js com páginas protegidas e públicas

---

## 🛠 Tecnologias utilizadas

**Backend**  
- Node.js  
- Express  
- MongoDB  
- Mongoose  
- JSON Web Token (JWT)  
- bcrypt  
- Helmet  

**Frontend**  
- Next.js (React)  
- Material UI (MUI)  
- Axios  
- Web Crypto API  
- HTML / CSS / JavaScript

---

## 🚀 Como executar localmente

### 1. Pré-requisitos

- Node.js instalado
- MongoDB local ou MongoDB Atlas
- Editor de código (como VS Code)

### 2. Clone o projeto

```
git clone https://github.com/Wellerson-M/sistemaRelatorios.git
cd sistemaRelatorios
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e edite com suas credenciais:

```
cp backend/.env.example backend/.env
```

Exemplo de conteúdo do `.env`:

```
MONGO_URI=mongodb://127.0.0.1:27017/relatoriosDB
JWT_SECRET=sua_chave_secreta_aqui

```

> 💡 Ao iniciar o backend, um usuário administrador será criado automaticamente se não existir:
> - **Email:** joaozinho@admin.com  
> - **Senha:** 123456  
> - **Cargo:** gerente

# 📦 Instalação das dependências

> Na **raiz do projeto**, execute:

```
npm install
```

Esse comando instalará automaticamente as dependências do **frontend** e do **backend** via `workspaces`.

---

## ▶️ Execução do projeto (frontend + backend)

> Ainda na **raiz do projeto**, execute:

```
npm run dev
```

- 🖥️ O backend rodará na porta `5000`
- 🌐 O frontend será iniciado em: `http://localhost:3000`  
- 🔁 O projeto redireciona automaticamente para a tela de **login**

---

## ⚙️ Estrutura do Projeto

```
sistemaRelatorios/
├── backend/
│   ├── controllers/
│   ├── crypto/
│   ├── middleware/
│   ├── models/ 
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── components/
│   ├── pages/
│   └── public/
├── package.json
├── README.md
└── .gitignore
```

---

## 📈 Melhorias futuras

- [ ] Validação criptográfica mais robusta  
- [ ] Criação de níveis de acesso mais refinados (gerente, funcionário, auditor)  
- [ ] Histórico de assinaturas e alterações  
- [ ] Upload com barra de progresso  
- [ ] Deploy com CI/CD (ex: Vercel + Render)  
- [ ] Melhorias visuais (responsividade e acessibilidade)

---

## 💡 Aprendizados

- Criação de autenticação segura com JWT  
- Uso de criptografia com chave pública/privada (Web Crypto API)  
- Manipulação segura de arquivos no frontend/backend  
- Integração entre Next.js e Express com MongoDB  
- Boas práticas de segurança usando Helmet e bcrypt

---

## 📝 Licença

Este projeto é de cunho educacional e está sob a licença MIT.

---

## 📫 Contato

- [LinkedIn](https://www.linkedin.com/in/wellerson-meredyk-a2b38b1ab/)
