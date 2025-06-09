# -*- coding: utf-8 -*-
from odoo import models, fields, api   # type: ignore
from odoo.exceptions import UserError  # type: ignore
import time

class ProductBarcodeScanner(models.TransientModel):
    _name = 'product.barcode.scanner'
    _description = 'Product Barcode Scanner for New Product Creation'

    barcode_input = fields.Char(string='Input utilisé par le widget pour récupérer les données du scan')
    barcode_scan  = fields.Char(string='Champ mis à jour par le widget après le traitement')
    test_onchange = fields.Char(string='Champ de test du onchange')


    @api.onchange('barcode_scan')
    def onchange_barcode_scan(self):
        "Methode pour vérifier que la modification du champ 'barcode_scan' par le Widget est bien prise en compte"
        for obj in self:
            print(obj,obj.barcode_scan)
            obj.test_onchange = "TEST %s"%obj.barcode_scan


    @api.model
    def on_barcode_scanned(self, barcode):
        """
            Méthode appelée par le widget OWL après le scan pour retourner les valeurs
        """
        if not barcode:
            raise UserError("Le code-barres est vide. Veuillez scanner une étiquette.")

        existing_product = self.env['product.product'].search([('barcode', '=', barcode)], limit=1)
        # if existing_product:
        #     raise UserError(f"Un produit avec ce code-barres existe déjà : {existing_product.display_name}. Vous ne pouvez pas créer un doublon.")

        print("TEST",barcode,existing_product)

        #time.sleep(1)

        # new_product = self.env['product.product'].create({
        #     'name': self.product_name,
        #     'barcode': barcode,
        #     'default_code': barcode,
        #     'type': 'product',
        #     'categ_id': self.product_category_id.id,
        # })
        return {'barcode': "%s scanné"%barcode}

        # Rafraîchir le formulaire en cours sans créer de produit
        return {
            'type': 'ir.actions.client',
            'tag': 'reload',
        }


        # return {
        #     'type': 'ir.actions.act_window',
        #     'name': 'Scan',
        #     'res_model': 'product.product',
        #     'res_id': new_product.id,
        #     'view_mode': 'form',
        #     'target': 'current',
        #     'context': {'default_name': new_product.name},
        # }
