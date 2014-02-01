/**
 * Laverna web clipper
 * @license GNU GPLv3
 */
var webclipper = function () {

    return {
        init: function () {
        },

        clip: function () {
            var title = content.document.getElementsByTagName('title'),
                body = content.document.getElementsByTagName('body');

            if (title.length === 0 || body.length === 0) {
                return;
            }

            webclipper.redirect(body[0].innerHTML, title[0].innerHTML);
        },

        redirect: function (body, title) {
            var myUrl = 'http://localhost/laverna/app/#/notes/add',
                browser = top.document.getElementById('content'),
                tab = browser.addTab(myUrl),
                inter,
                result;

            // use this line to focus the new tab, otherwise it will open in background
            browser.selectedTab = tab;

            tab.addEventListener('load', function tabLoad() {
                if (content.window.location.href === myUrl) {
                    tab.removeEventListener('load', tabLoad, false);

                    // Try to find Form's input in the DOM until success
                    inter = setInterval(function () {
                        result = webclipper.fillForm(body, title);
                        if (result === true) {
                            clearInterval(inter);
                        }
                    }, 1000);
                }
            }, false);
        },

        fillForm: function (body, title) {
            var inputTitle = content.document.getElementById('inputTitle'),
                inputText = content.document.getElementById('clipContent');

            if ( !inputTitle || !inputText) {
                return false;
            }

            inputTitle.value = title;
            inputText.value = body.replace(/(<([^>]+)>)/ig, '');
            return true;
        }

    };

} ();

content.window.addEventListener('load', function load() {
    window.removeEventListener('load', load, false);
    webclipper.init();
}, false);
