// INICIO_PROGRAMA
// DECLARE z linha
// z := "Exemplo de declaração de linha"
// DECLARE x inteiro
// DECLARE y inteiro
// DECLARE b inteiro
// ESCREVA "Hello world"
// LEIA x
// IF x > 0 THEN
// y := x * 2
// ESCREVA "O dobro de ", x, " é ", y
// ELSE
// ESCREVA "O valor de x é negativo"
// ENDIF
// FOR 1 TO 10 STEP 1
// ESCREVA "bonk!"
// ENDLOOP
// WHILE x < 10
// ESCREVA "bouf!"
// b := 3
// ENDWHILE
// FIM_PROGRAMA

class Tradutor {
    static traduzirFinal(optimizedCode) {
        let finalCode = [];
        let lines = optimizedCode.split('\n');

        for (let line of lines) {
            if (line.startsWith("DECLARE")) {
                let varType = line.includes("inteiro") ? "let" : "var";
                let varName = line.split(' ')[1];
                finalCode.push(`${varType} ${varName};`);
            } else if (line.includes(":=")) {
                let [varName, expr] = line.split(":=");
                varName = varName.trim();
                expr = expr.trim();
                finalCode.push(`${varName} = ${expr};`);
            } else if (line.startsWith("ESCREVA")) {
                let args = line.substring("ESCREVA ".length).replaceAll('",', '"+').replaceAll(', "', '+ "').replaceAll(',"', '+ "');
                console.log(args)
                finalCode.push(`alert(${args});`);
            } else if (line.startsWith("LEIA")) {
                let varName = line.split(' ')[1];
                finalCode.push(`${varName} = prompt();`);
            } else if (line === "INICIO_PROGRAMA") {
            } else if (line === "FIM_PROGRAMA") {
            } else if (line.startsWith("IF")) {
                let condition = line.substring(3).replace(/\bTHEN\b/, "").trim();
                finalCode.push(`if (${condition}) {`);
            } else if (line === "ELSE") {
                finalCode.push("} else {");
            } else if (line === "ENDIF") {
                finalCode.push("}");
            } else if (line.startsWith("FOR")) {
                let expressao = line.substring(4).replace("TO", "/").replace("STEP", "/").replaceAll(" ", "").split("/");
                finalCode.push(`for (let i = ${expressao[0]}; i <= ${expressao[1]}; i+=${expressao[2]}){`);
            } else if (line === "ENDLOOP") {
                finalCode.push("}");
            } else if (line.startsWith("WHILE")) {
                finalCode.push(`while (${line.substring(6)}) {`);
            } else if (line === "ENDWHILE") {
                finalCode.push("}");
            } else {
                finalCode.push(line);
            }
        }

        return finalCode.join("\n");
    }
}
