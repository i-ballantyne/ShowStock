define([
    'jquery'
], function ($) {
    'use strict';

    return function (widget) {

        $.widget('mage.configurable', widget, {

            input: '',
            lastInput: '',

            /**
             * Populates an option's selectable choices.
             * @private
             * @param {*} element - Element associated with a configurable option.
             */
            _fillSelect: function (element) {
                var attributeId = element.id.replace(/[a-z]*/, ''),
                    options = this._getAttributeOptions(attributeId),
                    prevConfig,
                    index = 1,
                    allowedProducts,
                    i,
                    j,
                    basePrice = parseFloat(this.options.spConfig.prices.basePrice.amount),
                    optionFinalPrice,
                    optionPriceDiff,
                    optionPrices = this.options.spConfig.optionPrices,
                    allowedProductMinPrice;

                this.input = $('#' + element.id);
                this.lastInput = $('.super-attribute-select').last();

                this._clearSelect(element);
                element.options[0] = new Option('', '');
                element.options[0].innerHTML = this.options.spConfig.chooseText;
                prevConfig = false;

                if (element.prevSetting) {
                    prevConfig = element.prevSetting.options[element.prevSetting.selectedIndex];
                }

                if (options) {
                    for (i = 0; i < options.length; i++) {
                        allowedProducts = [];
                        optionPriceDiff = 0;

                        /* eslint-disable max-depth */
                        if (prevConfig) {
                            for (j = 0; j < options[i].products.length; j++) {
                                // prevConfig.config can be undefined
                                if (prevConfig.config &&
                                    prevConfig.config.allowedProducts &&
                                    prevConfig.config.allowedProducts.indexOf(options[i].products[j]) > -1) {
                                    allowedProducts.push(options[i].products[j]);
                                }
                            }
                        } else {
                            allowedProducts = options[i].products.slice(0);

                            if (typeof allowedProducts[0] !== 'undefined' &&
                                typeof optionPrices[allowedProducts[0]] !== 'undefined') {
                                allowedProductMinPrice = this._getAllowedProductWithMinPrice(allowedProducts);
                                optionFinalPrice = parseFloat(optionPrices[allowedProductMinPrice].finalPrice.amount);
                                optionPriceDiff = optionFinalPrice - basePrice;

                                if (optionPriceDiff !== 0) {
                                    options[i].label = options[i].label + ' ' + priceUtils.formatPrice(
                                        optionPriceDiff,
                                        this.options.priceFormat,
                                        true);
                                }
                            }
                        }

                        options[i].allowedProducts = allowedProducts;
                        element.options[index] = new Option(this._getOptionLabel(options[i]), options[i].id);

                        if(this.input.attr('id') == this.lastInput.attr('id')) {
                            if(!this._getStock(options[i])) {
                                element.options[index].disabled = 'disabled';
                            }
                        }

                        if (typeof options[i].price !== 'undefined') {
                            element.options[index].setAttribute('price', options[i].price);
                        }

                        element.options[index].config = options[i];
                        index++;

                        /* eslint-enable max-depth */
                    }
                }
            },

            _getStock: function(option) {
                var optionId = option.id;
                if(option.allowedProducts.length == 0) {
                    return 0;
                }

                var key = '';
                $('.super-attribute-select').each(function() {
                    if($(this).not('.super-attribute-select:last-child')) {
                        var optId =  $(this).children("option:selected").val();

                        if(optId) {
                            key += String(optId) + '-';
                        }
                    }
                });
                key += optionId;

                var qty =  this.options.spConfig.stockConfig[key];

                return qty;
            },

            /**
             * Generate the label associated with a configurable option. This includes the option's
             * label or value and the option's price.
             * @private
             * @param {*} option - A single choice among a group of choices for a configurable option.
             * @return {String} The option label with option value and price (e.g. Black +1.99)
             */
            _getOptionLabel: function (option) {
                var label = option.label;

                if(this.input.attr('id') == this.lastInput.attr('id')) {
                    var qty = this._getStock(option);
                    if(qty) {
                        label += ' - ' + String(qty) + ' ' + this.options.spConfig.stockConfig['in_stock_label'];
                    }

                    return label;
                }

                return label;
            },



        });

        return $.mage.configurable;

    }

});