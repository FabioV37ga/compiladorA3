class Intermediate {
    static gerarCodIntermediario() {
        // Função interna: traduz a representação do parser para código intermediário
        function translateToIntermediateCode() {
            let pseudoCode = JSON.parse(main.finalString)

            let intermediateCode = [];

            // Função recursiva para percorrer a árvore de análise sintática e gerar código intermediário
            function traverse(node) {
                // console.log(node)
                if (!node) return;

                switch (node[0]) {
                    case 'programa':
                        intermediateCode.push("INICIO_PROGRAMA");
                        // Percorre todos os comandos no programa e os traduz
                        node[1].forEach(stmt => traverse(stmt));
                        break;

                    case 'declaracao':
                        
                        let varType = node[1];
                        // Para cada declaração de variável, gera a instrução de declaração no código intermediário
                        node[2].forEach(varDecl => {
                            let varName = varDecl[0];
                            intermediateCode.push(`DECLARE ${varName} ${varType}`);
                        });
                        break;

                    case 'escreva':
                        // Gera a instrução de escrita no código intermediário
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
                        // Gera a instrução de leitura no código intermediário
                        let varNameRead = node[1][0];
                        intermediateCode.push(`LEIA ${varNameRead}`);
                        break;

                    case 'if_else':
                        // Gera a estrutura condicional IF-ELSE no código intermediário
                        let condition = `${node[1][2][0]} ${node[1][1][0]} ${node[1][3][0]}`;
                        intermediateCode.push(`IF ${condition} THEN`);
                        // Traduz os comandos dentro do bloco THEN
                        node[2][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ELSE`);
                        // Traduz os comandos dentro do bloco ELSE
                        node[3][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ENDIF`);
                        break;

                    case 'loopPara':
                        // Gera a estrutura de loop PARA no código intermediário
                        let start = node[1][0][0];
                        let step = node[1][1][0];
                        let end = node[1][2][0];
                        intermediateCode.push(`FOR ${start} TO ${end} STEP ${step}`);
                        // Traduz os comandos dentro do corpo do loop PARA
                        node[2][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ENDLOOP`);
                        break;

                    case 'loopEnquanto':
                        // Gera a estrutura de loop ENQUANTO no código intermediário
                        let loopCondition = `${node[1][2][0]} ${node[1][1][0]} ${node[1][3][0]}`;
                        intermediateCode.push(`WHILE ${loopCondition}`);
                        // Traduz os comandos dentro do corpo do loop ENQUANTO
                        node[2][1].forEach(stmt => traverse(stmt));
                        intermediateCode.push(`ENDWHILE`);
                        break;

                    case 'atribuicao':
                        // Gera a instrução de atribuição no código intermediário
                        let varNameAssign = node[1][0];
                        console.log(node)
                        var expression;
                        if (node[0] && node[0] == 'binop'){
                            expression = `${node[2]} ${node[3][2][0]} ${node[3][1][0]} ${node[3][3][0]}`;
                            console.log("cuzinho")
                        }else if(node[2][0] == 'binop'){
                            expression = `:= ${node[2][2][0]} ${node[2][1][0]} ${node[2][3][0]}`;
                            console.log("outrumacaca")

                        }else if(node[0] == 'atribuicao'){
                            console.log("outrum2")
                            expression = `:= ${node[2][0]}`
                        }else{
                            expression = `${node[2]} ${node[3][0]}`;
                        }
                        intermediateCode.push(`${varNameAssign} ${expression}`);
                        break;

                    default:
                        throw new Error(`Tipo de nó desconhecido: ${node[0]}`);
                }
            }

            // Inicia a travessia pela raiz da árvore de análise sintática
            traverse(pseudoCode);

            // Adiciona marcação de fim de programa ao código intermediário
            intermediateCode.push("FIM_PROGRAMA");

            // Retorna o código intermediário como uma string
            return intermediateCode.join("\n");
        }
        return translateToIntermediateCode();
    }
}