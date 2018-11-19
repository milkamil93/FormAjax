<?php
/**
 * Created by PhpStorm.
 * User: milkamil93
 * Date: 13.06.2018
 * Time: 12:24
 */

require 'formajax.php';

function not_request($error = null) {
    header('HTTP/1.0 404 Not Found');
    die($error);
}
if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND $_SERVER['HTTP_X_REQUESTED_WITH'] == 'FormAjaxRequest') {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST': {
            echo (new formajax())->send(
                'to@to.to',
                'Тема письма',
                'Имя',
            /*array(
                'host' => 'smtp.yandex.ru',
                'username' => '@yandex.ru',
                'password' => ''
            )*/
            null, // smtp
            null // callback (array(function() { return }))
            );
            break;
        }

        default: {
            not_request('Only post request');
        }
    }
} else {
    not_request();
}