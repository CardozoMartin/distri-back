# Usa una imagen oficial de Node.js
FROM node:22

# Crea el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json ./
# Si tienes package-lock.json, descomenta la siguiente línea
# COPY package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código fuente
COPY . .

# Construye el bundle de producción
RUN npm run build

# Expone el puerto (ajusta si usas otro)
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
