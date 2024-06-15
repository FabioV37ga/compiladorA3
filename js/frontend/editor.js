tabOverride.set($('#txt'));
$(".btn-compilar")[0].addEventListener("click", () => {
    main.getCodigo();
})

$(".btn-exec")[0].addEventListener("click", () => {
    var output;
    if (main.finalString)
        output = executeCodeAndCaptureOutput(main.finalString)
        // eval(`${main.finalString}`)
        // Função simulando a execução de código e capturando a saída
        function executeCodeAndCaptureOutput(code) {
            let output = "";
            let originalLog = alert;
            alert = function (message) {
                output += message + "\n";
            }

            // Execute seu código aqui
            eval(code);

            alert = originalLog; // Restaurando console.log para o original, se necessário

            return output; // Retorne a saída capturada
        }
        $('.output-console')[0].value = output
})


var tabs = document.querySelectorAll(".secao-direita .tab")
var outputTextArea = $(".secao-direita .textBox-output")

for (let i = 0; i <= tabs.length - 2; i++) {
    tabs[i].addEventListener("click", function (e) {
        for (let ind = 0; ind <= tabs.length - 2; ind++) {

            tabs[ind].classList.add("-off");
            e.target.classList.remove("-off");

            outputTextArea[ind].classList.add("hidden")

            if (e.target.id)
                outputTextArea[e.target.id].classList.remove("hidden")
            else
                outputTextArea[e.target.parentElement.id].classList.remove("hidden")
        }
    })
}

console.log(outputTextArea)