// PÁGINA HTML SERÁ CRIADA POR AQUI

// FUNÇÃO PARA CRIAR ELEMENTO HTML
function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}
// FUNÇÃO CONTRUTORA PARA CRIAR A BARREIRA
function Barreira(reversa = false){
    // cria o atributo elemento como público (uma div com a classe barreira)
    this.elemento = novoElemento('div', 'barreira')
    // cria o corpo e a borda
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    // verifica se é reversa para fazer o corpo ou a borda em cima e embaixo
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)
    // função set
    this.setAltura = altura => corpo.style.height = `${altura}px`
}   
// criando uma barreira reversa
// const b = new Barreira(true)
// b.setAltura(300)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, pos){
    // cria o elemento div com a classe par-de-barreiras
    this.elemento = novoElemento('div', 'par-de-barreiras')
    // cria a barreira superior e inferior (objeto global)
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    // 'elemento' é um atributo da função contrutora barreira
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    // função para sortear abertura
    this.sortearAbertura = () =>{
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    // retornar a posição x do par barreiras (pega a posição , tira o px e converte para inteiro)
    this.getPosX = () => parseInt(this.elemento.style.left.split('px'[0]))
    // setar a posição do par de barreiras.
    this.setPosX = posX => this.elemento.style.left = `${posX}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setPosX(pos)
}
// teste do jogo
// const b = new ParDeBarreiras(700, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

// RESPONSÁVEL POR CONTROLAR MÚLTIPLAS BARREIRAS
function Barreiras(altura, largura, abertura, espacoBarreiras, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espacoBarreiras),
        new ParDeBarreiras(altura, abertura, largura + espacoBarreiras * 2),
        new ParDeBarreiras(altura, abertura, largura + espacoBarreiras * 3)
    ]
    const deslocamento = 3
    this.animar = () =>{
        this.pares.forEach(par =>{
            par.setPosX(par.getPosX() - deslocamento)

            // qunado o elemto sair da área do jogo seta a posição para o final do jogo
            // E SORTEIA A NOVA ABERTURA
            if(par.getPosX() < -par.getLargura()){
                par.setPosX(par.getPosX() + espacoBarreiras * this.pares.length)
                par.sortearAbertura()
            }
            // VERIFICA SE CRUZOU O MEIO DA BARREIRA
            const meio = largura / 2
            const cruzouOMeio = par.getPosX() + deslocamento >= meio && par.getPosX() < meio
            // CONTROLAR PONTUAÇÃO
            if(cruzouOMeio) notificarPonto()
        })
    }
}
// CRIAR O PÁSSARO
function Passaro(alturaDoJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = '../imgs/passaro.png'

    this.getPosY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setPosY = Y => this.elemento.style.bottom = `${Y}px`

    // se tiver tecla pressionada seta voando pra true
    window.onkeydown = evento => voando = true
    // se não tiver tecla pressionada seta voando pra false
    window.onkeyup = evento => voando = false

    this.animar = () =>{
        
        // se tiver voando aumenta senão diminui
        const novoY = this.getPosY() + (voando ? 5 : -4)
        // altura máxima que pássaro pode voar
        const alturaMaxima = alturaDoJogo - this.elemento.clientHeight

        // Verifica os limites do pássaro no jogo
        if(novoY <= 0){
            this.setPosY(0)
        } else if(novoY >= alturaMaxima){
            this.setPosY(alturaMaxima)
        } else{
            this.setPosY(novoY)
        }
    }
    // define a posição inicial do pássaro
    this.setPosY(alturaDoJogo / 2)
}
// FUNÇÃO PARA ATUALIZAR A PONTUAÇÃO
function Progresso(){
    // CRIA UM ELEMENTO SPAN COM A CLASSE PROGRESSO
    this.elemento = novoElemento('span', 'progresso')
    // adiciona os pontos atualizadas na página html
    this.atualizarPontos = pontos =>{
        this.elemento.innerHTML = pontos
    }
    // EXIBE O VALOR INICIAL
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    // (a.left + a.width = pega o lado direito do elemento)
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    // retorna que estão sobrepostos se V
    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras =>{
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(){
    let pontos = 0
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    const progresso = new Progresso()
    const notificarPonto = () => progresso.atualizarPontos(++pontos)
    const barreiras = new Barreiras(altura, largura, 200, 400, notificarPonto)
    const passaro = new Passaro(altura)
    
    // ADICIONAR NA PÁGINA
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = () =>{
        // LOOP DO JOGO
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
            }
        }, 20);
    }
}
new FlappyBird().start()


// // TESTE DO JOGO
// const barreiras = new Barreiras(700, 1200, 200, 400)
// const passaro = new Passaro(700)
// const areaJogo = document.querySelector('[wm-flappy]')
// // adiciona o pássaro na área do jogo
// areaJogo.appendChild(passaro.elemento)
// areaJogo.appendChild(new Progresso().elemento)

// barreiras.pares.forEach(par => areaJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20);
