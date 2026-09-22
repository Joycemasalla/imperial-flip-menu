# Imperial Digital Menu

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval.

### User Request
"O foco desse cardápio é os clientes chegarem no espaço perial, ler o QR code que vai ter na mesa e ver os produtos que o espaço perial oferece. Não vai ser pedir pelo cardápio, porque vai ter os clientes lá e os garçons. Então os clientes vão chamar os garçons pra pedir. Só que eles vão chegar na mesa, ler o QR code e já vai saber o que que eles vão querer pedir, porque já vai ter ele no cardápio. Então isso vai ser um cardápio mesmo, não precisa de checkout, carrinho, nem nada, só os produtos mesmo. Eu quero ter essa experiência de flipbook pra que a pessoa veja que é uma coisa interessante, uma proposta imersiva, só que tem que funcionar muito bem no celular, porque o foco é o mobile. Então ele tem que ser focado 100% no celular, mas também atender ao computador, ser responsivo, é, não travar, mas ser algo diferente. Quando clicar, conseguir ver sobre o produto também, ver as imagens dos produtos pra saber o que que vai pedir."

### Context & Implementation Requirements
- **Objetivo**: Cardápio digital exclusivamente consultivo do "Espaço Imperial", escaneado por QR Code na mesa do restaurante. Sem carrinho, sem checkout e sem fluxo de pagamento — o cliente consulta e chama o garçom.
- **Experiência Flipbook (Folheio Interativo)**:
  - 100% fluido e responsivo no celular (mobile-first): transição de folhear rápida e suave ao toque (swipe), sem travamento ou atraso.
  - No desktop: visualização de livro aberto em duas páginas lado a lado com sombra de lombada e cantos virando.
  - No mobile: página única ajustada à tela com navegação por deslize lateral e setas discretas.
  - Barra de categorias / sumário rápido: barra superior com botões de cada categoria (Artesanais, Tradicionais, Pizzas, Doces, Porções, Chapas, Baguete, Picanha, Bebidas) para ir direto à página desejada sem precisar folhear tudo.
- **Modal de Detalhes do Produto**:
  - Ao tocar em qualquer item da página, abrir modal elegante com foto em destaque do prato, nome, descrição completa dos ingredientes, indicação de rendimento ("Serve X pessoas", quando aplicável) e preços/variações de tamanho.
  - Fechamento fácil por botão ou gesto de deslizar para baixo.
- **Design & Identidade Visual**:
  - Identidade premium do Espaço Imperial: tema escuro refinado (tons de preto/chumbo com detalhes em dourado metálico), tipografia elegante (serifa para títulos e cabeçalhos, sans-serif limpa para textos e preços).
- **Dados do Cardápio**:
  - Utilizar todos os dados do arquivo anexo `menuData.json`, que contém todas as categorias, nomes, descrições completas e preços reais do restaurante. Utilizar imagens de alta qualidade (Unsplash food images) correspondentes para cada item e categoria.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://imperial-flip-menu.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6b9fc2fb-31de-4f62-a30d-772681d9f986).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
