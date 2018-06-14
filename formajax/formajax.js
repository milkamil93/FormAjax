/**
 * Created by PhpStorm.
 * User: milkamil93
 * Date: 13.06.2018
 * Time: 12:24
 */

;(function () {
    var $settings = {
        empty: 'Заполните необходимые поля',
        fatal: 'Неизвестная ошибка',
        sending: 'Идёт отправка',
        requestpage: 'Страница с запросом',
        referrer: 'Источник трафика',
        sent: 'Сообщение отправлено',
        yandexMetrika: function (key) {
            //yaCounter47027148.reachGoal(key);
        }
    };
    
    var $formajax = {
        init: function ($form) {
            this.form = $form;
            this.settings = $settings;
            this.typefileds = 'input:not([type="button"]):not([type="hidden"]):not([type="image"]):not([type="password"]):not([type="reset"]):not([type="submit"]),textarea,select';
            this.names = {};
            this.send();
        },
        /* Записать источник трафика */
        setReferrer: function () {
            if(!this.getReferrer() && (document.referrer)) {
                localStorage.setItem('formajax_Referrer', document.referrer);
            }
        },
        /* Получить источник трафика */
        getReferrer: function () {
            return localStorage.getItem('formajax_Referrer') || false;
        },
        /* Вывести статус формы */
        statusForm: function ($text, $status) {
            if ($text) {
                $status = $status || 'warning';
                var $alert = this.form.getElementsByClassName('alert');
                if ($alert.length) {
                    $alert[0].parentNode.removeChild($alert[0]);
                }
                this.form.appendChild(createEl('div','alert alert-' + $status, $text));
            }
        },
        /* Вывести ошибку поля */
        statusField: function ($el, $text) {
            $el.insertAdjacentHTML('afterend', '<div class="invalid-feedback">' + $text + '</div>');
        },
        /* Функция отправки */
        send: function () {
            var $fields = this.form.querySelectorAll(this.typefileds),
                $allRequired = this.form.querySelectorAll('[required]').length,
                $this = this,
                $cr = {
                    sets: {},
                    status: {}
                };
            $fields.forEach(function ($item) {
                var $name = $item.getAttribute('name'),
                    $type = $item.getAttribute('type');                
                var $next = $item.nextElementSibling;
                if ($next && is($item.nextElementSibling, '.invalid-feedback')) {
                    $next.parentNode.removeChild($next);
                    removeClass($item, 'is-invalid');
                }
                if (!$allRequired || $item.getAttribute('required') !== null) { 
                    /* Сбор ошибок */
                    switch ($type) {
                        /* Проверка checkbox и radio полей на выбранность */
                        case 'checkbox':
                        case 'radio': {
                            $cr.sets[$name] = $cr.sets[$name] === undefined ? $this.form.querySelectorAll('[name="' + $name + '"]') : $cr.sets[$name];
                            $cr.status[$name] = $cr.status[$name] ? $cr.status[$name] : $item.checked;
                            if ($cr.sets[$name].length === indexSET($cr.sets[$name], $item)) {
                                if (!$cr.status[$name]) {
                                    addClass($cr.sets[$name], 'is-invalid');
                                    $this.statusField($item, 'Поле обязательно для выбора');
                                } else {
                                    removeClass($cr.sets[$name], 'is-invalid');
                                }
                            }
                            break;
                        }
                        default: {
                            if (!$item.value.length) {
                                addClass($item, 'is-invalid');
                                $this.statusField($item, 'Поле обязательно для заполнения');
                            }
                        }
                    }
                    
                }
                /* Сбор имён */
                $this.names[$name] = $item.getAttribute('data-name') || null;
            });
        }
    };

    /* Ловим события отправки формы */
    addEvent(document, 'submit', '[data-formajax]', function(e) {
        e.preventDefault();
        $formajax.init(this);
    });
    
    /* Отключаем стандартную валидацию HTML5 у наших форм */
    var DOMEvents = ['DOMSubtreeModified','DOMContentLoaded'];
    for (var i = 0; i < DOMEvents.length; i++) {
        document.addEventListener(DOMEvents[i], function() {
            document.querySelectorAll('[data-formajax]:not([novalidate])').forEach(function ($item) {
                $item.setAttribute('novalidate', '');
            });
        });
    }
    
    function indexSET($set, $el) {
        var $number = 0;
        $set.forEach(function ($item, i) {
            if ($item === $el) {
                $number = ++i;
            } else return true;
        });
        return $number;
    }
    
    function createEl(tag, className, text) {
        var el = document.createElement(tag);
        el.className = className;
        el.innerHTML = text;
        return el;
    }
    
    function addClass(el, className) {
        if (el.length) {
            el.forEach(function ($item) {
                addCl($item);
            });
        } else {
            addCl(el);
        }
        function addCl(el) {
            if (el.classList) {
                el.classList.add(className);
            } else {
                el.className += ' ' + className;
            }
        }
    }
    
    function removeClass(el, className) {
        if (el.length) {
            el.forEach(function ($item) {
                removeCl($item);
            });
        } else {
            removeCl(el);
        }
        function removeCl(el) {
            if (el.classList) {
                el.classList.remove(className);
            } else {
                el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }
        
    }

    var is = function(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
    };

    function addEvent(parent, evt, selector, handler) {
        parent.addEventListener(evt, function(event) {
            if (event.target.matches(selector + ', ' + selector + ' *')) {
                handler.apply(event.target.closest(selector), arguments);
            }
        }, false);
    }
    
    /*
    
    // Статус отправки 
    
    // Функция отправки
    function flsend(e) {
    
        // обнуление набора
        $flajax.options.required = [];
        $flajax.options.names = {};
        
        var err = false,
            allRequired = true,
            form = e.closest('form');
    
        // Функция валидации
        function flcheck(th) {
            var type = th.attr('type');
            if (type !== 'file') $flajax.options.required.push(th.attr('name'));
        }
    
        form.find($flajax.typesfield).each(function() {
            var th = $(this);
            if (th.attr('required') !== undefined) {
                allRequired = false;
                flcheck(th);
            }
    
            // Добавляем имена полей в отдельный массив
            if (th.attr('type') !== 'file')
            $flajax.options.names[th.attr('name')] = th.is('[data-FL-name]') ? th.attr('data-FL-name') : 'name="' + th.attr('name') + '"';
    
        });
    
        if (allRequired) {
            form.find($flajax.typesfield).each(function() {
                flcheck($(this));
            });
        }
    
        if (err) {
            if (form.hasClass('cme')){
                flstatus(form, 'error', $flajax.error);
            }
            return;
        }
    
        flstatus(form, 'sending', $flajax.sending);
    
        var formData = new FormData(form[0]);
    
        // Источник трафика
        var rf = getData('FLreferrer');
        if (rf && rf.length > 0) {
            formData.append('referrer', rf);
            $flajax.options.names['referrer'] = $flajax.referrer;
        }
    
        // Страница с запросом
        formData.append('pageurl', location.href);
        $flajax.options.names['pageurl'] = $flajax.pageurl;
    
        var FLyaM = e.attr('data-FL-yaM');
    
        $flajax.options.to = e.attr('data-FL-to');
        $flajax.options.theme = e.attr('data-FL-theme');
    
        formData.append('options', JSON.stringify($flajax.options));
        
        $.ajax({
            url: '/postflajax',
            type: 'post',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function(json) { console.log(json);
                var items = form.find($flajax.typesfield);
                items.removeClass('is-invalid');
                if (json['status'] === false) {
                    if (json['errors'].length !== 0) {
                        var err_log = true;
                        $.each(json['errors'], function(key, data) {
                            if (err_log) {
                                flstatus(form, 'error', data['required']);
                                err_log = false;
                            }
                            items.filter('[name="' + key + '"]').addClass('is-invalid');
                        });
                    } else if (json['messages'].length !== 0) {
                        flstatus(form, 'error', json['messages']);
                    } else {
                        flstatus(form, 'error', $flajax.fatal_error);
                    }
                } else {
                    flstatus(form, 'sent', $flajax.sent);
                    e.attr('disabled', 'disabled');
                    setTimeout(function(){
                        if (typeof($.fancybox) !== 'undefined'){
                            $.fancybox.close();
                        }
                    }, 2000);
                    if (FLyaM !== undefined) $flajax.yaMetrik(FLyaM);
                }
            },
            error: function(status) {
                console.log(status);
            }
        });
    }
    
    function getData(e) {
        return localStorage.getItem(e) || false;
    }
*/
})();