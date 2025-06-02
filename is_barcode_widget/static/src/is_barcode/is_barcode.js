/** @odoo-module **/

import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { CharField } from "@web/views/fields/char/char_field";
import { onMounted, onWillStart, onWillUnmount, useRef, useState } from "@odoo/owl";

const BARCODE_SCAN_DELAY = 100;


export class BarcodeScanWidget extends CharField {
    static template = "is_barcode_widget.BarcodeScanWidget";


    setup() {
        super.setup();

        console.log('Setup this.__owl__.status', this.__owl__.status);
        console.log('Setup this.props', this.props);

        this.orm = useService("orm");
        this.notification = useService("notification");
        this.action = useService("action");
        this.barcodeBuffer = "";
        this.lastInputTime = 0;
        this.barcodeTimeout = null;
        this.state = useState({
            isScanning: false,
        });

        this.barcodeInputRef = useRef("barcodeInput");
        console.log('Setup this.barcodeInputRef', this.barcodeInputRef, this.barcodeInputRef.el);

        // Surveiller les changements de status
        // this._statusWatcher = setInterval(() => {
        //     if (this.__owl__.status === 3) {
        //         console.error('⚠️ Component passed to ERROR state!');
        //         console.error('Stack trace:', new Error().stack);
        //         clearInterval(this._statusWatcher);
        //     }
        // }, 50);

        onMounted(() => {
            console.log('onMounted this.barcodeInputRef', this.barcodeInputRef, this.barcodeInputRef.el);
            if (this.barcodeInputRef.el) {
                this.barcodeInputRef.el.focus();

                console.log('onMounted - this.barcodeInputRef.el:',  this.barcodeInputRef.el);


            }
            document.addEventListener('keydown', this._globalKeydownHandler);
        });
        onWillStart(this.willStart);
        onWillUnmount(this.willUnmount);
    }


    willStart() {
        console.log('willStart - Component status:', this.__owl__.status);
    }


    willUnmount() {
        console.log('willUnmount - Component status:', this.__owl__.status);
        // if (this._statusWatcher) {
        //     clearInterval(this._statusWatcher);
        // }
    }


    _globalKeydownHandler = (ev) => {
        // Intercepte le scan si l'input du widget n'est pas déjà focus ou si un autre élément n'a pas la main
        // Ajout d'une condition pour ne pas intercepter si Ctrl, Alt, Meta sont pressés (raccourcis claviers Odoo)
        if (!ev.ctrlKey && !ev.altKey && !ev.metaKey &&
            (!this.barcodeInputRef.el || document.activeElement !== this.barcodeInputRef.el)) {
            this.onKeyDown(ev);
        }
    }

    onKeyDown(ev) {
        // Ne pas appeler stopPropagation ici si vous voulez que d'autres gestionnaires de clés soient exécutés.
        // Si vous voulez qu'il soit le seul à gérer les frappes du scanner, laissez-le.
        // ev.stopPropagation(); // Décommentez si vous rencontrez des interférences
        const currentTime = new Date().getTime();
        if (currentTime - this.lastInputTime > BARCODE_SCAN_DELAY) {
            this.barcodeBuffer = "";
        }
        if (ev.key === 'Enter') {
            if (this.barcodeBuffer) {
                this.state.isScanning = true;
                // MISE À JOUR ICI : Mettre à jour les champs du formulaire AVANT l'appel au serveur
                this.updateFormFields(this.barcodeBuffer);
                this.handleBarcodeScan(this.barcodeBuffer);
                this.barcodeBuffer = "";
            }
        } else if (ev.key.length === 1) { // S'assurer que c'est un caractère imprimable
            this.barcodeBuffer += ev.key;
            this.lastInputTime = currentTime;
            //this.state.isScanning = true;
            clearTimeout(this.barcodeTimeout);
            this.barcodeTimeout = setTimeout(() => {
                this.barcodeBuffer = "";
                this.state.isScanning = false;
            }, BARCODE_SCAN_DELAY * 2);
        }
    }


    //Le champ à le focus
    onFocus() {
        console.log('onFocus');
        //this.state.isScanning = true;
    }

    //Le champ perd le focus
    onBlur() {
        console.log('onBlur');
        //this.state.isScanning = false;
        this.barcodeBuffer = "";
        clearTimeout(this.barcodeTimeout);
    }

    /**
     * Met à jour les champs du formulaire du modèle product.barcode.scanner
     * avec les informations du code-barres scanné.
     */
    updateFormFields(scannedBarcode) {
        // Mettre à jour le champ barcode_scan du record du formulaire
        this.props.record.update({
            barcode_scan: scannedBarcode,
        });
    }


    async handleBarcodeScan(barcode) {



        console.log('Full OWL state:', {
            status: this.__owl__.status,
            error: this.__owl__.error,
            isMounted: this.__owl__.isMounted,
            isDestroyed: this.__owl__.isDestroyed,
            parent: this.__owl__.parent,
            children: this.__owl__.children
        });

        if (this.__owl__.parent) {
            console.log('Parent state:', {
                isScanning: this.state.isScanning,
                status: this.__owl__.parent.status,
                error: this.__owl__.parent.error
            });
        }


        var result=false;
        if (this.__owl__.parent.status===1) {



            console.log('=== APPEL on_barcode_scanned ===', {
                resModel: this.props.record.resModel,
                method: 'on_barcode_scanned',
                args: [barcode]
            });
            try {
                    result = await this.orm.call(
                        this.props.record.resModel,
                        'on_barcode_scanned',
                        [barcode]
                    );



                    console.log('=== SUCCÈS on_barcode_scanned ===', {
                        resModel: this.props.record.resModel,
                        result: result,
                        barcode: barcode
                    });
                    //return result;
            } catch (error) {
                console.log('=== ERREUR ORM on_barcode_scanned ===', {
                    resModel: this.props.record.resModel,
                    TypeErreur: error.constructor.name,
                    Stack:  error.stack,
                    Erreur: error,
                    data: error.data,
                });                
                throw error;
            }
        }


        // if (result && result.type === 'ir.actions.act_window') {
        //     this.notification.add("Article créé avec succès!", { type: 'success' });
        //     this.action.doAction(result); // Exécuter l'action pour ouvrir le nouvel article
        // } else {
        //     this.notification.add("Aucune action de redirection n'a été retournée.", { type: 'info' });
        // }
        // } catch (error) {
        //     console.error("Erreur dans l'application"); //, error);
        //     //this.notification.add(error.message.data.message || "Erreur lors de la création de l'article.", { type: 'danger' });
        // }
        



        if (result && result.barcode) {
            this.notification.add(result.barcode, { type: 'success' });
            // Réinitialiser les autres champs du formulaire pour le prochain scan
            this.props.record.update({
                barcode_scan: result.barcode,
                // product_category_id: this.env.ref('product.product_category_all').id, // Remet la catégorie par défaut si nécessaire
            });
        } 
        // else {
        //     this.notification.add("Aucune action de redirection n'a été retournée.", { type: 'info' });
        // }

        this.props.update(null); // Réinitialise le champ 'barcode_input' dans le modèle du formulaire
        if (this.barcodeInputRef.el) {
            this.barcodeInputRef.el.value = '';
            this.barcodeInputRef.el.focus(); // Remettre le focus pour le prochain scan
        }
    }
}

//BarcodeScanWidget.template = "is_barcode_widget.BarcodeScanWidget";
BarcodeScanWidget.components = { CharField };
BarcodeScanWidget.legacy = true;

registry.category("fields").add("barcode_scan_widget", BarcodeScanWidget);

