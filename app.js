const express = require("express");
const db = require("./conexao");
const app = express();
const path = require("path");
const router = express.Router();
const ejs = require("ejs");

router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.html"));
});

// Adicione um middleware para processar dados de formulário
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

const ipAddress = "172.16.31.37"; //Endereço IP da máquina
const port = 3003;

app.listen(port, ipAddress, () => {
  console.log(`Servidor rodando em http://${ipAddress}:${port}`);
});

// Rota para lidar com a pesquisa
app.post("/pesquisar", async (req, res) => {
  const Escola = req.body.escola;
  const ano = req.body.ano;
  const ensino = req.body.ensino;
  const anosEscolares = req.body.anosEscolares;

  // Crie uma condição para construir a consulta SQL com base nos campos preenchidos
  let sql = "SELECT * FROM dados_escolares WHERE id_escola = ?";
  let params = [Escola];

  if (ano !== "Selecione") {
    sql += " AND ano = ?";
    params.push(ano);
  }

  if (ensino !== "Selecione") {
    sql += " AND ensino = ?";
    params.push(ensino);
  }

  if (anosEscolares !== "Selecione") {
    sql += " AND anos_escolares = ?";
    params.push(anosEscolares);
  }

  try {
    // Consulta ao banco de dados com base nos campos fornecidos
    const [rows, fields] = await db.execute(sql, params);

    // Verifica se há resultados
    if (rows.length > 0) {
      // Renderiza os dados usando EJS
      ejs.renderFile("arquivo.ejs", { rows: rows }, (err, html) => {
        if (err) {
          console.error("Erro ao renderizar o arquivo HTML:", err);
          res.status(500).send("<p>Erro interno do servidor</p>");
        } else {
          // Envie a resposta HTML renderizada
          res.send(html);
        }
      });
    } else {
      res.send("<p>Nenhum dado encontrado para os critérios fornecidos.</p>");
    }
  } catch (err) {
    console.error("Erro ao acessar o banco de dados:", err);
    res.status(500).send("<p>Erro interno do servidor</p>");
  }
});

app.post("/pesquisar2", async (req, res) => {
  const Escola = req.body.escola;

  // Consulta SQL com base no ID da escola, incluindo o ano
  const sql =
    "SELECT ano, nota_saeb_media_padronizada FROM dados_escolares WHERE id_escola = ?";
  const params = [Escola];

  try {
    // Consulta ao banco de dados com base no ID da escola
    const [rows, fields] = await db.execute(sql, params);

    // Verifica se há resultados
    if (rows.length > 0) {
      // Renderiza os dados usando EJS e envia a resposta para arquivo2.ejs
      ejs.renderFile("arquivo2.ejs", { pesquisa: rows }, (err, html) => {
        if (err) {
          console.error("Erro ao renderizar o arquivo HTML:", err);
          res.status(500).send("<p>Erro ao renderizar o arquivo HTML</p>");
        } else {
          // Envie a resposta HTML renderizada
          res.send(html);
        }
      });
    } else {
      res.send("<p>Nenhum dado encontrado para o ID da escola fornecido.</p>");
    }
  } catch (err) {
    console.error("Erro ao acessar o banco de dados:", err);
    res.status(500).send("<p>Erro ao acessar o banco de dados</p>");
  }
});
