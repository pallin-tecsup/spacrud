const express = require("express");
const mysql = require("mysql");

const app = express();

app.use("/css", express.static(__dirname + "/css"));
app.use("/img", express.static(__dirname + "/img"));
app.use("/js", express.static(__dirname + "/js"));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const conexion = mysql.createConnection({
    host: "localhost",
    database: "js",
    user: "root",
    password: ""
});

// MOSTRAR TU PÁGINA PRINCIPAL
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// CREATE: REGISTRAR
app.post("/validar", function (req, res) {
    const { dni, nombres, correo, password } = req.body;

    const sql = `
        INSERT INTO info (dni, nombres, correo, password)
        VALUES (?, ?, ?, ?)
    `;

    conexion.query(
        sql,
        [dni, nombres, correo, password],
        function (error) {
            if (error) {
                console.error(error);
                return res.status(500).send("Error al registrar");
            }

            res.redirect("/usuarios");
        }
    );
});

// READ: LISTAR
app.get("/usuarios", function (req, res) {
    const sql = "SELECT dni, nombres, correo FROM info";

    conexion.query(sql, function (error, resultados) {
        if (error) {
            console.error(error);
            return res.status(500).send("Error al listar");
        }

        res.render("usuarios", { usuarios: resultados });
    });
});

// MOSTRAR EL FORMULARIO PARA EDITAR
app.get("/editar/:dni", function (req, res) {
    const sql = "SELECT dni, nombres, correo FROM info WHERE dni = ?";

    conexion.query(sql, [req.params.dni], function (error, resultados) {
        if (error) {
            console.error(error);
            return res.status(500).send("Error al buscar");
        }

        if (resultados.length === 0) {
            return res.status(404).send("Usuario no encontrado");
        }

        res.render("editar", { usuario: resultados[0] });
    });
});

// UPDATE: ACTUALIZAR
app.post("/actualizar/:dni", function (req, res) {
    const { nombres, correo } = req.body;

    const sql = "UPDATE info SET nombres = ?, correo = ? WHERE dni = ?";

    conexion.query(
        sql,
        [nombres, correo, req.params.dni],
        function (error) {
            if (error) {
                console.error(error);
                return res.status(500).send("Error al actualizar");
            }

            res.redirect("/usuarios");
        }
    );
});

// DELETE: ELIMINAR
app.post("/eliminar/:dni", function (req, res) {
    const sql = "DELETE FROM info WHERE dni = ?";

    conexion.query(sql, [req.params.dni], function (error) {
        if (error) {
            console.error(error);
            return res.status(500).send("Error al eliminar");
        }

        res.redirect("/usuarios");
    });
});

app.listen(3000, function () {
    console.log("Servidor creado en http://localhost:3000");
});