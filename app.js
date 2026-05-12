/* =========================
   INDEXED DB
========================= */

const DB_NAME = 'controleFinanceiroDB'
const DB_VERSION = 1
const STORE_NAME = 'lancamentos'

let db



/* =========================
   ABRIR BANCO
========================= */

function abrirBanco() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(DB_NAME, DB_VERSION)



        request.onupgradeneeded = (event) => {

            db = event.target.result



            if (
                !db.objectStoreNames.contains(STORE_NAME)
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
                    { unique: false }
                )

                store.createIndex(
                    'categoria',
                    'categoria',
                    { unique: false }
                )

            }

        }



        request.onsuccess = (event) => {

            db = event.target.result

            resolve(db)

        }



        request.onerror = (event) => {

            reject(event.target.error)

        }

    })

}





/* =========================
   SALVAR LANÇAMENTO
========================= */

function salvarLancamento(dados) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                [STORE_NAME],
                'readwrite'
            )



        const store =
            transaction.objectStore(STORE_NAME)



        const request =
            store.add(dados)



        request.onsuccess = () => {

            resolve()

        }



        request.onerror = () => {

            reject()

        }

    })

}





/* =========================
   BUSCAR TODOS
========================= */

function buscarLancamentos() {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                [STORE_NAME],
                'readonly'
            )



        const store =
            transaction.objectStore(STORE_NAME)



        const request =
            store.getAll()



        request.onsuccess = () => {

            resolve(request.result)

        }



        request.onerror = () => {

            reject()

        }

    })

}





/* =========================
   REMOVER
========================= */

function removerLancamentoDB(id) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                [STORE_NAME],
                'readwrite'
            )



        const store =
            transaction.objectStore(STORE_NAME)



        const request =
            store.delete(id)



        request.onsuccess = () => {

            resolve()

        }



        request.onerror = () => {

            reject()

        }

    })

}





/* =========================
   VARIÁVEIS
========================= */

const form =
    document.getElementById('formLancamento')

const lista =
    document.getElementById('listaLancamentos')

const saldoTotal =
    document.getElementById('saldoTotal')

const totalEntradas =
    document.getElementById('totalEntradas')

const totalSaidas =
    document.getElementById('totalSaidas')

const pesquisa =
    document.getElementById('pesquisa')



let lancamentos = []





/* =========================
   FORMATAR MOEDA
========================= */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    )

}





/* =========================
   ATUALIZAR TELA
========================= */

function atualizarTela(listaFiltrada = lancamentos) {

    lista.innerHTML = ''

    let entradas = 0
    let saidas = 0



    listaFiltrada.forEach((item) => {

        const li =
            document.createElement('li')



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

          ${formatarMoeda(item.valor)}

        </span>



        <button
          onclick="remover(${item.id})"
        >

          X

        </button>

      </div>

    `



        lista.appendChild(li)



        if (item.tipo === 'entrada') {

            entradas += Number(item.valor)

        } else {

            saidas += Number(item.valor)

        }

    })



    saldoTotal.textContent =
        formatarMoeda(entradas - saidas)

    totalEntradas.textContent =
        formatarMoeda(entradas)

    totalSaidas.textContent =
        formatarMoeda(saidas)



    atualizarGrafico()

}





/* =========================
   ADICIONAR
========================= */

form.addEventListener('submit', async (e) => {

    e.preventDefault()



    const descricao =
        document.getElementById('descricao').value

    const valor =
        document.getElementById('valor').value

    const tipo =
        document.getElementById('tipo').value

    const categoria =
        document.getElementById('categoria').value



    await salvarLancamento({

        descricao,
        valor,
        tipo,
        categoria,
        criadoEm: new Date()
    })



    await carregarLancamentos()

    form.reset()

})





/* =========================
   CARREGAR
========================= */

async function carregarLancamentos() {

    lancamentos =
        await buscarLancamentos()



    atualizarTela()

}





/* =========================
   REMOVER
========================= */

async function remover(id) {

    await removerLancamentoDB(id)

    await carregarLancamentos()

}





/* =========================
   PESQUISA
========================= */

pesquisa.addEventListener('input', () => {

    const texto =
        pesquisa.value.toLowerCase()



    const filtrados =
        lancamentos.filter((item) => {

            return (

                item.descricao
                    .toLowerCase()
                    .includes(texto)

                ||

                item.categoria
                    .toLowerCase()
                    .includes(texto)

            )

        })



    atualizarTela(filtrados)

})





/* =========================
   GRÁFICO
========================= */

let grafico



function atualizarGrafico() {

    const categorias = {}



    lancamentos.forEach((item) => {

        if (item.tipo === 'saida') {

            if (!categorias[item.categoria]) {

                categorias[item.categoria] = 0

            }

            categorias[item.categoria] +=
                Number(item.valor)

        }

    })



    const labels =
        Object.keys(categorias)

    const valores =
        Object.values(categorias)



    const ctx =
        document.getElementById(
            'graficoCategorias'
        )



    if (grafico) {

        grafico.destroy()

    }



    grafico = new Chart(ctx, {

        type: 'doughnut',

        data: {

            labels: labels,

            datasets: [

                {

                    data: valores,

                    borderWidth: 0

                }

            ]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    labels: {

                        color: 'white'

                    }

                }

            }

        }

    })

}





/* =========================
   INICIAR
========================= */

async function iniciar() {

    await abrirBanco()

    await carregarLancamentos()

}



iniciar()