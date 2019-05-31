let Dk_atendimentos = function () {

    let that = this, form, grid, cellform, cellgrid, historico = new Historico();

    this.MontaLayout = function (container) {

        let layout = container.attachLayout({
            pattern: '2E',
            offsets: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            cells: [
                {
                    id: 'a',
                    header: false,
                    fix_size: [true, null]
                },
                {
                    id: 'b',
                    header: false,
                }
            ]
        });

        cellform = layout.cells('a');
        cellgrid = layout.cells('b');

        MontaBarraComandos(cellform);
        MontaFormulario(cellform);
        MontaGrid(cellgrid);

    };

    function MontaBarraComandos(cell) {

        cell.detachToolbar();

        cell.attachToolbar({
            icon_path: "./img/toolbar/",
            items:[
                {id: "novo", text:"Novo", type: "button", img: "novo.png"},
                {id: "salvar", text:"Salvar", type: "button", img: "salvar.png"},
                {id: "remover", text:"Remover", type: "button", img: "remover.png"},
            ],
            onClick: function (id) {
                switch (id) {
                    case 'novo':
                        that.LimparFormulario();
                        break;
                    case 'salvar':
                        form.validate();
                        break;
                    case 'remover':
                        historico.RemoverItem(form.getItemValue('id'), AoExecutarOperacao);
                        break;
                }
            }
        });

    }

    this.LimparFormulario = function() {

        form.clear();
        form.setFormData({});
        form.setItemValue('id', null);
        form.setItemValue('filedate', null);
        form.getCombo('categoria').unSelectOption();
        form.getCombo('tipo').unSelectOption();


    };

    function MontaFormulario(cell, info) {

        cell.progressOn();
        cell.detachObject(true);
        form = cell.attachForm();
        form.loadStruct(formatendimetos, function () {

            let combotipos = form.getCombo('tipo');
            let categorias = form.getCombo('categoria');
            let cliente = form.getCombo('cliente');

            new Tipos().Listar(function (tipos) {


                if (tipos === null) {
                    cell.progressOff();
                    return;
                }

                tipos.filter(function (item) {
                    combotipos.addOption(item.id, item.nome);
                });

                new Categorias().Listar(function (listacategorias) {

                    if (tipos === null) {
                        cell.progressOff();
                        return;
                    }

                    listacategorias.filter(function (item) {
                        categorias.addOption(item.id, item.nome);
                    });

                    new Cliente().Listar(function (clientes) {

                        if (clientes === null) {
                            cell.progressOff();
                            return;
                        }

                        clientes.filter(function (item) {
                            cliente.addOption(item.id, item.nome);
                        });
                        cell.progressOff();
                    });



                });

            });
        });

        if (info !== undefined) {
            form.setFormData(info);
        }

        form.attachEvent("onAfterValidate", function (status){

            if (status === false)
                return;

            cell.progressOn();
            let dados = form.getFormData();
            dados.responsavel = usuariocorrente.login;

            if (dados.id > 0) {
                historico.EditarItem(dados, AoExecutarOperacao);
            } else {
                historico.AdicionarItem(dados, AoExecutarOperacao);
            }

        });

    }

    function AoExecutarOperacao() {

        cellform.progressOff();
        cellgrid.progressOn();
        that.LimparFormulario();

        historico.Grid(function (registros) {

            cellgrid.progressOff();
            if (registros === null)
                return;

            grid.clearAll();
            grid.parse(registros,"json");
        });
    }

    function MontaGrid(cell) {

        grid = cell.attachGrid();
        grid.setHeader(['Entrada', 'Id', 'Assunto', 'Categoria', 'Tipo', 'Técnico(s)']);
        grid.attachHeader('#text_filter,#text_filter,#text_filter,#text_filter,#text_filter,#text_filter');
        grid.setColTypes('ro,ro,ro,ro,ro,ro');
        grid.setColSorting('date,str,str,str,str,str');
        grid.setInitWidths('150,90');
        grid.enableSmartRendering(true);
        grid.enableMultiselect(true);
        grid.init();

        grid.attachEvent("onRowSelect", function (id) {
            cellform.progressOn();
            historico.Info(id, function (response) {

                cellform.progressOff();

                if (response === null)
                    return;

                let dados = response[0];
                dados.filedate = moment(dados.filedate).format('YYYY-MM-DD HH:mm:ss');
                dados.fechamento = moment(dados.fechamento).format('YYYY-MM-DD HH:mm:ss');
                form.setFormData(dados);

            })
        });

        historico.Grid(function (atendimentos) {

            if (atendimentos === null)
                return;

            grid.parse(atendimentos, 'json');

        })

    }
};


let formatendimetos = [
    {type: 'settings', offsetTop:15, inputWidth:200, labelWidth:140, labelAlign: 'right'},
    {type: 'template', name: 'id', label: 'Registro Nº:'},
    {type: 'combo', name: 'cliente',required: true,  label: 'Cliente:', inputWidth: 400},
    {type: 'input', name: 'assunto', required: true, label: 'Assunto:', inputWidth: 400},
    {type: 'input', name: 'chamado', required: true, label: 'Chamado:', rows:5, inputWidth: 400},
    {type: 'input', name: 'resposta', required: true, label: 'Resposta:', rows:5, inputWidth: 400},
    {type: 'newcolumn', offset: 20},
    {type: 'calendar', name: 'filedate', required: true, label: 'Entrada:', dateFormat:'%d/%m/%y %H:%i', serverDateFormat:'%y-%m-%d %H:%i'},
    {type: 'calendar', name: 'fechamento',required: true,  label: 'Fechamento:', dateFormat:'%d/%m/%y %H:%i', serverDateFormat:'%y-%m-%d %H:%i'},
    {type: 'input', name: 'tecnico', required: true, label: 'Técnico(s):'},
    {type: 'combo', name: 'categoria',required: true,  label: 'Categoria:'},
    {type: 'combo', name: 'tipo', required: true, label: 'Tipo:'}
];