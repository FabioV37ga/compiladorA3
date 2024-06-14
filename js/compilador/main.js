class main {
    static codigo;  // Armazena o código de entrada fornecido pelo usuário
    static tokens;  // Armazena os tokens obtidos após a análise léxica
    static semantic;  // Instância para análise semântica
    static parser;  // Instância do parser para análise sintática
    static parsedString;  // Armazena a representação final do código em formato string JSON
    static intermediateString;

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
        // console.log(Intermediate.gerarCodIntermediario())

        // Traduz a representação do parser para código intermediário e exibe na interface

        main.intermediateString = Intermediate.gerarCodIntermediario()
        document.querySelector(".output-intermediate").value = main.intermediateString
        
        // Intermediate.gerarCodIntermediario()


        function downloadTxtFile() {
            // Conteúdo do arquivo
            const texto = "Este é o conteúdo do arquivo que será baixado.";
        
            // Cria um Blob com o texto
            const blob = new Blob([texto], { type: 'text/plain' });
        
            // Cria um URL temporário
            const url = URL.createObjectURL(blob);
        
            // Cria um elemento de link <a>
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meuarquivo.txt'; // Nome do arquivo a ser baixado
        
            // Adiciona o elemento de link ao documento
            document.body.appendChild(a);
        
            // Simula um clique no elemento para iniciar o download
            a.click();
        
            // Limpa o objeto URL criado
            URL.revokeObjectURL(url);
        
            // Remove o elemento <a> do documento
            document.body.removeChild(a);
        }
    }
}