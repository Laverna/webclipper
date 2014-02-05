/**
 * Laverna web clipper
 * @license GNU GPLv3
 */
var webclipper = function () {

    return {
        /**
         * Load settings of extension
         */
        init: function () {
            this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService)
                 .getBranch("extensions.laverna-clipper.");

            this.prefs.addObserver("", this, false);
        },

        /**
         * Clipper
         */
        clip: function (type) {
            var title = content.document.getElementsByTagName('title'),
                body = $('body', content.document);

            if (title.length === 0 || body.length === 0) {
                return;
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
                            webclipper.redirect($content.clone(), title[0].innerHTML);
                            break;
                    }
                });
            }
            // Or entire page
            else {
                body = body.clone();
                $('aside,#footer,#header,.header,nav').remove();
                webclipper.redirect(body, title[0].innerHTML);
            }
        },

        /**
         * Redirect to Laverna app page
         */
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
                inputText = $('#clipContent', content.document),
                needAuth = $('input[name=password]', content.document);

            if (inputTitle.length === 0 || inputText.length === 0 || needAuth.length !== 0) {
                return false;
            }

            // Remove some html tags
            $('script,noscript,style,link,footer,form', body).remove();
            $('#disqus,.comments,#comments', body).remove();
            body = this.cleanHtml(body).html();

            // Add link to original post
            link = "[Original url](" + url +") " + this.prefs.getCharPref("defaultTags") +
                    "\n\n-----------\n\n";
            body = link + toMarkdown(body);

            // Strip html tags
            body = String(body).replace(/<\/?[^>]+>/g, '');

            inputTitle.val(title);
            inputText.val(body);
            inputTitle.blur();
            return true;
        },

        /**
         * Clear whitespace between html tags
         */
        cleanHtml: function (str) {
            var that = this;
            str.contents().filter(function() {
                if (this.nodeType != 3) {
                    that.cleanHtml($(this));
                    return false;
                }
                else {
                    this.textContent = $.trim(this.textContent);
                    return !/\S/.test(this.nodeValue);
                }
            }).remove();
            return str;
        }

    };

} ();

window.addEventListener('load', function (e) {
    webclipper.init();
}, false);
