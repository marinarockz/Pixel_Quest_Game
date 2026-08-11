
const NUM_PARES = 6;

const TEMPO_PARA_VIRAR_DE_VOLTA = 900;

const CAMINHO_IMAGENS = 'assets/img/';

const IMAGEM_VERSO = CAMINHO_IMAGENS + 'verso.png';

function gerarFigurasPadrao(quantidade) {
  const figuras = [];
  for (let i = 1; i <= quantidade; i++) {
    figuras.push({
      id: i,
      nome: `figura-${i}`,
      imagem: `${CAMINHO_IMAGENS}figura-${i}.png`
    });
  }
  return figuras;
}

const FIGURAS = gerarFigurasPadrao(NUM_PARES);

let cartasViradas = [];
let paresEncontrados = 0;
let jogadas = 0;
let tabuleiroTravado = false;
let jogoIniciado = false;
let segundosDecorridos = 0;
let cronometroInterval = null;

const board = document.getElementById('board');
const movesEl = document.getElementById('moves');
const pairsEl = document.getElementById('pairs');
const timerEl = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const winOverlay = document.getElementById('win-overlay');
const finalMovesEl = document.getElementById('final-moves');
const finalTimeEl = document.getElementById('final-time');
const playAgainBtn = document.getElementById('play-again-btn');

pairsEl.textContent = `0/${NUM_PARES}`;

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function criarBaralho() {
  const baralho = [...FIGURAS, ...FIGURAS]; 
  return embaralhar(baralho);
}

function criarElementoCarta(figura, indice) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.figuraId = figura.id;
  card.dataset.indice = indice;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <img class="pixel-img" src="${IMAGEM_VERSO}" alt="Verso da carta">
        <span class="placeholder-label">verso.png</span>
      </div>
      <div class="card-face card-front">
        <img class="pixel-img" src="${figura.imagem}" alt="${figura.nome}">
        <span class="placeholder-label">${figura.nome}.png</span>
      </div>
    </div>
  `;

  card.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      img.parentElement.classList.add('placeholder');
    });
  });

  card.addEventListener('click', () => virarCarta(card));
  return card;
}

function montarTabuleiro() {
  board.innerHTML = '';
  const baralho = criarBaralho();
  baralho.forEach((figura, indice) => {
    board.appendChild(criarElementoCarta(figura, indice));
  });
}

function virarCarta(card) {
  if (tabuleiroTravado) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  if (!jogoIniciado) {
    jogoIniciado = true;
    iniciarCronometro();
  }

  card.classList.add('flipped');
  cartasViradas.push(card);

  if (cartasViradas.length === 2) {
    jogadas++;
    movesEl.textContent = jogadas;
    verificarPar();
  }
}

function verificarPar() {
  tabuleiroTravado = true;
  const [primeira, segunda] = cartasViradas;
  const acertou = primeira.dataset.figuraId === segunda.dataset.figuraId;

  if (acertou) {
    primeira.classList.add('matched');
    segunda.classList.add('matched');
    paresEncontrados++;
    pairsEl.textContent = `${paresEncontrados}/${NUM_PARES}`;
    resetarSelecao();

    if (paresEncontrados === NUM_PARES) {
      finalizarJogo();
    }
  } else {
    primeira.classList.add('erro');
    segunda.classList.add('erro');

    setTimeout(() => {
      primeira.classList.remove('flipped', 'erro');
      segunda.classList.remove('flipped', 'erro');
      resetarSelecao();
    }, TEMPO_PARA_VIRAR_DE_VOLTA);
  }
}

function resetarSelecao() {
  cartasViradas = [];
  tabuleiroTravado = false;
}

function iniciarCronometro() {
  segundosDecorridos = 0;
  atualizarTimer();
  cronometroInterval = setInterval(() => {
    segundosDecorridos++;
    atualizarTimer();
  }, 1000);
}

function pararCronometro() {
  clearInterval(cronometroInterval);
}

function atualizarTimer() {
  const min = String(Math.floor(segundosDecorridos / 60)).padStart(2, '0');
  const seg = String(segundosDecorridos % 60).padStart(2, '0');
  timerEl.textContent = `${min}:${seg}`;
}

function finalizarJogo() {
  pararCronometro();
  finalMovesEl.textContent = jogadas;
  finalTimeEl.textContent = timerEl.textContent;
  winOverlay.classList.remove('hidden');
}

function reiniciarJogo() {
  pararCronometro();

  cartasViradas = [];
  paresEncontrados = 0;
  jogadas = 0;
  tabuleiroTravado = false;
  jogoIniciado = false;
  segundosDecorridos = 0;

  movesEl.textContent = '0';
  pairsEl.textContent = `0/${NUM_PARES}`;
  timerEl.textContent = '00:00';
  winOverlay.classList.add('hidden');

  montarTabuleiro();
}

restartBtn.addEventListener('click', reiniciarJogo);
playAgainBtn.addEventListener('click', reiniciarJogo);

montarTabuleiro();
