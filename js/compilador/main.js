class main {
    static codigo;  // Armazena o código de entrada fornecido pelo usuário
    static tokens;  // Armazena os tokens obtidos após a análise léxica
    static semantic;  // Instância para análise semântica
    static parser;  // Instância do parser para análise sintática
    static finalString;  // Armazena a representação final do código em formato string JSON

    // Método getCodigo: Responsável por ler a entrada do usuário
    static getCodigo() {
        main.codigo = $(".textBox-input")[0].value;
        // Define os tokens utilizando o Lexer
        main.tokens = Lexer.getTokens()
        main.semantic = new Semantic()
        main.parser = new Parser(main.tokens)
        main.finalString = JSON.stringify(main.parser.parse(), null, 2)

        // Exibe a representação do parser na interface do usuário
        document.querySelector(".output-parser").value = this.finalString
        console.log(Intermediate.gerarCodIntermediario())

        // Traduz a representação do parser para código intermediário e exibe na interface
        document.querySelector(".output-intermediate").value = Intermediate.gerarCodIntermediario()
        
        Intermediate.gerarCodIntermediario()
    }
}