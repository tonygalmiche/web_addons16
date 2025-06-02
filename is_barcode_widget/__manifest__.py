# -*- coding: utf-8 -*-
{
    'name': 'is_barcode_widget',
    'version': '1.0',
    'summary': 'Module Odoo pour scanner des codes-barres avec un widget',
    'description': """
        Module Odoo pour scanner des codes-barres avec un widgets.
    """,
    'author'   : 'InfoSaône',
    'category' : 'InfoSaône',
    'website': 'https://infosaone.com',
    'depends': ['base', 'web'],
    'data': [
    ],
    'assets': {
        'web.assets_backend': [
            'is_barcode_widget/static/src/is_barcode/is_barcode.xml',
            'is_barcode_widget/static/src/is_barcode/is_barcode.js',
            'is_barcode_widget/static/src/is_barcode/is_barcode.scss',
        ],
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
