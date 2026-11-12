
/* ==================================
   URNA DIGITAL - SISTEMA DE VOTAÇÃO
   ================================== */

const perguntas = [
    {
        pergunta: "Se você descobrisse que um aplicativo está usando seus dados pessoais, o que faria?",
        alternativas: [
            "Continuaria usando normalmente.",
            "Procuraria saber quais dados estão sendo coletados.",
            "Excluiria o aplicativo.",
            "Não saberia o que fazer."
        ]
    },
    {
        pergunta: "Você costuma aceitar os cookies dos sites sem ler?",
        alternativas: [
            "Sim, sempre.",
            "Às vezes leio.",
            "Não, procuro entender antes.",
            "Nem sei exatamente o que são cookies."
        ]
    },
    {
        pergunta: "Se uma rede social mostrasse uma propaganda de algo que você comentou com alguém, como reagiria?",
        alternativas: [
            "Acharia normal.",
            "Ficaria desconfiado.",
            "Me sentiria vigiado.",
            "Procuraria saber como isso aconteceu."
        ]
    },
    {
        pergunta: "Se presenciasse alguém sendo humilhado na internet, o que faria?",
        alternativas: [
            "Não me envolveria.",
            "Denunciaria a publicação.",
            "Defenderia a pessoa.",
            "Conversaria com alguém sobre a situação."
        ]
    },
    {
        pergunta: "Você trocaria parte da sua privacidade por mais praticidade na internet?",
        alternativas: [
            "Sim, sem problemas.",
            "Depende do que eu receberia em troca.",
            "Não, minha privacidade é prioridade.",
            "Nunca pensei sobre isso."
        ]
    }
];

/* ELEMENTOS */

const telas = {
    inicio: document.querySelector("#tela-inicio"),
    quiz: document.querySelector("#tela-quiz"),
    conclusao: document.querySelector("#tela-conclusao"),
    resultado: document.querySelector("#tela-resultado")
};

const botaoIniciar = document.querySelector("#iniciar-quiz");
const botaoConfirmar = document.querySelector("#confirmar-resposta");
const botaoProximo = document.querySelector("#proximo-participante");

const textoPergunta = document.querySelector("#texto-pergunta");
const alternativas = document.querySelector("#alternativas");
const numeroPergunta = document.querySelector("#numero-pergunta");
const progresso = document.querySelector("#progresso");

const grafico = document.querySelector("#grafico-resultados");
const totalParticipantes = document.querySelector("#quantidade-participantes");

/* DADOS */

const CHAVE_VOTOS = "urnaDigitalVotosV1";

function carregarVotos() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_VOTOS) || "[]"
        );

        if (
            Array.isArray(dados) &&
            dados.every(function (voto) {
                return Array.isArray(voto) &&
                    voto.length === perguntas.length &&
                    voto.every(function (resposta) {
                        return Number.isInteger(resposta) &&
                            resposta >= 0 &&
                            resposta <= 3;
                    });
            })
        ) {
            return dados;
        }
    } catch (erro) {
        console.error("Erro ao carregar votos:", erro);
    }

    return [];
}

let votos = carregarVotos();
let perguntaAtual = 0;
let respostaSelecionada = null;
let respostasAtuais = [];

/* CONTROLE DAS TELAS */

function mostrarTela(nome) {
    Object.keys(telas).forEach(function (chave) {
        telas[chave].hidden = chave !== nome;
    });
}

/* INICIAR VOTAÇÃO */

function iniciarVotacao() {
    perguntaAtual = 0;
    respostaSelecionada = null;
    respostasAtuais = [];

    mostrarTela("quiz");
    mostrarPergunta();
}

botaoIniciar.addEventListener("click", iniciarVotacao);
botaoProximo.addEventListener("click", iniciarVotacao);

/* EXIBIR PERGUNTA */

function mostrarPergunta() {
    const atual = perguntas[perguntaAtual];

    textoPergunta.textContent = atual.pergunta;

    numeroPergunta.textContent =
        `Pergunta ${perguntaAtual + 1} de ${perguntas.length}`;

    progresso.style.width =
        `${((perguntaAtual + 1) / perguntas.length) * 100}%`;

    alternativas.innerHTML = "";
    respostaSelecionada = null;
    botaoConfirmar.disabled = true;

    atual.alternativas.forEach(function (texto, indice) {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "alternativa";
        botao.textContent =
            `${String.fromCharCode(65 + indice)}) ${texto}`;

        botao.setAttribute("aria-pressed", "false");

        botao.addEventListener("click", function () {
            document.querySelectorAll(".alternativa")
                .forEach(function (item) {
                    item.classList.remove("selecionada");
                    item.setAttribute("aria-pressed", "false");
                });

            botao.classList.add("selecionada");
            botao.setAttribute("aria-pressed", "true");

            respostaSelecionada = indice;
            botaoConfirmar.disabled = false;
        });

        alternativas.appendChild(botao);
    });
}

/* CONFIRMAR RESPOSTA */

botaoConfirmar.addEventListener("click", function () {
    if (respostaSelecionada === null) {
        return;
    }

    respostasAtuais.push(respostaSelecionada);
    perguntaAtual++;

    if (perguntaAtual < perguntas.length) {
        mostrarPergunta();
    } else {
        finalizarVotacao();
    }
});

/* FINALIZAR E SALVAR */

function finalizarVotacao() {
    const novosVotos = [...votos, [...respostasAtuais]];

    try {
        localStorage.setItem(
            CHAVE_VOTOS,
            JSON.stringify(novosVotos)
        );

        votos = novosVotos;
        mostrarTela("conclusao");
    } catch (erro) {
        console.error("Erro ao salvar votação:", erro);

        alert(
            "Não foi possível salvar o voto. " +
            "Verifique o armazenamento do navegador."
        );
    }
}

/* PAINEL DE RESULTADOS */

function mostrarResultados() {
    mostrarTela("resultado");

    totalParticipantes.textContent = votos.length;
    grafico.innerHTML = "";

    const letras = ["A", "B", "C", "D"];

    perguntas.forEach(function (pergunta, indicePergunta) {
        const bloco = document.createElement("div");
        bloco.className = "bloco-resultado";

        const titulo = document.createElement("h3");
        titulo.textContent =
            `${indicePergunta + 1}. ${pergunta.pergunta}`;

        bloco.appendChild(titulo);

        const contagem = [0, 0, 0, 0];

        votos.forEach(function (voto) {
            contagem[voto[indicePergunta]]++;
        });

        contagem.forEach(function (quantidade, indice) {
            const porcentagem = votos.length > 0
                ? (quantidade / votos.length) * 100
                : 0;

            const linha = document.createElement("div");
            linha.className = "linha-resultado";

            const legenda = document.createElement("div");
            legenda.className = "titulo-resultado";

            legenda.textContent =
                `${letras[indice]}) ${pergunta.alternativas[indice]}`;

            const numero = document.createElement("span");
            numero.className = "numero-resultado";
            numero.textContent =
                `${quantidade} voto(s) — ${porcentagem.toFixed(1)}%`;

            const barra = document.createElement("div");
            barra.className = "barra-resultado";

            const preenchimento = document.createElement("div");
            preenchimento.className = "preenchimento-resultado";
            preenchimento.style.width = `${porcentagem}%`;

            barra.appendChild(preenchimento);
            linha.appendChild(legenda);
            linha.appendChild(numero);
            linha.appendChild(barra);

            bloco.appendChild(linha);
        });

        grafico.appendChild(bloco);
    });
}

/* BOTÕES DO PAINEL */

document.querySelector("#ver-resultados")
    .addEventListener("click", mostrarResultados);

document.querySelector("#resultados-conclusao")
    .addEventListener("click", mostrarResultados);

document.querySelector("#voltar-inicio")
    .addEventListener("click", function () {
        mostrarTela("inicio");
    });

/* EXPORTAR PARA EXCEL (CSV) */

document.querySelector("#exportar-resultados")
    .addEventListener("click", function () {

        const linhas = [
            ["Participante", "Pergunta 1", "Pergunta 2",
             "Pergunta 3", "Pergunta 4", "Pergunta 5"]
        ];

        votos.forEach(function (voto, indice) {
            linhas.push([
                indice + 1,
                ...voto.map(function (resposta) {
                    return ["A", "B", "C", "D"][resposta];
                })
            ]);
        });

        const conteudo = linhas
            .map(function (linha) {
                return linha.join(";");
            })
            .join("\r\n");

        const arquivo = new Blob(
            ["\uFEFF" + conteudo],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(arquivo);
        const link = document.createElement("a");

        link.href = url;
        link.download = "resultados-urna-digital.csv";
        link.click();

        URL.revokeObjectURL(url);
    });
