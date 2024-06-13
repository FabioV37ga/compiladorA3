class main {
    static codigo;
    static tokens;
    static semantic;
    static parser;

    // Método getCodigo: Responsável por ler a entrada do usuário
    static getCodigo() {
        main.codigo = $(".textBox-input")[0].value;
        // define tokens
        main.tokens = Lexer.getTokens()
        main.semantic = new Semantic()
        main.parser = new Parser(main.tokens)

        document.querySelector(".textBox-output").value = JSON.stringify(main.parser.parse(), null, 2)
    }
}