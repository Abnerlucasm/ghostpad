// Variáveis globais
let teleprompterAtivo = false;
let intervaloTeleprompter = null;
let velocidadeAtual = 5;
let contagemRegressiva = 0;
let scrollTimeout = null;
let palavraAtual = null;
let indicePalavraAtual = 0;
let todasPalavras = [];
let teleprompterPausado = false;
let destaqueAtivado = true;

// Funções auxiliares do Teleprompter
function calcularTempoLeitura(palavra) {
    if (!palavra) return 300;
    
    const letras = palavra.replace(/[^\p{L}]/gu, '').length;
    
    if (letras <= 2) return 200;
    if (letras <= 4) return 250;
    if (letras <= 8) return 300 + ((letras - 5) * 20);
    return 400 + ((letras - 8) * 30);
}

function temPontuacaoPausa(palavra) {
    if (!palavra) return false;
    
    const pontuacao = palavra.match(/[.,:;!?]$/);
    if (!pontuacao) return false;
    
    switch (pontuacao[0]) {
        case '.': case '!': case '?':
            return 600;
        case ':': case ';':
            return 400;
        case ',':
            return 200;
        default:
            return 0;
    }
}

function limparDestaquesAnteriores() {
    const spansFocados = document.querySelectorAll('.palavra-focada');
    spansFocados.forEach(span => {
        const parent = span.parentNode;
        if (parent) {
            const texto = span.textContent;
            const textNode = document.createTextNode(texto);
            parent.replaceChild(textNode, span);
            parent.normalize();
        }
    });
    
    const elementos = document.querySelectorAll('#editor *');
    elementos.forEach(el => {
        el.style.fontWeight = '';
        el.style.fontSize = '';
    });
}

function exibirInfoTempo(palavra, tempoTotal, velocidade) {
    const infoExistente = document.querySelector('.info-timer');
    if (infoExistente) infoExistente.remove();
    
    const infoTimer = document.createElement('div');
    infoTimer.className = 'info-timer';
    
    const tempoSegundos = (tempoTotal / 1000).toFixed(1);
    
    let velocidadeInfo = '';
    if (velocidade < 1) {
        velocidadeInfo = `muito lento (${velocidade})`;
    } else if (velocidade < 5) {
        velocidadeInfo = `lento (${velocidade})`;
    } else if (velocidade === 5) {
        velocidadeInfo = `normal (${velocidade})`;
    } else {
        velocidadeInfo = `rápido (${velocidade})`;
    }
    
    infoTimer.textContent = `${palavra} (${tempoSegundos}s) - ${velocidadeInfo}`;
    
    document.body.appendChild(infoTimer);
    
    setTimeout(() => {
        infoTimer.remove();
    }, tempoTotal + 100);
}

function ajustarVelocidade(incremento) {
    const velocidadeInput = document.getElementById('velocidade-teleprompter');
    if (!velocidadeInput) return;
    
    let valorAtual = parseFloat(velocidadeInput.value);
    let novaVelocidade;
    
    if (valorAtual < 1) {
        if (incremento > 0) {
            if (valorAtual < 0.5) novaVelocidade = 0.5;
            else if (valorAtual < 0.75) novaVelocidade = 0.75;
            else novaVelocidade = 1;
        } else {
            if (valorAtual > 0.5) novaVelocidade = 0.5;
            else if (valorAtual > 0.25) novaVelocidade = 0.25;
            else novaVelocidade = 0.25;
        }
    } else {
        novaVelocidade = valorAtual + incremento;
    }
    
    novaVelocidade = Math.max(0.25, Math.min(10, novaVelocidade));
    velocidadeInput.value = novaVelocidade;
    
    return novaVelocidade;
}

function mostrarContagemRegressiva(segundos, callback) {
    const contagem = document.getElementById('contagem-regressiva');
    if (!contagem) return;
    
    let contagemAtual = segundos;
    
    const atualizarContagem = () => {
        if (contagemAtual >= 0) {
            contagem.textContent = contagemAtual;
            contagem.classList.add('ativo');
            contagemAtual--;
            setTimeout(atualizarContagem, 1000);
        } else {
            contagem.classList.remove('ativo');
            contagem.textContent = '';
            if (callback) callback();
        }
    };
    
    atualizarContagem();
}

function mostrarInstrucoesUso() {
    const infoExistente = document.querySelector('.info-atalho');
    if (infoExistente) {
        infoExistente.remove();
        return;
    }
    
    const infoAtalho = document.createElement('div');
    infoAtalho.className = 'info-atalho';
    
    const atalhos = [
        { tecla: 'P', descricao: 'Pausar/Continuar' },
        { tecla: '↑', descricao: 'Aumentar velocidade' },
        { tecla: '↓', descricao: 'Diminuir velocidade' },
        { tecla: 'Home', descricao: 'Reiniciar leitura' },
        { tecla: 'ESC', descricao: 'Parar teleprompter' },
        { tecla: 'Alt + T', descricao: 'Alternar opacidade (100%/50%)' },
        { tecla: 'Alt + ]', descricao: 'Aumentar opacidade' },
        { tecla: 'Alt + [', descricao: 'Diminuir opacidade' },
        { tecla: 'Alt + Space', descricao: 'Iniciar teleprompter' }
    ];
    
    atalhos.forEach(atalho => {
        const item = document.createElement('div');
        item.className = 'info-atalho-item';
        
        const kbd = document.createElement('kbd');
        kbd.textContent = atalho.tecla;
        
        const desc = document.createElement('span');
        desc.textContent = atalho.descricao;
        
        item.appendChild(kbd);
        item.appendChild(desc);
        infoAtalho.appendChild(item);
    });
    
    document.body.appendChild(infoAtalho);
    
    infoAtalho.addEventListener('click', () => {
        infoAtalho.remove();
    });
}

// Função para inserir título
function insertTitle() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const title = document.createElement('h2');
    title.contentEditable = true;
    title.className = 'title';
    title.textContent = 'Título';
    editor.appendChild(title);
    title.focus();
    
    // Adiciona evento para expandir título
    title.addEventListener('input', function() {
        this.style.width = 'auto';
        this.style.width = (this.scrollWidth + 2) + 'px';
    });
}

// Função para atualizar o marcador de texto e indicador de foco
function atualizarMarcador() {
    const editor = document.getElementById('editor');
    const marcador = document.getElementById('marcador-texto');
    const indicador = document.getElementById('indicador-foco');
    const linhaAtual = document.querySelector('.linha-atual');
    if (!editor || !marcador || !indicador || !linhaAtual) return;

    // Posição do indicador no topo superior esquerdo
    indicador.style.top = '10px';
    indicador.style.left = '0';

    // Calculamos qual elemento está visível no topo da área de visualização
    const posicaoTopo = editor.scrollTop + 50; // Um pouco abaixo do topo para melhor visualização
    
    // Limpa o destaque de todo texto anterior
    limparDestaquesAnteriores();
    
    // Encontra a posição atual do cursor de foco
    const elementoNaFoco = encontrarElementoNaFoco(editor, posicaoTopo);
    
    if (elementoNaFoco) {
        const { elemento, texto } = elementoNaFoco;
        
        // Posiciona o marcador na linha atual
        const retangulo = elemento.getBoundingClientRect();
        const editorRect = editor.getBoundingClientRect();
        marcador.style.top = `${retangulo.top - editorRect.top + editor.scrollTop}px`;
        linhaAtual.style.top = `${retangulo.top - editorRect.top + editor.scrollTop}px`;
        
        // Destaca a palavra atual no texto
        if (texto) {
            destacarPalavraAtual(elemento, texto);
        } else {
            // Se não temos texto específico, destacamos o elemento inteiro
            elemento.style.fontWeight = 'bold';
            elemento.style.fontSize = '1.2em';
        }
    }
}

// Função para encontrar o elemento e texto no ponto de foco
function encontrarElementoNaFoco(editor, posicaoTopo) {
    const elementos = Array.from(editor.children);
    let alturaAcumulada = 0;
    
    for (const elemento of elementos) {
        const alturaAnterior = alturaAcumulada;
        alturaAcumulada += elemento.offsetHeight;
        
        // Verifica se o elemento está próximo ao topo da visualização
        if (posicaoTopo >= alturaAnterior && posicaoTopo <= alturaAcumulada) {
            // Calcula a posição relativa dentro do elemento
            const posicaoRelativa = posicaoTopo - alturaAnterior;
            const percentualAltura = posicaoRelativa / elemento.offsetHeight;
            
            // Tenta obter o texto do elemento
            let textoCompleto = elemento.textContent;
            
            // Se o elemento não tem texto ou é muito curto, retorna apenas o elemento
            if (!textoCompleto || textoCompleto.length < 3) {
                return { elemento };
            }
            
            // Divide o texto em palavras
            const palavras = textoCompleto.split(/\s+/);
            
            // Calcula qual palavra deve estar em foco com base na posição relativa
            const indicePalavra = Math.min(
                Math.floor(percentualAltura * palavras.length),
                palavras.length - 1
            );
            
            return {
                elemento,
                texto: palavras[indicePalavra]
            };
        }
    }
    
    return null;
}

// Função para destacar a palavra atual no texto
function destacarPalavraAtual(elemento, palavraFoco) {
    // Se a palavra estiver vazia, não faz nada
    if (!palavraFoco || palavraFoco.trim() === '') return;
    
    // Cria uma expressão regular para encontrar a palavra com limites de palavra
    const regex = new RegExp(`\\b${palavraFoco}\\b`, 'g');
    
    // Função recursiva para processar nós de texto
    function processarNo(no) {
        if (no.nodeType === Node.TEXT_NODE) {
            const texto = no.textContent;
            if (regex.test(texto)) {
                // Reseta o regex porque já foi usado
                regex.lastIndex = 0;
                
                // Divide o texto em partes usando a regex
                const partes = texto.split(regex);
                
                // Se não houver divisão, não há correspondência exata
                if (partes.length <= 1) return false;
                
                const novoFragmento = document.createDocumentFragment();
                
                // Reconstrói o texto com spans de destaque
                for (let i = 0; i < partes.length; i++) {
                    // Adiciona a parte do texto
                    if (partes[i]) {
                        novoFragmento.appendChild(document.createTextNode(partes[i]));
                    }
                    
                    // Adiciona a palavra com destaque (exceto após a última parte)
                    if (i < partes.length - 1) {
                        const span = document.createElement('span');
                        span.textContent = palavraFoco;
                        span.className = 'palavra-focada';
                        span.style.fontWeight = 'bold';
                        span.style.fontSize = '1.2em';
                        span.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                        novoFragmento.appendChild(span);
                    }
                }
                
                // Substitui o nó de texto pelo fragmento
                no.parentNode.replaceChild(novoFragmento, no);
                return true;
            }
        } else if (no.nodeType === Node.ELEMENT_NODE) {
            // Para elementos, processamos seus filhos
            const filhos = Array.from(no.childNodes);
            for (const filho of filhos) {
                if (processarNo(filho)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Processa os nós filhos do elemento
    processarNo(elemento);
}

// Função para reiniciar o teleprompter
function reiniciarTeleprompter() {
    if (!teleprompterAtivo) return;
    
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
    }
    
    indicePalavraAtual = 0;
    limparDestaquesAnteriores();
    
    const infoTimer = document.querySelector('.info-timer');
    if (infoTimer) infoTimer.remove();
    
    processarProximaPalavra();
}

// Função para iniciar o teleprompter
function iniciarTeleprompter() {
    const editor = document.getElementById('editor');
    const velocidadeInput = document.getElementById('velocidade-teleprompter');
    const iniciarBtn = document.getElementById('btn-iniciar-teleprompter');
    const pausarBtn = document.getElementById('btn-pausar-teleprompter');
    const reiniciarBtn = document.getElementById('btn-reiniciar-teleprompter');
    const indicador = document.getElementById('indicador-foco');
    const contagemInput = document.getElementById('contagem-regressiva-input');
    const destaqueToggle = document.getElementById('destaque-toggle');
    const transparenciaSlider = document.getElementById('transparencia-slider');
    
    if (!velocidadeInput || !editor || !iniciarBtn || !pausarBtn || !indicador || !contagemInput) {
        console.error('Elementos necessários não encontrados para iniciar o teleprompter');
        return;
    }
    
    const segundosContagem = parseInt(contagemInput.value) || 0;
    
    // Atualiza o estado do destaque quando o toggle é alterado
    if (destaqueToggle) {
        destaqueToggle.addEventListener('change', () => {
            destaqueAtivado = destaqueToggle.checked;
            
            if (teleprompterAtivo && !teleprompterPausado && palavraAtual) {
                if (destaqueAtivado) {
                    destacarPalavra(indicePalavraAtual - 1);
                } else {
                    limparDestaquesAnteriores();
                }
            }
        });
    }
    
    // Função para extrair todas as palavras do texto
    const extrairPalavras = () => {
        todasPalavras = [];
        const texto = editor.textContent;
        
        if (!texto.trim()) return todasPalavras;
        
        const palavrasDoTexto = texto.match(/[\wáàâãéèêíìóòôõúùûçÁÀÂÃÉÈÊÍÌÓÒÔÕÚÙÛÇ]+[.,;:!?]?|\n|[.,;:!?]/g) || [];
        
        let posicaoAtual = 0;
        palavrasDoTexto.forEach((palavra, index) => {
            if (palavra.trim()) {
                const posicao = texto.indexOf(palavra, posicaoAtual);
                if (posicao !== -1) {
                    posicaoAtual = posicao + palavra.length;
                    
                    todasPalavras.push({
                        texto: palavra,
                        posicao: posicao,
                        tempoBase: calcularTempoLeitura(palavra),
                        pausaAdicional: temPontuacaoPausa(palavra)
                    });
                }
            }
        });
        
        return todasPalavras;
    };
    
    // Função para encontrar o nó de texto que contém uma posição específica
    function encontrarNodoTexto(node, posicao, posicaoAtual = 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            const novoPos = posicaoAtual + node.textContent.length;
            if (posicaoAtual <= posicao && posicao < novoPos) {
                return {
                    node,
                    posicaoLocal: posicao - posicaoAtual
                };
            }
            return { posicaoAtual: novoPos };
        }
        
        if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
            let pos = posicaoAtual;
            for (const child of node.childNodes) {
                const resultado = encontrarNodoTexto(child, posicao, pos);
                if (resultado.node) {
                    return resultado;
                }
                pos = resultado.posicaoAtual;
            }
            return { posicaoAtual: pos };
        }
        
        return { posicaoAtual };
    }
    
    // Função para destacar uma palavra por sua posição no texto
    function destacarPalavraEmPosicao(posicao, palavra, tempoExibicao) {
        limparDestaquesAnteriores();
        
        const resultado = encontrarNodoTexto(editor, posicao);
        
        if (resultado.node) {
            const node = resultado.node;
            const pos = resultado.posicaoLocal;
            const texto = node.textContent;
            
            if (pos + palavra.length <= texto.length) {
                const antes = texto.substring(0, pos);
                const palavraExata = texto.substring(pos, pos + palavra.length);
                const depois = texto.substring(pos + palavra.length);
                
                const fragmento = document.createDocumentFragment();
                
                if (antes) {
                    fragmento.appendChild(document.createTextNode(antes));
                }
                
                const span = document.createElement('span');
                span.textContent = palavraExata;
                span.className = 'palavra-focada';
                span.style.setProperty('--duracao-palavra', `${tempoExibicao}ms`);
                fragmento.appendChild(span);
                
                if (depois) {
                    fragmento.appendChild(document.createTextNode(depois));
                }
                
                node.parentNode.replaceChild(fragmento, node);
                
                const spanPos = span.getBoundingClientRect();
                const editorPos = editor.getBoundingClientRect();
                
                const scrollPos = spanPos.top - editorPos.top + editor.scrollTop - (editorPos.height / 3);
                editor.scrollTo({
                    top: scrollPos,
                    behavior: 'smooth'
                });
                
                return span;
            }
        }
        
        return null;
    }
    
    // Função para destacar uma palavra específica
    const destacarPalavra = (indice) => {
        if (indice < 0 || indice >= todasPalavras.length) return;
        
        const palavraInfo = todasPalavras[indice];
        palavraAtual = palavraInfo;
        
        destacarPalavraEmPosicao(
            palavraInfo.posicao,
            palavraInfo.texto,
            Math.max(50, palavraInfo.tempoBase + (palavraInfo.pausaAdicional || 0))
        );
        
        const elementoFocado = document.querySelector('.palavra-focada');
        if (elementoFocado) {
            const retangulo = elementoFocado.getBoundingClientRect();
            const editorRect = editor.getBoundingClientRect();
            
            const marcador = document.getElementById('marcador-texto');
            const linhaAtual = document.querySelector('.linha-atual');
            
            if (marcador && linhaAtual) {
                marcador.style.top = `${retangulo.top - editorRect.top + editor.scrollTop}px`;
                linhaAtual.style.top = `${retangulo.top - editorRect.top + editor.scrollTop}px`;
            }
        }
    };
    
    const iniciarScroll = () => {
        if (teleprompterAtivo && !teleprompterPausado) return;
        
        if (teleprompterPausado) {
            teleprompterPausado = false;
            pausarBtn.innerHTML = '<i class="fas fa-pause"></i>';
            processarProximaPalavra();
            return;
        }
        
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        
        iniciarBtn.style.display = 'none';
        pausarBtn.style.display = 'inline-block';
        if (reiniciarBtn) reiniciarBtn.style.display = 'inline-block';
        indicador.style.display = 'block';
        
        if (!teleprompterAtivo || todasPalavras.length === 0) {
            todasPalavras = extrairPalavras();
            indicePalavraAtual = 0;
        }
        
        teleprompterAtivo = true;
        teleprompterPausado = false;
        
        // Inicia a contagem regressiva se configurada
        if (segundosContagem > 0) {
            mostrarContagemRegressiva(segundosContagem, () => {
                processarProximaPalavra();
            });
        } else {
            processarProximaPalavra();
        }
    };
    
    const pausarTeleprompter = () => {
        if (!teleprompterAtivo) return;
        
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        
        teleprompterPausado = true;
        pausarBtn.innerHTML = '<i class="fas fa-play"></i>';
    };
    
    const pararTeleprompter = () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
            scrollTimeout = null;
        }
        
        teleprompterAtivo = false;
        teleprompterPausado = false;
        iniciarBtn.style.display = 'inline-block';
        pausarBtn.style.display = 'none';
        if (reiniciarBtn) reiniciarBtn.style.display = 'none';
        indicador.style.display = 'none';
        limparDestaquesAnteriores();
        
        const infoTimer = document.querySelector('.info-timer');
        if (infoTimer) infoTimer.remove();
    };
    
    // Função para avançar para a próxima palavra
    const avancarPalavra = () => {
        if (indicePalavraAtual >= todasPalavras.length) {
            pararTeleprompter();
            return false;
        }
        
        const palavraInfo = todasPalavras[indicePalavraAtual];
        palavraAtual = palavraInfo;
        
        let tempoPalavra = palavraInfo.tempoBase;
        
        if (palavraInfo.pausaAdicional) {
            tempoPalavra += palavraInfo.pausaAdicional;
        }
        
        const velocidade = parseFloat(velocidadeInput.value) || 5;
        let multiplicador;
        
        if (velocidade < 1) {
            multiplicador = velocidade <= 0.25 ? 4.0 :
                            velocidade <= 0.5 ? 3.0 :
                            velocidade <= 0.75 ? 2.5 : 2.0;
        } else if (velocidade <= 5) {
            multiplicador = 2 - (velocidade * 0.2);
        } else {
            multiplicador = 1 - ((velocidade - 5) * 0.16);
        }
        
        const tempoAjustado = Math.max(50, Math.floor(tempoPalavra * multiplicador));
        
        if (destaqueAtivado) {
            destacarPalavra(indicePalavraAtual);
        } else {
            atualizarScrollSemDestaque(palavraInfo);
        }
        
        exibirInfoTempo(palavraInfo.texto, tempoAjustado, velocidade);
        
        indicePalavraAtual++;
        
        return tempoAjustado;
    };
    
    // Função para atualizar o scroll sem destacar a palavra
    const atualizarScrollSemDestaque = (palavraInfo) => {
        const resultado = encontrarNodoTexto(editor, palavraInfo.posicao);
        
        if (resultado.node) {
            let node = resultado.node;
            while (node && node !== editor) {
                if (node.offsetTop !== undefined) {
                    const editorAltura = editor.clientHeight;
                    const scrollPos = node.offsetTop - (editorAltura / 3);
                    
                    editor.scrollTo({
                        top: scrollPos,
                        behavior: 'smooth'
                    });
                    break;
                }
                node = node.parentNode;
            }
            
            const editorRect = editor.getBoundingClientRect();
            let offsetTop = 0;
            
            if (node && node.getBoundingClientRect) {
                const nodeRect = node.getBoundingClientRect();
                offsetTop = nodeRect.top - editorRect.top + editor.scrollTop;
            } else {
                const posicaoRelativa = palavraInfo.posicao / editor.textContent.length;
                offsetTop = posicaoRelativa * editor.scrollHeight;
            }
            
            const marcador = document.getElementById('marcador-texto');
            const linhaAtual = document.querySelector('.linha-atual');
            
            if (marcador && linhaAtual) {
                marcador.style.top = `${offsetTop}px`;
                linhaAtual.style.top = `${offsetTop}px`;
            }
        }
    };
    
    // Função para processar a próxima palavra
    const processarProximaPalavra = () => {
        if (!teleprompterAtivo || teleprompterPausado) return;
        
        const tempoPalavra = avancarPalavra();
        
        if (tempoPalavra !== false) {
            scrollTimeout = setTimeout(processarProximaPalavra, tempoPalavra);
        }
    };
    
    // Adiciona evento para pausar/continuar com o botão
    pausarBtn.addEventListener('click', () => {
        if (teleprompterPausado) {
            iniciarScroll();
        } else {
            pausarTeleprompter();
        }
    });
    
    // Adiciona eventos de teclado
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target === editor) return;
        
        switch(e.code) {
            case 'KeyP':
                if (teleprompterAtivo) {
                    if (teleprompterPausado) {
                        iniciarScroll();
                    } else {
                        pausarTeleprompter();
                    }
                    e.preventDefault();
                }
                break;
            case 'ArrowUp':
                ajustarVelocidade(1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                ajustarVelocidade(-1);
                e.preventDefault();
                break;
            case 'Home':
                if (teleprompterAtivo) {
                    reiniciarTeleprompter();
                    e.preventDefault();
                }
                break;
            case 'Escape':
                if (teleprompterAtivo) {
                    pararTeleprompter();
                    e.preventDefault();
                }
                break;
            case 'KeyT':
                if (e.altKey) {
                    e.preventDefault();
                    if (transparenciaSlider) {
                        const valorAtual = parseFloat(transparenciaSlider.value);
                        const novoValor = valorAtual === 1.0 ? 0.5 : 1.0;
                        transparenciaSlider.value = novoValor;
                        const container = document.querySelector('.container');
                        if (container) {
                            container.style.opacity = novoValor;
                            if (novoValor < 1) {
                                container.style.backgroundColor = 'transparent';
                                document.body.style.backgroundColor = 'transparent';
                            } else {
                                container.style.backgroundColor = '';
                                document.body.style.backgroundColor = '';
                            }
                        }
                    }
                }
                break;
            case 'BracketRight':
                if (e.altKey && transparenciaSlider) {
                    e.preventDefault();
                    const valorAtual = parseFloat(transparenciaSlider.value);
                    const novoValor = Math.min(1.0, valorAtual + 0.1);
                    transparenciaSlider.value = novoValor;
                    const container = document.querySelector('.container');
                    if (container) {
                        container.style.opacity = novoValor;
                        if (novoValor < 1) {
                            container.style.backgroundColor = 'transparent';
                            document.body.style.backgroundColor = 'transparent';
                        } else {
                            container.style.backgroundColor = '';
                            document.body.style.backgroundColor = '';
                        }
                    }
                }
                break;
            case 'BracketLeft':
                if (e.altKey && transparenciaSlider) {
                    e.preventDefault();
                    const valorAtual = parseFloat(transparenciaSlider.value);
                    const novoValor = Math.max(0.2, valorAtual - 0.1);
                    transparenciaSlider.value = novoValor;
                    const container = document.querySelector('.container');
                    if (container) {
                        container.style.opacity = novoValor;
                        if (novoValor < 1) {
                            container.style.backgroundColor = 'transparent';
                            document.body.style.backgroundColor = 'transparent';
                        } else {
                            container.style.backgroundColor = '';
                            document.body.style.backgroundColor = '';
                        }
                    }
                }
                break;
            case 'Space':
                if (e.altKey) {
                    e.preventDefault();
                    if (!teleprompterAtivo) {
                        iniciarScroll();
                    }
                }
                break;
        }
    });
    
    // Adiciona eventos para os botões de velocidade
    const diminuirVelocidadeBtn = document.getElementById('diminuir-velocidade');
    const aumentarVelocidadeBtn = document.getElementById('aumentar-velocidade');
    
    if (diminuirVelocidadeBtn) {
        diminuirVelocidadeBtn.addEventListener('click', () => {
            ajustarVelocidade(-1);
        });
    }
    
    if (aumentarVelocidadeBtn) {
        aumentarVelocidadeBtn.addEventListener('click', () => {
            ajustarVelocidade(1);
        });
    }
    
    // Adiciona evento para o botão de informações
    const infoBtn = document.getElementById('btn-info-teleprompter');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            mostrarInstrucoesUso();
        });
    }
    
    // Adiciona evento para o botão de reiniciar
    if (reiniciarBtn) {
        reiniciarBtn.addEventListener('click', reiniciarTeleprompter);
    }
    
    // Inicia com contagem regressiva se configurado
    if (segundosContagem > 0) {
        mostrarContagemRegressiva(segundosContagem, iniciarScroll);
    } else {
        iniciarScroll();
    }
}

// Função para salvar o conteúdo
function saveContent() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const content = editor.innerHTML;
    localStorage.setItem('editorContent', content);
}

// Função para carregar o conteúdo salvo
function loadContent() {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
        editor.innerHTML = savedContent;
    }
}

// Menu Hambúrguer para telas pequenas
function inicializarMenuHamburger() {
    const menuBurgerBtn = document.getElementById('menu-burger');
    const toolbar = document.querySelector('.toolbar');
    
    if (!menuBurgerBtn || !toolbar) return;
    
    // Função para verificar o tamanho da tela e decidir se mostra o menu burger
    function verificarTamanhoTela() {
        if (window.innerWidth <= 500) {
            menuBurgerBtn.style.display = 'flex';
            toolbar.classList.remove('open');
        } else {
            menuBurgerBtn.style.display = 'none';
            toolbar.classList.remove('open');
            toolbar.style.display = '';
        }
    }
    
    // Verificar ao carregar a página
    verificarTamanhoTela();
    
    // Verificar quando a janela é redimensionada
    window.addEventListener('resize', verificarTamanhoTela);
    
    // Alternar menu ao clicar no burger
    menuBurgerBtn.addEventListener('click', () => {
        toolbar.classList.toggle('open');
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!toolbar.contains(e.target) && e.target !== menuBurgerBtn) {
            toolbar.classList.remove('open');
        }
    });
}

// Inicialização dos eventos
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const iniciarTeleprompterBtn = document.getElementById('btn-iniciar-teleprompter');
    const pausarTeleprompterBtn = document.getElementById('btn-pausar-teleprompter');
    const reiniciarTeleprompterBtn = document.getElementById('btn-reiniciar-teleprompter');
    const transparenciaSlider = document.getElementById('transparencia-slider');
    const toolbarButtons = document.querySelectorAll('.toolbar-btn');
    const dropdownButtons = document.querySelectorAll('.toolbar-dropdown .dropdown-menu button');
    const destaqueToggle = document.getElementById('destaque-toggle');
    
    if (editor) {
        editor.addEventListener('input', saveContent);
        editor.focus();
        // Corrige o problema do cursor
        editor.addEventListener('click', (e) => {
            e.stopPropagation();
            editor.focus();
        });
        
        // Prevenindo o comportamento padrão da tecla espaço
        editor.addEventListener('keydown', (e) => {
            // Não fazemos nada especial com a tecla espaço
            // Ela deve funcionar normalmente para inserir espaços
        });
    }
    
    // Adicionar funcionalidade para botões da barra de ferramentas
    toolbarButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const command = button.getAttribute('data-command');
            const value = button.getAttribute('data-value');
            
            if (command) {
                document.execCommand(command, false, value);
                editor.focus();
            }
        });
    });
    
    // Gerenciar os dropdowns da barra de ferramentas
    const toolbarDropdowns = document.querySelectorAll('.toolbar-dropdown');
    toolbarDropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.toolbar-btn');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (btn && menu) {
            // Mostrar/ocultar dropdown ao clicar no botão
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const allMenus = document.querySelectorAll('.dropdown-menu');
                allMenus.forEach(m => {
                    if (m !== menu) m.classList.remove('active');
                });
                menu.classList.toggle('active');
            });
        }
        
        // Fechar o dropdown ao clicar fora dele
        document.addEventListener('click', () => {
            if (menu) menu.classList.remove('active');
        });
    });
    
    // Adicionar funcionalidade para os botões dentro dos dropdowns
    dropdownButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const command = button.getAttribute('data-command');
            const value = button.getAttribute('data-value');
            
            if (command) {
                document.execCommand(command, false, value);
                button.closest('.dropdown-menu').classList.remove('active');
                editor.focus();
            }
        });
    });
    
    // Adicionar eventos de clique para os botões do teleprompter
    if (iniciarTeleprompterBtn) {
        iniciarTeleprompterBtn.addEventListener('click', () => {
            iniciarTeleprompter();
        });
    }
    
    if (pausarTeleprompterBtn) {
        pausarTeleprompterBtn.addEventListener('click', () => {
            if (teleprompterAtivo) {
                if (teleprompterPausado) {
                    iniciarScroll(); // Retoma
                } else {
                    pausarTeleprompter(); // Pausa
                }
            }
        });
    }
    
    if (reiniciarTeleprompterBtn) {
        reiniciarTeleprompterBtn.addEventListener('click', () => {
            reiniciarTeleprompter();
        });
    }
    
    // Adicionar funcionalidade para o toggle de destaque
    if (destaqueToggle) {
        destaqueToggle.addEventListener('change', () => {
            destaqueAtivado = destaqueToggle.checked;
            
            // Se estiver no meio da leitura, atualiza o destaque atual
            if (teleprompterAtivo && !teleprompterPausado && palavraAtual) {
                if (destaqueAtivado) {
                    // Re-destaca a palavra atual
                    destacarPalavra(indicePalavraAtual - 1);
                } else {
                    // Remove todos os destaques
                    limparDestaquesAnteriores();
                }
            }
        });
    }
    
    // Adiciona evento para o botão de informações
    const infoBtn = document.getElementById('btn-info-teleprompter');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            mostrarInstrucoesUso();
        });
    }
    
    // Inicializa o menu hamburger
    inicializarMenuHamburger();
    
    // Carregar o conteúdo salvo
    loadContent();
});

// Controle de transparência
if (transparenciaSlider) {
    transparenciaSlider.addEventListener('input', (e) => {
        const valor = e.target.value;
        // Aplicamos a transparência ao container principal em vez de body
        const container = document.querySelector('.container');
        if (container) {
            container.style.opacity = valor;
            // Garantimos que o background fique transparente
            if (valor < 1) {
                container.style.backgroundColor = 'transparent';
                document.body.style.backgroundColor = 'transparent';
            } else {
                // Restaurar cores de background padrão
                container.style.backgroundColor = '';
                document.body.style.backgroundColor = '';
            }
        }
    });
}

// Controle de zoom
let nivelZoom = 1.0; // Nível inicial de zoom
const MIN_ZOOM = 0.5; // 50%
const MAX_ZOOM = 2.0; // 200%
const STEP_ZOOM = 0.1; // 10% por etapa

function aplicarZoom(novoZoom) {
    nivelZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, novoZoom));
    
    const conteudo = document.getElementById('conteudo-principal');
    if (conteudo) {
        conteudo.style.transform = `scale(${nivelZoom})`;
        conteudo.style.transformOrigin = 'center top';
        
        // Ajustar altura para compensar o zoom
        if (nivelZoom !== 1.0) {
            conteudo.style.height = `${100 / nivelZoom}%`;
        } else {
            conteudo.style.height = '';
        }
    }
    
    // Exibir nível de zoom
    exibirZoomInfo(nivelZoom);
}

function aumentarZoom() {
    aplicarZoom(nivelZoom + STEP_ZOOM);
}

function diminuirZoom() {
    aplicarZoom(nivelZoom - STEP_ZOOM);
}

function exibirZoomInfo(zoom) {
    // Remove qualquer info anterior
    const infoExistente = document.querySelector('.zoom-info');
    if (infoExistente) infoExistente.remove();
    
    // Cria o elemento de informação
    const infoZoom = document.createElement('div');
    infoZoom.className = 'zoom-info';
    infoZoom.textContent = `Zoom: ${Math.round(zoom * 100)}%`;
    
    // Adiciona ao documento
    document.body.appendChild(infoZoom);
    
    // Remove após 1.5 segundos
    setTimeout(() => {
        infoZoom.remove();
    }, 1500);
}

// Adicionar eventos para controle de zoom
document.addEventListener('wheel', (e) => {
    // Se Alt estiver pressionado, controla o zoom
    if (e.altKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
            aumentarZoom();
        } else {
            diminuirZoom();
        }
    }
}, { passive: false });

document.addEventListener('keydown', (e) => {
    // Alt+Plus para aumentar zoom
    if (e.altKey && e.key === '+') {
        e.preventDefault();
        aumentarZoom();
    }
    // Alt+Minus para diminuir zoom
    else if (e.altKey && e.key === '-') {
        e.preventDefault();
        diminuirZoom();
    }
    // Alt+0 para resetar zoom
    else if (e.altKey && e.key === '0') {
        e.preventDefault();
        aplicarZoom(1.0);
    }
}); 