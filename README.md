<h1 align="center">📊 Sistema de Encuestas</h1>
<p align="center"><b>Frontend para gestión, respuesta, seguimiento y análisis de encuestas</b></p>
<p align="center">
<img src="https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white"/>
<img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Chart.js-4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Excel-XLSX-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white"/>
</p>

## 📌 Descripción
Aplicación frontend construida con Angular para gestionar encuestas dirigidas a distintos perfiles de usuario. Incluye flujos diferenciados para **egresados, empleadores y administración**, además de módulos de seguimiento y analítica.

## ✨ Funcionalidades
- 🔐 Selección de rol e inicio de sesión.
- 🎓 Dashboard para egresados.
- 🏢 Dashboard para empleadores.
- 📝 Respuesta de encuestas por identificador.
- 🛡️ Rutas protegidas mediante guards de autenticación y administración.
- 📊 Analítica y visualización de reportes.
- 🔎 Seguimiento desde el módulo administrativo.
- 📄 Herramientas para generación/exportación de información mediante PDF, captura y hojas de cálculo.

## 🛠️ Tecnologías
**Angular 19 · TypeScript · RxJS · Chart.js · SweetAlert2 · jsPDF · html2canvas · XLSX · Font Awesome**

## 🚀 Ejecución local
```bash
git clone https://github.com/AnniDiaz/Frontend-Sistemas-Encuestas.git
cd Frontend-Sistemas-Encuestas
npm install
npm start
```
Luego abre `http://localhost:4200/`.

## 🧩 Organización funcional
```text
Usuarios
├── Egresado
│   ├── Dashboard
│   └── Encuestas
├── Empleador
│   ├── Dashboard
│   └── Encuestas
└── Administrador
    ├── Analítica
    └── Seguimiento
```

## 👩‍💻 Autora
**Elva Anni Díaz Regalado** — Estudiante de Ingeniería de Sistemas e Informática  
[GitHub](https://github.com/AnniDiaz) · [LinkedIn](https://www.linkedin.com/in/elva-anni-diaz-regalado-168289307/)
