const canvas = document.getElementById('meucanvas');

const ctx = canvas.getContext("2d");
let frames = 0

const grau = Math.PI/180


//carregar imagens

const imagem = new Image()
imagem.src = "imagens/sprite.png"

const som = []
som.push(new Audio())
som[0].src = 'audio/sfx_point.wav'
som[0].volume = 0.1
som.push(new Audio())
som[1].src = 'audio/sfx_flap.wav'
som[1].volume = 0.1
som.push(new Audio())
som[2].src = 'audio/sfx_hit.wav'
som[2].volume = 0.1
som.push(new Audio())
som[3].src = 'audio/sfx_swooshing.wav'
som[3].volume = 0.1
som.push(new Audio())
som[4].src = 'audio/sfx_die.wav'
som[4].volume = 0.1

canvas.addEventListener("click", evt => {
    switch(estadojogo.atual){
        case estadojogo.comeco:
            estadojogo.atual = estadojogo.jogo
            som[3].play()
            break
        case estadojogo.jogo:
            passaro.pular()
            som[1].play()
            break
        case estadojogo.final:
            let deslocamento = canvas.getBoundingClientRect()
            let clickx = evt.clientX - deslocamento.left
            let clicky = evt.clientY -deslocamento.top
            if(clickx >= botao.x && clickx <= botao.x + botao.w && clicky >= botao.y && clicky <= botao.y + botao.h){
                pontuacao.resetar()
                tubos.resetar()
                passaro.resetar()
                estadojogo.atual = estadojogo.comeco
            }
            break
    }
})

const botao = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

const estadojogo = {
    atual : 0,
    comeco : 0,
    jogo: 1,
    final : 2,
}

const pontuacao = {
    atual : 0,
    melhor : parseInt(localStorage.getItem('melhor')) || 0,
    draw : function() {
        ctx.fillStyle = '#FFF'
        ctx.strokeStyle = '#000'
        if(estadojogo.atual==estadojogo.jogo){
            ctx.lineWidth = 2
            ctx.font = '35px Stencil Std, fantasy'
            ctx.fillText(this.atual, canvas.width/2, 50)
            ctx.strokeText(this.atual, canvas.width/2, 50)
        }   
        else if(estadojogo.atual == estadojogo.final){
            ctx.lineWidth = 2
            ctx.font = '25px Stencil Std, fantasy'
            ctx.fillText(this.atual, 225, 186)
            ctx.strokeText(this.atual, 225, 186)
            ctx.fillText(this.melhor, 225, 228)
            ctx.strokeText(this.melhor, 225, 228)

        }
    },
    resetar : function(){
        this.atual = 0
    }
}


const background = {
    sX : 0,
    sY : 0,
    w : 275,
    h: 226,
    x : 0,
    y : canvas.height - 226,
    draw : function(){
        ctx.drawImage(imagem, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(imagem, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    }
}

const chao = {
    sX : 276,
    sY : 0,
    w : 224,
    h: 112,
    x : 0,
    y : canvas.height - 112,
    dx : 2,
    draw : function(){
        ctx.drawImage(imagem, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        ctx.drawImage(imagem, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
    },
    mover : function(){
        if(estadojogo.atual==estadojogo.jogo){
            this.x = (this.x - this.dx)%(this.w/2)
        }
    }
}


const passaro = {
    animacao : [{sX : 276, sY : 112},{sX : 276, sY : 164},{sX : 276, sY : 139},{sX : 276, sY : 112}],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    raio : 12,
    frame : 0,
    gravidade : 0.20,
    pulo : 4.6,
    velocidade : 0,
    rotacionar : 0,
    draw : function(){
        let passaro = this.animacao[this.frame]
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotacionar)
        ctx.drawImage(imagem, passaro.sX, passaro.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h)
        ctx.restore()
    },
    pular : function(){
        this.velocidade = -this.pulo

    },
    animar : function(){
        this.periodo = estadojogo.atual == estadojogo.comeco ? 10 : 5
        this.frame += frames % this.periodo == 0 ? 1 : 0
        this.frame = this.frame%this.animacao.length
        if(estadojogo.atual == estadojogo.comeco){ 
            this.y = 150
            this.rotacionar = 0 * grau
        }
        else{
            this.velocidade += this.gravidade
            this.y += this.velocidade
            if(this.y + this.h/2 >= canvas.height-chao.h){
                this.y = canvas.height - chao.h - this.h/2;
                if(estadojogo.atual == estadojogo.jogo){
                    estadojogo.atual = estadojogo.final
                    som[4].play()
                }
            }
            if(this.velocidade >= this.pulo){
                this.rotacionar = 90 * grau
                this.frame = 1
            }
            else{
                this.rotacionar = -25 * grau
            }
        }
    },
    resetar : function(){
        this.velocidade = 0
    }
}

const tubos = {
    posicao : [],
    cima : {
        sX : 553,
        sY : 0
    },
    baixo : {
        sX : 502,
        sY : 0
    },
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    draw : function(){
        for(let i = 0; i < this.posicao.length; i++){
            let p = this.posicao[i]
            let cimaYPos = p.y
            let baixoYPos = p.y + this.h + this.gap
            ctx.drawImage(imagem, this.cima.sX, this.cima.sY, this.w, this.h, p.x, cimaYPos, this.w, this.h)
            ctx.drawImage(imagem, this.baixo.sX, this.baixo.sY, this.w, this.h, p.x, baixoYPos, this.w, this.h)

        }
    },
    atualizar : function(){
        if(estadojogo.atual !== estadojogo.jogo) return
        if(frames%100==0){
            this.posicao.push({
                x : canvas.width,
                y : this.maxYPos * (Math.random() + 1)
            })
        }
        for(let i = 0; i < this.posicao.length; i++){
            let p = this.posicao[i]
            //DETECTAR COLISAO
            let tubobaixo = p.y + this.h + this.gap
            if(passaro.x + passaro.raio > p.x && passaro.x - passaro.raio < p.x + this.w && passaro.y + passaro.raio > p.y && passaro.y -  passaro.raio < p.y + this.h){
                estadojogo.atual = estadojogo.final
                som[2].play()
            }
            if(passaro.x + passaro.raio > p.x && passaro.x - passaro.raio < p.x + this.w && passaro.y + passaro.raio > tubobaixo && passaro.y - passaro.raio < tubobaixo + this.h){
                estadojogo.atual = estadojogo.final
                som[2].play()

            }
            //MOVER TUBOS
            p.x -= this.dx;
            if(p.x + this.w <= 0){
                this.posicao.shift();
                pontuacao.atual += 1
                som[0].play()
                pontuacao.melhor = Math.max(pontuacao.atual, pontuacao.melhor)
                localStorage.setItem('melhor', pontuacao.melhor)
                
            }
        }
    },
    resetar : function(){
        this.posicao = []
    }

    
}



const telainicial = {
    sX : 0,
    sY : 228,
    w : 173,
    h : 152,
    x : canvas.width/2 - 173/2,
    y : 80,
    draw : function(){
        if(estadojogo.atual==estadojogo.comeco){
            ctx.drawImage(imagem, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}

const gameover = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : canvas.width/2 - 225/2,
    y : 90,
    draw : function(){
        if(estadojogo.atual==estadojogo.final){
            ctx.drawImage(imagem, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h)
        }
    }
}



function draw(){
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    background.draw()
    tubos.draw()
    chao.draw()
    passaro.draw()
    telainicial.draw()
    gameover.draw()
    pontuacao.draw()
}

function atualizar(){
    passaro.animar()
    chao.mover()
    tubos.atualizar()

}

function loop(){
    atualizar()
    draw()
    frames++
    requestAnimationFrame(loop)

}

loop()



