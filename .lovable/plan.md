# Atualização dos produtos do cardápio

## Objetivo
Atualizar o cardápio com base no arquivo enviado, preservando fotos e dados existentes quando o produto já existe e adicionando os produtos e categorias ausentes.

## Alterações
- Manter todos os produtos atuais que aparecem no novo cardápio e atualizar nomes, descrições e preços conforme o arquivo enviado.
- Adicionar Drinks, Sobremesas, Prato Feito, Churrasco e Refeições, além dos itens ausentes nas categorias existentes.
- Deixar `price` como `null` em Drinks e Bebidas, mantendo o campo pronto para preenchimento posterior.
- Representar preços por tamanho ou rendimento no campo `options`, como pizzas, baguete, picanha e refeições.
- Preservar as imagens atuais; produtos novos usarão a imagem da categoria até receberem uma foto própria.
- Organizar tudo em `menuData.json`, com categorias em uma lista e produtos em listas internas, mantendo sempre a mesma ordem de campos para facilitar edições manuais.
- Ajustar somente o necessário na exibição para que itens sem foto ou preço continuem aparecendo corretamente.

## Validação
- Conferir categorias, itens e preços contra o arquivo enviado.
- Testar abertura das categorias, rolagem e detalhes no celular.
- Confirmar que o cardápio continua compilando sem erros.
