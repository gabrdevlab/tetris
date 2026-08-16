# 🎮 Tetris Clássico

> Uma recriação do clássico Tetris desenvolvida com **HTML5, CSS3 e JavaScript puro**, utilizando **Canvas API** para renderização do jogo.

Um projeto leve, sem frameworks e sem dependências externas, criado para estudar lógica de programação, manipulação do Canvas, gerenciamento de estado, colisões, rotação de matrizes e desenvolvimento de jogos no navegador.

---

## 📸 Sobre o projeto

O objetivo deste projeto é reproduzir a experiência essencial do Tetris clássico:

* Peças caindo automaticamente
* Movimento horizontal
* Rotação das peças
* Queda rápida
* Hard drop
* Detecção de colisões
* Limpeza de linhas
* Sistema de pontuação
* Sistema de níveis
* Aumento progressivo da dificuldade
* Próxima peça
* Sistema de Game Over
* Pausa durante a partida

Tudo isso executado diretamente no navegador.

---

## 🧱 Estrutura do projeto

```text
tetris/
│
├── index.html      # Estrutura da aplicação
├── style.css       # Interface e estilos
├── script.js       # Lógica completa do jogo
└── README.md       # Documentação
```

### Responsabilidade de cada arquivo

| Arquivo      | Responsabilidade                    |
| ------------ | ----------------------------------- |
| `index.html` | Estrutura da interface              |
| `style.css`  | Layout, cores e componentes visuais |
| `script.js`  | Mecânicas e lógica do jogo          |
| `README.md`  | Documentação do projeto             |

A separação mantém cada parte do projeto responsável pelo que deveria fazer. Uma ideia revolucionária, aparentemente.

---

# 🚀 Como executar

## Método 1: Abrir diretamente

Não existe nenhuma configuração obrigatória.

Basta abrir:

```text
index.html
```

em um navegador moderno.

---

## Método 2: VS Code + Live Server

Para desenvolvimento, recomenda-se utilizar o **Live Server**.

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão **Live Server**.
3. Clique com o botão direito em `index.html`.
4. Selecione:

```text
Open with Live Server
```

O jogo será aberto automaticamente no navegador.

---

# 🎮 Controles

| Tecla    | Ação                |
| -------- | ------------------- |
| `←`      | Mover para esquerda |
| `→`      | Mover para direita  |
| `↓`      | Acelerar a queda    |
| `↑`      | Girar a peça        |
| `Espaço` | Hard Drop           |
| `P`      | Pausar / continuar  |
| `Enter`  | Iniciar o jogo      |

---

# 🧩 Peças

O jogo implementa as sete peças tradicionais:

```text
I    O    T    S    Z    J    L
```

Cada peça é representada internamente como uma **matriz bidimensional**.

Exemplo:

```javascript
[
    [0, 3, 0],
    [3, 3, 3]
]
```

Isso permite que as peças sejam movimentadas e rotacionadas utilizando operações sobre matrizes.

---

# 🏗️ Como o jogo funciona

O jogo utiliza um tabuleiro de:

```text
10 colunas × 20 linhas
```

Cada célula do tabuleiro possui um valor numérico correspondente a uma peça.

Exemplo:

```javascript
[
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 6, 6, 6, 0, 0, 0, 0],
    ...
]
```

O valor `0` representa uma célula vazia.

Os demais valores representam as peças.

---

# ⚙️ Principais sistemas

## Colisão

Antes de mover uma peça, o jogo verifica se ela:

* ultrapassou a borda esquerda;
* ultrapassou a borda direita;
* atingiu o fundo;
* colidiu com outra peça.

A função responsável por isso é:

```javascript
collide()
```

---

## Movimento

O jogador pode deslocar a peça horizontalmente:

```javascript
move(-1);
move(1);
```

Caso o movimento provoque uma colisão, a posição anterior é restaurada.

---

## Rotação

As peças são rotacionadas utilizando uma transformação de matriz.

A função:

```javascript
rotate()
```

gera uma nova orientação da peça.

Depois da rotação, o jogo verifica novamente as colisões.

---

## Limpeza de linhas

Quando uma linha fica completamente preenchida, ela é removida.

Exemplo:

```text
██████████
```

A linha desaparece e as linhas superiores descem.

A função responsável é:

```javascript
clearLines()
```

---

# 🏆 Sistema de pontuação

A pontuação base é:

| Linhas eliminadas | Pontos |
| ----------------: | -----: |
|                 1 |    100 |
|                 2 |    300 |
|                 3 |    500 |
|                 4 |    800 |

A pontuação é multiplicada pelo nível atual.

Exemplo:

```text
100 × nível
300 × nível
500 × nível
800 × nível
```

O **Hard Drop** também adiciona pontos de acordo com a distância percorrida pela peça.

---

# 📈 Sistema de níveis

A cada **10 linhas eliminadas**, o nível aumenta:

```text
Nível 1 → 0-9 linhas
Nível 2 → 10-19 linhas
Nível 3 → 20-29 linhas
...
```

O intervalo entre as quedas diminui conforme o nível aumenta.

A velocidade possui um limite mínimo para evitar que o jogo se torne impossível de controlar.

---

# 🔮 Próxima peça

O jogo mantém uma peça adicional armazenada em:

```javascript
nextPiece
```

Essa peça é exibida no painel lateral antes de entrar no tabuleiro.

Isso permite ao jogador antecipar parcialmente a próxima jogada.

---

# 💀 Game Over

O jogo termina quando uma nova peça não consegue ser posicionada no tabuleiro.

Nesse momento:

1. A partida é interrompida.
2. A pontuação final é exibida.
3. A tela de Game Over aparece.
4. O jogador pode iniciar uma nova partida.

---

# ⏸️ Sistema de pausa

A tecla:

```text
P
```

alterna entre:

```text
Jogo ativo
     ↓
Pausado
     ↓
Jogo ativo
```

Durante a pausa, a atualização da física do jogo é interrompida.

---

# 🖥️ Tecnologias utilizadas

## HTML5

Responsável pela estrutura da aplicação e pelos elementos `<canvas>`.

## CSS3

Responsável pelo:

* Layout
* Painel lateral
* Botões
* Tela de Game Over
* Responsividade

## JavaScript

Responsável por toda a lógica:

* Estado do jogo
* Peças
* Movimento
* Rotação
* Colisões
* Pontuação
* Níveis
* Linhas
* Game Over
* Loop de animação

## Canvas API

Utilizada para renderizar:

* Tabuleiro
* Peças
* Blocos
* Próxima peça

---

# 📚 Conceitos estudados

Este projeto pode ser utilizado como exercício para estudar:

* Manipulação do DOM
* Eventos de teclado
* JavaScript moderno
* Arrays multidimensionais
* Matrizes
* Transformações de matriz
* Detecção de colisões
* Game loops
* `requestAnimationFrame`
* Controle de tempo
* Gerenciamento de estado
* Renderização com Canvas
* Estruturação de projetos front-end

---

# 🔧 Melhorias planejadas

O projeto pode evoluir com os seguintes recursos:

### Jogabilidade

* [ ] Hold Piece
* [ ] Ghost Piece
* [ ] Sistema de rotação mais avançado
* [ ] Sistema de wall kick
* [ ] Sistema de 7-bag para distribuição das peças
* [ ] Preview de múltiplas peças
* [ ] Combo
* [ ] Back-to-back
* [ ] T-Spin
* [ ] Perfect Clear

### Interface

* [ ] Tela inicial
* [ ] Tela de pausa
* [ ] Tela de configurações
* [ ] Animação ao eliminar linhas
* [ ] Efeitos visuais
* [ ] Tema claro/escuro
* [ ] Responsividade aprimorada

### Áudio

* [ ] Efeitos sonoros
* [ ] Música
* [ ] Som de movimento
* [ ] Som de rotação
* [ ] Som de queda
* [ ] Som de Game Over

### Dados

* [ ] High Score
* [ ] `localStorage`
* [ ] Ranking local
* [ ] Estatísticas da partida
* [ ] Melhor nível alcançado
* [ ] Maior quantidade de linhas

### Mobile

* [ ] Controles na tela
* [ ] Suporte a toque
* [ ] Layout otimizado para smartphones
* [ ] Gestos para movimentação

---

# 🧪 Compatibilidade

O projeto foi desenvolvido utilizando tecnologias disponíveis nos navegadores modernos.

Recomenda-se utilizar versões recentes de:

* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Safari

---

# 📦 Dependências

Nenhuma.

```text
Frameworks: 0
Bibliotecas: 0
Backend: 0
Banco de dados: 0
Build system: 0
Dependências: 0
```

É JavaScript puro. A velha tecnologia que ainda consegue fazer coisas úteis sem instalar 847 pacotes.

---

# 🤝 Contribuição

Contribuições são bem-vindas.

Para contribuir:

```bash
git clone https://github.com/gabrdevlab/tetris
cd tetris
```

Depois:

1. Crie uma branch.
2. Faça suas alterações.
3. Teste o jogo.
4. Faça o commit.
5. Envie um Pull Request.

Exemplo:

```bash
git checkout -b feature/novo-recurso

git add .

git commit -m "feat: adiciona novo recurso"

git push origin feature/novo-recurso
```

---

# 📄 Licença

Este projeto foi desenvolvido para fins educacionais.

O código pode ser estudado, modificado e utilizado como base para outros projetos, respeitando a licença definida para o repositório.

---

# 🎯 Objetivo do projeto

O objetivo principal não é apenas criar um jogo funcional.

É utilizar um projeto pequeno e conhecido para compreender como diferentes conceitos de desenvolvimento de software trabalham juntos:

```text
Entrada do jogador
       ↓
Processamento
       ↓
Estado do jogo
       ↓
Colisões
       ↓
Atualização
       ↓
Renderização
       ↓
Novo frame
       ↺
```

O resultado é um projeto simples o suficiente para ser entendido por quem está começando, mas complexo o bastante para servir como exercício real de programação.

---

## ⭐ Status

**Em desenvolvimento**

Novos recursos podem ser adicionados conforme o projeto evolui.
