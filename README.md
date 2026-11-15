# Craftmy

Protótipo de estúdio 3D de referências humanas, com interface em português e renderização Three.js.

## Executar

```sh
npm install
npm run dev
```

Abra o endereço mostrado pelo Vite. `npm run build` verifica os tipos e gera a versão de produção. `npm run preview` serve essa versão localmente.

## Funcionalidades atuais

- Câmera orbital, perspectiva/ortográfica, múltiplos personagens, transformação individual, controles de biotipo e estilo, poses predefinidas e ajustes das articulações implementadas.
- Catálogo procedural de cabelos, cores individuais e exportação de imagem e projeto JSON.
- Biblioteca local com projetos, pastas, duplicação, miniaturas e salvamento automático a cada cinco segundos (ou manual). Os dados ficam no armazenamento do navegador e podem ser perdidos se ele for limpo; exporte um JSON para backup. Apenas os recursos implementados são preservados.
- Tema claro e escuro.
- Estimativa experimental de pose a partir de uma imagem, usando MediaPipe Pose no próprio navegador. O modelo e seus arquivos WebAssembly são distribuídos com a aplicação; a primeira análise pode demorar. O resultado é uma aproximação, não uma reconstrução fiel: estimativas de profundidade, oclusões e rotações podem estar erradas. Partes com baixa confiança mantêm a pose anterior e podem ser corrigidas manualmente.

## Limitações e próximos passos

Este é um ponto de partida, não a implementação completa da especificação: roupas adaptativas, objetos, IK interativa, dedos articulados, iluminação editável e efeitos de pós-processamento ainda não estão integrados. Os modelos são representações procedurais simplificadas; a ausência de interseções anatômicas ou de roupas não é garantida. Alguns catálogos e módulos de geometria/IK estão preparados para desenvolvimento posterior. A estimativa de imagem precisa de validação adicional em navegadores, diferentes posições, enquadramentos e imagens oclusas antes de ser considerada uma solução de produção.
