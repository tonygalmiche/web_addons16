# -*- coding: utf-8 -*-
{
    'name': 'is_barcode_widget_test',
    'version': '1.0',
    'summary': 'Test du module Odoo pour scanner des codes-barres avec un widget',
    'description': """
        Test du module Odoo pour scanner des codes-barres avec un widgets.
    """,
    'author'   : 'InfoSaône',
    'category' : 'InfoSaône',
    'website': 'https://infosaone.com',
    'depends': ['base', 'web'],
    'data': [
        'security/ir.model.access.csv',
        'views/product_barcode_scanner_views.xml',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
