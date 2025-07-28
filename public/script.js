/**
 * Sistema de Gestión de Reparaciones - Frontend
 * JavaScript para la interfaz de usuario
 * 
 * @author Enlaces Comunicaciones
 * @version 2.0.0
 */

// ==========================================
// CONFIGURACIÓN Y UTILIDADES
// ==========================================

/**
 * Configuración de la aplicación
 */
const CONFIG = {
  API_BASE_URL: '/api',
  TOKEN_KEY: 'authToken',
  USER_KEY: 'userInfo',
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  AUTO_REFRESH_INTERVAL: 10000 // 10 segundos
};

// Variable para controlar el intervalo de auto-refresh
let autoRefreshInterval = null;

/**
 * Verificar autenticación al cargar la página
 */
function verificarAuth() {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

/**
 * Obtener headers con autenticación
 */
function getAuthHeaders() {
  const token = localStorage.getItem(CONFIG.TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Manejar errores de autenticación
 */
function handleAuthError(response) {
  if (response.status === 403 || response.status === 401) {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    window.location.href = '/login.html';
    return true;
  }
  return false;
}

/**
 * Formatear fecha para Argentina
 */
function formatearFecha(fechaString) {
  if (!fechaString) return '-';
  
  try {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-AR', {
      timeZone: CONFIG.TIMEZONE,
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    return '-';
  }
}

/**
 * Obtener fecha actual en formato argentino
 */
function fechaActualArgentina() {
  return new Date().toLocaleDateString('es-AR', {
    timeZone: CONFIG.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-');
}

/**
 * Mostrar alerta con Bootstrap
 */
function mostrarAlerta(mensaje, tipo = 'info') {
  const alertContainer = document.getElementById('alertContainer') || document.body;
  const alertId = `alert-${Date.now()}`;
  
  const alertHTML = `
    <div id="${alertId}" class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
  
  alertContainer.insertAdjacentHTML('afterbegin', alertHTML);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    const alertElement = document.getElementById(alertId);
    if (alertElement) {
      alertElement.remove();
    }
  }, 5000);
}

// ==========================================
// GESTIÓN DE USUARIO
// ==========================================

/**
 * Mostrar información del usuario logueado
 */
function mostrarInfoUsuario() {
  const userInfo = localStorage.getItem(CONFIG.USER_KEY);
  const userInfoElement = document.getElementById('userInfo');
  
  if (userInfo && userInfoElement) {
    const user = JSON.parse(userInfo);
    userInfoElement.textContent = `Bienvenido, ${user.username}`;
  }
}

/**
 * Cerrar sesión
 */
function cerrarSesion() {
  if (confirm('¿Estás seguro que querés cerrar sesión?')) {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    window.location.href = '/login.html';
  }
}

// ==========================================
// GESTIÓN DE PEDIDOS
// ==========================================

/**
 * Cargar y mostrar pedidos
 */
async function cargarPedidos() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/pedidos`, {
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    
    if (!response.ok) {
      throw new Error('Error al cargar pedidos');
    }
    
    const pedidos = await response.json();
    cargarTabla(pedidos);
    
    // Actualizar timestamp de última actualización
    actualizarTimestampRefresh();
  } catch (error) {
    mostrarAlerta('Error al cargar las órdenes: ' + error.message, 'danger');
  }
}

/**
 * Cargar datos en la tabla
 */
function cargarTabla(pedidos) {
  const tbody = document.querySelector('#pedidos tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (pedidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center text-muted">
          No hay órdenes registradas
        </td>
      </tr>
    `;
    return;
  }
  
  pedidos.forEach(pedido => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.cliente || '-'}</td>
      <td>${pedido.equipo || '-'}</td>
      <td>${pedido.telefono || '-'}</td>
      <td>${pedido.mail || '-'}</td>
      <td>
        <span class="badge bg-${getEstadoBadgeColor(pedido.estado)}">
          ${pedido.estado || 'pendiente'}
        </span>
      </td>
      <td>$${pedido.costo_estimado || '0'}</td>
      <td class="text-wrap" style="max-width: 200px; font-size: 0.9em;">
        ${pedido.nota_tecnica ? 
          `<span class="text-muted" title="${pedido.nota_tecnica}">${pedido.nota_tecnica.length > 50 ? pedido.nota_tecnica.substring(0, 50) + '...' : pedido.nota_tecnica}</span>` 
          : '<span class="text-muted">-</span>'
        }
      </td>
      <td class="text-center">
        ${generateActionButtons(pedido)}
      </td>
      <td>${formatearFecha(pedido.fecha_ingreso)}</td>
      <td>${formatearFecha(pedido.fecha_reparado)}</td>
      <td>${formatearFecha(pedido.fecha_retiro)}</td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Obtener color del badge según el estado
 */
function getEstadoBadgeColor(estado) {
  const colors = {
    'pendiente': 'warning',     // 🟡 Amarillo
    'reparado': 'success',      // 🟢 Verde
    'retirado': 'info'          // 🔵 Celeste (finalizado)
  };
  return colors[estado] || 'secondary';
}

/**
 * Generar botones de acción según el estado
 */
function generateActionButtons(pedido) {
  let buttons = '';
  
  // Solo mostrar botón "Reparado" si está pendiente
  if (pedido.estado === 'pendiente') {
    buttons += `
      <button class="btn btn-success btn-sm me-1" onclick="marcarReparado(${pedido.id})" title="Completar reparación">
        <i class="bi bi-check-circle-fill me-1"></i>Reparado
      </button>
    `;
  }
  
  // Botón "Retirar" si está reparado
  if (pedido.estado === 'reparado') {
    buttons += `
      <button class="btn btn-info btn-sm me-1" onclick="marcarRetirado(${pedido.id})" title="Marcar como retirado">
        <i class="bi bi-box-arrow-up me-1"></i>Retirar
      </button>
    `;
  }
  
  // Botón de eliminar siempre disponible
  buttons += `
    <button class="btn btn-outline-danger btn-sm" onclick="eliminarPedido(${pedido.id})" title="Eliminar pedido">
      <i class="bi bi-trash"></i>
    </button>
  `;
  
  return buttons;
}

/**
 * Marcar pedido como reparado - Abre modal para completar datos
 */
function marcarReparado(id) {
  // Guardar el ID en el campo oculto del modal
  document.getElementById('pedidoIdReparado').value = id;
  
  // Limpiar los campos del formulario
  document.getElementById('costoFinal').value = '';
  document.getElementById('notaTecnica').value = '';
  
  // Mostrar el modal
  const modal = new bootstrap.Modal(document.getElementById('modalReparado'));
  modal.show();
}

/**
 * Confirmar y procesar la reparación con los datos del modal
 */
async function confirmarReparado() {
  const id = document.getElementById('pedidoIdReparado').value;
  const costoFinal = document.getElementById('costoFinal').value;
  const notaTecnica = document.getElementById('notaTecnica').value;
  
  // Validar campos requeridos
  if (!costoFinal || !notaTecnica) {
    mostrarToast('Por favor complete todos los campos', 'warning');
    return;
  }
  
  try {
    // Actualizar el pedido con los datos de reparación
    await actualizarEstadoPedido(id, 'reparado', {
      fecha_reparado: fechaActualArgentina(),
      costo_estimado: parseFloat(costoFinal),
      nota_tecnica: notaTecnica
    });
    
    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalReparado'));
    modal.hide();
    
    mostrarToast('Equipo marcado como reparado exitosamente', 'success');
  } catch (error) {
    console.error('Error al marcar como reparado:', error);
    mostrarToast('Error al procesar la reparación', 'error');
  }
}

/**
 * Marcar pedido como retirado - Abre modal
 */
function marcarRetirado(id) {
  document.getElementById('pedidoIdRetirado').value = id;
  document.getElementById('esMismoDueno').checked = false;
  document.getElementById('retiradoPor').value = '';
  document.getElementById('retiradoPor').required = true;
  document.getElementById('campoRetiroPor').style.display = 'block';
  
  const modal = new bootstrap.Modal(document.getElementById('modalRetirado'));
  modal.show();
}

/**
 * Alternar campo de retiro según checkbox
 */
function toggleRetiroPor() {
  const checkbox = document.getElementById('esMismoDueno');
  const campo = document.getElementById('campoRetiroPor');
  const input = document.getElementById('retiradoPor');
  
  if (checkbox.checked) {
    campo.style.display = 'none';
    input.required = false;
    input.value = '';
  } else {
    campo.style.display = 'block';
    input.required = true;
  }
}

/**
 * Confirmar retiro desde modal
 */
async function confirmarRetirado() {
  try {
    const pedidoId = document.getElementById('pedidoIdRetirado').value;
    const esMismoDueno = document.getElementById('esMismoDueno').checked;
    const retiradoPor = document.getElementById('retiradoPor').value.trim();
    
    // Validar datos
    if (!esMismoDueno && !retiradoPor) {
      mostrarToast('Por favor complete quién retiró el equipo', 'error');
      return;
    }
    
    // Preparar datos para enviar
    const datosRetiro = {
      fecha_retiro: fechaActualArgentina(),
      es_mismo_dueno: esMismoDueno,
      retirado_por: esMismoDueno ? null : retiradoPor
    };
    
    await actualizarEstadoPedido(pedidoId, 'retirado', datosRetiro);
    
    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalRetirado'));
    modal.hide();
    
    mostrarToast('Equipo marcado como retirado exitosamente', 'success');
  } catch (error) {
    console.error('Error al marcar como retirado:', error);
    mostrarToast('Error al procesar el retiro', 'error');
  }
}

/**
 * Actualizar estado de pedido
 */
async function actualizarEstadoPedido(id, nuevoEstado, camposAdicionales = {}) {
  try {
    const body = {
      estado: nuevoEstado,
      ...camposAdicionales
    };
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/pedidos/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });
    
    if (handleAuthError(response)) return;
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en el servidor');
    }
    
    mostrarAlerta(`Orden marcada como ${nuevoEstado}`, 'success');
    cargarPedidos();
  } catch (error) {
    mostrarAlerta(`Error al actualizar: ${error.message}`, 'danger');
  }
}

/**
 * Eliminar pedido
 */
async function eliminarPedido(id) {
  if (!confirm("¿Estás seguro de que querés eliminar esta orden?")) return;
  
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/pedidos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    
    if (!response.ok) {
      throw new Error('Error al eliminar pedido');
    }
    
    mostrarAlerta('Orden eliminada exitosamente', 'success');
    cargarPedidos();
  } catch (error) {
    mostrarAlerta('Error al eliminar: ' + error.message, 'danger');
  }
}

/**
 * Buscar pedidos
 */
async function buscarPedidos() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;
  
  const term = searchInput.value.trim();
  const url = term 
    ? `${CONFIG.API_BASE_URL}/buscar?term=${encodeURIComponent(term)}`
    : `${CONFIG.API_BASE_URL}/pedidos`;
  
  try {
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    
    if (handleAuthError(response)) return;
    
    if (!response.ok) {
      throw new Error('Error en la búsqueda');
    }
    
    const pedidos = await response.json();
    cargarTabla(pedidos);
  } catch (error) {
    mostrarAlerta('Error al buscar: ' + error.message, 'danger');
  }
}

/**
 * Exportar a Excel
 */
function exportarExcel() {
  if (typeof XLSX === 'undefined') {
    mostrarAlerta('Error: Librería XLSX no cargada', 'danger');
    return;
  }
  
  fetch(`${CONFIG.API_BASE_URL}/pedidos`, {
    headers: getAuthHeaders()
  })
    .then(res => {
      if (handleAuthError(res)) return;
      return res.json();
    })
    .then(data => {
      if (!data) return;
      
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
        Fecha_Ingreso: formatearFecha(p.fecha_ingreso),
        Fecha_Reparado: formatearFecha(p.fecha_reparado),
        Fecha_Retiro: formatearFecha(p.fecha_retiro)
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Ordenes_Reparacion");
      
      const fileName = `ordenes_reparacion_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      mostrarAlerta('Archivo Excel generado exitosamente', 'success');
    })
    .catch(error => {
      mostrarAlerta('Error al exportar: ' + error.message, 'danger');
    });
}

// ==========================================
// AUTO-REFRESH SYSTEM
// ==========================================

/**
 * Iniciar auto-refresh
 */
function iniciarAutoRefresh() {
  // Limpiar cualquier intervalo existente
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  // Configurar nuevo intervalo
  autoRefreshInterval = setInterval(() => {
    console.log('🔄 Auto-refresh: Actualizando datos...');
    cargarPedidos();
  }, CONFIG.AUTO_REFRESH_INTERVAL);
  
  console.log('✅ Auto-refresh iniciado cada', CONFIG.AUTO_REFRESH_INTERVAL / 1000, 'segundos');
}

/**
 * Detener auto-refresh
 */
function detenerAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('⏹️ Auto-refresh detenido');
  }
}

/**
 * Actualizar timestamp de última actualización
 */
function actualizarTimestampRefresh() {
  const ahora = new Date().toLocaleTimeString('es-AR', {
    timeZone: CONFIG.TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Agregar indicador visual si no existe
  let indicator = document.getElementById('refreshIndicator');
  if (!indicator) {
    const header = document.querySelector('.card-header .col-md-6 h2');
    if (header) {
      indicator = document.createElement('small');
      indicator.id = 'refreshIndicator';
      indicator.className = 'text-muted ms-2';
      header.parentNode.appendChild(indicator);
    }
  }
  
  if (indicator) {
    indicator.innerHTML = `<i class="bi bi-arrow-clockwise me-1"></i>Última actualización: ${ahora}`;
  }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================

/**
 * Inicializar la aplicación
 */
function inicializarApp() {
  // Verificar autenticación
  if (!verificarAuth()) return;
  
  // Mostrar información del usuario
  mostrarInfoUsuario();
  
  // Configurar formulario si existe
  const form = document.getElementById('pedidoForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await crearPedido(new FormData(form));
    });
  }
  
  // Configurar búsqueda si existe
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', buscarPedidos);
  }
  
  // Cargar pedidos iniciales
  cargarPedidos();
  
  // Iniciar auto-refresh
  iniciarAutoRefresh();
  
  // Detener auto-refresh cuando la página se oculta
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      detenerAutoRefresh();
    } else {
      iniciarAutoRefresh();
    }
  });
}

/**
 * Crear nuevo pedido
 */
async function crearPedido(formData) {
  try {
    const data = Object.fromEntries(formData);
    
    // Validación básica
    if (!data.telefono && !data.mail) {
      mostrarAlerta("Ingresá al menos teléfono o mail", "warning");
      return;
    }
    
    const response = await fetch(`${CONFIG.API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (handleAuthError(response)) return;
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear pedido');
    }
    
    mostrarAlerta('Orden creada exitosamente', 'success');
    document.getElementById('pedidoForm').reset();
    cargarPedidos();
  } catch (error) {
    mostrarAlerta('Error al crear orden: ' + error.message, 'danger');
  }
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarApp);

// Hacer funciones globales para uso en HTML
window.cerrarSesion = cerrarSesion;
window.marcarReparado = marcarReparado;
window.confirmarReparado = confirmarReparado;
window.marcarRetirado = marcarRetirado;
window.toggleRetiroPor = toggleRetiroPor;
window.confirmarRetirado = confirmarRetirado;
window.eliminarPedido = eliminarPedido;
window.buscarPedidos = buscarPedidos;
window.exportarExcel = exportarExcel;
