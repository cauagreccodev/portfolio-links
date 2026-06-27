# Portfolio de links

Página de links para usar na bio do Instagram, inspirada no estilo da referência enviada.

## Arquivos

- `index.html`: estrutura da página.
- `styles.css`: visual responsivo e animações.
- `script.js`: ano automático, partículas de fundo e troca da foto.
- `api/instagram-avatar.js`: função serverless para buscar a foto atual do Instagram na Vercel.
- `api/instagram-avatar-image.js`: função serverless para servir a imagem atual do Instagram.

## Como publicar

Suba estes arquivos na Vercel. As rotas `/api/instagram-avatar` e `/api/instagram-avatar-image` serão ativadas automaticamente e a foto do perfil do Instagram será atualizada com cache de 1 hora.

Ao abrir localmente pelo arquivo HTML, a página usa diretamente a URL atual da imagem do Instagram.
