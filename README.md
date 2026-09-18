# 🐶 PerritaApp

**App móvil colaborativa para registrar las comidas diarias de una mascota entre varios usuarios en tiempo real.**

Aplicación desarrollada para uso familiar que permite a varias personas registrar si su perrita comió (desayuno, almuerzo, cena), recibir notificaciones push cuando alguien registra una comida, y consultar un historial de los últimos 7 días con estadísticas.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

---

## ✨ Características principales

- 🔐 **Autenticación con nombre de usuario** (sin correo electrónico)
- 👆 **Login con huella dactilar / Face ID** (credenciales cifradas con SecureStore)
- 🌗 **Modo claro y oscuro** persistente
- 🍽️ **Registro de comidas** (desayuno, almuerzo, cena) con actualización en tiempo real
- 🔔 **Notificaciones push** a los demás usuarios cuando alguien registra una comida
- 📊 **Historial de los últimos 7 días** con estadísticas semanales
- ↩️ **Función deshacer** en el registro de comidas
- 📶 **Detección de conexión a internet** con manejo de errores
- 📱 **Diseño responsive** adaptado a móviles y tablets
- 🎨 **Interfaz personalizada** con tipografía Poppins, iconos vectoriales y degradados
- 🚀 **Splash screen y pantalla de bienvenida** personalizados

---

## 🛠️ Stack técnico

| Área | Tecnología |
| :--- | :--- |
| **Framework** | React Native + Expo SDK 57 |
| **Navegación** | Expo Router |
| **Lenguaje** | TypeScript |
| **Backend** | Firebase (Auth, Firestore, Cloud Messaging) |
| **Notificaciones** | Expo Notifications + FCM V1 |
| **Biometría** | Expo Local Authentication + SecureStore |
| **Estado global** | React Context API |
| **Build & Deploy** | EAS Build |

---

## 🏗️ Arquitectura

```
MiPerrita/
├── context/
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   ├── firebase.ts
│   ├── notifications.ts
│   ├── typography.ts
│   └── bienvenida.ts
├── src/app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── login.tsx
│   ├── registro.tsx
│   ├── bienvenida.tsx
│   ├── dias.tsx
│   ├── historial.tsx
│   ├── ajustes.tsx
│   └── dia/[dia].tsx
├── assets/images/
├── arquitectura.html
└── app.json
```

---

## 🔒 Seguridad implementada

- ✅ **Firestore Rules**: solo usuarios autenticados
- ✅ **API Key restringida** por SHA-1
- ✅ **Contraseñas hasheadas** con bcrypt
- ✅ **Tokens JWT** con expiración automática
- ✅ **SecureStore** para credenciales biométricas
- ✅ **EAS Secrets** para credenciales sensibles

---

## 🚀 Cómo ejecutar

```bash
git clone https://github.com/dbraca11/perritaapp-portfolio.git
cd perritaapp-portfolio/MiPerrita
npm install
cp .env.example .env.local
npx expo start
```

---

## 📌 Sobre el proyecto

Desarrollado **desde cero** con herramientas **100% gratuitas**: GitHub Codespaces, Firebase Plan Spark, EAS Build.

---

## 👨‍💻 Autor

**Darwin Braca** · [@dbraca11](https://github.com/dbraca11) · darwinbraca@gmail.com

---

## 📄 Licencia

MIT
