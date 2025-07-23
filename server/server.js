const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/pedidos', (req, res) => {
  db.all('SELECT * FROM pedidos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.delete('/api/pedidos/:id', (req, res) => {
  db.run('DELETE FROM pedidos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});


app.post('/api/pedidos', (req, res) => {
  const { cliente, equipo, descripcion_falla, fecha_ingreso, accesorios, telefono, mail } = req.body;
  db.run(
    `INSERT INTO pedidos (cliente, equipo, descripcion_falla, fecha_ingreso, accesorios, telefono, mail) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cliente, equipo, descripcion_falla, fecha_ingreso, accesorios, telefono, mail],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/pedidos/:id', (req, res) => {
  const { estado, costo_estimado, nota_tecnica } = req.body;
  db.run(
    `UPDATE pedidos SET estado = ?, costo_estimado = ?, nota_tecnica = ? WHERE id = ?`,
    [estado, costo_estimado, nota_tecnica, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ updated: this.changes });
    }
  );
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
