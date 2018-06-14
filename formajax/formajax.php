<?php
/**
 * Created by PhpStorm.
 * User: milkamil93
 * Date: 09.06.2018
 * Time: 21:00
 */

ini_set('error_reporting', E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

require 'phpmailer/class.smtp.php';
require 'phpmailer/class.phpmailer.php';

class formajax {
    const VERSION = '0.1.1';
    private $post;
    private $names;
    private $mail;

    public function __construct () 
    {
        $this->post = filter_input_array(INPUT_POST, FILTER_SANITIZE_SPECIAL_CHARS);
        $this->names = isset($this->post['names']) ? json_decode($this->post['names'],1) : array();
        unset($this->post['names']);
        $this->mail = new PHPMailer;
    }
    
    private function setSettings ($settings, $subject, $smtp) 
    {
        // Настройки SMTP
        if ($smtp) {
            $this->mail->isSMTP();
            $this->mail->SMTPDebug = 0;
            $this->mail->Host = $smtp['host'];
            $this->mail->SMTPAuth = true;
            $this->mail->Username = $smtp['username'];
            $this->mail->Password = $smtp['password'];
            $this->mail->SMTPSecure = 'ssl';
            $this->mail->Port = 465;
            $this->mail->setFrom($smtp['username']);
        } else {
            // От кого пришло
            $host = parse_url('http://'.$_SERVER['HTTP_HOST']);
            $from = 'noreply@' . str_replace(array('http://','www.'),'',$host['host']);
            $this->mail->setFrom($from);
        }
        
        // Тема письма
        $this->mail->Subject = isset($settings['subject']) ? $settings['subject'] : $subject;

        // Тело письма
        $this->mail->isHTML(true);
        $this->mail->Body = $this->getBody();
    }

    private function getBody () 
    {
        $data = '';
        if (count($this->post)) {
            $data .= '<div style="background:#f7fbff;border:1px solid #e5e5e5;padding:5px 15px;">';
            foreach ($this->post as $key => $item) {
                $name = $this->names[$key] OR $key;
                $data .= '<p><strong>' . $name . ':</strong> ' . $item . '<br/></p>';
            }
            $data .= '</div>';
        }
        $data .= '<div style="background:#f5f5f5;border:1px solid #e5e5e5;padding:10px 15px;margin: 10px 0;">
            IP: ' . $_SERVER['REMOTE_ADDR'] . 
        '</div>';
        return $data;
    }

    private function getFiles () 
    {
        foreach ($_FILES as $item) {
            if (is_array($item['name'])) {
                foreach ($item['name'] as $i => $name) {
                    $this->mail->AddAttachment($item['tmp_name'][$i], $name);
                }
            } else {
                $this->mail->AddAttachment($item['tmp_name'], $item['name']);
            }
        }
    }


    public function send ($to = null, $subject = 'Обратный звонок', $smtp = null) 
    {
        $settings = isset($this->post['settings']) ? json_decode($this->post['settings'],1) : array();
        $to = isset($settings['to']) ? $settings['to'] : $to;
        unset($this->post['settings']);
        if ($to) {
            foreach (explode(',', $to) as $item) {
                $this->mail->addAddress(trim($item));
            }
            $this->setSettings($settings, $subject, $smtp);
            $this->getFiles();
            if (!$this->mail->send()) {
                $out = $this->mail->ErrorInfo;
            } else {
                $out = 'Сообщение отправлено';
            }
        } else {
            $out = 'Укажите адрес получателя!';
        }
        
        return $out;
    }

}