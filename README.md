# Alimentação

App pessoal e mobile-first para registrar alimentação, acompanhar calorias e observar a qualidade nutricional do dia.

## Primeira versão

- Registro por data, horário e refeição.
- Nome do alimento/preparação e quantidade.
- Calorias obrigatórias.
- Nota de qualidade nutricional de 1 a 5.
- Proteína, carboidratos e gorduras opcionais.
- Observações opcionais.
- Resumo diário de calorias, proteína, número de registros e refeições.
- Meta diária de calorias ajustável.
- Nota diária de qualidade ponderada pelas calorias dos itens registrados.
- Edição e exclusão de registros.
- Backup e restauração em JSON.
- Armazenamento local no navegador (localStorage).
- PWA com suporte offline básico.
- Interface adaptada para iPhone/Safari e modo claro/escuro.

## Como a nota de qualidade do dia funciona

Quando existem calorias nos registros, a média é ponderada pelas calorias:

`Σ(calorias × nota de qualidade) ÷ Σ(calorias)`

Assim, um item muito pequeno não domina a nota do dia. A avaliação de 1 a 5 é subjetiva e preenchida pelo usuário; o app não apresenta essa nota como avaliação médica ou nutricional automática.

## Publicar no GitHub Pages

No repositório, abra **Settings → Pages**, escolha **Deploy from a branch**, selecione **main** e a pasta **/(root)**. Depois de publicado, o endereço padrão será:

`https://viniciusnevesdev.github.io/Alimentacao/`

## Próximas evoluções possíveis

- Cadastro de alimentos favoritos e refeições reutilizáveis.
- Busca de alimentos em base nutricional.
- Leitura de código de barras.
- Fotos das refeições.
- Metas de proteínas, carboidratos, gorduras, fibras e água.
- Gráficos semanais e mensais.
- Análise de padrão alimentar e frequência de alimentos.
- Classificação por nível de processamento e grupos alimentares.
- Exportação em CSV.
