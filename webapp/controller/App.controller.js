sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	'sap/m/Token',
	'sap/ui/model/FilterOperator'
], function (Controller, Fragment, Filter, JSONModel, Token, FilterOperator) {
	"use strict";

	return Controller.extend("com.sap.Adhoc.controller.App", {
		onInit: function () {

		},
		
		onSelectionChange: function (e) {
			var params = e.getParameters();
			var changedItem = params.changedItem;
			alert (`Selected item: key - ${changedItem.getKey()}, text - ${changedItem.getText()}, isSelected - ${params.selected}`);
			
			
		},
		
		
		/*********************************************************************************************/
		
		handleValueHelp : function (oController) {
			this.inputId = oController.oSource.sId;
			// create value help dialog
			if (!this._valueHelpDialog) {
				this._valueHelpDialog = sap.ui.xmlfragment(
					"com.sap.Adhoc.Fragments.Dialog",
					this
				);
				this.getView().addDependent(this._valueHelpDialog);
			}

			// open value help dialog
			this._valueHelpDialog.open();
		},

		_handleValueHelpSearch : function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"title",
				sap.ui.model.FilterOperator.Contains, sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleValueHelpClose : function (evt) {
			var oSelectedItem = evt.getParameter("selectedItem");
			if (oSelectedItem) {
				var productInput = this.byId(this.inputId);
				productInput.setValue(oSelectedItem.getTitle());
			}
			evt.getSource().getBinding("items").filter([]);
		},
		
		
		/*********************************************************************************************/
		
		handleMultiValueHelp: function (oEvent) {
			var sInputValue = oEvent.getSource().getValue();

			// create value help dialog
			if (!this._multiValueHelpDialog) {
				Fragment.load({
					id: "valueHelpDialog",
					name: "com.sap.Adhoc.Fragments.MultiDialog",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._multiValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._multiValueHelpDialog);
					this._openValueHelpDialog(sInputValue);
				}.bind(this));
			} else {
				this._openValueHelpDialog(sInputValue);
			}
		},

		_openValueHelpDialog: function (sInputValue) {
			// create a filter for the binding
			this._multiValueHelpDialog.getBinding("items").filter([new Filter(
				"title",
				FilterOperator.Contains,
				sInputValue
			)]);

			// open value help dialog filtered by the input value
			this._multiValueHelpDialog.open(sInputValue);
		},

		_handleMultiValueHelpSearch: function (evt) {
			var sValue = evt.getParameter("value");
			var oFilter = new Filter(
				"title",
				FilterOperator.Contains,
				sValue
			);
			evt.getSource().getBinding("items").filter([oFilter]);
		},

		_handleMultiValueHelpClose: function (evt) {
			var aSelectedItems = evt.getParameter("selectedItems"),
				oMultiInput = this.byId("multiInput");

			if (aSelectedItems && aSelectedItems.length > 0) {
				aSelectedItems.forEach(function (oItem) {
					oMultiInput.addToken(new Token({
						text: oItem.getTitle()
					}));
				});
			}
		}
	});
});