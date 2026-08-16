# 🎮 Tetris Clássico


Uma implementação simples do clássico **Tetris**, desenvolvida com **HTML, CSS e JavaScript puro**.


O projeto roda diretamente no navegador e não depende de frameworks ou bibliotecas externas.


## 📁 Estrutura do projeto


```text
tetris/
│
├── index.html
├── style.css
├── script.js
└── README.md
🚀 Como executar
Clone ou baixe este projeto.
Entre na pasta:
cd tetris
Abra o arquivo:
index.html

Você pode abrir diretamente no navegador ou utilizar uma extensão como Live Server no VS Code.

🎮 Controles
Tecla	Ação
←	Mover para esquerda
→	Mover para direita
↓	Acelerar queda
↑	Girar peça
Espaço	Queda instantânea
P	Pausar
Enter	Iniciar/reiniciar
🧱 Peças

O jogo possui as sete peças clássicas do Tetris:

I
O
T
S
Z
J
L
🏆 Sistema de pontuação

A pontuação aumenta de acordo com o número de linhas eliminadas simultaneamente:

Linhas	Pontos base
1	100
2	300
3	500
4	800

A pontuação também é multiplicada pelo nível atual.

O hard drop concede pontos adicionais pela distância percorrida pela peça.

📈 Níveis

A cada 10 linhas eliminadas, o nível aumenta.

Conforme o nível aumenta:

A velocidade das peças aumenta.
A dificuldade aumenta.
A pontuação das linhas passa a receber um multiplicador maior.
🛠️ Tecnologias
HTML5
CSS3
JavaScript
HTML Canvas

Não há:

Frameworks
Bibliotecas externas
Backend
Banco de dados
Dependências para instalação
🎯 Objetivo

Complete linhas horizontais preenchendo o tabuleiro.

Quando uma linha estiver completamente preenchida, ela será removida e as peças acima cairão.

O jogo termina quando uma nova peça não consegue ser posicionada no tabuleiro.

🔮 Próximos recursos

Algumas melhorias que podem ser adicionadas futuramente:

 Sistema de recorde
 Salvamento do recorde com localStorage
 Tela inicial
 Tela de pausa
 Sistema de "hold piece"
 Ghost piece
 Sons
 Música
 Efeitos visuais
 Animação ao eliminar linhas
 Ranking local
 Controles para dispositivos móveis
 Sistema de pontuação mais próximo do Tetris moderno
📄 Licença

Este projeto foi criado para fins educacionais e de estudo.

Sinta-se livre para modificar o código, experimentar novas mecânicas e usar o projeto como base para aprender desenvolvimento de jogos com JavaScript.
