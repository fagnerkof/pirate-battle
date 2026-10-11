# 🏴‍☠️ Pirate Battle — Naval Combat Arena

Aplicação web interativa de combate naval em 2D desenvolvida com **React**, **TypeScript** e motor gráfico **PixiJS v8**.

---

## 🚀 Setup do Projeto

### Pré-requisitos
* **Node.js**: Versão `>= 18.0.0`
* **npm**: Versão `>= 9.0.0`

### Passo a Passo de Instalação (Clean Checkout)
```bash
# 1. Clonar e acessar o repositório
git clone <URL_DO_REPOSITORIO>
cd pirate-battle

# 2. Instalar dependências
npm install

# 3. Inicializar worker do MSW (se necessário)
npx msw init public/ --save

🛠️ Configuração de Gameplay e Modos

Na tela de Options, o usuário pode personalizar e salvar no localStorage:
Game Session Time: Duração da partida (entre 60s e 180s).
Enemy Spawn Interval: Frequência de surgimento de inimigos (entre 1s e 10s).

🌐 Seleção, Reset e Teste de Cenários de Rede (MSW)

A aplicação conta com um simulador de cenários de rede configurável para validar resiliência e tratamento de falhas.

Cenários Disponíveis
success (Padrão): Respostas instantâneas da API (200 OK / 201 Created).
slow: Alta latência (delay de 2,5s).
error_500: Simula erro interno do servidor HTTP 500.
timeout: Simula estouro de tempo de requisição (delay > 5s).
offline: Simula perda total de conexão à internet.

Instruções para Alterar e Reproduzir Falhas
Abra o Console do Navegador (F12) e execute os comandos JS abaixo:
JavaScript
// 1. Simular falha de servidor (Erro 500)
localStorage.setItem('pirate_battle_network_scenario', 'error_500');

// 2. Simular modo Offline e Fila de Retenção
localStorage.setItem('pirate_battle_network_scenario', 'offline');

// 3. Resetar para funcionamento normal
localStorage.setItem('pirate_battle_network_scenario', 'success');

Testando a Recuperação de Pontuações Pendentes (Offline Queue)

Ative o cenário offline.
Conclua uma partida e tente enviar o seu nome. O envio falhará e a pontuação será salva na fila pendente local.
Altere o cenário para success.
Recarregue a página (F5). A aplicação sincronizará automaticamente os registros pendentes e atualizará o ranking.

📜 Scripts do Projeto

Comando 			Descrição
npm run dev			Inicia o servidor de desenvolvimento Vite com HMR
npm run build		Valida tipos TypeScript e compila o bundle otimizado de produção em dist/	
npm run preview		Executa o servidor local apontando para a pasta dist/ de produção
npm run lint		Executa o linter ESLint no modo estrito sem ignorar avisos	
npm run typecheck	Executa a verificação estática de tipos do TypeScript sem emitir arquivos
npm run test:e2e	Executa a suíte de testes ponta a ponta com Playwright em navegadores Headless

📊 Relatório de Testes e Profiling

Acesse o relatório estático e evidências de performance diretamente pelo navegador em:
👉 http://localhost:5173/report.html (em dev) ou /report.html após o deploy.
