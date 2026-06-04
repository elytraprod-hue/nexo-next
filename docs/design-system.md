# Design system - NEXO Studio OS

## Principio

O NEXO nao deve parecer painel administrativo. Deve parecer um ambiente operacional para audiovisual: rapido, escuro, concentrado, com vidro/liquid glass, feedback vivo e acoes contextuais.

## Tokens de cor

| Token | Uso | Valor |
| --- | --- | --- |
| `--background` | Fundo base | `#080808` |
| `--foreground` | Texto principal | `#f4f4f5` |
| `--muted` | Texto secundario | `#a1a1aa` |
| `--border` | Bordas comuns | `rgba(255,255,255,.10)` |
| `--orange` | Acao principal / marca | `#ff6a00` |
| `--green` | OK / aprovado / receita | `#17d18b` |
| `--blue` | Sistema / informacao | `#3b82f6` |
| `--violet` | Producao / pipeline | `#8b5cf6` |
| `--cyan` | Review / documentos | `#22d3ee` |
| `--glass-bg` | Superficie glass | gradiente translúcido |
| `--glass-border` | Borda glass | `rgba(255,255,255,.092)` |
| `--glass-shadow` | Profundidade | `0 18px 60px rgba(0,0,0,.30)` |
| `--glass-blur` | Blur | `blur(18px) saturate(1.18)` |

## Espacamento

- `8px`: separacao minima entre chips e controles compactos.
- `12px`: padding de botoes pequenos e linhas de lista.
- `16px`: gap padrao entre grupos proximos.
- `20px`: padding de superficies principais.
- `24px`: usado apenas em secoes de destaque ou telas de review.
- `32px`: separacao entre blocos de pagina.

Regra: se a tela parecer "blocada", aumentar gap entre secoes antes de aumentar tamanho dos cards.

## Escala tipografica

- Eyebrow: `10-12px`, uppercase, `font-black`, letter spacing positivo.
- Texto auxiliar: `13-14px`, line-height `1.5-1.65`.
- Titulo de card: `18-24px`, `font-black`.
- Hero/cockpit: `32-48px`, apenas em primeiro contexto da pagina.
- Numeros/KPIs: `clamp(...)` contido, sempre com `break-words` para nao vazar do card.

Regra: nao usar texto hero dentro de cards pequenos.

## Superficies

- `Surface`: bloco principal com glass, raio `16px` e padding `16-20px`.
- Card de item: cliente, projeto, documento ou lancamento.
- Dock/toast/modal: sempre com blur e sombra mais forte.

Evitar cards dentro de cards. Preferir bandas/secoes e listas internas sem moldura pesada.

Regra de raio: componentes operacionais usam `8px-16px`. Raios maiores ficam restritos a hero, lock screen, modal especial ou superficies de review.

## Estados de componentes

- Default: baixa opacidade, borda branca/translucida.
- Hover: leve lift, borda mais clara, sem mudar layout.
- Active: cor semantica + fundo translúcido.
- Disabled: opacidade baixa, sem hover agressivo.
- Error/warn: vermelho/amarelo apenas quando ha acao clara.
- Success: verde para aprovado, salvo, pronto ou sincronizado.

## Formularios

Prioridade de input:

1. Preset ou playbook.
2. Chips/segmented controls.
3. Select quando ha muitas opcoes.
4. Campo livre apenas para nome, contexto especifico ou excecao.

Campos longos devem aparecer em etapas guiadas ou detalhes expansivos.

## Tabelas e listas

- Evitar tabela pesada para operacao diaria.
- Usar listas com acao direta e status colorido.
- Tabelas ficam para comparacao, historico, planos ou relatorios.
- Linhas precisam ter acao primaria clara: abrir, avancar, aprovar, cobrar, exportar.

## Modais e janelas

Padrao:

- Header com titulo e fechar.
- Corpo com no maximo 2 colunas.
- Acao final sticky quando o fluxo for longo.
- Escape fecha.
- Backdrop com blur.

Janelas devem parecer ferramentas de trabalho, nao formularios administrativos.

## Feedback visual

Elementos obrigatorios para sensacao OS:

- Boot inicial curto.
- Toast de sistema.
- Contexto ativo do dia.
- Dock rapido.
- Privacidade de valores.
- Estado de sync/local/cloud.
- Empty states orientados por acao.

## Dashboard

Regra do primeiro viewport:

- Uma saudacao/contexto.
- Uma decisao principal.
- Quatro KPIs compactos no maximo.
- Score ou status do sistema.
- Detalhes so sob demanda.

Nao abrir com grade extensa de cards.

## Review de video

Modulo principal do produto.

Padrao obrigatorio:

- Video grande.
- Timeline com marcadores.
- Comentario com timestamp automatico.
- Clique no comentario leva ao ponto.
- Status de aprovacao evidente.
- Cliente final nao deve precisar entender o sistema.

## Documentos

Padrao obrigatorio:

- Tipo de documento com descricao clara.
- Base/preset audiovisual.
- Campos especificos por documento.
- Preview de documento real.
- Exportacao PDF.
- Historico restauravel.

## Regra de evolucao

Toda nova funcionalidade precisa responder:

- reduziu clique?
- reduziu digitacao?
- reduziu treinamento?
- aumenta valor para filmmaker/produtora?
- melhora a sensacao de Studio OS?
