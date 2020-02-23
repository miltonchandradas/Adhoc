sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/core/Fragment',
	'sap/ui/model/Filter',
	'sap/ui/model/json/JSONModel',
	'sap/m/Token',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/ui/comp/library'
], function (Controller, Fragment, Filter, JSONModel, Token, FilterOperator, typeString, ColumnListItem, Label, SearchField, compLibrary) {
	"use strict";
	

	return Controller.extend("com.sap.Adhoc.controller.App", {
		onInit: function () {

			this._oMultiInput = this.getView().byId("newCorrespondence");
			//this._oMultiInput.setTokens(this._getDefaultTokens());

			this.oColModel = new JSONModel(sap.ui.require.toUrl("com/sap/Adhoc/model") + "/columnsModel.json");

			this.oTodoModel = this.getOwnerComponent().getModel();
			this.getView().setModel(this.oTodoModel);
		},
		
		onSelectionChange: function (e) {
			/*var params = e.getParameters();
			var changedItem = params.changedItem;*/
			//alert (`Selected item: key - ${changedItem.getKey()}, text - ${changedItem.getText()}, isSelected - ${params.selected}`);
			
			
		},
		
		
		/*********************************************************************************************/
		
		handleChange: function (oEvent) {
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState("Error");
				oValidatedComboBox.setValueStateText("Please enter a valid correspondence method...");
			} else {
				oValidatedComboBox.setValueState("None");
			}
		},
		
		/*********************************************************************************************/
		
		handleValueHelp : function (oController) {
			var aCols = this.oColModel.getData().cols;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			this._oValueHelpDialog = sap.ui.xmlfragment("com.sap.Adhoc.Fragments.Dialog", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.getFilterBar().setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oTodoModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({ text: "{" + column.template + "}" });
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			var oToken = new Token();
			oToken.setKey(this._oMultiInput.getSelectedKey());
			oToken.setText(this._oMultiInput.getValue());
			this._oValueHelpDialog.setTokens([oToken]);
			
			this._oValueHelpDialog.open();
			
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setSelectedKey(aTokens[0].getKey());
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
		},

		onFilterBarSearch: function (oEvent) {
			var sSearchQuery = this._oBasicSearchField.getValue(),
				aSelectionSet = oEvent.getParameter("selectionSet");
			var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.Contains,
						value1: oControl.getValue()
					}));
				}

				return aResult;
			}, []);

			aFilters.push(new Filter({
				filters: [
					new Filter({ path: "title", operator: FilterOperator.Contains, value1: sSearchQuery }),
					new Filter({ path: "completed", operator: FilterOperator.Contains, value1: sSearchQuery })
				],
				and: false
			}));

			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		}
	});
});