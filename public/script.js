const form = document.getElementById('pedidoForm');
const tbody = document.querySelector('#pedidos tbody');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.telefono && !data.mail) {
    mostrarAlerta("Ingresá al menos teléfono o mail", "warning");
  return;
}
  await fetch('/api/pedidos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
    mostrarAlerta('Pedido guardado correctamente', 'success');
  form.reset();
  cargarPedidos();
  document.getElementById('buscador').addEventListener('input', filtrarPedidos);

});

async function cargarPedidos() {
  const res = await fetch('/api/pedidos');
  const pedidos = await res.json();
  tbody.innerHTML = '';
  pedidos.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.id}</td>
      <td>${p.cliente}</td>
      <td>${p.equipo}</td>
      <td>${p.telefono || '-'}</td>
      <td>${p.mail || '-'}</td>
      <td>
        <span class="badge ${p.estado === 'reparado' ? 'bg-success' : 'bg-warning text-dark'}">
        ${p.estado}
        </span>
      </td>
      <td>${p.costo_estimado || '-'}</td>
      <td>${p.nota_tecnica || '-'}</td>
      <td>${p.accesorios || '-'}</td>
      <td>
        <button class="btn btn-success btn-sm me-1" onclick="marcarReparado(${p.id})" title="Marcar como reparado">
            <i class="bi bi-check-circle"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="eliminarPedido(${p.id})" title="Eliminar pedido">
            <i class="bi bi-trash"></i>
        </button>
    </td>
    `;
    tbody.appendChild(row);
  });
}

async function eliminarPedido(id) {
  const confirmar = confirm("¿Estás seguro de que querés eliminar este pedido?");
  if (!confirmar) return;

  await fetch(`/api/pedidos/${id}`, {
    method: 'DELETE'
  });
    mostrarAlerta('Pedido eliminado correctamente', 'danger');
  cargarPedidos();
}

function mostrarAlerta(mensaje, tipo = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.getElementById('alertContainer').appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}


async function marcarReparado(id) {
  const costo = prompt("Costo estimado:");
  const nota = prompt("Nota técnica (opcional):");
  await fetch(`/api/pedidos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: 'reparado', costo_estimado: parseFloat(costo), nota_tecnica: nota }),
  });
    mostrarAlerta('Pedido marcado como reparado', 'info');
  cargarPedidos();
}

function autoFecha() {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fechaInput').value = hoy;
}

function filtrarPedidos() {
  const texto = document.getElementById('buscador').value.toLowerCase();
  const filas = tbody.querySelectorAll('tr');

  filas.forEach(fila => {
    const cliente = fila.children[1].textContent.toLowerCase();
    const equipo = fila.children[2].textContent.toLowerCase();
    const coincide = cliente.includes(texto) || equipo.includes(texto);
    fila.style.display = coincide ? '' : 'none';
  });
}

function exportarExcel() {
  fetch('/api/pedidos')
    .then(res => res.json())
    .then(data => {
      const worksheet = XLSX.utils.json_to_sheet(data.map(p => ({
        ID: p.id,
        Cliente: p.cliente,
        Equipo: p.equipo,
        Teléfono: p.telefono,
        Email: p.mail,
        Estado: p.estado,
        Costo: p.costo_estimado,
        Nota_Técnica: p.nota_tecnica,
        Accesorios: p.accesorios,
        Fecha: p.fecha_ingreso
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");
      XLSX.writeFile(workbook, "pedidos.xlsx");
    });
}




cargarPedidos();
