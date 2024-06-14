class main {
    static codigo;
    static tokens;
    static semantic;
    static parser;
    static finalString;

    // Método getCodigo: Responsável por ler a entrada do usuário
    static getCodigo() {
        main.codigo = $(".textBox-input")[0].value;
        // define tokens
        main.tokens = Lexer.getTokens()
        main.semantic = new Semantic()
        main.parser = new Parser(main.tokens)
        main.finalString = JSON.stringify(main.parser.parse(), null, 2)

        document.querySelector(".output-parser").value = this.finalString
        console.log(translateToIntermediateCode())

        document.querySelector(".output-intermediate").value = translateToIntermediateCode()
        function translateToIntermediateCode() {
            let pseudoCode = JSON.parse(main.finalString)

            let intermediateCode = [];

            function traverse(node) {
                if (!node) return;

                switch (node[0]) {
                    case 'programa':
                        intermediateCode.push("INICIO_PROGRAMA");
                        node[1].forEach(stmt => traverse(stmt));
                        break;

                    case 'declaracao':
                        let varType = node[1];
                        node[2].forEach(varDecl => {
                            let varName = varDecl[0];
                            intermediateCode.push(`DECLARE ${varName} ${varType}`);
                        });
                        break;

                    case 'escreva':
                        let args = node[1].map(arg => {
                            if (arg[1] === 'TEXTO') {
                                return `"${arg[0]}"`;
                            } else {
                                return arg[0];
                            }
                        }).join(', ');
                        intermediateCode.push(`ESCREVA ${args}`);
                        break;

                    case 'leia':
                        let varNameRead = node[1][0];
                        intermediateCode.push(`LEIA ${varNameRead}`);
                        break;

                    case 'if_else':                       
                        let condition = `${node[1][2][0]} ${node[1][1][0]} ${node[1][3][0]}`;
                        intermediateCode.push(`IF ${condition} THEN`);
                        node[2][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ELSE`);
                        node[3][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ENDIF`);
                        break;

                    case 'loopPara':
                        
                        let start = node[1][0][0];
                        let step = node[1][1][0];
                        let end = node[1][2][0];
                        intermediateCode.push(`FOR ${start} TO ${end} STEP ${step}`);
                        node[2][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ENDLOOP`);
                        break;

                    case 'loopEnquanto':
                        console.log(node)
                        let loopCondition = `${node[1][2][0]} ${node[1][1][0]} ${node[1][3][0]}`;
                        intermediateCode.push(`WHILE ${loopCondition}`);
                        node[2][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ENDWHILE`);
                        break;

                    case 'atribuicao':
                        
                        let varNameAssign = node[1][0];
                        let expression = `${node[3][2][0]} ${node[3][1][0]} ${node[3][3][0]}`;
                        intermediateCode.push(`${varNameAssign} := ${expression}`);
                        break;

                    default:
                        throw new Error(`Tipo de nó desconhecido: ${node[0]}`);
                }
            }

            
            traverse(pseudoCode);

            intermediateCode.push("FIM_PROGRAMA");

            return intermediateCode.join("\n");
        }
        
    }
}