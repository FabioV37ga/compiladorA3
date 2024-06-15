tabOverride.set($('#txt'));
$(".btn-compilar")[0].addEventListener("click", () => {
    main.getCodigo();
})

$(".btn-exec")[0].addEventListener("click", () => {
    if (main.finalString)
        eval(`${main.finalString}`)
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