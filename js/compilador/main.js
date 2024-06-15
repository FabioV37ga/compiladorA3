class main {
    static codigo;  // Armazena o código de entrada fornecido pelo usuário
    static tokens;  // Armazena os tokens obtidos após a análise léxica
    static semantic;  // Instância para análise semântica
    static parser;  // Instância do parser para análise sintática
    static parsedString;  // Armazena a representação final do código em formato string JSON
    static intermediateString;
    static finalString;

    // Método getCodigo: Responsável por ler a entrada do usuário
    static getCodigo() {
        main.codigo = $(".textBox-input")[0].value;
        // Define os tokens utilizando o Lexer
        main.tokens = Lexer.getTokens()
        main.semantic = new Semantic()
        main.parser = new Parser(main.tokens)
        main.parsedString = JSON.stringify(main.parser.parse(), null, 2)

        // Exibe a representação do parser na interface do usuário
        document.querySelector(".output-parser").value = this.parsedString

        // Traduz a representação do parser para código intermediário e exibe na interface
        main.intermediateString = Intermediate.gerarCodIntermediario()
        document.querySelector(".output-intermediate").value = main.intermediateString

        main.finalString = Tradutor.traduzirFinal(main.intermediateString.toString())
        document.querySelector(".output-final").value = this.finalString;


    }
}