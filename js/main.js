let webservice = new Webservice(), usuariocorrente;
dhtmlxEvent(window, 'load', function () {

    console.info('versão 1.0');

    if (!sessionStorage.user) {
        window.location = '../smart.auth/auth.html?system=smart.controldesk';
        return;
    }

    usuariocorrente = JSON.parse(sessionStorage.user);


    if (typeof window.orientation === 'undefined')
    {
        let controldesk = new ControlDeskDesktop();
        controldesk.MontaLayout();
    } else {
        let controldesk = new ControlDeskMobile();
        controldesk.MontaLayout();
    }

});

let ControlDeskDesktop = function () {

    let that = this, siderbar;

    this.MontaLayout = function() {

        siderbar = new dhtmlXSideBar({
            parent: document.body,
            template: 'icons',
            icons_path: 'img/siderbar/',
            single_cell: false,
            width: 50,
            header: true,
            autohide: false,
            offsets: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            items: [
                {
                    id: 'gestor',
                    text: 'Dashboard',
                    icon: 'gestor.png',
                    selected: false
                },
                {
                    id: 'atendimentos',
                    text: 'Atendimentos',
                    icon: 'atendimentos.png',
                    selected: true
                }
            ]

        });

        siderbar.attachEvent('onSelect', function(id) {
            that.SelecionarOpcao(id);
        });

        that.SelecionarAtendimentos();
    };

    this.SelecionarOpcao = function(id) {
        switch (id) {
            case 'gestor':
                that.SelecionarGestor();
                break;
            case 'atendimentos':
                that.SelecionarAtendimentos();
                break;
        }
    };

    this.SelecionarGestor = function () {

    };

    this.SelecionarAtendimentos = function () {
        let atendimentos = new editorMensagens();
        atendimentos.MontaLayout(siderbar.cells('atendimentos'));
    }

};

let mb_recurso_corrente, mb_chamado_corrente, mb_toolbar;
let ControlDeskMobile = function () {

    let that = this, siderbar, atendimentos;

    this.MontaLayout = function() {

        let layout = new dhtmlXLayoutObject({
            parent: document.body,
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
                    header:         false,
                    collapse:       false
                }
            ]
        });

        layout.cells('a').hideHeader();
        layout.setSkin("dhx_web");

        mb_toolbar = layout.cells('a').attachToolbar({
            icon_path: "./img/toolbar/",
            items: [
                {type: "button", id: "menu", img: "menu.png"},
                {type: "button", id: "voltar", img: "voltar.png"},
                {id: "info", type: "text", text: "ControlDesk"},
                {type: "button", id: "editar", img: "editar.png"},
                {type: "button", id: "salvar", img: "salvar.png"},
                {type: "button", id: "remover", img: "remover.png"},
            ],
            onclick: function (id) {
                switch (id) {
                    case 'menu':
                        siderbar.showSide();
                        break;
                    case 'voltar':
                        if (mb_recurso_corrente === 'info_atendimento') {
                            mb_toolbar.hideItem('salvar');
                            mb_toolbar.hideItem('remover');
                            mb_toolbar.hideItem('voltar');
                            mb_toolbar.showItem('menu');
                            mb_toolbar.showItem('editar');

                            mb_recurso_corrente = 'lista_atendimentos';
                            that.SelecionarAtendimentos();
                        }
                        break;
                    case 'editar':
                        mb_toolbar.showItem('salvar');
                        mb_toolbar.hideItem('remover');
                        mb_toolbar.showItem('voltar');
                        mb_toolbar.hideItem('menu');
                        mb_toolbar.hideItem('editar');

                        atendimentos.MontaFormulario();
                        break;
                    case 'salvar':
                        atendimentos.Salvar();
                        break;
                }
            }
        });

        mb_toolbar.addSpacer('info');
        mb_toolbar.hideItem('voltar');
        mb_toolbar.hideItem('salvar');
        mb_toolbar.hideItem('remover');




        siderbar = layout.cells('a').attachSidebar({
            template: 'details',
            icons_path: 'img/siderbar/',
            single_cell: true,
            width: 150,
            header: false,
            autohide: true,
            offsets: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            },
            items: [
                {
                    id: 'gestor',
                    text: 'Dashboard',
                    icon: 'gestor.png',
                    selected: false
                },
                {
                    id: 'atendimentos',
                    text: '<div class="mb_header_at">Atendimentos</div><div class="mb_header_add">+</div>',
                    icon: 'atendimentos.png',
                    selected: true
                }
            ]

        });

        siderbar.attachEvent('onSelect', function(id) {
            that.SelecionarOpcao(id);
        });

        that.SelecionarAtendimentos();
    };

    this.SelecionarOpcao = function(id) {
        switch (id) {
            case 'gestor':
                that.SelecionarGestor();
                break;
            case 'atendimentos':
                that.SelecionarAtendimentos();
                break;
        }
    };

    this.SelecionarGestor = function () {

    };

    this.SelecionarAtendimentos = function () {
        atendimentos = new MB_Atendimentos(siderbar.cells('atendimentos'));
        atendimentos.MontaListagem();
        mb_recurso_corrente = 'lista_atendimentos'
    }

};