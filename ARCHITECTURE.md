## 1. Integração React + PixiJS e Loop de Simulação

A arquitetura adota a separação estrita de responsabilidades entre o **motor gráfico de simulação (PixiJS)** e a **camada de apresentação (React)**.

┌────────────────────────────────────────────────────────┐
│                   React Shell (UI)                     
│  [Main Menu] ──> [Options] ──> [HUD] ──> [Result]      └───────────────────────────┬────────────────────────────┘
│ (Callbacks via React Ref)
┌───────────────────────────▼────────────────────────────┐
│              PixiJS Engine (Game Engine)               │
│  - Ticker Loop (deltaTime)                             │
│  - Entity Updates (Player, Enemies, Bullets)           │
│  - Collision Detection (CollisionManager)              └────────────────────────────────────────────────────────┘

* **Loop por Delta Time**: O método `app.ticker.add` utiliza `ticker.deltaTime` e `ticker.deltaMS` para desacoplar a física do framerate do monitor, mantendo velocidade idêntica a 30 FPS, 60 FPS ou 144 FPS.
* **Desacoplamento do React**: Atualizações de HUD ocorrem via callbacks leves (`onHUDUpdate`) sem provocar *re-renders* do componente Canvas no React.
* **Ciclo de Vida e Limpeza de Memória**: O método `GameEngine.destroy()` encerra o ticker, remove ouvintes de eventos da janela (`blur`/`focus`/teclado) e descarta texturas/gráficos, prevenindo *memory leaks* no `React.StrictMode`.

---

## 2. Sistema de Colisões

O gerenciamento de colisões é feito via formas geométricas e limitadores de espaço (AABB):

1. **Circulo vs. Círculo (`checkCircleCircle`)**:
   Utilizado para verificar impactos entre projéteis e navios (jogador e inimigos).
   $$\text{Distância} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} < (r_1 + r_2)$$
2. **Círculo vs. Retângulo AABB (`checkCircleRect`)**:
   Utilizado para detectar colisão dos navios e projéteis contra a Ilha Central e bordas da arena.

---

## 3. Gerenciamento de Recursos e Texturas

* **Fase Atual**: Renderização via primitivas vetoriais otimizadas (`Graphics`) do PixiJS v8 para carregamento instantâneo sem dependência de assets externos.
* **Fase Futura (Atlas/Sprites)**: Suporte pronto para substituir as primitivas por carregamento de sprites via `Assets.load('ui_sheet.json')`.

---

## 4. Persistência Local e Integração de Dados (Ranking e Histórico)

### Contratos de API (JSON)
* **`GET /api/ranking`**: Retorna array de pontuações ordenadas decrescentemente.
* **`GET /api/history`**: Retorna lista com histórico de partidas mais recentes.
* **`POST /api/ranking`**: Registra nova pontuação de partida.

### Estratégia de Caching e Invalidação (TanStack Query)
* A aplicação utiliza os hooks `useRanking` e `useMatchHistory` com `queryKey: ['ranking']` e `queryKey: ['history']`.
* Ao submeter um resultado via `useSubmitScore`, a mutação executa `queryClient.invalidateQueries()`, atualizando instantaneamente as tabelas do menu principal sem necessidade de *refresh*.

---

## 5. Resiliência Offline e Recuperação de Registros Pendentes

Quando uma submissão de pontuação falha (devido a falhas de rede, erro 500 ou queda de conexão):
1. A pontuação é gravada na fila local `pirate_battle_pending_scores` no `localStorage`.
2. A aplicação escuta eventos de reconexão e inicialização no `main.tsx`.
3. O serviço `syncPendingScores()` consome a fila e tenta reenviar os registros com controle de ID único, evitando duplicações.

---

## 6. Limitações e Decisões de Balanceamento

* **Velocidade do Jogador vs. Inimigos**: O navio principal opera a `3.5 px/frame`, enquanto inimigos *Chaser* operam a `2.2 px/frame` e *Shooters* a `1.2 px/frame`.
* **Recarga de Canhões**:
  * **Tiro Frontal**: Cooldown de 300ms.
  * **Tiro Lateral**: Cooldown de 800ms (dispara rajada de 3 tiros para cada bordo).
* **AI de Inimigos**: Inimigos *Chaser* causam dano por impacto e se autodestroem sem conceder pontos ao jogador. Inimigos *Shooter* mantêm distância e atacam a cada 2 segundos.