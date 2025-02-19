// Simulação do aluno logado
const alunoLogado = {
    nome: "João Silva",
    matricula: "2024001",
    pendencia: false,
    acessibilidade: false
};

// Dados dos armários
const armarios = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    formato: i % 3 === 0 ? 'duplo' : 'padrao',
    status: i % 7 === 0 ? 'reservado' : 'disponivel',
    acessivel: i % 4 === 0,
    reservaAtual: null
}));

// Array para armazenar reservas
let reservasAtivas = [];

// Funções relacionadas ao aluno
function renderizarUserInfo() {
    const userInfo = document.getElementById('userInfo');
    userInfo.innerHTML = `
        <h3>Aluno: ${alunoLogado.nome}</h3>
        <p>Matrícula: ${alunoLogado.matricula}</p>
        <p>Status: ${alunoLogado.pendencia ? 'Com pendência' : 'Regular'}</p>
        ${alunoLogado.acessibilidade ? '<p>Necessita de armário acessível</p>' : ''}
    `;
}

// Verificação de permissão para reserva
function podeReservar(armario) {
    if (armario.status !== 'disponivel') return false;
    if (alunoLogado.pendencia) return false;
    if (alunoLogado.acessibilidade && !armario.acessivel) return false;
    return true;
}

// Funções de manipulação dos armários
function realizarReserva(armarioId) {
    // Verifica se o aluno já tem uma reserva ativa
    const jaTemReserva = reservasAtivas.some(reserva => reserva.matricula === alunoLogado.matricula && !reserva.dataEntrega);
    if (jaTemReserva) {
        alert('Você já tem um armário reservado.');
        return;
    }

    const armario = armarios.find(a => a.id === armarioId);
    if (!podeReservar(armario)) {
        alert('Não é possível reservar este armário');
        return;
    }

    // Adiciona uma confirmação antes de realizar a reserva
    const confirmar = confirm('Você deseja realmente reservar este armário?');
    if (!confirmar) {
        return; // Se o aluno não confirmar, a função é encerrada aqui
    }

    const reserva = {
        armarioId: armarioId,
        matricula: alunoLogado.matricula,
        nome: alunoLogado.nome,
        dataReserva: new Date().toISOString(),
        dataEntrega: null,
        status: 'ativa'
    };

    armario.status = 'reservado';
    armario.reservaAtual = reserva;
    reservasAtivas.push(reserva);

    salvarDados();
    renderizarArmarios();
    renderizarReservas();
}

function finalizarReserva(armarioId) {
    const armario = armarios.find(a => a.id === armarioId);
    if (!armario.reservaAtual) return;

    const reservaIndex = reservasAtivas.findIndex(
        r => r.armarioId === armarioId && !r.dataEntrega
    );

    if (reservaIndex !== -1) {
        reservasAtivas[reservaIndex].dataEntrega = new Date().toISOString();
        reservasAtivas[reservaIndex].status = 'finalizada';
    }

    armario.status = 'disponivel';
    armario.reservaAtual = null;

    salvarDados();
    renderizarArmarios();
    renderizarReservas();
}

// Funções de filtro
function filtrarArmarios() {
    const mostrarAcessiveis = document.getElementById('filtroAcessivel').checked;
    const mostrarDisponiveis = document.getElementById('filtroDisponiveis').checked;

    return armarios.filter(armario => {
        if (mostrarAcessiveis && !armario.acessivel) return false;
        if (mostrarDisponiveis && armario.status !== 'disponivel') return false;
        return true;
    });
}

// Funções de renderização
function renderizarArmarios() {
    const armariosGrid = document.getElementById('armariosGrid');
    const armariosFiltrados = filtrarArmarios();
    
    armariosGrid.innerHTML = '';
    armariosFiltrados.forEach((armario) => {
        const div = document.createElement('div');
        let armarioClass = 'armario';
        if (armario.status === 'disponivel') {
            armarioClass += ' disponivel';
            div.onclick = () => realizarReserva(armario.id);
        } else if (armario.reservaAtual?.matricula === alunoLogado.matricula) {
            armarioClass += ' reservado-meu';
        } else {
            armarioClass += ' reservado-outro';
        }

        div.className = `${armarioClass} ${armario.formato}`;

        div.innerHTML = `
            <div class="numero">${armario.id}</div>
            <div class="info">
                ${armario.formato === 'duplo' ? '<span class="icone-duplo">2</span>' : ''}
                ${armario.acessivel ? '<span class="icone-acessivel">♿</span>' : ''}
                <br>
                ${armario.status.charAt(0).toUpperCase() + armario.status.slice(1)}
            </div>
        `;

        armariosGrid.appendChild(div);
    });
}

function renderizarReservas() {
    const reservasLista = document.getElementById('reservasLista');
    const minhasReservas = reservasAtivas.filter(
        r => r.matricula === alunoLogado.matricula
    );

    reservasLista.innerHTML = '';

    if (minhasReservas.length === 0) {
        reservasLista.innerHTML = '<p>Você ainda não tem reservas.</p>';
    } else {
        minhasReservas.forEach(reserva => {
            const div = document.createElement('div');
            div.className = reserva.status === 'finalizada' ? 'reserva-item finalizada' : 'reserva-item';
            
            const dataReserva = new Date(reserva.dataReserva).toLocaleString();
            const armario = armarios.find(a => a.id === reserva.armarioId);
            
            div.innerHTML = `
                <div>
                    <strong>Armário ${reserva.armarioId}</strong>
                    <br>
                    Tipo: ${armario.formato}
                    ${armario.acessivel ? ' (Acessível)' : ''}
                    <br>
                    Reservado em: ${dataReserva}
                </div>
            `;

            // Adiciona o botão apenas se a reserva não estiver finalizada
            if (reserva.status !== 'finalizada') {
                div.innerHTML += `
                    <button onclick="finalizarReserva(${reserva.armarioId})">
                        Finalizar Reserva
                    </button>
                `;
            }

            reservasLista.appendChild(div);
        });
    }
}

// Funções de persistência
function salvarDados() {
    localStorage.setItem('armariosSistema', JSON.stringify(armarios));
    localStorage.setItem('reservasAtivas', JSON.stringify(reservasAtivas));
}

function carregarDados() {
    const dadosArmarios = localStorage.getItem('armariosSistema');
    const dadosReservas = localStorage.getItem('reservasAtivas');
    
    if (dadosArmarios) {
        const dados = JSON.parse(dadosArmarios);
        dados.forEach((dado, index) => {
            armarios[index] = dado;
        });
    }
    
    if (dadosReservas) {
        reservasAtivas = JSON.parse(dadosReservas);
    }
}

// Verificação de reservas expiradas
function verificarReservasExpiradas() {
    const agora = new Date().getTime();
    armarios.forEach(armario => {
        if (armario.reservaAtual) {
            const dataReserva = new Date(armario.reservaAtual.dataReserva).getTime();
            if (agora - dataReserva > 24 * 60 * 60 * 1000) {
                finalizarReserva(armario.id);
                armario.reservaAtual.status = 'expirada';
            }
        }
    });
}

// Função para salvar os dados do aluno
function salvarDadosAluno() {
    const dadosAluno = {
        nome: alunoLogado.nome,
        matricula: alunoLogado.matricula,
        pendencia: alunoLogado.pendencia,
        acessibilidade: alunoLogado.acessibilidade
    };
    localStorage.setItem('dadosAluno', JSON.stringify(dadosAluno));
}

// Função para carregar os dados do aluno
function carregarDadosAluno() {
    const dadosAluno = localStorage.getItem('dadosAluno');
    if (dadosAluno) {
        const aluno = JSON.parse(dadosAluno);
        alunoLogado.nome = aluno.nome;
        alunoLogado.matricula = aluno.matricula;
        alunoLogado.pendencia = aluno.pendencia;
        alunoLogado.acessibilidade = aluno.acessibilidade;
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosAluno(); // Carrega os dados do aluno do localStorage
    carregarDados();
    renderizarUserInfo();
    renderizarArmarios();
    renderizarReservas();

    // Eventos dos filtros
    document.getElementById('filtroAcessivel').addEventListener('change', renderizarArmarios);
    document.getElementById('filtroDisponiveis').addEventListener('change', renderizarArmarios);

    // Verificar reservas expiradas a cada minuto
    setInterval(verificarReservasExpiradas, 60000);

    // Verifica se é a primeira visita do usuário
    if (!localStorage.getItem('primeiraVisita')) {
        alert('Bem-vindo! Mudei um pouco o intuito da tarefa para que ficasse mais abrangente e pudésse explorar melhor a tecnologia.');
        localStorage.setItem('primeiraVisita', 'true');
    }
});

document.getElementById('formAluno').addEventListener('submit', function(event) {
    event.preventDefault();
    alunoLogado.nome = document.getElementById('nomeAluno').value;
    alunoLogado.matricula = document.getElementById('matriculaAluno').value;
    alunoLogado.pendencia = document.getElementById('pendenciaAluno').checked;
    alunoLogado.acessibilidade = document.getElementById('acessibilidadeAluno').checked;

    salvarDadosAluno(); // Salva os dados do aluno no localStorage
    renderizarUserInfo();
    renderizarArmarios();
    renderizarReservas();
});