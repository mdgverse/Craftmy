# CraftDesign — Nossa versão do Figma

Protótipo funcional de editor de design (tipo Figma) construído em HTML/CSS/JS puro, rodando direto no navegador.feito para ser a base da nossa jornada junto com o repositório [craft-anything](https://github.com/storytold/craft-anything).

## Como usar

1. Abra o arquivo `/home/user/Craftmy/figma-clone/index.html` em qualquer navegador moderno.
2. Escolha uma ferramenta na barra esquerda:
   - **V** Selecionar
   - **R** Retângulo
   - **O** Círculo
   - **T** Texto
   - **Z** Zoom
   - **Mão** arrastar tela
3. Clique e arraste no canvas para criar ou mover elementos.
4. Selecione um elemento para editar suas propriedades no painel direito (X, Y, largura, altura, cores, raio, opacidade).
5. Use **Ctrl+Z** / **Ctrl+Y** para desfazer/refazer.
6. Exporte o projeto em JSON.

## Recursos já funcionais

- Canvas com zoom (roda do mouse) e pan
- Criação de frames, retângulos, círculos e textos
- Seleção, movimentação e redimensionamento de elementos
- Painel de camadas e painel de propriedades
- Undo/redo com histórico
- Exportação de JSON do projeto

## Próximos passos (integração com craft-anything)

O `craft-anything` é uma engine em Rust para inspecionar e reconstruir apps/sites. Mais adiante podemos:

- Usar as crates de `ui-egui` e `engine` do craft-anything para portar este editor para desktop (Rust/egui).
- Aproveitar a engine de comparação (`Study → Build → Check → Ready`) para validar designs gerados contra um alvo original.
- Adicionar colaboração em tempo real, plugins Wasm e exportação nativa (PNG/SVG).

## Estrutura

```
figma-clone/
├── index.html      # Editor completo (HTML + CSS + JS em um arquivo)
└── README.md
```

## Licença

MIT — igual ao craft-anything.