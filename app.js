/* ======================================
   INDEXED DB
====================================== */

const DB_NAME = 'controleFinanceiroDB'
const DB_VERSION = 2
const STORE_NAME = 'lancamentos'



let db



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





/* ======================================
   VARIÁVEIS
====================================== */

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
   CONFIG CARTÃO
====================================== */

formConfigCartao.addEventListener(
    'submit',
    (e) => {

        e.preventDefault()



        configCartao = {

            limite: Number(
                document.getElementById(
                    'limiteCartaoInput'
                ).value
            ),

            fechamento: Number(
                document.getElementById(
                    'fechamentoCartao'
                ).value
            ),

            vencimento: Number(
                document.getElementById(
                    'vencimentoCartao'
                ).value
            )

        }



        localStorage.setItem(
            'configCartao',
            JSON.stringify(
                configCartao
            )
        )



        atualizarCartao()

    }
)





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
   NOVO LANÇAMENTO
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
   PARCELAMENTO REAL
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

            const dataParcela =
                new Date()



            dataParcela.setMonth(
                dataParcela.getMonth()
                + (i - 1)
            )



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
                    dataParcela,

                cartao: true

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
   CARTÃO REAL
====================================== */

function atualizarCartao() {

    let limiteUsado = 0

    let faturaAtual = 0



    const hoje =
        new Date()



    const mesAtual =
        hoje.getMonth()



    const anoAtual =
        hoje.getFullYear()



    lancamentos.forEach(
        (item) => {

            if (item.cartao) {

                limiteUsado +=
                    Number(item.valor)



                const data =
                    new Date(
                        item.criadoEm
                    )



                if (

                    data.getMonth()
                    === mesAtual

                    &&

                    data.getFullYear()
                    === anoAtual

                ) {

                    faturaAtual +=
                        Number(item.valor)

                }

            }

        }
    )



    const disponivel =
        configCartao.limite
        - limiteUsado



    document.getElementById(
        'limiteTotal'
    ).textContent =
        formatarMoeda(
            configCartao.limite
        )



    document.getElementById(
        'limiteUsado'
    ).textContent =
        formatarMoeda(
            limiteUsado
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
            faturaAtual
        )



    document.getElementById(
        'fechamentoTexto'
    ).textContent =

        `Fechamento dia ${configCartao.fechamento}`



    document.getElementById(
        'vencimentoTexto'
    ).textContent =

        `Vencimento dia ${configCartao.vencimento}`

}





/* ======================================
   INICIAR
====================================== */

async function iniciar() {

    document.getElementById(
        'limiteCartaoInput'
    ).value =
        configCartao.limite



    document.getElementById(
        'fechamentoCartao'
    ).value =
        configCartao.fechamento



    document.getElementById(
        'vencimentoCartao'
    ).value =
        configCartao.vencimento



    await abrirBanco()

    await carregarLancamentos()

}



iniciar()