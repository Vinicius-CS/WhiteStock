
<div align="center">
  <img src="https://i.imgur.com/48bg7Xe.png" height="150" alt="White Stock"/>
</div>

<hr>

<div align="center">
  <img alt="Vinicius-Vue" src="https://img.shields.io/badge/Vue.js-323330?style=for-the-badge&logo=vue.js&logoColor=5CFFA6">
  <img alt="Vinicius-Vuetify" src="https://img.shields.io/badge/Vuetify-323330?style=for-the-badge&logo=vuetify&logoColor=5CFFA6">
  <img alt="Vinicius-Node" src="https://img.shields.io/badge/Node-323330?style=for-the-badge&logo=node.js&logoColor=5CFFA6">
  <img alt="Vinicius-CSS" src="https://img.shields.io/badge/CSS-323330?&style=for-the-badge&logo=css3&logoColor=5CFFA6">
  <img alt="Vinicius-MySQL" src="https://img.shields.io/badge/MySQL-323330?style=for-the-badge&logo=mysql&logoColor=5CFFA6">
</div>

Projeto de gerenciamento de estoque com frontend em Vue.js 3 e Vuetify 3 para estilização e backend em Node.js.
Para o banco de dados, foi utilizado o MySQL.

![White Stock - Início](http://i.imgur.com/1dhTJ4Kh.gif)

<hr>

# Configurações

## Backend
Execute o comando abaixo para instalar as dependências do projeto na pasta [backend](https://github.com/Vinicius-CS/WhiteStock/tree/main/backend):
- `npm install`

Configure o domínio e nome do site no arquivo [config.json](https://github.com/Vinicius-CS/WhiteStock/blob/main/backend/settings/config.json).

Configure as variáveis do banco de dados criando um arquivo .env com base no arquivo de exemplo [.env.example](https://github.com/Vinicius-CS/WhiteStock/blob/main/backend/.env.example).

Execute a SQL do arquivo [white_stock.sql](https://github.com/Vinicius-CS/WhiteStock/blob/main/backend/settings/white_stock.sql).

Configure sua  **public.key**  e  **private.key**, gerando uma [RSA Key](https://www.csfieldguide.org.nz/en/interactives/rsa-key-generator/) com as opções:

-   **Format Scheme:**  PKCS #1 (base64)
-   **Key Size:**  2048 bits

*Insira ambos os arquivos na pasta [settings](https://github.com/Vinicius-CS/WhiteStock/tree/main/backend/settings).*

## Frontend

Execute o comando abaixo para instalar as dependências do projeto na pasta [frontend](https://github.com/Vinicius-CS/WhiteStock/tree/main/frontend):
- `npm install`

<br>

# Iniciando o Servidor

## Frontend
Execute o comando abaixo na pasta [frontend](https://github.com/Vinicius-CS/WhiteStock/tree/main/frontend) para iniciar o frontend do projeto:
- `npm run serve`

## Backend
Execute o comando abaixo na pasta [backend](https://github.com/Vinicius-CS/WhiteStock/tree/main/backend) para iniciar a API do projeto:
- `node .`
