# 🎀 Auditorio uni PWA

Aplicación PWA para comprar/reservar boletos de eventos del auditorio universitario.

Cumple con:
- PWA con `manifest.json` y `service-worker.js`.
- Frontend en HTML, CSS y JavaScript.
- Backend con Node.js + Express.
- Comunicación cliente-servidor con `fetch()` y API REST.
- Procesos asíncronos con `async/await`.
- Base de datos relacional PostgreSQL.
- CRUD de eventos para administrador.
- Registro de usuarios.
- Inicio de sesión con JWT.
- Verificación de correo electrónico.
- Recuperación y restablecimiento de contraseña por correo.
- Compra/reserva simulada de boletos.
- Historial de boletos por usuario.

---

## 1. Requisitos

Instala:

- Node.js
- PostgreSQL local o base de datos en Aiven/Render/Supabase
- Visual Studio Code
- Extensión Live Server, opcional pero recomendada

---

## 2. Crear la base de datos

En PostgreSQL crea una base de datos, por ejemplo:

```sql
CREATE DATABASE auditorio_uni;
```

Luego ejecuta el archivo:

```bash
backend/scripts/schema.sql
```

Puedes pegarlo en tu consola SQL o en el panel de tu proveedor de base de datos.

---

## 3. Configurar backend

Entra a la carpeta backend:

```bash
cd backend
npm install
```

Copia el archivo `.env.example` y renómbralo como `.env`.

Configura tus datos:

```env
PORT=3000
DATABASE_URL=postgres://usuario:password@host:5432/auditorio_uni

FRONTEND_URL=http://127.0.0.1:5500/frontend

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
MAIL_FROM="Auditorio uni <tu_correo@gmail.com>"

ADMIN_EMAIL=admin@uni.edu
ADMIN_PASSWORD=Admin123*
ADMIN_NAME=Admin Auditorio
```

> Para Gmail necesitas una contraseña de aplicación, no tu contraseña normal.

---

## 4. Crear administrador

Después de configurar `.env`, ejecuta:

```bash
npm run create-admin
```

Con eso podrás entrar como admin usando el correo y contraseña configurados.

---

## 5. Ejecutar backend

```bash
npm run dev
```

Debe salir algo como:

```text
API Auditorio uni corriendo en http://localhost:3000
```

---

## 6. Ejecutar frontend

Abre la carpeta del proyecto en VS Code.

Con Live Server abre:

```text
frontend/index.html
```

Si no usas Live Server, abre los HTML directamente, pero lo más recomendado es Live Server.

---

## 7. Flujo para la demostración

1. Abrir la PWA.
2. Registrar usuario.
3. Mostrar que llega el correo de verificación.
4. Abrir enlace de verificación.
5. Iniciar sesión.
6. Ver eventos.
7. Comprar boleto con pago simulado.
8. Ver historial.
9. Entrar como admin.
10. Crear, editar y eliminar un evento.
11. Mostrar la base de datos con usuarios, eventos y boletos.

---

## 8. Explicación rápida de arquitectura

```text
Frontend PWA
HTML + CSS + JS
        ↓ fetch async/await
Backend API REST
Node.js + Express
        ↓ consultas async
PostgreSQL
```

---

## 9. Modificación en vivo sugerida

El docente puede pedir algo como:
- Cambiar color del botón.
- Agregar un campo "categoría" al evento.
- Cambiar el texto del boleto.
- Agregar un filtro por fecha.
- Cambiar el precio de un evento.

Una modificación fácil es editar `frontend/css/styles.css` o agregar un campo simple en `admin-eventos.html`.

---

## 10. Nota sobre pagos

El pago es simulado. Para el proyecto no se usan tarjetas reales. Esto es correcto porque la rúbrica pide API, CRUD, base de datos, asincronismo, autenticación y correos, no pagos reales.
