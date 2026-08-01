# Amazon — Dreame L50 Ultra

Landing page do Dreame L50 Ultra organizada como um projeto web estático convencional.

## Onde editar

```text
.
├── index.html              # conteúdo e estrutura da página
├── css/
│   └── styles.css          # visual, responsividade e animações
├── js/
│   ├── app.js              # inicialização da página
│   ├── interactions.js     # menus, abas, carrosséis e efeitos de rolagem
│   └── vendor/             # runtime mantido isolado do código do projeto
├── assets/                 # imagens, vídeos, logos e itens do produto
├── materiais/              # arquivos antigos locais; não são publicados
├── app/                    # rotas mínimas exigidas pela hospedagem Sites
├── public/                 # saída gerada automaticamente; não editar
└── tests/                  # validações da build
```

O trabalho diário fica concentrado em `index.html`, `css/`, `js/` e `assets/`. As pastas `app/`, `public/` e `.openai/` existem apenas para manter a publicação compatível com Sites. A pasta `materiais/` preserva referências e versões antigas, mas fica fora do Git e da publicação.

## Executar localmente

```bash
npm install
npm run dev
```

## Validar

```bash
npm test
```

Antes de iniciar ou gerar a build, `npm run prepare:site` copia somente os arquivos necessários para `public/`.
