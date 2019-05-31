#!/usr/bin/php 
<?php
/**
 * Created by PhpStorm.
 * User: oberdanbrito
 * Date: 27/11/18
 * Time: 14:07
 */

require_once('../../../ws/var/etc/auth.php');
$conn = pg_connect(CONNECTIONSTRING_AS);

$lista=<<<SQL
  SELECT id, equipamento, endereco, log, alerta, alert_limite 
    FROM controldesk.lista_eventos_rede
SQL;

$result = pg_query($conn, $lista);
if (!$result) {
    echo "An error occurred.\n";
    exit;
}

while ($data = pg_fetch_object($result)) {

    $ip = $data->endereco;
    exec("ping -c 5 $ip", $saida, $retorno);

    $perda = '';
    $status = '';
    for($i=0; $i<count($saida); $i++) {

        if (strpos($saida[$i], 'transmitted') > -1) {
            $status = $saida[$i];
            $perda = explode(' ', explode(',', $saida[$i])[1]);
            $perda = $perda[1];
        }
    }

//    print_r($data);
    if ($perda == '0') {

	$equipamento = $ip." ".$data->equipamento;
	
        if ($data->alerta == 't')
            exec ('telegram-send "'.$equipamento." ".$status.'"');
	
	$id = $data->id;
	
        if ($data->log == true) {
            $log =<<<SQL
                INSERT INTO controldesk.eventos (origem, evento, valor, observacoes, inventario) 
                VALUES ('monitor_rede', 'ping', '$equipamento', '$status', '$id');
SQL;
            pg_query($log);
        }

    }

}