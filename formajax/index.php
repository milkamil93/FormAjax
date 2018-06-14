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

if($_SERVER['HTTP_X_REQUESTED_WITH'] == 'XMLHttpRequest') {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'POST': {
            echo (new formajax())->send(
                'kamil@pandaworks.ru',
                'Тема письма'
            /*array(
                'host' => 'smtp.yandex.ru',
                'username' => '@yandex.ru',
                'password' => ''
            )*/
            );
        }

        default: {
            not_request('Only post request');
        }
    }
} else {
    not_request();
}