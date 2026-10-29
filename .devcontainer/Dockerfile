# Dev Container construido a partir de la imagen oficial de Node.js de Docker Hub.
# node:24-bookworm: Node.js 24 sobre Debian 12 (bookworm), con npm y git.
FROM node:24-bookworm

# Sin el aviso de versiones nuevas de npm en cada orden.
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# La imagen ya trae el usuario node (sin privilegios de administrador): se trabaja con él.
USER node
