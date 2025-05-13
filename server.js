const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { createObjectCsvWriter } = require('csv-writer');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para ver las respuestas directamente en el navegador
app.get('/ver-respuestas', (req, res) => {
    const filePath = path.join(__dirname, 'respuestas_encuesta.csv');
    
    fs.exists(filePath, (exists) => {
        if (!exists) {
            return res.status(500).send('No se encontraron respuestas.');
        }

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).send('Error al leer el archivo CSV.');
            }

            const filas = data.trim().split('\n');
            let tablaHTML = `
                <h1>Respuestas de la Encuesta</h1>
                <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <thead style="background-color: #4CAF50; color: white;">
                        <tr>
                            <th>¿Aceptó participar?</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Teléfono</th>
                            <th>¿Conoce al candidato?</th>
                            <th>¿Votaría por él?</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            filas.slice(1).forEach((fila) => {
                const columnas = fila.split(',');
                tablaHTML += `
                    <tr>
                        <td>${columnas[0]}</td>
                        <td>${columnas[1]}</td>
                        <td>${columnas[2]}</td>
                        <td>${columnas[3]}</td>
                        <td>${columnas[4]}</td>
                        <td>${columnas[5]}</td>
                    </tr>
                `;
            });

            tablaHTML += `
                    </tbody>
                </table>
            `;

            res.send(`<!DOCTYPE html>
            <html>
            <head>
                <title>Respuestas de la Encuesta</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    th { background-color: #4CAF50; color: white; }
                </style>
            </head>
            <body>
                ${tablaHTML}
            </body>
            </html>`);
        });
    });
});

// Ruta para guardar las respuestas en un archivo CSV
app.post('/guardar-respuestas', (req, res) => {
    const respuestas = req.body.respuestas;

    const csvWriter = createObjectCsvWriter({
        path: path.join(__dirname, 'respuestas_encuesta.csv'),
        header: [
            { id: 'participacion', title: '¿Aceptó participar?' },
            { id: 'nombre', title: 'Nombre' },
            { id: 'apellidos', title: 'Apellidos' },
            { id: 'telefono', title: 'Teléfono' },
            { id: 'conoceCandidato', title: '¿Conoce al candidato?' },
            { id: 'votaria', title: '¿Votaría por él?' },
        ],
        append: true
    });

    csvWriter.writeRecords(respuestas)
        .then(() => {
            res.send('Respuestas guardadas correctamente.');
        })
        .catch((err) => {
            res.status(500).send('Error al guardar las respuestas.');
        });
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'encuestas.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
