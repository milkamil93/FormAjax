<?php
/**
 * NOTICE OF LICENSE
 *
 * This source file is subject to the MIT License (MIT)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.gnu.org/copyleft/lesser.html
 *
 * @package   FormAjax
 * @author    milkamil93
 * @copyright 2018 FormAjax
 * @license   http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 * @link      https://github.com/milkamil93/FormAjax
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

                // smtp
                /*array(
                    'host' => 'smtp.yandex.ru',
                    'username' => '@yandex.ru',
                    'password' => ''
                )*/
                null,

                // callback после успешной отправки
                function($fields) {
                    return $fields;
                }
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
