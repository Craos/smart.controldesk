class MB_Atendimentos {

    constructor(container) {
        mb_recurso_corrente = 'info_atendimento';
        container.detachObject(true);
        MB_Atendimentos.layout = container.attachLayout({
            pattern: '1C',
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
                }
            ]
        });

        MB_Atendimentos.layout.attachEvent("onContentLoaded", function(id){
            MB_Atendimentos.ifr = MB_Atendimentos.layout.cells(id).getFrame();
            MB_Atendimentos.ifr.style.height = "20000px";
        });

    }

    MontaListagem() {

        let list = MB_Atendimentos.layout.cells('a').attachList({
            container:"data_container",
            type:{
                template:"http->./html/mb_list_atendimentos.html",
                height:90
            }
        });

        let historico = new Historico();

        MB_Atendimentos.layout.progressOn();
        historico.Lista(function (registros) {

            if (registros === null) {
                MB_Atendimentos.layout.progressOff();
                return;
            }

            list.clearAll();
            list.parse(registros,"json");
            console.debug(registros);
            MB_Atendimentos.layout.progressOff();
        });


        list.attachEvent("onItemClick", function (id, ev, html){

            MB_Atendimentos.layout.progressOn();
            mb_toolbar.showItem('voltar');
            mb_toolbar.showItem('remover');
            mb_toolbar.showItem('salvar');
            mb_toolbar.hideItem('editar');
            mb_toolbar.hideItem('menu');
            mb_recurso_corrente = 'info_atendimento';

            historico.Info(id, function (response) {

                if (response === null) {
                    MB_Atendimentos.layout.progressOff();
                    return;
                }

                let dados = response[0];
                mb_chamado_corrente = dados.id;
                dados.filedate = moment(dados.filedate).format('YYYY-MM-DD HH:mm:ss');
                dados.fechamento = moment(dados.fechamento).format('YYYY-MM-DD HH:mm:ss');
                MB_Atendimentos.layout.cells('a').attachURL('./html/mb_adc_atendimento.html?id='+mb_chamado_corrente);
                MB_Atendimentos.layout.progressOff();

            });

            return true;
        });


    };

    MontaFormulario() {
        mb_recurso_corrente = 'info_atendimento';
        let janela = document.getElementsByClassName('dhx_cell_cont_layout');
        //janela[0].style.height = "max-content";
        //janela[1].style.height = "max-content";
        //console.debug(janela);
        MB_Atendimentos.layout.cells('a').attachURL('./html/mb_adc_atendimento.html');
    }

    Salvar() {

        let doc = MB_Atendimentos.ifr.contentWindow;

        let dados ={
            assunto: doc.document.getElementById('assunto').value,
            chamado: doc.document.getElementById('chamado').value,
            resposta: doc.document.getElementById('resposta').value,
            fechamento: doc.document.getElementById('fechamento').value,
            tecnico: doc.document.getElementById('tecnico').value,
            categoria: doc.document.getElementById('categoria').value,
            tipo: doc.document.getElementById('tipo').value
        };

        let historico = new Historico();
        historico.AdicionarItem(dados, function (response) {
            if (response === null) {
                dhtmlx.alert({
                    title:"Controldesk",
                    type:"alert-error",
                    text:"Não foi possível salvar as informações. Verifique sua conexão"
                });
                return;
            }

            dhtmlx.alert({
                title:"Controldesk",
                type:"alert",
                text:"Chamado registrado com sucesso!"
            });

            doc.document.getElementById('assunto').value = null;
            doc.document.getElementById('chamado').value = null;
            doc.document.getElementById('resposta').value = null;
            doc.document.getElementById('fechamento').value = null;
            doc.document.getElementById('tecnico').value = null;
            doc.document.getElementById('categoria').value = null;
            doc.document.getElementById('tipo').value = null;
        });

    }

}