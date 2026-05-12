/* ======================================
   INDEXED DB
====================================== */

const DB_NAME = 'controleFinanceiroDB'
const DB_VERSION = 1
const STORE_NAME = 'lancamentos'

let db





/* ======================================
   ABRIR BANCO
====================================== */

function abrirBanco() {

    return new Promise((resolve, reject) => {

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



                    store.createIndex(
                        'categoria',
                        'categoria',
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

                resolve(db)

            }



        request.onerror =
            (event) => {

                reject(
                    event.target.error
                )

            }

    })

}





/* ======================================
   SALVAR
====================================== */

function salvarLancamento(dados) {

    return new Promise((resolve, reject) => {

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



        request.onsuccess = () => {

            resolve()

        }



        request.onerror = () => {

            reject()

        }

    })

}





/* ======================================
   BUSCAR
====================================== */

function buscarLancamentos() {

    return new Promise((resolve, reject) => {

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



        request.onsuccess = () => {

            resolve(
                request.result
            )

        }



        request.onerror = () => {

            reject()

        }

    })

}





/* ======================================
   REMOVER
====================================== */

function removerLancamentoDB(id) {

    return new Promise((resolve, reject) => {

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



        request.onsuccess = () => {

            resolve()

        }



        request.onerror = () => {

            reject()

        }

    })

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



const menuItems =
    document.querySelectorAll(
        '.menu-item'
    )

const paginas =
    document.querySelectorAll(
        '.pagina'
    )





/* ======================================
   VARIÁVEIS
====================================== */

const LIMITE_CARTAO = 5000

let lancamentos = []

let grafico





/* ======================================
   MENU
====================================== */

menuItems.forEach((item) => {

    item.addEventListener(
        'click',
        () => {

            menuItems.forEach((btn) => {

                btn.classList.remove(
                    'ativo'
                )

            })



            item.classList.add(
                'ativo'
            )



            const pagina =
                item.dataset.page



            paginas.forEach((secao) => {

                secao.classList.remove(
                    'ativa'
                )

            })



            document
                .getElementById(pagina)
                .classList.add(
                    'ativa'
                )

        }
    )

})





/* ======================================
   FORMATAR
====================================== */

function formatarMoeda(valor) {

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

    })



    saldoTotal.textContent =
        formatarMoeda(
            entradas - saidas
        )



    totalEntradas.textContent =
        formatarMoeda(entradas)



    totalSaidas.textContent =
        formatarMoeda(saidas)



    atualizarGrafico()

    atualizarCartao()

}





/* ======================================
   ADICIONAR
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
            criadoEm: new Date()

        })



        await carregarLancamentos()

        form.reset()

    }
)





/* ======================================
   PARCELAMENTO
====================================== */

formParcela.addEventListener(
    'submit',
    async (e) => {

        e.preventDefault()



        const descricao =
            document.getElementById(
                'descricaoParcela'
            ).value



        const valorTotal =
            Number(
                document.getElementById(
                    'valorTotalParcela'
                ).value
            )



        const quantidadeParcelas =
            Number(
                document.getElementById(
                    'quantidadeParcelas'
                ).value
            )



        const valorParcela =
            valorTotal /
            quantidadeParcelas



        for (
            let i = 1;
            i <= quantidadeParcelas;
            i++
        ) {

            await salvarLancamento({

                descricao:
                    `${descricao} (${i}/${quantidadeParcelas})`,

                valor:
                    valorParcela,

                tipo: 'saida',

                categoria: 'Cartão',

                parcela: i,

                totalParcelas:
                    quantidadeParcelas,

                criadoEm:
                    new Date()

            })

        }



        await carregarLancamentos()

        formParcela.reset()

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

async function remover(id) {

    await removerLancamentoDB(id)

    await carregarLancamentos()

}





/* ======================================
   PESQUISA
====================================== */

pesquisa.addEventListener(
    'input',
    () => {

        const texto =
            pesquisa.value
                .toLowerCase()



        const filtrados =
            lancamentos.filter(
                (item) => {

                    return (

                        item.descricao
                            .toLowerCase()
                            .includes(texto)

                        ||

                        item.categoria
                            .toLowerCase()
                            .includes(texto)

                    )

                }
            )



        atualizarTela(
            filtrados
        )

    }
)





/* ======================================
   EXPORTAR
====================================== */

exportarBtn.addEventListener(
    'click',
    () => {

        const dados =
            JSON.stringify(
                lancamentos
            )



        const blob =
            new Blob(
                [dados],
                {
                    type:
                        'application/json'
                }
            )



        const url =
            URL.createObjectURL(
                blob
            )



        const a =
            document.createElement(
                'a'
            )



        a.href = url

        a.download =
            'backup-financeiro.json'



        a.click()

    }
)





/* ======================================
   IMPORTAR
====================================== */

importarArquivo.addEventListener(
    'change',
    async (evento) => {

        const arquivo =
            evento.target.files[0]



        if (!arquivo) return



        const leitor =
            new FileReader()



        leitor.onload =
            async function (e) {

                const dados =
                    JSON.parse(
                        e.target.result
                    )



                for (
                    const item of dados
                ) {

                    delete item.id

                    await salvarLancamento(
                        item
                    )

                }



                await carregarLancamentos()

            }



        leitor.readAsText(
            arquivo
        )

    }
)





/* ======================================
   GRÁFICO
====================================== */

function atualizarGrafico() {

    const categorias = {}



    lancamentos.forEach(
        (item) => {

            if (
                item.tipo === 'saida'
            ) {

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

        }
    )



    const labels =
        Object.keys(
            categorias
        )



    const valores =
        Object.values(
            categorias
        )



    const ctx =
        document.getElementById(
            'graficoCategorias'
        )



    if (grafico) {

        grafico.destroy()

    }



    grafico = new Chart(
        ctx,
        {

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

        }
    )

}





/* ======================================
   CARTÃO
====================================== */

function atualizarCartao() {

    let usado = 0



    lancamentos.forEach(
        (item) => {

            if (
                item.categoria ===
                'Cartão'
            ) {

                usado += Number(
                    item.valor
                )

            }

        }
    )



    const disponivel =
        LIMITE_CARTAO - usado



    document.getElementById(
        'limiteTotal'
    ).textContent =
        formatarMoeda(
            LIMITE_CARTAO
        )



    document.getElementById(
        'limiteUsado'
    ).textContent =
        formatarMoeda(
            usado
        )



    document.getElementById(
        'limiteDisponivel'
    ).textContent =
        formatarMoeda(
            disponivel
        )



    document.getElementById(
        'faturaAtual'
    ).textContent =
        formatarMoeda(
            usado
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