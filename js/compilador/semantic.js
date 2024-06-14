class Semantic {
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
