var page = require('webpage').create(),
    system = require('system'),
    address, output, size,
    resourceWait = 300,
    requestCount = 0,
    renderTimeout;

if (system.args.length < 3 || system.args.length > 5) {
    console.log('Usage: rasterize.js URL filename [paperwidth*paperheight|paperformat] [zoom]');
    console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
    phantom.exit(1);
} else {
    address = system.args[1];
    output = system.args[2];
    page.viewportSize = { width: 1024, height: 768 };
    if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
        size = system.args[3].split('*');
        page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
            : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
    }
    if (system.args.length > 4) {
        page.zoomFactor = system.args[4];
    }

    page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.101 Safari/537.36 PhantomJS';

    page.onResourceRequested = function (req) {
        requestCount += 1;
        clearTimeout(renderTimeout);
    };

    page.onResourceReceived = function (res) {
        if (!res.stage || res.stage === 'end') {
            requestCount -= 1;
            if (requestCount === 0) {
                renderTimeout = setTimeout(render, resourceWait);
            }
        }
    };

    function render() {
        clearTimeout(renderTimeout);
        page.render(output);
        phantom.exit();
    }

    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('Unable to load the address!');
            phantom.exit();
        }
    });
}