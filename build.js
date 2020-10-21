/*jshint -W030 */
({
    paths: {
        jquery: "empty:",
        sdk: "empty:",
        hyprlive: "empty:",
        hyprlivecontext: "empty:",
        underscore: "vendor/underscore/underscore",
        backbone: "vendor/backbone/backbone"
    },
    dir: "compiled/scripts/",
    locale: "en-us",
    optimize: "uglify2",
    keepBuildDir: false,
    optimizeCss: "none",
    removeCombined: true,
    skipPragmas: true,
    modules: [
        {
            name: "modules/common",
            include: [
                'modules/api',
                'modules/backbone-mozu',
                'modules/cart-monitor',
                'modules/contextify',
                'modules/jquery-mozu',
                'modules/login-links',
                'modules/models-address',
                'modules/models-customer',
                'modules/models-documents',
                'modules/models-faceting',
                'modules/models-messages',
                'modules/models-product',
                'modules/scroll-nav',
                //'modules/search-autocomplete',
                'modules/views-collections',
                'modules/views-messages',
                'modules/views-paging',
                'modules/views-productlists',
                'modules/menu',
                'modules/minicart',
				        'modules/browser-info',
				        // 'modules/pepperjam',				
				        'modules/zinrelo',
                'modules/geodetect',
				        'pages/flavor-guides',
                'modules/new-lazy-load'
            ],
            exclude: ['jquery'],
        },
        {
            name: "pages/cart",
			include: [
            'modules/geodetect'
        ],
            exclude: ["modules/common"]
        },
        {
            name: "pages/category",
            include: [
            'modules/geodetect',
			'modules/add-to-wishlist-modal'
		],
            exclude: ["modules/common"]
        },
        {
            name: "pages/checkout",
            exclude: ["modules/common"]
        },
        {
            name: "pages/error",
            exclude: ["modules/common"]
        },
        {
            name: "pages/location",
            exclude: ["modules/common"]
        },
        {
            name: "pages/myaccount",
            exclude: ["modules/common"]
        },
        {
            name: "pages/product",
            include: [
            'modules/geodetect',
            'modules/add-to-wishlist-modal'
          ],
            exclude: ["modules/common"]
        },
        {
            name: 'pages/search',
			include: [
            'modules/geodetect'
          ],
            exclude: ["modules/common"]
        }
    ]
});
