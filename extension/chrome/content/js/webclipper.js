/**
 * Laverna web clipper
 * @license GNU GPLv3
 */
var webclipper = function () {

    return {
        init: function () {
            this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService)
                 .getBranch("extensions.laverna-clipper.");

            this.prefs.addObserver("", this, false);
        },

        clip: function (type) {
            var title = content.document.getElementsByTagName('title'),
                body = content.document.getElementsByTagName('body');
if (title.length === 0 || body.length === 0) { return;
            }

            // Clip selected item
            if (type === 'selected') {
                var $els = $('div,article,section,aside', content.document);
                $els.on('mouseover mouseout click', function (e) {
                    e.stopPropagation();
                    $content = $(this);
                    switch (e.type) {
                        case 'mouseover':
                            $content.css({
                                'outline': '1px solid ' + $content.css('color')
                            });
                            break;
                        case 'mouseout':
                            $content.css('outline', 'none');
                            break;
                        case 'click':
                            $els.off('mouseover mouseout click');
                            $content.css('outline', 'none');
                            webclipper.redirect($content.html(), title[0].innerHTML);
                            break;
                    }
                });
            }
            // Or entire page
            else {
                webclipper.redirect(body[0].innerHTML, title[0].innerHTML);
            }
        },

        redirect: function (body, title) {
            var myUrl = this.prefs.getCharPref("appURL") + '/index.html#/notes/add',
                browser = top.document.getElementById('content'),
                tab = browser.addTab(myUrl),
                inter,
                result;

            // get url of the page to clip
            url = content.window.location.href;

            // use this line to focus the new tab, otherwise it will open in background
            browser.selectedTab = tab;

            tab.addEventListener('load', function tabLoad() {
                if (content.window.location.href === myUrl) {
                    tab.removeEventListener('load', tabLoad, false);

                    // Try to find Form's input in the DOM until success
                    inter = setInterval(function () {
                        result = webclipper.fillForm(body, title, url);
                        if (result === true) {
                            clearInterval(inter);
                        }
                    }, 1000);
                }
            }, false);
        },

        fillForm: function (body, title, url) {
            var inputTitle = $('#inputTitle', content.document),
                inputText = $('#clipContent', content.document);

            if (inputTitle.length === 0 || inputText.length === 0) {
                return false;
            }

            link = "[Original url](" + url +") " + this.prefs.getCharPref("defaultTags")
                    + "\n\n-----------\n\n";
            body = link + toMarkdown(body);

            inputTitle.val(title);
            inputText.val(body);
            inputTitle.blur();
            return true;
        }

    };

} ();

window.addEventListener('load', function (e) {
    webclipper.init();
}, false);
