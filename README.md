# Alimentação

PWA pessoal para registrar alimentação, acompanhar calorias, macronutrientes, hidratação e qualidade nutricional.

## Interface atual

A interface principal foi reconstruída usando o projeto `Food-Gemini` como referência visual e estrutural, mantendo o app leve e compatível com publicação direta no GitHub Pages.

- Cabeçalho fixo com navegação por data.
- Abas para Diário & Refeições, Banco de Alimentos e Metas & Backup.
- Cartão principal de consumo calórico em destaque.
- Indicador de qualidade nutricional diária.
- Controle de hidratação com atalhos de 250 ml e 500 ml.
- Cartões separados de proteínas, carboidratos e gorduras.
- Refeições organizadas em cartões com calorias e macros por refeição.
- Layout responsivo para iPhone e desktop.
- Paleta visual baseada em verde-esmeralda, branco e slate.

## Registro e sugestões nutricionais

- Registro por data, horário e refeição.
- Nome do alimento/preparação e quantidade.
- Sugestões conforme o nome digitado.
- Base nutricional local disponível offline.
- Cálculo automático de calorias, proteínas, carboidratos e gorduras conforme a porção.
- Interpretação de gramas, ml, unidades, fatias, colheres, xícaras, copos, conchas e outras medidas compatíveis.
- Porção padrão quando a quantidade não é informada.
- Sugestão de qualidade nutricional de 1 a 5, sempre editável.
- Valores sugeridos só são inseridos após o usuário tocar em **Aplicar sugestão nutricional**.
- Registros estimados são identificados visualmente.
- Preenchimento manual continua disponível para alimentos fora da base ou valores de rótulo.
- Edição e exclusão de registros.

## Metas e hidratação

O painel permite definir metas independentes de:

- calorias;
- proteína;
- carboidratos;
- gorduras;
- água.

Esses valores são referências visuais configuradas pelo usuário, e não recomendações médicas automáticas.

## Qualidade do dia

Quando existem calorias nos registros, a média é ponderada pelas calorias:

`Σ(calorias × nota de qualidade) ÷ Σ(calorias)`

Assim, itens muito pequenos não dominam a nota do dia.

## Dados e backup

- Registros, metas e hidratação ficam no `localStorage` do navegador.
- Exportação e restauração por JSON.
- Backups usam um esquema versionado (`backupSchemaVersion`) compartilhado entre Oficial e Beta.
- A Beta preserva os campos-base usados pela Oficial; campos experimentais novos devem ser apenas aditivos.
- Mudanças incompatíveis de estrutura exigem migração explícita antes de elevar a versão do esquema.
- Backups antigos sem `backupSchemaVersion` continuam sendo tratados como esquema v1.
- Se um backup vier de um esquema mais novo, a versão atual importa os campos conhecidos e avisa que dados adicionais podem ser ignorados.
- Compatibilidade com os registros das versões anteriores.
- O app não exibe integrações simuladas com Apple Watch ou iCloud como se fossem conexões reais.
- Service worker com cache offline dos arquivos essenciais.

## GitHub Pages

Publicação pela branch `main`, pasta `/(root)`:

`https://viniciusnevesdev.github.io/Alimentacao/`

## Próximas evoluções úteis

- Interpretar refeições compostas, como `2 ovos + 1 pão francês + café`.
- Cadastro de alimentos e marcas personalizados.
- Favoritos e refeições reutilizáveis.
- Leitura real de código de barras.
- Fotos das refeições.
- Fibras, sódio e micronutrientes.
- Gráficos semanais e mensais.
- Análise de frequência e padrões alimentares.
