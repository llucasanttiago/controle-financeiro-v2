const form = document.getElementById('formLancamento')

const lista = document.getElementById('listaLancamentos')

const saldoTotal = document.getElementById('saldoTotal')
const totalEntradas = document.getElementById('totalEntradas')
const totalSaidas = document.getElementById('totalSaidas')

const pesquisa = document.getElementById('pesquisa')

const exportarBtn = document.getElementById('exportar')
const importarArquivo = document.getElementById('importarArquivo')



let lancamentos =
    JSON.parse(localStorage.getItem('lancamentos')) || []



/* SALVAR */

function salvarDados() {

    localStorage.setItem(
        'lancamentos',
        JSON.stringify(lancamentos)
    )
}





/* FORMATAR */

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        'pt-BR',
        {
            style: 'currency',
            currency: 'BRL'
        }
    )
}





/* ATUALIZAR */

function atualizarTela(listaFiltrada = lancamentos) {

    lista.innerHTML = ''

    let entradas = 0
    let saidas = 0

    listaFiltrada.forEach((item, index) => {

        const li = document.createElement('li')



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



        <button onclick="removerLancamento(${index})">

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



    const saldo = entradas - saidas



    saldoTotal.textContent =
        formatarMoeda(saldo)

    totalEntradas.textContent =
        formatarMoeda(entradas)

    totalSaidas.textContent =
        formatarMoeda(saidas)



    salvarDados()

    atualizarGrafico()
}





/* ADICIONAR */

form.addEventListener('submit', (e) => {

    e.preventDefault()



    const descricao =
        document.getElementById('descricao').value

    const valor =
        document.getElementById('valor').value

    const tipo =
        document.getElementById('tipo').value

    const categoria =
        document.getElementById('categoria').value



    lancamentos.push({

        descricao,
        valor,
        tipo,
        categoria

    })



    atualizarTela()

    form.reset()

})





/* REMOVER */

function removerLancamento(index) {

    lancamentos.splice(index, 1)

    atualizarTela()

}





/* PESQUISA */

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





/* BACKUP */

exportarBtn.addEventListener('click', () => {

    const dados =
        JSON.stringify(lancamentos)



    const blob = new Blob(
        [dados],
        {
            type: 'application/json'
        }
    )



    const url =
        URL.createObjectURL(blob)



    const a =
        document.createElement('a')



    a.href = url

    a.download =
        'backup-financeiro.json'



    a.click()

})





/* IMPORTAR */

importarArquivo.addEventListener(
    'change',
    (evento) => {

        const arquivo =
            evento.target.files[0]



        if (!arquivo) return



        const leitor =
            new FileReader()



        leitor.onload = function (e) {

            lancamentos =
                JSON.parse(e.target.result)



            atualizarTela()

        }



        leitor.readAsText(arquivo)

    }
)





/* GRÁFICO */

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
        document.getElementById('graficoCategorias')



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





/* INICIAR */

atualizarTela()