let Tipos = function () {

    this.Listar = function(Callback) {


        if (sessionStorage.tiposatendimentos !== undefined) {
            Callback(webservice.PreparaLista('query',sessionStorage.tiposatendimentos));
            return;
        }

        webservice.Request({
            process: 'query',
            params: JSON.stringify({
                command: 'select',
                fields: '*',
                from: 'controldesk.atendimento_tipos',
                order: 'id'
            })
        }, function (http) {

            if (http.response === 'null' || http.response === 'false') {
                Callback(null);
                return;
            }

            sessionStorage.tiposatendimentos = http.response;
            Callback(webservice.PreparaLista('query',sessionStorage.tiposatendimentos));
        });

    }
};