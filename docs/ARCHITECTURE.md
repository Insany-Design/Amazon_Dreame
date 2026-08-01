# Estrutura do projeto

## Fonte do site

A raiz do repositório contém a página estática em uma estrutura convencional:

- `index.html`: conteúdo e marcação da landing page.
- `css/styles.css`: estilos, responsividade e motion.
- `js/app.js`: carregamento e inicialização.
- `js/interactions.js`: estado e comportamento da interface.
- `assets/`: mídia usada em produção.

O runtime legado necessário para interpretar alguns componentes permanece isolado em `js/vendor/`. Assim, ele não se mistura com o JavaScript editável da página e pode ser removido em uma migração futura sem alterar a organização principal.

## Hospedagem

O diretório `app/` possui somente as rotas exigidas pelo Sites. O script `scripts/prepare-site.mjs` copia a fonte estática para `public/` antes do desenvolvimento e da build. Portanto, `public/` é uma saída gerada e nunca deve ser editada diretamente.

## Otimizações aplicadas

- CSS e JavaScript externos, permitindo cache do navegador.
- script principal carregado com `defer`.
- imagem principal pré-carregada com prioridade alta.
- conexões antecipadas para fontes e recursos externos.
- imagens abaixo da dobra carregadas sob demanda.
- vídeos configurados com carregamento de metadados.
- suporte a `prefers-reduced-motion`.
- build identifica as referências do HTML, CSS e JavaScript e publica somente os assets usados pela página.
