const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());

mongoose.connect(process.env.MONGO_URI)
  .then(() =
  .catch((err) =, err));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) =
  res.send("Servidor rodando com segurança!");
});

app.listen(PORT, () = rodando na porta ${PORT}`));
