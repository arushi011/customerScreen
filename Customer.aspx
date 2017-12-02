<%@ Page Language="C#" MasterPageFile="~/Admin/iAutomateAdmin/AdminMaster.master" AutoEventWireup="true" CodeFile="Customer.aspx.cs" Inherits="Admin_iAutomateAdmin_iAutomateScreens_Customer" %>

<asp:Content ID="Content1" ContentPlaceHolderID="ContentPlaceHolder1" runat="Server">
    <script src="../js/jszip.js" type="text/javascript"></script>
    <script src="../js/xlsx.js" type="text/javascript"></script>
    <script src="../js/linq.js" type="text/javascript"></script>
    <meta http-equiv="X-UA-Compatible" content="IE=11" />
    <asp:ScriptManager ID="ScriptManager1" runat="server" EnablePageMethods="true">
    </asp:ScriptManager>
    <style>
        .filterIcon {
            background-image: url('../../Images/DF.png');
            background-repeat: no-repeat;
            background-position: right;
            cursor: pointer;
        }

            .filterIcon:active {
                background-image: url('../../Images/dynamic-filter.png');
            }

        /*tr:hover {
            background-color: lightyellow;
        }*/

        .textValidator {
            background: url('../../../Images/ajax-loader.gif');
            background-repeat: no-repeat;
        }

        .textValidationSuccess {
            background: url('../../../Images/tick-icon.png');
            background-repeat: no-repeat;
            height: 22px;
        }

        .textValidationError {
            background: url('../../../Images/no.gif');
            background-repeat: no-repeat;
        }

        .km-switch-on .km-switch-container {
            background-color: rgb(19,95,143);
        }

        .km-switch-off .km-switch-container {
            background-color: #CCC;
        }

        .k-switch {
            border-width: 0px;
            background-color: transparent;
        }

        .multiSelect .k-multiselect-wrap {
            overflow: auto;
            max-height: 100px;
        }

            .multiSelect .k-multiselect-wrap .k-button {
                clear: left;
            }

        #nestedFilters table {
            width: 95%;
            float: right;
        }

        .nestedRow {
            background-color: #B2BFC8;
        }

        #nestedFilters table th {
            line-height: 5px;
        }

            #nestedFilters table th:first-child {
                border-left-color: #456b92;
                border-left-width: 2px;
            }

        .nestedFilter {
            background-color: white;
        }

        #nestedFilters table td:first-child {
            border-left-color: #456b92;
            border-left-width: 2px;
            padding-left: 0;
        }

        #filters div table th:first-child {
            border-left-color: #456b92;
            border-left-width: 2px;
        }

        #filters div table td:first-child {
            border-left-color: #456b92;
            border-left-width: 2px;
            padding-left: 0;
        }

        svg {
            height: 60px;
            width: 5%;
        }

        .modal, .modal-dialog, .modal-content {
            height: 100%;
        }

        .modal-header, .modal-footer {
            height: 10%;
        }

        .modal-body {
            height: 80%;
        }
    </style>
    <link href="../CSS/iAutomate_Admin.css" rel="stylesheet" />
    <script src="../js/customer.js"></script>
    <div style="float: right" id="addCustomer">
        <input value="Add New" class="create-runbook" type="button" data-bind="visible: isAddCustomerVisible" onclick="    customerActions.addCustomer();" />
    </div>
    <h1>Customer</h1>
    <div id="customerView" class="form-tbl" style="margin-top: 20px;">
        <div id="allCustomersGrid" data-bind="visible: isCustomerGridVisible">
        </div>
        <script type="text/x-kendo-template" id="editCustomer">
            <center>
            <span><img style="cursor:pointer" title="delete" src='../iAutomateImages/delete.png' onclick="customerActions.deleteCustomer('#:nmCustomerId#')" ></span>
            <span><img style="cursor:pointer" title="edit" src="../../Images/EditItem.png" onclick="customerActions.editCustomer('#:nmCustomerId#')" />  </span>
            </center>
        </script>
        <div id="customerInformation" data-bind="invisible: isCustomerGridVisible">
            <table class="form-tbl" style="margin-bottom: 10px" width="100%" cellspacing="0" cellpadding="0" bordercolor="#ccc" border="1">
                <tbody>
                    <tr>
                        <td>
                            <label>Customer Name <i class="mandatory">*</i></label></td>
                        <td>
                            <input name="" maxlength="50" id="" data-bind="value: customerName, enabled: isCustomerNameEditable, events: { change: customerNameChanged }" class="tagsearch k-textbox" placeholder="Enter Customer Name" style="max-width: 100%; background-color: rgb(255, 255, 204);" type="text" />
                        </td>
                        <td>
                            <div data-bind="css: { textValidator: doValidate, textValidationSuccess: isValidated, textValidationError: isNotValidated }" id="ImgValidateCustomer">&nbsp;</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label>Logo</label></td>
                        <td>
                            <input type="file" name="" id="filePicker" style="max-width: 100%;" onchange="customerActions.changeLogo(this)" accept="image/*" />
                        </td>
                        <td id="logoImg">
                         
                        </td>
                    </tr>
                    <tr style="display: none">
                        <td>
                            <label>Status</label></td>
                        <td colspan="2">
                            <input type='checkbox' id='statusSwitch' data-role='kendo.mobile.ui.Switch' data-off-label='I' data-on-label='A' data-bind="checked: isActive, events: { change: statusChanged }" /></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div id="sourceCustomerMapping" data-bind="visible: isSourceGridVisible">
            <div id="sourceCustomerMappingGrid" style="min-height: 350px; max-height: 350px; overflow-y: auto">
                <table style="width: 100%">
                    <thead>
                        <tr>
                            <th>Data Source</th>
                            <th>Map To Customer/Domain in the Data Source</th>
                        </tr>
                    </thead>
                    <tbody data-template="source-customer-mapping-row-template" data-bind="source: sources"></tbody>
                </table>
                <script id="source-customer-mapping-row-template" type="text/x-kendo-template">
                    <tr>
                        <td width='30%'>
                            <input type='checkbox' data-bind="checked: isSelected, value: sourceId, disabled: isDisabled, events: { change: sourceChanged }" />
                            <span data-bind="text: sourceName"></span>
                        </td>
                        <td width='70%;'>
                            <div style="max-height:150px;overflow-y:auto">
                                <table style='width:100%'>
                                    <tbody data-template='multiSelectTemplateKeyIdentifiers' data-bind='source:keyIdentifiers'></tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                </script>
                <script id='multiSelectTemplateKeyIdentifiers' type="text/x-kendo-template">
                    <tr>
                        <td width='10%'><input type='checkbox' data-bind="checked: isKeyIdentifierSelected,value:keyIdentifierValue, events:{change:identifierChanged},disabled:isDisabled" /></td>
                        <td width='90%' data-bind="text: keyIdentifierName"></td>
                    </tr>
                </script>
            </div>
        </div>
        <div id="sourceSubTypeMapping" data-bind="visible: isSubTypeGridVisible">
            <div id="sourceSubTypeMappingGrid" style="min-height: 350px; max-height: 350px; overflow-y: auto">
                <table style="width: 100%">
                    <thead>
                        <tr>
                            <th>Select</th>
                            <th>Start Analysis</th>
                            <th>Source</th>
                            <th>Module</th>
                        </tr>
                    </thead>
                    <tbody data-template="source-sub-type-mapping-row-template" data-bind="source: subTypes"></tbody>
                </table>
                <script id="source-sub-type-mapping-row-template" type="text/x-kendo-template">
                    <tr>
                        <td width='10%'><input type='checkbox' data-bind="checked: isSubTypeSelected,value:subTypeId" /></td>
                        <td width='20%'><input type='checkbox' id='statusSwitch' data-role='kendo.mobile.ui.Switch' data-off-label='I' data-on-label='A' data-bind="checked: isAnalysisStart" /></td>
                        <td width='20%' data-bind="text: sourceName"></td>
                        <td width='70%'><div class='filterIcon' data-toggle='modal' data-target='\#filters' data-bind="text: subTypeName,events:{click:openFilter}"></div></td>
                    </tr>
                </script>
            </div>
            <div id="filters" style="display: none" class="fade fullwidth-popup modal modal-primary document-view" role="dialog">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-bind="events: { click: closeFilter }" data-dismiss="modal" aria-expanded="false">×</button>
                            <h4 class="modal-title">Filters</h4>
                        </div>
                        <div class="modal-body" style="background-color: #fff">
                            <div class="row">
                                <div class="col-md-12">
                                    <table style="width: 100%">
                                        <thead>
                                            <tr>
                                                <th>Column</th>
                                                <th>Operator</th>
                                                <th>Value</th>
                                                <th>Clause</th>
                                                <th>Sub Clause</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody data-template="source-filters-mapping-row-template" data-bind="source: schema.filters"></tbody>
                                    </table>

                                    <script id="source-filters-mapping-row-template" type="text/x-kendo-template">
                        <tr>
                            <td width='20%'><select style='width:90%;margin-left:10px;' data-role='dropdownlist' data-value-primitive="true" data-text-field="text" data-value-field="value" data-bind="source:columns,value:column, events:{change:columnChanged}"></select></td>
                            <td width='10%'><select style='width:90%' data-role='dropdownlist' data-value-primitive="true" data-text-field="text" data-value-field="text" data-bind="source:operators,value:operator,events:{change:operatorChanged}"></select></td>
                            <td width='30%'>
                                <div>
                                    <select data-role="multiselect" data-placeholder="Type or select a value" data-text-field="text" data-value-field="value" data-bind="value: selectedValue, source: masterValues,visible: isMultiSelect, events:{change:multiSelectChanged}"></select>
                                    <input data-role="upload" type="file" accept=".csv" data-localization="{select: 'upload csv'}" data-multiple='false'  data-bind="visible: isCsvControlVisible, events:{select:browseCsv, change:csvChanged}"></input>
                                    <select data-role="multiselect"  data-placeholder="Type or select a value" data-text-field="text" data-value-field="value" class='multiSelect' data-bind="value: selectedValue, source: csvValues,visible: isMultiSelectCsvControlVisible, events:{change:csvMultiSelectChanged}"></select>
                                    <input class='tagsearch k-textbox' placeholder='Enter Value' style='width:90%;background-color: rgb(255, 255, 204);' type='text' data-bind='value:value,visible:isTextControlVisible'/>
                                </div>
                            </td>
                            <td width='15%'>
                                <select style='width:90%' data-role='dropdownlist' data-value-primitive="true" data-text-field="text" data-value-field="value" data-bind="source:clauses,value:clause,events:{change:parent().clauseChanged}"></select>
                            </td>
                            <td width='15%'>
                        <select data-role='dropdownlist' data-bind="source:subClauses,value:subClause,events:{change:showNestedFilters}" style='width:90%' data-auto-bind="false" data-value-primitive="false" data-text-field="text" data-value-field="value"></select>
                            </td>
                        
                            <td width='10%'>
                        <img style='cursor:pointer' src='../iAutomateImages/arrowup.png' data-bind='events:{click:killNestedFilter},visible:arrowUpVisible'/>
                        <img style='cursor:pointer' src='../iAutomateImages/arrowdown.png' data-bind='events:{click:showNestedFilters},visible:arrowDownVisible'/>
                        <img style='cursor:pointer' src='../iAutomateImages/delete.png' data-bind='events:{click:parent().deleteFilter},visible:deleteRowVisible'/></td>
                        </tr>
                                    </script>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <div class="row">
                                <div class="col-md-9">
                                    <input type="text" id="txtCreatedQuery" data-bind="value: CreateQuery" class='tagsearch k-textbox' placeholder='' style='background-color: rgb(255, 255, 204);' />
                                </div>
                                <div class="col-md-3">
                                    <input type="button" class="k-button close-button" data-bind="events: { click: saveFilter }" data-dismiss="modal" value="Save" />
                                    <input type="button" class="k-button close-button" data-bind="events: { click: closeFilter }" data-dismiss="modal" value="Close" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <br />
            </div>

            <div id="nestedFilters" style="display: none">
                <svg xmlns='http://www.w3.org/2000/svg' version='1.1'>
                    <line x1="0" y1="99%" x2="100%" y2="99%" style="stroke: #456b92; stroke-width: 3"></line></svg>
                <table>
                    <thead>
                        <tr>
                            <th>Column</th>
                            <th>Operator</th>
                            <th>Value</th>
                            <th>Clause</th>
                            <th>Sub Clause</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody data-template="source-nestedFilters-mapping-row-template" data-bind="source: nestedFilters"></tbody>
                </table>

                <script id="source-nestedFilters-mapping-row-template" type="text/x-kendo-template">
                    
                    <tr class='nestedFilter'>
                            <td width='20%'><select style='width:90%;margin-left:10px;' data-role='dropdownlist' data-value-primitive="true" data-text-field="text" data-value-field="value" data-bind="source:columns,value:column, events:{change:columnChanged}"></select></td>
                            <td width='10%'><select style='width:90%' data-role='dropdownlist' data-value-primitive="true" data-text-field="text" data-value-field="text" data-bind="source:operators,value:operator,events:{change:operatorChanged}"></select></td>
                            <td width='30%'>
                                <div>
                                    <select data-role="multiselect" data-placeholder="Type or select a value" data-text-field="text" data-value-field="value" data-bind="value: selectedValue, source: masterValues,visible: isMultiSelect, events:{change:multiSelectChanged}"></select>
                                    <input data-role="upload" type="file" accept=".csv" data-localization="{select: 'upload csv'}" data-multiple='false'  data-bind="visible: isCsvControlVisible, events:{select:browseCsv, change:csvChanged}"></input>
                                    <select data-role="multiselect" data-placeholder="Type or select a value" data-text-field="text" data-value-field="value" class='multiSelect' data-bind="value: selectedValue, source: csvValues,visible: isMultiSelectCsvControlVisible, events:{change:csvMultiSelectChanged}"></select>
                                    <input class='tagsearch k-textbox' placeholder='Enter Value' style='width:90%;background-color: rgb(255, 255, 204);' type='text' data-bind='value:value,visible:isTextControlVisible'/>
                </div>
                            </td>
                            <td width='15%'>
                                <select data-role='dropdownlist' style='width:90%' data-value-primitive="true" data-text-field="text" data-value-field="value" data-bind="source:clauses,value:clause,events:{change:clauseChanged}"></select>
                            </td>
                            <td width='15%'>
                        <select data-role='dropdownlist' data-bind="source:subClauses,value:subClause,events:{change:showNestedFilters}" style='width:90%' data-auto-bind="false" data-value-primitive="false" data-text-field="text" data-value-field="value"></select>
                            </td>
                        
                            <td width='10%'>
                        <img style='cursor:pointer' src='../iAutomateImages/arrowup.png' data-bind='events:{click:killNestedFilter},visible:arrowUpVisible'/>
                        <img style='cursor:pointer' src='../iAutomateImages/arrowdown.png' data-bind='events:{click:showNestedFilters},visible:arrowDownVisible'/>
                        <img src='../iAutomateImages/delete.png' data-bind='events:{click:deleteFilter},visible:deleteRowVisible'></td>
                        </tr>
                </script>
            </div>
            <table id="childRow" style="display: none">
                <tr class="nestedRow">
                    <td colspan="6"></td>
                </tr>
            </table>
        </div>

        <div class="btns">
            <a href="javascript:void(0)" data-bind="events: { click: cancelEditingCustomer }, invisible: isCustomerGridVisible">Cancel</a>
            <a href="javascript:void(0)" data-bind="events: { click: showPreviousPanel }, visible: isSubTypeGridVisible">Previous</a>
            <a href="javascript:void(0)" data-bind="events: { click: showNextPanel }, visible: isSourceGridVisible">Next</a>
            <a href="javascript:void(0)" data-bind="events: { click: submitCustomer }, visible: isSubTypeGridVisible">Save</a>
        </div>

    </div>
</asp:Content>

