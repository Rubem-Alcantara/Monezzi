Monezzi

App de gestão financeira para dispositivos móveis, desenvolvido com React Native.
Permite aos usuários registrar, acompanhar e analisar suas transações financeiras de forma simples e intuitiva. 
GitHub

📌 Visão Geral

Este projeto é uma aplicação mobile (Android/iOS) construída com React Native que oferece funcionalidades básicas de controle financeiro. O objetivo é permitir que cada usuário visualize o seu saldo total, cadastre entradas e saídas, e acompanhe suas finanças pessoais de maneira organizada.

Funcionalidades (planejadas / implementadas)

Tela inicial com resumo financeiro (saldo total);

Registro de transações (entradas e saídas);

Categorias de transações (opcional, dependendo da implementação);

Navegação entre telas com React Navigation;

(Futuro) Persistência de dados com Firebase ou outra solução de backend.

🛠 Tecnologias

O projeto foi construído com a seguinte stack:

React Native — framework para desenvolvimento mobile multiplataforma;

JavaScript — linguagem principal do projeto;

React Navigation — para navegação entre telas;

(Opcional) Firebase — para persistência de usuários e transações;

Módulos nativos Android/iOS incluídos no diretório android e configuração com app.json, eas.json. 
GitHub

🚀 Começando

Siga estas etapas para rodar o projeto localmente:

Pré-requisitos

Verifique se você tem instalado:

Node.js (versão recente);

npm ou yarn;

Expo CLI ou React Native CLI (dependendo da configuração do projeto);

Android Studio (para Android) ou Xcode (para iOS — macOS).
Obs.: Ajuste os comandos conforme seu ambiente de desenvolvimento mobile.

Instalação

Clone o repositório

git clone https://github.com/Rubem-Alcantara/Monezzi.git


Entre no diretório do projeto

cd Monezzi


Instale as dependências

npm install
# ou
yarn install


Inicie o servidor de desenvolvimento

npm start
# ou
yarn start


Execute no emulador ou dispositivo real

Para Android:

npm run android


Para iOS (macOS):

npm run ios

🧠 Organização do Projeto

O repositório contém os principais diretórios e arquivos:

Monezzi/

├─ android/                 # Código nativo Android

├─ assets/                  # Imagens, fontes e recursos estáticos

├─ src/                     # Código fonte da aplicação

├─ .gitignore

├─ App.js                   # Entrada principal do app

├─ app.json                 # Configuração do projeto

├─ eas.json                 # Configuração para EAS (Expo Application Services)

├─ index.js

├─ metro.config.js

├─ package.json
