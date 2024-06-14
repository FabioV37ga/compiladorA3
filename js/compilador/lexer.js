class Lexer {

    static expressao = (/\s*(\b(?:programa|fimprog|inteiro|decimal|leia|escreva|if|else|para|enquanto)\b|[a-zA-Z_á-úÁ-Ú][a-zA-Z0-9_á-úÁ-Ú]*|\d+|\+|\-|\*|\/|<|>|<=|>=|!=|==|:=|=|\(|\)|\{|\}|,|;|"([^"\\]*(?:\\.[^"\\]*)*)")\s*/);

    static getTokens() {
        const tokens = [];
        var codigo = main.codigo.replace(/\n/g, ' ');
        while (codigo) {
            const match = codigo.match(this.expressao)
            if (match) {
                let valor = match[1];
                codigo = codigo.slice(match[0].length);
                let tipo_token;

                if (Linguagem.PALAVRAS_CHAVE.includes(valor)) {
                    tipo_token = Linguagem.TIPOS_TOKEN.PALAVRA_CHAVE;

                } else if (Linguagem.OPERADORES.includes(valor)) {
                    tipo_token = Linguagem.TIPOS_TOKEN.OPERADOR;

                } else if (Linguagem.DELIMITADORES.includes(valor)) {
                    tipo_token = Linguagem.TIPOS_TOKEN.DELIMITADOR;

                } else if (!isNaN(valor)) {
                    tipo_token = Linguagem.TIPOS_TOKEN.NUMERO;

                } else if (valor[0].match(/[a-zA-Z]/)) {
                    tipo_token = Linguagem.TIPOS_TOKEN.ID;

                } else {
                    tipo_token = Linguagem.TIPOS_TOKEN.TEXTO;
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
}