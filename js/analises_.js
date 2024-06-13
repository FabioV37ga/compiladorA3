const TIPOS_TOKEN = {
    PALAVRA_CHAVE: 'PALAVRA_CHAVE',
    ID: 'ID',
    NUMERO: 'NUMERO',
    OPERADOR: 'OPERADOR',
    DELIMITADOR: 'DELIMITADOR',
    TEXTO: 'TEXTO'
};

const PALAVRAS_CHAVE = ['programa', 'fimprog', 'inteiro', 'decimal', 'leia', 'escreva', 'if', 'else'];
const OPERADORES = ['+', '-', '*', '/', '<', '>', '<=', '>=', '!=', '==', ':=', '='];
const DELIMITADORES = ['(', ')', '{', '}', ',', ';'];

// Análise léxica
function lexer(codigo) {
    const tokens = [];
    codigo = codigo.replace(/\n/g, ' ');
    while (codigo) {
        const match = codigo.match(/\s*(\b(?:programa|fimprog|inteiro|decimal|leia|escreva|if|else)\b|[a-zA-Z_á-úÁ-Ú][a-zA-Z0-9_á-úÁ-Ú]*|\d+|\+|\-|\*|\/|<|>|<=|>=|!=|==|:=|=|\(|\)|\{|\}|,|;|"([^"\\]*(?:\\.[^"\\]*)*)")\s*/);
        if (match) {
            let valor = match[1];
            codigo = codigo.slice(match[0].length);
            let tipo_token;
            if (PALAVRAS_CHAVE.includes(valor)) {
                tipo_token = TIPOS_TOKEN.PALAVRA_CHAVE;
            } else if (OPERADORES.includes(valor)) {
                tipo_token = TIPOS_TOKEN.OPERADOR;
            } else if (DELIMITADORES.includes(valor)) {
                tipo_token = TIPOS_TOKEN.DELIMITADOR;
            } else if (!isNaN(valor)) {
                tipo_token = TIPOS_TOKEN.NUMERO;
            } else if (valor[0].match(/[a-zA-Z]/)) {
                tipo_token = TIPOS_TOKEN.ID;
            } else {
                tipo_token = TIPOS_TOKEN.TEXTO;
                valor = valor.slice(1, -1);
            }
            tokens.push([valor, tipo_token]);
        } else if (codigo[0] === ' ') {
            codigo = codigo.slice(1);
        } else {
            document.querySelector(".textBox-output").value = 'Token inválido: ' + codigo
            throw new Error('Token inválido: ' + codigo);
        }
    }
    return tokens;
}

// Análise semântica
class SemanticAnalyzer {
    constructor() {
        this.symbolTable = {};
    }

    declareVariable(varName, varType) {
        if (this.symbolTable[varName]) {
            document.querySelector(".textBox-output").value = `Variável '${varName}' já declarada.`
            throw new Error(`Variável '${varName}' já declarada.`);
        }
        this.symbolTable[varName] = varType;
    }

    checkVariable(varName) {
        if (!this.symbolTable[varName]) {
            document.querySelector(".textBox-output").value = `Variável '${varName}' não declarada.`
            throw new Error(`Variável '${varName}' não declarada.`);
        }
        return this.symbolTable[varName];
    }

    checkType(varName, expectedType) {
        const varType = this.checkVariable(varName);
        if (varType !== expectedType) {
            document.querySelector(".textBox-output").value = `Tipo incompatível: variável '${varName}' é do tipo '${varType}', esperado '${expectedType}'.`
            throw new Error(`Tipo incompatível: variável '${varName}' é do tipo '${varType}', esperado '${expectedType}'.`);
        }
    }
}

// Análise sintática
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
        this.semanticAnalyzer = new SemanticAnalyzer();
    }

    currentToken() {
        return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
    }

    consume(expectedType = null, expectedValue = null) {
        const token = this.currentToken();
        if (token && (expectedType === null || token[1] === expectedType) && (expectedValue === null || token[0] === expectedValue)) {
            this.pos++;
            return token;
        } else {
            const expected = `${expectedType} ${expectedValue}`.trim();
            document.querySelector(".textBox-output").value = `Expected ${expected} but got ${token}`
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
        return ['programa', corpo];
    }

    corpo() {
        const statements = [];
        while (this.currentToken() && this.currentToken()[0] !== 'fimprog') {
            if (this.currentToken()[0] === 'inteiro' || this.currentToken()[0] === 'decimal') {
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
            this.semanticAnalyzer.declareVariable(variable[0], tipo);
        }
        return ['declaracao', tipo, varList];
    }

    tipo() {
        const token = this.consume('PALAVRA_CHAVE');
        if (!['inteiro', 'decimal'].includes(token[0])) {
            document.querySelector(".textBox-output").value = `Tipo inválido: ${token[0]}`
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
        } else {
            document.querySelector(".textBox-output").value = `Comando inválido: ${this.currentToken()}`
            throw new SyntaxError(`Comando inválido: ${this.currentToken()}`);
        }
    }

    escreva() {
        this.consume('PALAVRA_CHAVE', 'escreva');
        this.consume('DELIMITADOR', '(');
        const argumentos = this.argumentoList();
        for (const arg of argumentos) {
            if (arg[1] === 'ID') {
                this.semanticAnalyzer.checkVariable(arg[0]);
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
        this.semanticAnalyzer.checkVariable(idToken[0]);
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
                leftType = this.semanticAnalyzer.checkVariable(left[0]);
            } else if (left[1] === 'NUMERO') {
                leftType = 'inteiro';
            }
            if (right[1] === 'ID') {
                rightType = this.semanticAnalyzer.checkVariable(right[0]);
            } else if (right[1] === 'NUMERO') {
                rightType = 'inteiro';
            }
            if (leftType !== rightType) {
                document.querySelector(".textBox-output").value = `Operação inválida entre tipos '${leftType}' e '${rightType}'`
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
        } else if (token[0] === '(') {
            this.consume('DELIMITADOR', '(');
            const expr = this.expr();
            this.consume('DELIMITADOR', ')');
            return expr;
        } else {
            document.querySelector(".textBox-output").value = `Termo inválido: ${token}`
            throw new SyntaxError(`Termo inválido: ${token}`);
        }
    }

    argumentoList() {
        const argumentos = [this.argumento()];
        while (this.currentToken() && this.currentToken()[0] === ',') {
            this.consume('DELIMITADOR', ',');
            argumentos.push(this.argumento());
        }
        return argumentos;
    }

    argumento() {
        const token = this.currentToken();
        if (['TEXTO', 'ID', 'NUMERO'].includes(token[1])) {
            return this.consume();
        } else {
            document.querySelector(".textBox-output").value = `Argumento inválido: ${token}`
            throw new SyntaxError(`Argumento inválido: ${token}`);
        }
    }

    atribuicao() {
        const idToken = this.consume('ID');
        this.semanticAnalyzer.checkVariable(idToken[0]);
        this.consume('OPERADOR', ':=');
        const expr = this.expr();
        this.consume('DELIMITADOR', ';');
        return ['atribuicao', idToken, ':=', expr];
    }
}

var tokens;
var parser;
var ast;

function getCodigo() {
    document.querySelector(".textBox-output").value = ''
    codigoTeste = document.querySelector(".textBox-input").value
    tokens = lexer(codigoTeste);
    parser = new Parser(tokens);
    ast = parser.parse();
    console.log(JSON.stringify(ast, null, 2));
    document.querySelector(".textBox-output").value = JSON.stringify(ast, null, 2)
}

