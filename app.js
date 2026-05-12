const form = document.getElementById('formLancamento')
const lista = document.getElementById('listaLancamentos')
const saldoTotal = document.getElementById('saldoTotal')
const totalEntradas = document.getElementById('totalEntradas')
const totalSaidas = document.getElementById('totalSaidas')
const exportarBtn = document.getElementById('exportar')
const importarArquivo = document.getElementById('importarArquivo')
let lancamentos = JSON.parse(localStorage.getItem('lancamentos')) || []
function salvarDados() {
    localStorage.setItem('lancamentos', JSON.stringify(lancamentos))
}
function atualizarTela() {
    lista.innerHTML = ''
    let entradas = 0
    let saidas = 0
    lancamentos.forEach((item, index) => {
        const li = document.createElement('li')
        const valorFormatado = Number(item.valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        })
        li.innerHTML = `
 <div class="item-info">
 <strong>${item.descricao}</strong>
 <small>${item.categoria}</small>
 </div>
 <div>
 <span class="${item.tipo === 'entrada' ? 'valor-entrada' : 'valorsaida'}">
${item.tipo === 'entrada' ? '+' : '-'} ${valorFormatado}
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
    saldoTotal.textContent = saldo.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
    totalEntradas.textContent = entradas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
    totalSaidas.textContent = saidas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    })
    salvarDados()
}
form.addEventListener('submit', (e) => {
    e.preventDefault()
    const descricao = document.getElementById('descricao').value
    const valor = document.getElementById('valor').value
    const tipo = document.getElementById('tipo').value
    const categoria = document.getElementById('categoria').value
    lancamentos.push({
        descricao,
        valor,
        tipo,
        categoria
    })
    atualizarTela()
    form.reset()
})
function removerLancamento(index) {
    lancamentos.splice(index, 1)
    atualizarTela()
}
exportarBtn.addEventListener('click', () => {
    const dados = JSON.stringify(lancamentos)
    const blob = new Blob([dados], {
        type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-financeiro.json'
    a.click()
})
importarArquivo.addEventListener('change', (evento) => {
    const arquivo = evento.target.files[0]
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = function (e) {
        lancamentos = JSON.parse(e.target.result)
        atualizarTela()
    }
    leitor.readAsText(arquivo)
})
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
}
atualizarTela()