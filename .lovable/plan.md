# Miniaturas dos produtos no cardápio

## Objetivo
Exibir a foto real de cada produto ao lado do nome, descrição e preço, mantendo o toque no item para abrir os detalhes.

## Alterações
- Reorganizar cada linha em uma grade compacta com miniatura fixa e conteúdo flexível.
- Usar `imageUrl` do próprio produto, com carregamento preguiçoso e decodificação assíncrona.
- Preservar área de toque mínima, legibilidade e espaço do preço em telas pequenas.
- Manter as listas roláveis, a física do livro e todo o conteúdo existentes.

## Validação
- Conferir celular estreito e computador.
- Testar rolagem, swipe entre páginas e abertura do produto pela linha inteira.
- Confirmar ausência de imagens quebradas, sobreposições e erros.
