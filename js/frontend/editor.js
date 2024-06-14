tabOverride.set($('#txt'));
$(".btn-compilar")[0].addEventListener("click", () => {
    main.getCodigo();
})

$(".btn-exec")[0].addEventListener("click", () => {
    eval(`${Tradutor.traduzirFinal(main.intermediateString.toString())}`)
})