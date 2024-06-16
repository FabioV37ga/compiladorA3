class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
        main.semantic = main.semantic;
    }

    currentToken() {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
    }

    consume(expectedType = null, expectedValue = null) {
        const token = this.currentToken();
        if (token &&
            (expectedType === null || token[1] === expectedType) &&
            (expectedValue === null || token[0] === expectedValue)) {
            this.pos++;
            return token;
        } else {
            const expected = `${expectedType} ${expectedValue}`.trim();
            document.querySelector(".textBox-output").value = `Expected ${expected} but got ${token}`;
            throw new SyntaxError(`Expected ${expected} but got ${token}`);
        }
    }

    parse() {
        return this.programa();
    }

    programa() {
        this.consume('PALAVRA_CHAVE', 'programa');
        const corpo = this.corpo();
        this.consume('PALAVRA_CHAVE', 'fimprog');
        Parser.parsedString = JSON.stringify(corpo);
        return ['programa', corpo];
    }

    corpo() {
        const statements = [];
        while (this.currentToken() && this.currentToken()[0] !== 'fimprog') {
            if (this.currentToken()[0] === 'inteiro' || this.currentToken()[0] === 'decimal' || this.currentToken()[0] === 'linha') {
                statements.push(this.declaracao());
            } else {
                statements.push(this.comando());
            }
        }
        return statements;
    }

    declaracao() {
        const tipo = this.tipo();
        const varList = this.varList();
        this.consume('DELIMITADOR', ';');
        for (const variable of varList) {
            main.semantic.declareVariable(variable[0], tipo);
        }
        return ['declaracao', tipo, varList];
    }

    tipo() {
        const token = this.consume('PALAVRA_CHAVE');
        if (!['inteiro', 'decimal', 'linha'].includes(token[0])) {
            document.querySelector(".textBox-output").value = `Tipo inválido: ${token[0]}`;
            throw new SyntaxError(`Tipo inválido: ${token[0]}`);
        }
        return token[0];
    }

    varList() {
        const variables = [this.consume('ID')];
        while (this.currentToken() && this.currentToken()[0] === ',') {
            this.consume('DELIMITADOR', ',');
            variables.push(this.consume('ID'));
        }
        return variables;
    }

    comando() {
        if (this.currentToken()[0] === 'escreva') {
            return this.escreva();
        } else if (this.currentToken()[0] === 'leia') {
            return this.leia();
        } else if (this.currentToken()[0] === 'if') {
            return this.condicional();
        } else if (this.currentToken()[0] === '{') {
            return this.bloco();
        } else if (this.currentToken()[1] === 'ID') {
            return this.atribuicao();
        } else if (this.currentToken()[0] === 'para') {
            return this.lacoPara();
        } else if (this.currentToken()[0] === 'enquanto') {
            return this.lacoEnquanto();
        } else {
            document.querySelector(".textBox-output").value = `Comando inválido: ${this.currentToken()}`;
            throw new SyntaxError(`Comando inválido: ${this.currentToken()}`);
        }
    }

    lacoPara() {
        this.consume('PALAVRA_CHAVE', 'para');
        this.consume('DELIMITADOR', '(');
        const argumentos = this.argumentoList(3);
        if (argumentos.length !== 3) {
            document.querySelector(".textBox-output").value = `O laço 'para' requer exatamente 3 argumentos, mas obteve ${argumentos.length}`;
            throw new SyntaxError(`O laço 'para' requer exatamente 3 argumentos, mas obteve ${argumentos.length}`);
        }
        for (const arg of argumentos) {
            if (arg[1] !== 'NUMERO') {
                // main.semantic.checkVariable(arg[0]);
                document.querySelector(".textBox-output").value = `O laço 'para' só aceita argumentos do tipo inteiro`;
                throw new SyntaxError(`O laço 'para' só aceita argumentos do tipo inteiro`);
            }
        }
        console.log(argumentos)
        this.consume('DELIMITADOR', ')');
        const bloco = this.bloco();
        return ['loopPara', argumentos, bloco];
    }

    lacoEnquanto() {
        this.consume('PALAVRA_CHAVE', 'enquanto');
        const condicao = this.expr();
        const bloco = this.bloco();
        return ['loopEnquanto', condicao, bloco];
    }

    escreva() {
        this.consume('PALAVRA_CHAVE', 'escreva');
        this.consume('DELIMITADOR', '(');
        const argumentos = this.argumentoList();
        for (const arg of argumentos) {
            if (arg[1] === 'ID') {
                main.semantic.checkVariable(arg[0]);
            }
        }
        this.consume('DELIMITADOR', ')');
        this.consume('DELIMITADOR', ';');
        return ['escreva', argumentos];
    }

    leia() {
        this.consume('PALAVRA_CHAVE', 'leia');
        this.consume('DELIMITADOR', '(');
        const idToken = this.consume('ID');
        main.semantic.checkVariable(idToken[0]);
        this.consume('DELIMITADOR', ')');
        this.consume('DELIMITADOR', ';');
        return ['leia', idToken];
    }

    condicional() {
        this.consume('PALAVRA_CHAVE', 'if');
        this.consume('DELIMITADOR', '(');
        const expr = this.expr();
        this.consume('DELIMITADOR', ')');
        const bloco = this.bloco();
        if (this.currentToken() && this.currentToken()[0] === 'else') {
            this.consume('PALAVRA_CHAVE', 'else');
            const elseBloco = this.bloco();
            return ['if_else', expr, bloco, elseBloco];
        }
        return ['if', expr, bloco];
    }

    bloco() {
        this.consume('DELIMITADOR', '{');
        const comandos = [];
        while (this.currentToken() && this.currentToken()[0] !== '}') {
            comandos.push(this.comando());
        }
        this.consume('DELIMITADOR', '}');
        return ['bloco', comandos];
    }

    expr() {
        let left = this.termo();
        while (this.currentToken() && this.currentToken()[1] === 'OPERADOR' && ![':=', '='].includes(this.currentToken()[0])) {
            const operador = this.consume('OPERADOR');
            const right = this.termo();
            let leftType, rightType;
            if (left[1] === 'ID') {
                leftType = main.semantic.checkVariable(left[0]);
            } else if (left[1] === 'NUMERO') {
                leftType = 'inteiro';
            } else if (left[1] == 'TEXTO') {
                leftType = 'linha';
            }
            if (right[1] === 'ID') {
                rightType = main.semantic.checkVariable(right[0]);
            } else if (right[1] === 'NUMERO') {
                rightType = 'inteiro';
            } else if (right[1] === 'TEXTO') {
                rightType = 'linha';
            }
            if (leftType !== rightType) {
                document.querySelector(".textBox-output").value = `Operação inválida entre tipos '${leftType}' e '${rightType}'`;
                throw new Error(`Operação inválida entre tipos '${leftType}' e '${rightType}'`);
            }
            left = ['binop', operador, left, right];
        }
        return left;
    }

    termo() {
        const token = this.currentToken();
        if (token[1] === 'ID') {
            return this.consume('ID');
        } else if (token[1] === 'NUMERO') {
            return this.consume('NUMERO');
        } else if (token[1] === 'TEXTO') {
            return this.consume('TEXTO');
        } else if (token[0] === '(') {
            this.consume('DELIMITADOR', '(');
            const expr = this.expr();
            this.consume('DELIMITADOR', ')');
            return expr;
        } else {
            document.querySelector(".textBox-output").value = `Termo inválido: ${token}`;
            throw new SyntaxError(`Termo inválido: ${token}`);
        }
    }

    argumentoList(length) {
        const argumentos = [this.argumento()];
        var index = 1;
        while (this.currentToken() && this.currentToken()[0] === ',') {
            this.consume('DELIMITADOR', ',');
            if (!length || index < length) {
                var argumento = this.argumento();
                argumentos.push(argumento);
                index++;
            } else {
                break;
            }
        }
        return argumentos;
    }

    argumento() {
        const token = this.currentToken();
        if (['TEXTO', 'ID', 'NUMERO'].includes(token[1])) {
            return this.consume();
        } else {
            document.querySelector(".textBox-output").value = `Argumento inválido: ${token}`;
            throw new SyntaxError(`Argumento inválido: ${token}`);
        }
    }

    atribuicao() {
        const idToken = this.consume('ID');
        main.semantic.checkVariable(idToken[0]);
        this.consume('OPERADOR', ':=');
        const expr = this.expr();
        this.consume('DELIMITADOR', ';');
        return ['atribuicao', idToken, expr];
    }
}