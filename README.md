# Amazon — Dreame L50 Ultra

Landing page estática do Dreame L50 Ultra.

## Estrutura

```text
.
├── index.html          # conteúdo da página
├── styles.css          # aparência e responsividade
├── app.js              # inicialização
├── interactions.js     # menus, abas e animações
├── dc-runtime.js       # suporte legado isolado
├── assets/             # imagens e vídeos
├── app/                # adaptador mínimo da hospedagem
├── public/             # versão gerada automaticamente
├── build.mjs           # prepara a pasta public
├── worker.ts           # entrada da hospedagem
└── test.mjs            # validação automática
```

Para editar a landing page, normalmente basta trabalhar em `index.html`, `styles.css`, `app.js`, `interactions.js` e `assets/`.

`app/`, `.openai/`, `worker.ts` e `vite.config.ts` existem somente para a publicação no Sites. `public/` e `dist/` são saídas automáticas e não devem ser editadas. `node_modules/` contém dependências instaladas e também não faz parte do Git.

Os arquivos antigos ficam preservados localmente em `materiais/`, fora do Git e da publicação.
A pasta `Imagens do produto (NÃO EXCLUIR)/` também é uma referência local protegida pelo `.gitignore`; ela não entra no site nem nos commits.

## Executar

```bash
npm install
npm run dev
```

## Validar

```bash
npm test
```
