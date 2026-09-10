# Alimentação

App pessoal e mobile-first para registrar alimentação, acompanhar calorias e observar a qualidade nutricional do dia.

## Versão atual

- Registro por data, horário e refeição.
- Nome do alimento/preparação e quantidade.
- Sugestões de alimentos conforme o nome digitado.
- Base nutricional local com alimentos comuns, disponível offline.
- Cálculo automático de calorias, proteínas, carboidratos e gorduras conforme a porção informada.
- Interpretação de porções como gramas, quilos, ml, litros, unidades, fatias, colheres, xícaras, copos, conchas e outras medidas compatíveis com cada alimento.
- Porção padrão sugerida quando a quantidade ainda não foi informada.
- Sugestão de nota de qualidade nutricional de 1 a 5, sempre editável.
- Valores sugeridos só são aplicados quando o usuário toca em **Aplicar sugestão**.
- Identificação visual dos registros que usam valores estimados.
- Preenchimento manual continua disponível quando o alimento não está na base ou quando se deseja usar dados do rótulo.
- Observações opcionais.
- Resumo diário de calorias, proteína, número de registros e refeições.
- Meta diária de calorias ajustável.
- Nota diária de qualidade ponderada pelas calorias dos itens registrados.
- Edição e exclusão de registros.
- Backup e restauração em JSON, com compatibilidade com registros da versão anterior.
- Armazenamento local no navegador (localStorage).
- PWA com suporte offline.
- Interface adaptada para iPhone/Safari e modo claro/escuro.

## Sugestões nutricionais

Os valores da base são referências aproximadas por 100 g ou 100 ml. O app ajusta esses números de acordo com a quantidade informada. Marcas, receitas, tamanho real das unidades e modo de preparo podem alterar significativamente calorias e macronutrientes; quando houver rótulo, ele é a melhor referência para aquele produto específico.

O app não inventa valores para alimentos que não reconhece: nesses casos, mantém o preenchimento manual.

## Como a nota de qualidade do dia funciona

Quando existem calorias nos registros, a média é ponderada pelas calorias:

`Σ(calorias × nota de qualidade) ÷ Σ(calorias)`

Assim, um item muito pequeno não domina a nota do dia. A nota sugerida para alimentos reconhecidos é apenas uma classificação prática do app e pode ser alterada pelo usuário.

## Publicar no GitHub Pages

No repositório, abra **Settings → Pages**, escolha **Deploy from a branch**, selecione **main** e a pasta **/(root)**. Depois de publicado, o endereço padrão será:

`https://viniciusnevesdev.github.io/Alimentacao/`

## Próximas evoluções possíveis

- Refeições compostas digitadas em linguagem natural, como `2 ovos + 1 pão francês + café`.
- Cadastro de alimentos e marcas personalizados.
- Alimentos favoritos e refeições reutilizáveis.
- Leitura de código de barras.
- Fotos das refeições.
- Metas de proteínas, carboidratos, gorduras, fibras e água.
- Gráficos semanais e mensais.
- Análise de padrão alimentar e frequência de alimentos.
- Classificação por nível de processamento e grupos alimentares.
- Exportação em CSV.
