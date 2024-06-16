class Parser {
    static parsedString;  // Variável estática para armazenar a string parseada

    // Construtor da classe Parser, recebe tokens como entrada
    constructor(tokens) {
        this.tokens = tokens;  // Armazena os tokens recebidos
        this.pos = 0;  // Inicializa a posição atual na lista de tokens
        main.semantic = main.semantic;  // Atualiza a referência semântica principal
    }

    // Retorna o token atual ou null se estiver fora dos limites
    currentToken() {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
    }

    // Consome o token atual se coincidir com o tipo e valor esperados
    consume(expectedType = null, expectedValue = null) {
        const token = this.currentToken();
        if (token &&
            (expectedType === null || token[1] === expectedType) &&
            (expectedValue === null || token[0] === expectedValue)) {
            this.pos++;
            return token;
        } else {
            const expected = `${expectedType} ${expectedValue}`.trim();
            document.querySelector(".textBox-output").value = `Expected ${expected} but got ${token}`
            throw new SyntaxError(`Expected ${expected} but got ${token}`);
        }
    }

    // Método inicial da análise sintática, inicia com o programa principal
    parse() {
        return this.programa();
    }

    // Regra para o início de um programa
    programa() {
        this.consume('PALAVRA_CHAVE', 'programa');  // Consome a palavra-chave 'programa'
        const corpo = this.corpo();  // Obtém o corpo do programa
        this.consume('PALAVRA_CHAVE', 'fimprog');  // Consome a palavra-chave 'fimprog'
        // console.log(JSON.stringify(corpo))
        Parser.parsedString = JSON.stringify(corpo);  // Armazena o corpo parseado como string JSON
        return ['programa', corpo];  // Retorna a estrutura do programa
    }

    // Regra para o corpo do programa, composto por declarações e comandos
    corpo() {
        const statements = [];
        while (this.currentToken() && this.currentToken()[0] !== 'fimprog') {
            if (this.currentToken()[0] === 'inteiro' || this.currentToken()[0] === 'decimal' || this.currentToken()[0] === 'linha') {
                statements.push(this.declaracao());  // Se for uma declaração, adiciona à lista de declarações
            } else {
                statements.push(this.comando());  // Caso contrário, é um comando e adiciona à lista de comandos
            }
        }
        return statements;  // Retorna todos os comandos e declarações encontrados
    }

    // Regra para declaração de variáveis
    declaracao() {
        const tipo = this.tipo();  // Obtém o tipo da variável
        const varList = this.varList();  // Obtém a lista de variáveis
        this.consume('DELIMITADOR', ';');  // Consome o delimitador ';' no final da declaração
        for (const variable of varList) {
            main.semantic.declareVariable(variable[0], tipo);  // Registra a variável no contexto semântico
            // console.log(main.semantic.checkVariable(variable[0]))
        }
        return ['declaracao', tipo, varList];  // Retorna a estrutura da declaração
    }

    // Regra para o tipo de variável
    tipo() {
        const token = this.consume('PALAVRA_CHAVE');  // Consome uma palavra-chave que define o tipo
        if (!['inteiro', 'decimal', 'linha'].includes(token[0])) {  // Verifica se o tipo é válido
            document.querySelector(".textBox-output").value = `Tipo inválido: ${token[0]}`
            throw new SyntaxError(`Tipo inválido: ${token[0]}`);
        }
        return token[0];  // Retorna o tipo da variável
    }

    // Regra para lista de variáveis
    varList() {
        const variables = [this.consume('ID')];  // Obtém a primeira variável
        while (this.currentToken() && this.currentToken()[0] === ',') {
            this.consume('DELIMITADOR', ',');  // Consome o delimitador ','
            variables.push(this.consume('ID'));  // Adiciona a próxima variável à lista
        }
        return variables;  // Retorna a lista de variáveis
    }

    // Regra para comandos no programa
    comando() {
        if (this.currentToken()[0] === 'escreva') {
            return this.escreva();  // Se for um comando de escrita, processa
        } else if (this.currentToken()[0] === 'leia') {
            return this.leia();  // Se for um comando de leitura, processa
        } else if (this.currentToken()[0] === 'if') {
            return this.condicional();  // Se for uma estrutura condicional, processa
        } else if (this.currentToken()[0] === '{') {
            return this.bloco();  // Se for um bloco delimitado por chaves, processa
        } else if (this.currentToken()[1] === 'ID') {
            return this.atribuicao();  // Se for uma atribuição, processa
        } else if (this.currentToken()[0] === 'para') {
            return this.lacoPara();  // Se for um laço 'para', processa
        } else if (this.currentToken()[0] === 'enquanto') {
            return this.lacoEnquanto();  // Se for um laço 'enquanto', processa
        }
        else {
            document.querySelector(".textBox-output").value = `Comando inválido: ${this.currentToken()}`
            throw new SyntaxError(`Comando inválido: ${this.currentToken()}`);
        }
    }

    // Regra para o laço 'para'
    lacoPara() {
        this.consume('PALAVRA_CHAVE', 'para');  // Consome a palavra-chave 'para'
        this.consume('DELIMITADOR', '(');  // Consome o delimitador '('
        const argumentos = this.argumentoList(3);  // Obtém os argumentos do laço
        this.consume('DELIMITADOR', ')');  // Consome o delimitador ')'
        const bloco = this.bloco();  // Obtém o bloco de comandos do laço
        return ['loopPara', argumentos, bloco];  // Retorna a estrutura do laço 'para'
    }

    // Regra para o laço 'enquanto'
    lacoEnquanto() {
        this.consume('PALAVRA_CHAVE', 'enquanto');  // Consome a palavra-chave 'enquanto'
        const condicao = this.expr();  // Obtém a condição do laço
        const bloco = this.bloco();  // Obtém o bloco de comandos do laço
        return ['loopEnquanto', condicao, bloco];  // Retorna a estrutura do laço 'enquanto'
    }

    // Regra para o comando de escrita
    escreva() {
        this.consume('PALAVRA_CHAVE', 'escreva');  // Consome a palavra-chave 'escreva'
        this.consume('DELIMITADOR', '(');  // Consome o delimitador '('
        const argumentos = this.argumentoList();  // Obtém a lista de argumentos para escrita
        for (const arg of argumentos) {
            if (arg[1] === 'ID') {
                main.semantic.checkVariable(arg[0]);  // Verifica se variáveis estão declaradas
            }
        }
        this.consume('DELIMITADOR', ')');  // Consome o delimitador ')'
        this.consume('DELIMITADOR', ';');  // Consome o delimitador ';'
        return ['escreva', argumentos];  // Retorna a estrutura do comando de escrita
    }

    // Regra para o comando de leitura
    leia() {
        this.consume('PALAVRA_CHAVE', 'leia');  // Consome a palavra-chave 'leia'
        this.consume('DELIMITADOR', '(');  // Consome o delimitador '('
        const idToken = this.consume('ID');  // Obtém o token do identificador a ser lido
        main.semantic.checkVariable(idToken[0]);  // Verifica se a variável está declarada
        this.consume('DELIMITADOR', ')');  // Consome o delimitador ')'
        this.consume('DELIMITADOR', ';');  // Consome o delimitador ';'
        return ['leia', idToken];  // Retorna a estrutura do comando de leitura
    }

    // Regra para a estrutura condicional (IF-ELSE)
    condicional() {
        this.consume('PALAVRA_CHAVE', 'if');  // Consome a palavra-chave 'if'
        this.consume('DELIMITADOR', '(');  // Consome o delimitador '('
        const expr = this.expr();
        this.consume('DELIMITADOR', ')');  // Consome o delimitador ')'
        const bloco = this.bloco();  // Obtém o bloco de comandos do bloco if
        if (this.currentToken() && this.currentToken()[0] === 'else') {
            this.consume('PALAVRA_CHAVE', 'else');  // Consome a palavra-chave 'else' se existir
            const elseBloco = this.bloco();  // Obtém o bloco de comandos do bloco else
            return ['if_else', expr, bloco, elseBloco];  // Retorna a estrutura do IF-ELSE
        }
        return ['if', expr, bloco];  // Retorna a estrutura do IF
    }

    // Regra para um bloco delimitado por chaves '{}'
    bloco() {
        this.consume('DELIMITADOR', '{');  // Consome o delimitador '{'
        const comandos = [];
        while (this.currentToken() && this.currentToken()[0] !== '}') {
            comandos.push(this.comando());  // Processa todos os comandos dentro do bloco
        }
        this.consume('DELIMITADOR', '}');  // Consome o delimitador '}'
        return ['bloco', comandos];  // Retorna a estrutura do bloco de comandos
    }

    // Regra para expressão matemática ou lógica
    expr() {
        let left = this.termo();  // Obtém o termo inicial da expressão
        while (this.currentToken() && this.currentToken()[1] === 'OPERADOR' && ![':=', '='].includes(this.currentToken()[0])) {
            const operador = this.consume('OPERADOR');  // Consome um operador
            const right = this.termo();  // Obtém o próximo termo da expressão
            let leftType, rightType;
            if (left[1] === 'ID') {
                leftType = main.semantic.checkVariable(left[0]);  // Verifica o tipo da variável à esquerda
            } else if (left[1] === 'NUMERO') {
                leftType = 'inteiro';  // Se for número, define como tipo 'inteiro'
            } else if (left[1] == 'TEXTO') {
                leftType = 'linha'
            }
            if (right[1] === 'ID') {
                rightType = main.semantic.checkVariable(right[0]);  // Verifica o tipo da variável à direita
            } else if (right[1] === 'NUMERO') {
                rightType = 'inteiro';  // Se for número, define como tipo 'inteiro'
            } else if (right[1] === 'TEXTO') {
                rightType = 'linha'
            }
            if (leftType !== rightType) {
                document.querySelector(".textBox-output").value = `Operação inválida entre tipos '${leftType}' e '${rightType}'`
                throw new Error(`Operação inválida entre tipos '${leftType}' e '${rightType}'`);
            }
            left = ['binop', operador, left, right];  // Cria um nó para operação binária na árvore sintática
        }
        // console.log(left)
        return left;  // Retorna a expressão analisada
    }

    // Regra para um termo na expressão matemática ou lógica
    termo() {
        const token = this.currentToken();
        // console.log(token)
        if (token[1] === 'ID') {
            return this.consume('ID');  // Se for um identificador, consome e retorna
        } else if (token[1] === 'NUMERO') {
            return this.consume('NUMERO');  // Se for um número, consome e retorna
        } else if (token[1] === 'TEXTO') {
            return this.consume('TEXTO')
        } else if (token[0] === '(') {
            this.consume('DELIMITADOR', '(');  // Se for '(', consome
            const expr = this.expr();  // Obtém a expressão dentro dos parênteses
            this.consume('DELIMITADOR', ')');  // Consome o ')'
            return expr;  // Retorna a expressão dentro dos parênteses
        } else {
            document.querySelector(".textBox-output").value = `Termo inválido: ${token}`
            throw new SyntaxError(`Termo inválido: ${token}`);
        }
    }

    // Regra para lista de argumentos separados por vírgula
    argumentoList(length) {
        const argumentos = [this.argumento()];  // Inicializa a lista de argumentos com o primeiro
        var index = 1;
        while (this.currentToken() && this.currentToken()[0] === ',') {
            this.consume('DELIMITADOR', ',');  // Consome a vírgula
            if (!length) {
                argumentos.push(this.argumento());  // Adiciona o próximo argumento à lista
            } else {
                if (index < length) {
                    argumentos.push(this.argumento());  // Adiciona o próximo argumento à lista, limitado pelo comprimento
                    index++;
                } else {
                    break;  // Para quando atinge o comprimento máximo especificado
                }
            }
        }
        return argumentos;  // Retorna a lista de argumentos
    }

    // Regra para um argumento em uma lista de argumentos
    argumento() {
        const token = this.currentToken();
        if (['TEXTO', 'ID', 'NUMERO'].includes(token[1])) {
            return this.consume();  // Se for um tipo válido (texto, identificador, número), consome
        }
        else {
            document.querySelector(".textBox-output").value = `Argumento inválido: ${token}`
            throw new SyntaxError(`Argumento inválido: ${token}`);
        }
    }

    // Regra para atribuição de valor a uma variável
    atribuicao() {
        const idToken = this.consume('ID');  // Obtém o token do identificador
        main.semantic.checkVariable(idToken[0]);  // Verifica se a variável está declarada
        this.consume('OPERADOR', ':=');  // Consome o operador de atribuição ':='

        const expr = this.expr();  // Obtém a expressão atribuída

        // Verifica se o tipo da expressão atribuída é compatível com o tipo da variável
        const varType = main.semantic.checkVariable(idToken[0]);
        // console.log(expr)
        if ((varType === 'inteiro' || varType === 'decimal')) {
            if (expr[0] == 'binop') {
                // console.log("aqui")

                if (expr[3][1] !== 'NUMERO') {
                    // console.log("teste")
                    document.querySelector(".textBox-output").value = `Valor inválido para tipo ${varType}: ${expr[2][1]}`;
                    throw new SyntaxError(`Valor inválido para tipo ${varType}: ${expr[2][1]}`);
                }
            } else {
                if (expr[1] !== 'NUMERO') {
                    // console.log("caiu aqui")
                    document.querySelector(".textBox-output").value = `Valor inválido para tipo ${varType}: "${expr[0]}"`;
                    throw new SyntaxError(`Valor inválido para tipo ${varType}: ${expr[2][1]}`);
                }
            }
        } else if (varType === 'linha' && expr[1] !== 'TEXTO') {
            document.querySelector(".textBox-output").value = `Valor inválido para tipo ${varType}: ${expr[0]}`;
            throw new SyntaxError(`Valor inválido para tipo ${varType}: ${expr[2][1]}`);
        }

        this.consume('DELIMITADOR', ';');  // Consome o delimitador ';'
        return ['atribuicao', idToken, expr];  // Retorna a estrutura da atribuição
    }
}