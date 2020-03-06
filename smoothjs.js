// smooth loading stuff


// set name of element containing content, as a css selector e.g '#mainwrap'
var mainWrapper = '#mainwrap';
// set transition speed as ms
var transitionSpeed = '500';
// set element as the bit that moves, for active classes and transition speed
var pageTransitionLayer = $('.pagetransitionlayer');
// set name of the class you will be adding/removing
var pageTransitionClass = 'pageChanging';
var isAnimating = false;
// extra scripts, put into an array
// set list of extra scripts and their names as keys, to check against extrascript attribute later
// important to set the data attribute on the page equal to one of these keys, otherwise no dice
var extraScriptArray = {
    'axios': 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.1/axios.min.js',
};
var extraScriptArrayKeys = Object.keys(extraScriptArray);
// current functions for page, home etc declared earlier
var scriptArray = {
    'pageScripts': pageScripts,
    'homeScripts': homeScripts,
    'archiveScripts': archiveScripts,
    'contactScripts': contactScripts,
    'eventScripts': eventScripts,
};
var scriptArrayKeys = Object.keys(scriptArray);

var siteRoot = window.location.hostname;





// on any link click, if its local, and if its not an anchor
$('a').on('click',function() {
    event.preventDefault();
    var linkObject = $(this);
    var link = $(this).attr('href');
    // if link contains http but isnt local, do nothing
    if (link.includes('http') && !(link.includes(siteRoot))) {
        window.location.href = link;
        return;
    } else if (link.charAt(0) == '#') {
        window.location.href = link;
        // if an anchor, return
        return;
    } else {
        pageTransitionSetup(linkObject);
    }
});





function pageTransitionSetup(linkObject) {

    // if it is a menu item and has children, and its on mobile, dont trigger animation - need to see submenu
    if (linkObject.closest('.menu-item').hasClass('menu-item-has-children') && $(window).width() < 992) {
        return
    }

    // finding current pathname, if page is current page, then don't trigger changepage
    if (window.location.pathname == newPage) {
        return;
    }

    // setting the speed of transition, if it hasnt already been set
    checkTransitionSpeed(transitionSpeed);

    //detect which page has been selected
    var newPage = linkObject.attr('href');

    // checking for data-script attr
    if (linkObject.attr('data-script')) {
        var scriptLink = linkObject.attr('data-script');
    }

    // checking if the name of this extra script is included in the name of extrascript keys, defined above
    if (checkExtraScript(linkObject.attr('data-scriptextra'))) {
        var extrascript = extraScriptArray[$(this).attr('data-scriptextra')];
    }

    //if the page is not animating - trigger animation
    if( !isAnimating ) changePage(newPage, true, scriptLink, extrascript);
}




// $('.menu-item > a, .pageTransitionLink, .header-logo').on('click', function(event){
//     return;
//
//     // if it is a menu item and has children, and its on mobile, dont trigger animation - need to see submenu
//     if ($(this).closest('.menu-item').hasClass('menu-item-has-children') && $(window).width() < 992) {
//         return
//     }
//
//     // finding current pathname, if page is current page, then don't trigger changepage
//     if (window.location.pathname == newPage) {
//         return;
//     }
//
//     event.preventDefault();
//
//     // setting the speed of transition, if it hasnt already been set
//     checkTransitionSpeed(transitionSpeed);
//
//     //detect which page has been selected
//     var newPage = $(this).attr('href');
//
//     // checking for data-script attr
//     if ($(this).attr('data-script')) {
//         var scriptLink = $(this).attr('data-script');
//     }
//
//     // checking if the name of this extra script is included in the name of extrascript keys, defined above
//     if (checkExtraScript($(this).attr('data-scriptextra'))) {
//         var extrascript = extraScriptArray[$(this).attr('data-scriptextra')];
//     }
//
//     //if the page is not animating - trigger animation
//     if( !isAnimating ) changePage(newPage, true, scriptLink, extrascript);
// });


// when first landing on page
$(window).on('load', function() {
    // set speed of layer change
    checkTransitionSpeed(transitionSpeed);
    // remove layer covering page
    if (pageTransitionLayer.hasClass(pageTransitionClass)) {
        pageTransitionLayer.removeClass(pageTransitionClass);
    };
    // if any script is needed from scriptArray
    if ($(mainWrapper)[0].hasAttribute('data-script')) {
        if (checkScript($(mainWrapper).attr('data-script'))) {
            scriptArray[$(mainWrapper).attr('data-script')].apply();
        }
    }
    // if extra script like axios needed
    if (checkExtraScript($(mainWrapper).attr('data-scriptextra'))) {
        $.getScript(extraScriptArray[$(mainWrapper).attr('data-scriptextra')])
    }
});


// when pressing back/forward key
$(window).on('popstate', function() {
    checkTransitionSpeed(transitionSpeed);
    // get page url, to get html content, to then check if new page #mainpage has any data attributes for scripts
    var currentUrl = window.location.href;
    // set variables here to then set with value if found on new page html
    var scriptTagLoad = false;
    var extraScriptTagLoad = false;
    $.when(
        $.get(currentUrl, function(html) {
            var doc = $(html);
            // if any script is needed from pagescripts
            if (doc.find(mainWrapper)[0].dataset.hasOwnProperty('script')) {
                scriptTagLoad = doc.find(mainWrapper)[0].dataset.script;
            }
            // if extra script like axios needed
            if (doc.find(mainWrapper)[0].dataset.hasOwnProperty('extrascript')) {
                if (checkExtraScript(doc.find(mainWrapper)[0].dataset.extrascript)) {
                    extraScriptTagLoad = extraScriptArray[doc.find(mainWrapper)[0].dataset.extrascript];
                }
            }
        }),
    ).then(function(){
        if( !isAnimating ) changePage(window.location.href, true, scriptTagLoad, extraScriptTagLoad);
    });
});



function checkTransitionSpeed() {
    // checking the transition speed is set for the animation
    if (!pageTransitionLayer.attr('style')) {
        pageTransitionLayer.css('transition', 'transform ' + transitionSpeed +'ms cubic-bezier(.5,.07,.2,1)');
    }
};


function changePage(url, bool, scriptLink, extrascript) {
    isAnimating = true;
    // trigger page animation
    if (!(pageTransitionLayer.hasClass(pageTransitionClass))) {
        pageTransitionLayer.addClass(pageTransitionClass);
    };
    loadNewContent(url, bool, scriptLink, extrascript);
}


function loadNewContent(url, bool, scriptLink, extrascript) {
    // get page content, store in array
    var content = [];
    var newPageScript;
    var newPageExtraScript;
    $.when(
        // html content
        $.get(url, function(html) {
            var doc = $(html);
            content.html = doc.find('#mainwrap > *');
            // getting script and extra script name from new content
            if (doc.find('#mainwrap').attr('data-script')) {
                newPageScript = doc.find('#mainwrap').attr('data-script');
            }
            if (doc.find('#mainwrap').attr('data-scriptextra')) {
                newPageExtraScript = doc.find('#mainwrap').attr('data-scriptextra');
            }
        }),
    ).then(function() {
        // wrapped in setTimeout to fire once the css animation is done
        setTimeout(function() {
            nav_reset();
            // load new content and replace .mainwrap content with the new one
            function getAllContent() {
                $.when(
                    // loading new content
                    $(mainWrapper).empty().html(content.html),
                ).then(function() {
                    // setting the new mainwrap to have the right script names
                    if (newPageScript) {
                        $(mainWrapper).attr('data-script',newPageScript);
                    }
                    if (newPageExtraScript) {
                        $(mainWrapper).attr('data-scriptextra',newPageExtraScript);
                    }
                });
            };
            // scripts - these are called and executed
            function getAllScripts() {
                // if any script is needed from pagescripts
                if (newPageScript) {
                    if (checkScript(newPageScript)) {
                        scriptArray[newPageScript].apply();
                    }
                }
                // if extra script like axios needed
                if (newPageExtraScript) {
                    if (checkExtraScript($(mainWrapper).attr('data-scriptextra'))) {
                        $.getScript(extraScriptArray[$(mainWrapper).attr('data-scriptextra')])
                    } else {
                        removeAnimationClass();
                    }
                } else {
                    removeAnimationClass();
                }
            };
            $.when(getAllContent()).then(getAllScripts());
            // remove animating class
            function removeAnimationClass() {
                setTimeout(function() {
                    pageTransitionLayer.removeClass(pageTransitionClass);
                    isAnimating = false;
                }, 200);
            };
            //add the new page to the window.history
            if(url != window.location){
               window.history.pushState({path: url},'',url);
            }
        }, transitionSpeed);
    });
}


// checking if extra script exists in the object of extrascripts, comparing the keys
function checkExtraScript(scriptName) {
    return scriptName && (extraScriptArrayKeys.indexOf(scriptName) > -1);
};

// checking if script exists in the object of scripts, comparing the keys
function checkScript(scriptName) {
    return scriptName && (scriptArrayKeys.indexOf(scriptName) > -1);
};


// setting nav reset, for mobile stuff
function nav_reset() {
    if ($('body').hasClass('__mobile')) {
        $('.burger').removeClass('__active');
        $('.navwindow').hide();
        $('body').removeClass('__mobile');
        $('.navwrap').removeClass('__active');
        $('.navwrap ul.__active').removeClass('__active');
    }
};
