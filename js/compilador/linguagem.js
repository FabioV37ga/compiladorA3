class Linguagem {
    // Tipos de token aceitos
    static TIPOS_TOKEN = {
        PALAVRA_CHAVE: 'PALAVRA_CHAVE',
        ID: 'ID',
        NUMERO: 'NUMERO',
        OPERADOR: 'OPERADOR',
        DELIMITADOR: 'DELIMITADOR',
        TEXTO: 'TEXTO'
    };
    static PALAVRAS_CHAVE = ['programa', 'fimprog', 'inteiro', 'decimal', 'linha', 'leia', 'escreva', 'if', 'else', 'para', 'enquanto'];
    static OPERADORES = ['+', '-', '*', '/', '<', '>', '<=', '>=', '!=', '==', ':=', '='];
    static DELIMITADORES = ['(', ')', '{', '}', ',', ';'];
}