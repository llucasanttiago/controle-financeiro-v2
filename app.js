require('dotenv').config();
/* ======================================
   OPENAI
====================================== */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;





/* ======================================
   DATABASE
====================================== */

const DB_NAME =
    'controleFinanceiroDB'

const DB_VERSION = 5

const STORE_NAME =
    'lancamentos'



let db
let lancamentos = []
let grafico





/* ======================================
   CONFIG CARTÃO
====================================== */

let configCartao =
    JSON.parse(

        localStorage.getItem(
            'configCartao'
        )

    ) || {

        limite: 5000,
        fechamento: 10,
        vencimento: 17

    }





/* ======================================
   ELEMENTOS
====================================== */

const form =
    document.getElementById(
        'formLancamento'
    )

const lista =
    document.getElementById(
        'listaLancamentos'
    )

const saldoTotal =
    document.getElementById(
        'saldoTotal'
    )

const totalEntradas =
    document.getElementById(
        'totalEntradas'
    )

const totalSaidas =
    document.getElementById(
        'totalSaidas'
    )

const pesquisa =
    document.getElementById(
        'pesquisa'
    )

const exportarBtn =
    document.getElementById(
        'exportar'
    )

const importarArquivo =
    document.getElementById(
        'importarArquivo'
    )

const formParcela =
    document.getElementById(
        'formParcela'
    )

const formConfigCartao =
    document.getElementById(
        'formConfigCartao'
    )

const menuItems =
    document.querySelectorAll(
        '.menu-item'
    )

const paginas =
    document.querySelectorAll(
        '.pagina'
    )

const chatInput =
    document.getElementById(
        'chatInput'
    )

const enviarIA =
    document.getElementById(
        'enviarIA'
    )

const chatMensagens =
    document.getElementById(
        'chatMensagens'
    )





/* ======================================
   BANCO
====================================== */

function abrirBanco() {

    return new Promise(

        (resolve, reject) => {

            const request =
                indexedDB.open(

                    DB_NAME,
                    DB_VERSION

                )



            request.onupgradeneeded =
                (event) => {

                    db =
                        event.target.result



                    if (

                        !db.objectStoreNames.contains(
                            STORE_NAME
                        )

                    ) {

                        const store =
                            db.createObjectStore(

                                STORE_NAME,

                                {
                                    keyPath: 'id',
                                    autoIncrement: true
                                }

                            )



                        store.createIndex(
                            'descricao',
                            'descricao',
                            {
                                unique: false
                            }
                        )

                    }

                }



            request.onsuccess =
                (event) => {

                    db =
                        event.target.result

                    resolve()

                }



            request.onerror =
                (event) => {

                    reject(
                        event.target.error
                    )

                }

        }

    )

}





/* ======================================
   SALVAR
====================================== */

function salvarLancamento(
    dados
) {

    return new Promise(

        (resolve, reject) => {

            const transaction =
                db.transaction(

                    [STORE_NAME],
                    'readwrite'

                )



            const store =
                transaction.objectStore(
                    STORE_NAME
                )



            const request =
                store.add(dados)



            request.onsuccess =
                () => resolve()



            request.onerror =
                () => reject()

        }

    )

}





/* ======================================
   BUSCAR
====================================== */

function buscarLancamentos() {

    return new Promise(

        (resolve, reject) => {

            const transaction =
                db.transaction(

                    [STORE_NAME],
                    'readonly'

                )



            const store =
                transaction.objectStore(
                    STORE_NAME
                )



            const request =
                store.getAll()



            request.onsuccess =
                () => {

                    resolve(
                        request.result
                    )

                }



            request.onerror =
                () => reject()

        }

    )

}





/* ======================================
   REMOVER
====================================== */

function removerLancamentoDB(
    id
) {

    return new Promise(

        (resolve, reject) => {

            const transaction =
                db.transaction(

                    [STORE_NAME],
                    'readwrite'

                )



            const store =
                transaction.objectStore(
                    STORE_NAME
                )



            const request =
                store.delete(id)



            request.onsuccess =
                () => resolve()



            request.onerror =
                () => reject()

        }

    )

}





/* ======================================
   MENU
====================================== */

menuItems.forEach(
    (item) => {

        item.addEventListener(
            'click',
            () => {

                menuItems.forEach(
                    (btn) => {

                        btn.classList.remove(
                            'ativo'
                        )

                    }
                )



                item.classList.add(
                    'ativo'
                )



                const pagina =
                    item.dataset.page



                paginas.forEach(
                    (secao) => {

                        secao.classList.remove(
                            'ativa'
                        )

                    }
                )



                document
                    .getElementById(
                        pagina
                    )
                    .classList.add(
                        'ativa'
                    )

            }
        )

    }
)





/* ======================================
   FORMATAR
====================================== */

function formatarMoeda(
    valor
) {

    return Number(valor)
        .toLocaleString(

            'pt-BR',

            {
                style: 'currency',
                currency: 'BRL'
            }

        )

}





/* ======================================
   ATUALIZAR TELA
====================================== */

function atualizarTela(
    listaFiltrada = lancamentos
) {

    lista.innerHTML = ''



    let entradas = 0
    let saidas = 0



    listaFiltrada.forEach(
        (item) => {

            const li =
                document.createElement(
                    'li'
                )



            li.innerHTML = `

        <div class="item-info">

          <strong>
            ${item.descricao}
          </strong>

          <small>
            ${item.categoria}
          </small>

        </div>



        <div>

          <span class="${item.tipo === 'entrada'
                    ? 'valor-entrada'
                    : 'valor-saida'
                }">

            ${item.tipo === 'entrada'
                    ? '+'
                    : '-'
                }

            ${formatarMoeda(
                    item.valor
                )}

          </span>



          <button
            onclick="remover(${item.id})"
          >

            X

          </button>

        </div>

      `



            lista.appendChild(li)



            if (
                item.tipo === 'entrada'
            ) {

                entradas +=
                    Number(item.valor)

            }

            else {

                saidas +=
                    Number(item.valor)

            }

        }
    )



    saldoTotal.textContent =
        formatarMoeda(
            entradas - saidas
        )



    totalEntradas.textContent =
        formatarMoeda(
            entradas
        )



    totalSaidas.textContent =
        formatarMoeda(
            saidas
        )

}





/* ======================================
   CHAT
====================================== */

function adicionarMensagem(
    texto,
    tipo
) {

    const div =
        document.createElement(
            'div'
        )



    div.classList.add(
        'mensagem'
    )



    div.classList.add(
        tipo
    )



    div.innerHTML = texto



    chatMensagens.appendChild(
        div
    )



    chatMensagens.scrollTop =
        chatMensagens.scrollHeight

}



/* ======================================
   CONTEXTO
====================================== */

function gerarContextoFinanceiro() {

    let entradas = 0
    let saidas = 0

    let categorias = {}



    lancamentos.forEach(
        (item) => {

            if (
                item.tipo === 'entrada'
            ) {

                entradas +=
                    Number(item.valor)

            }

            else {

                saidas +=
                    Number(item.valor)

            }



            if (
                !categorias[
                item.categoria
                ]
            ) {

                categorias[
                    item.categoria
                ] = 0

            }



            categorias[
                item.categoria
            ] += Number(
                item.valor
            )

        }
    )



    return `

Resumo financeiro:

Entradas:
${entradas}

Saídas:
${saidas}

Saldo:
${entradas - saidas}

Categorias:
${JSON.stringify(categorias)}

Últimos lançamentos:
${JSON.stringify(
        lancamentos.slice(-15)
    )}

`

}





/* ======================================
   IA
====================================== */

async function processarIA(
    mensagem
) {

    adicionarMensagem(
        'Pensando...',
        'ia'
    )



    try {

        const contexto =
            gerarContextoFinanceiro()



        const resposta =
            await fetch(

                'https://api.openai.com/v1/chat/completions',

                {

                    method: 'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        Authorization:
                            `Bearer ${OPENAI_API_KEY}`

                    },



                    body: JSON.stringify({

                        model: 'gpt-4o-mini',



                        messages: [

                            {

                                role: 'system',

                                content: `

Você é uma IA financeira inteligente.

Você conversa naturalmente.

Você entende finanças pessoais.

Você pode:
- analisar gastos
- registrar gastos
- responder naturalmente
- agir como ChatGPT

IMPORTANTE:

Quando for registrar lançamento:
retorne APENAS JSON.

Formato:

{
  "acao": "lancamento",
  "descricao": "",
  "valor": 0,
  "tipo": "saida",
  "categoria": "",
  "cartao": false,
  "parcelas": 1
}

Se NÃO for lançamento:
responda normalmente.

`

                            },



                            {

                                role: 'system',

                                content: contexto

                            },



                            {

                                role: 'user',

                                content: mensagem

                            }

                        ],

                        temperature: 0.7

                    })

                }

            )



        /* ======================================
           ERRO API
        ====================================== */

        if (
            !resposta.ok
        ) {

            const erro =
                await resposta.text()



            console.log(erro)



            document
                .querySelector(
                    '.mensagem.ia:last-child'
                )
                .remove()



            adicionarMensagem(

                'Erro OpenAI API.',

                'ia'

            )



            return

        }





        const dados =
            await resposta.json()



        console.log(dados)



        const textoIA =
            dados
                .choices[0]
                .message
                .content



        document
            .querySelector(
                '.mensagem.ia:last-child'
            )
            .remove()



        /* ======================================
           TENTAR JSON
        ====================================== */

        let json = null



        try {

            const textoLimpo =
                textoIA

                    .replace(
                        '```json',
                        ''
                    )

                    .replace(
                        '```',
                        ''
                    )

                    .trim()



            json =
                JSON.parse(
                    textoLimpo
                )

        }

        catch {

            json = null

        }





        /* ======================================
           LANÇAMENTO
        ====================================== */

        if (
            json &&
            json.acao ===
            'lancamento'
        ) {

            const parcelas =
                json.parcelas || 1



            const valorParcela =
                json.valor / parcelas



            for (
                let i = 1;
                i <= parcelas;
                i++
            ) {

                const data =
                    new Date()



                data.setMonth(
                    data.getMonth()
                    + (i - 1)
                )



                await salvarLancamento({

                    descricao:
                        parcelas > 1

                            ? `${json.descricao} (${i}/${parcelas})`

                            : json.descricao,



                    valor:
                        valorParcela,



                    tipo:
                        json.tipo,



                    categoria:
                        json.categoria,



                    cartao:
                        json.cartao,



                    criadoEm:
                        data

                })

            }



            await carregarLancamentos()



            adicionarMensagem(

                'Lançamento salvo com sucesso.',

                'ia'

            )

        }





        /* ======================================
           RESPOSTA NORMAL
        ====================================== */

        else {

            adicionarMensagem(
                textoIA,
                'ia'
            )

        }

    }

    catch (error) {

        console.log(error)



        document
            .querySelector(
                '.mensagem.ia:last-child'
            )
            ?.remove()



        adicionarMensagem(

            'Erro ao processar IA.',

            'ia'

        )

    }

}





/* ======================================
   ENVIAR CHAT
====================================== */

enviarIA.addEventListener(

    'click',

    async () => {

        const mensagem =
            chatInput.value.trim()



        if (!mensagem) return



        adicionarMensagem(
            mensagem,
            'usuario'
        )



        chatInput.value = ''



        await processarIA(
            mensagem
        )

    }

)





/* ======================================
   ENTER
====================================== */

chatInput.addEventListener(

    'keypress',

    (e) => {

        if (
            e.key === 'Enter'
        ) {

            enviarIA.click()

        }

    }

)





/* ======================================
   FORM
====================================== */

form.addEventListener(

    'submit',

    async (e) => {

        e.preventDefault()



        const descricao =
            document.getElementById(
                'descricao'
            ).value



        const valor =
            document.getElementById(
                'valor'
            ).value



        const tipo =
            document.getElementById(
                'tipo'
            ).value



        const categoria =
            document.getElementById(
                'categoria'
            ).value



        await salvarLancamento({

            descricao,
            valor,
            tipo,
            categoria,

            criadoEm:
                new Date()

        })



        await carregarLancamentos()

        form.reset()

    }

)





/* ======================================
   CARREGAR
====================================== */

async function carregarLancamentos() {

    lancamentos =
        await buscarLancamentos()



    atualizarTela()

}





/* ======================================
   REMOVER
====================================== */

async function remover(
    id
) {

    await removerLancamentoDB(
        id
    )



    await carregarLancamentos()

}





/* ======================================
   SERVICE WORKER
====================================== */

if (
    'serviceWorker'
    in navigator
) {

    window.addEventListener(

        'load',

        () => {

            navigator.serviceWorker
                .register('./sw.js')

        }

    )

}





/* ======================================
   INICIAR
====================================== */

async function iniciar() {

    await abrirBanco()

    await carregarLancamentos()

}



iniciar()