/**
 * Created by PhpStorm.
 * User: milkamil93
 * Date: 13.06.2018
 * Time: 12:24
 */

;(function () {
    var settings = {
        phpScript: '__ajax__/form', // ссылка до обработчика
        empty: 'Заполните необходимые поля',
        fatal: 'Неизвестная ошибка',
        sending: 'Отправка сообщения',
        requestPage: 'Страница с запросом',
        referrer: 'Источник трафика',
        sent: 'Сообщение отправлено',
        callback: function (form) {

            /*var target;
            if ((target = form.getAttribute('data-target'))) {
                // старая метрика
                //yaCounter47027148.reachGoal(target);

                // новая метрика
                //ym(47027148, 'reachGoal', target);
            }*/
        }
    };

    var formAjax = {
        init: function (form) {
            this.form = form;
            this.settings = settings;
            this.typefileds = 'input:not([type="button"]):not([type="image"]):not([type="password"]):not([type="reset"]):not([type="submit"]),textarea,select';
            this.names = {};
            this.error = false;
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
        statusForm: function (text, status) {
            if (text) {
                status = status || 'warning';
                var alert = this.form.getElementsByClassName('alert');
                if (alert.length) {
                    alert[0].setAttribute('class', 'alert alert-' + status);
                    alert[0].textContent = text;
                } else {
                    this.form.insertBefore(createEl('div','alert alert-' + status, text), this.form.firstChild);
                }

            }
        },

        /* Вывести ошибку поля */
        statusField: function (el) {
            this.error = true;
            var msg = el.getAttribute('data-error') || 'Поле обязательно для заполнения',
                inputInvalid = document.createElement('div');
            inputInvalid.className = 'invalid-feedback';
            inputInvalid.innerText = msg;
            el.after(inputInvalid);
            inputInvalid.addEventListener('mouseover', () => {
                el.classList.remove('is-invalid');
                el.focus();
                inputInvalid.remove();
            });
        },

        /* Проверка полей на валидность, подготовка формы к отправке */
        checkFields: function () {
            var fields = this.form.querySelectorAll(this.typefileds),
                allRequired = this.form.querySelectorAll('[required]').length,
                self = this,
                cr = {
                    sets: {},
                    status: {}
                };
            fields.forEach(function (item) {
                var name = item.getAttribute('name'),
                    type = item.getAttribute('type'),
                    next = item.nextElementSibling;
                if (next && is(item.nextElementSibling, '.invalid-feedback')) {
                    next.parentNode.removeChild(next);
                    removeClass(item, 'is-invalid');
                }
                if (!allRequired || item.getAttribute('required') !== null) {

                    /* Сбор ошибок */
                    switch (type) {

                        /* Проверка checkbox и radio полей на выбранность */
                        case 'checkbox':
                        case 'radio': {
                            cr.sets[name] = cr.sets[name] === undefined ? self.form.querySelectorAll('[name="' + name + '"]') : cr.sets[name];
                            cr.status[name] = cr.status[name] ? cr.status[name] : item.checked;
                            if (cr.sets[name].length === indexSET(cr.sets[name], item)) {
                                if (!cr.status[name]) {
                                    addClass(cr.sets[name], 'is-invalid');
                                    self.statusField(item);
                                } else {
                                    removeClass(cr.sets[name], 'is-invalid');
                                }
                            }
                            break;
                        }
                        default: {
                            if (!item.value.length) {
                                addClass(item, 'is-invalid');
                                self.statusField(item);
                            }
                        }
                    }

                }

                /* Сбор имён */
                var names;
                if ((names = item.getAttribute('data-name'))) {
                    self.names[name] = names;
                }
            });
        },

        /* Функция отправки */
        send: function () {
            var self = this;
            self.checkFields();
            if(self.error) return false;

            var formData = new FormData(self.form),
                toDelete = [];

            /* Удаляем пустые поля */
            formData.forEach(function (value, key) {
                if (typeof value === 'object' && value.size === 0 || value.length === 0) {
                    toDelete.push(key);
                }
                if (typeof value === 'object' && value.size >= 10485760) { // 10 МБ
                    self.statusForm('Слишком большой размер файла', 'danger');
                    self.error = true;
                }
            });
            toDelete.forEach(function (value) {
                formData.delete(value);
            });

            /* Источник трафика и страница с запросом */
            self.names.fa_requestpage = settings.requestPage;
            self.names.fa_referrer = settings.referrer;
            formData.append('fa_requestpage', location.href);
            formData.append('fa_referrer', self.getReferrer());

            /* Набор идентификаторов */
            formData.append('fa_names', JSON.stringify(self.names));

            /* Индивидульная тема формы */
            var subject;
            if ((subject = self.form.getAttribute('data-formajax'))) {
                formData.append('fa_subject', subject);
            }

            /* Индивидульный получатель формы */
            var $to;
            if (($to = self.form.getAttribute('data-to'))) {
                formData.append('fa_to', $to);
            }

            if(self.error) return false;


            self.statusForm(settings.sending, 'warning');

            /* Делаем запрос */
            var request = new XMLHttpRequest();
            request.open('POST', '__ajax__/form', true);
            request.setRequestHeader('X-REQUESTED-WITH', 'FormAjaxRequest');
            request.onload = function() {
                var response = JSON.parse(request.responseText);
                if (request.status >= 200 && request.status < 400) {

                    /* Результат успешного запроса */
                    var type;
                    if (response.status) {
                        type = 'success';
                        self.form.querySelectorAll('button,[type="button"],[type="submit"]')[0].setAttribute('disabled', '');

                        /* Закрытие popup */
                        if (typeof($) !== 'undefined') {
                            setTimeout(function(){

                                /* FancyBox */
                                if (typeof($.fancybox) !== 'undefined'){
                                    $.fancybox.close();
                                }

                                /* Bootstrap */
                                if (typeof($.modal) !== 'undefined'){
                                    $('.modal').modal('hide');
                                }
                            }, 2000);
                        }

                        /* Функция после успешной отправки */
                        self.settings.callback(self.form);
                    } else {
                        type = 'danger';
                    }
                    self.statusForm(response.messages, type);
                } else {

                    /* Ошибка запроса */
                    self.statusForm(response, 'danger');
                }
            };
            request.onerror = function(error) {

                /* Прочие ошибки */
                self.statusForm(error.type, 'danger');
            };
            request.send(formData);
        }
    };

    /* Ловим события отправки формы */
    addEvent(document, 'submit', '[data-formajax]', function(e) {
        e.preventDefault();
        formAjax.init(this);
    });

    /* Записываем источник трафика */
    window.onload = formAjax.setReferrer(this);

    /* Отключаем стандартную валидацию HTML5 у наших форм */
    var DOMEvents = ['DOMSubtreeModified','DOMContentLoaded'];
    for (var i = 0; i < DOMEvents.length; i++) {
        document.addEventListener(DOMEvents[i], function() {
            document.querySelectorAll('[data-formajax]:not([novalidate])').forEach(function (item) {
                item.setAttribute('novalidate', '');
            });
        });
    }

    function indexSET(set, el) {
        var number = 0;
        set.forEach(function (item, i) {
            if (item === el) {
                number = ++i;
            } else return true;
        });
        return number;
    }

    function createEl(tag, className, text) {
        var el = document.createElement(tag);
        el.className = className;
        el.innerHTML = text;
        return el;
    }

    function addClass(el, className) {
        if (el.length) {
            el.forEach(function (item) {
                addCl(item);
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
            el.forEach(function (item) {
                removeCl(item);
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

    function is(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
    }

    function addEvent(parent, evt, selector, handler) {
        parent.addEventListener(evt, function(event) {
            if (event.target.matches(selector + ', ' + selector + ' *')) {
                handler.apply(event.target.closest(selector), arguments);
            }
        }, false);
    }
})();