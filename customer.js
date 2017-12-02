$(document).ready(function () {
    service.getAllCustomers();
    kendo.bind('#customerView', customerViewModel);
    $('#btnImport').on("change", customerActions.browseExcel);
    $('#filePicker').on("change", function(){
        
    });
});
var service = {
    call: function (methodName, methodType, params, callback, showOverLay) {
        if (showOverLay)
            $('.overlay').show();
        $.ajax({
            type: methodType,
            url: "customer.aspx/" + methodName,
            data: params,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                $('.overlay').hide();
                var json = JSON.parse(response.d)
                if (json) {
                    callback(json);
                }
            },
            failure: function (response) {
                $('.overlay').hide();
                global.alert(response.d, global.DialogType_Error);
            },
            error: function (response) {
                $('.overlay').hide();
                global.alert(response.d, global.DialogType_Error);
            }
        });
    },
    getCustomer: function (customerId) {
        var callback = function (json) {
            if (json.customerId > 0)
                customerViewModel.set('isValidated', true);
            customerViewModel.set('customerId', json.customerId);
            customerViewModel.set('customerName', json.customerName);
            customerViewModel.set('customerLogoPath', json.customerLogoPath);
            customerViewModel.set('isActive', json.isActive);
            customerViewModel.set('isCustomerNameEditable', json.isCustomerNameEditable);
            customerViewModel.set('isKeyIdentifiersVisible', true);
            customerViewModel.sources.splice(0, customerViewModel.sources.length);//remove this
            customerViewModel.sources.push.apply(customerViewModel.sources, json.sources);//remove this

            if (json.source) {
                customerViewModel.source.set('sourceId', json.source.sourceId);

            }
            else {
            }
            customerViewModel.set('isCustomerGridVisible', false);
            customerViewModel.set('isSourceGridVisible', true);
            $('input[type=file]').val('');
            $('#logoImg').css('background-image', 'url("data:image/gif;base64,' + customerViewModel.customerLogoPath + '"');
            $('#logoImg').css('background-size', 'contain');
            $('#logoImg').css('background-size', 'contain');
            $('#logoImg').css('background-repeat', 'no-repeat');
            $('#addCustomer').hide();

        }
        var methodName = "GetCustomer";
        var methodTye = "POST";
        var params = JSON.stringify({ customerId: customerId });
        this.call(methodName, methodTye, params, callback, true);
    },
    getServiceSubTypes: function (callback) {
        var customerId = customerViewModel.customerId;
        var methodName = "GetServiceSubTypes";
        var methodTye = "POST";
        var isSourceSelected = $.grep(customerViewModel.sources, function (sources) {
            return sources.isSelected;
        });
        var selectedSourceIds = [];
        $.each(isSourceSelected, function (index, value) {
            selectedSourceIds[index] = value.sourceId;
        });
        var params = JSON.stringify({ customerId: customerId, selectedSourceIds: selectedSourceIds }); //changed here 20-11-2016
        this.call(methodName, methodTye, params, callback, true);
    },
    getFilterSchema: function (callback) {
        var envDetailAutoId = customerViewModel.envDetailAutoId;
        var methodName = "GetFilterSchema";
        var methodTye = "POST";
        var params = JSON.stringify({ envDetailAutoId: envDetailAutoId });
        this.call(methodName, methodTye, params, callback, true);
    },
    saveCustomerSource: function (callback) {
        var customerSourceModel = JSON.stringify(customerViewModel);
        var methodName = "SaveCustomerSource";
        var methodTye = "POST";
        var customerId = customerViewModel.customerId;
        var params = JSON.stringify({ customerId: customerId, json: customerSourceModel });
        this.call(methodName, methodTye, params, callback, true);

    },
    validateCustomer: function () {
        if (!customerViewModel.isValidated) {
            customerViewModel.openAlert("<p><strong>Customer</strong> is not validated.<p>");
            return false;
        }
        if (customerViewModel.customerName.trim().length == 0) {
            customerViewModel.openAlert("<p>Enter <strong>Customer</strong> name.<p>");
            return false;
        }
        var isSourceSubTypeSelected = $.grep(customerViewModel.subTypes, function (e) {
            return e.isSubTypeSelected == true;
        });
        var isSourceSelected = $.grep(customerViewModel.sources, function (e) {
            return e.isSelected == true;
        })
        if (isSourceSelected.length > 0) {
            if (isSourceSubTypeSelected.length == 0) {
                customerViewModel.openAlert("<p>Select <strong>Module</strong>.<p>");
                return false;
            }
        }
        return true;
    },
    getAllCustomers: function () {
        var customerSourceModel = JSON.stringify(customerViewModel);
        var methodName = "GetAllCustomers";
        var methodTye = "POST";
        var params = {};
        var callback = function (json) {
            customerViewModel.set('isAddCustomerVisible', json.isAddCustomerVisible);
            $("#allCustomersGrid").kendoGrid({
                dataSource: {
                    data: json.allCustomers,
                    schema: {
                        model: {
                            fields: {
                                vcCustomerName: { type: "string" },
                                vcCustomerDescription: { type: "string" }
                            }
                        }
                    },
                    pageSize: 10
                },
                height: '490',
                scrollable: true,
                sortable: true,
                filterable: true,
                pageable: {
                    input: true,
                    numeric: false
                },
                noRecords: {
                    template: "<div style='padding-top:100px;color:gray'>No data available.</div>"
                },
                columns: [
                    { field: "vcCustomerName", title: "Customer Name", headerTemplate: "<div style='color:white'>Customer Name</div>" },
                    {
                        field: "", title: "Action", template: function (data) {
                            if (data.isCustomerEditDeleteVisible)
                                return kendo.template($("#editCustomer").html())(data);
                            else
                                return kendo.template($('<div/>').html())(data);
                        }, width: "70px"
                    }
                ]
            });
            customerViewModel.set('isSourceGridVisible', false);
            customerViewModel.set('isSubTypeGridVisible', false);
            customerViewModel.set('isCustomerGridVisible', true);
            $('#addCustomer').show();
        };
        this.call(methodName, methodTye, params, callback, true);
    },
    validateCustomerName: function (customerName) {
        var methodName = "ValidateCustomerName";
        var methodTye = "POST";
        var params = JSON.stringify({ customerName: customerName });
        var callback = function (json) {
            customerViewModel.set('isValidated', json.isValidated);
            customerViewModel.set('isNotValidated', !json.isValidated);
        };
        this.call(methodName, methodTye, params, callback, false);
    },
    getDomains: function (sourceId) {
        var callback = function (json) {
            customerViewModel.set('isKeyIdentifiersVisible', true);
            var selectedSource = $.grep(customerViewModel.sources, function (data) {
                return data.sourceId == sourceId;
            });
            if (selectedSource.length > 0) {
                if (selectedSource[0].keyIdentifiers == null)
                    selectedSource[0].keyIdentifiers = [];
                selectedSource[0].keyIdentifiers.splice(0, selectedSource[0].keyIdentifiers.length);
                selectedSource[0].keyIdentifiers.push.apply(selectedSource[0].keyIdentifiers, json.domains);
            }
        }
        var methodName = "GetDomains";
        var methodTye = "POST";
        var params = JSON.stringify({ sourceId: sourceId });
        this.call(methodName, methodTye, params, callback, true);
    },
    changeCustomerStatus: function (customerId, status) {
        var callback = function (json) {
            if (json.isStatusChanged) {
                //global.alert("Status changed successfully.", global.DialogType_Alert);
                var gridData = $('#allCustomersGrid').data('kendoGrid').dataSource.data();
                var customer = $.grep(gridData, function (data) {
                    return data.nmCustomerId == customerId;
                });
                gridData.splice(gridData.indexOf(customer[0]), 1);
            }
            else {
                global.alert("Status not changed as similar domains are mapped to other existing customers.", global.DialogType_Alert);
                customerViewModel.set('isActive', !customerViewModel.isActive);
            }
        }
        var methodName = "ChangeCustomerStatus";
        var methodTye = "POST";
        var params = JSON.stringify({ customerId: customerId, status: status });
        this.call(methodName, methodTye, params, callback, true);
    },
    canCustomerDeleted: function (customerId, deleteCustomerCallback) {
        var callback = function (json) {
            if (json.canCustomerDeleted) {
                deleteCustomerCallback();
            }
            else {
                global.alert(json.message, global.DialogType_Alert);
            }
        }
        var methodName = "CanCustomerDeleted";
        var methodTye = "POST";
        var params = JSON.stringify({ customerId: customerId });
        this.call(methodName, methodTye, params, callback, true);
    }
};
var customerViewModel = kendo.observable({
    customerId: 0,
    customerName: '',
    customerLogoPath: '',
    isAddCustomerVisible: false,
    isActive: true,
    isSubTypeGridVisible: false,
    isSourceGridVisible: false,
    isCustomerGridVisible: true,
    isKeyIdentifiersVisible: false,
    isValidated: false,
    doValidate: false,
    totalPanels: 2,
    currentPanel: 1,
    envDetailAutoId: 0,
    isNotValidated: false,
    isCustomerNameEditable: true,
    activeChildRow: null,
    guid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    cancelEditingCustomer: function (e) {
        this.resetCustomerNameValidationFlags(e);
        //customerViewModel.sources.splice(0, customerViewModel.sources.length);
        //customerViewModel.source.keyIdentifiers.splice(0, customerViewModel.source.keyIdentifiers.length);
        service.getAllCustomers();
    },
    resetCustomerNameValidationFlags: function (e) {
        this.set('doValidate', false);
        this.set('isValidated', false);
        this.set('isNotValidated', false);
    },
    submitCustomer: function (e) {
        var callback = function (json) {
            if (json) {
                customerViewModel.openAlert('<p><strong>Customer</strong> saved successfully.</p>');
                customerViewModel.resetCustomerNameValidationFlags(e);
                service.getAllCustomers();
            }
            else {
                customerViewModel.openAlert('<p>An error occured while saving customer. Please contact administrator.</p>')
            }
        };
        if (service.validateCustomer())
            service.saveCustomerSource(callback)
    },
    showNextPanel: function (e) {
        var response;
        customerViewModel.subTypes.splice(0, customerViewModel.subTypes.length);

        if (this.validate(e)) {
            var callback = function (json) {
                customerViewModel.subTypes.splice(0, customerViewModel.subTypes.length);
                customerViewModel.subTypes.push.apply(customerViewModel.subTypes, json);
                e.data.set('isSourceGridVisible', false);
                e.data.set('isSubTypeGridVisible', true);
                e.data.set('isCustomerGridVisible', false);
            };
            service.getServiceSubTypes(callback);
        }
    },

    showPreviousPanel: function (e) {
        e.data.set('isSubTypeGridVisible', false);
        e.data.set('isCustomerGridVisible', false);
        e.data.set('isSourceGridVisible', true);
    },
    openAlert: function (text) {
        global.alert(text, 'Alert');
    },
    validate: function (e) {
        if (customerViewModel.customerName.trim().length == 0) {
            customerViewModel.openAlert("<p>Please enter <strong>Customer</strong> name.<p>");
            return false;
        }
        var isSourceSelected = $.grep(customerViewModel.sources, function (sources) {
            return sources.isSelected;
        });

        var isAnyKeyIdentifierSelected = true;
        if (isSourceSelected.length > 0) {
            $.each(isSourceSelected, function (index, value) {
                var isKeyIdentifierSelected = $.grep(value.keyIdentifiers, function (identifier) {
                    return identifier.isKeyIdentifierSelected;
                });
                if (isKeyIdentifierSelected.length == 0) {
                    customerViewModel.openAlert("<p>Please select a <strong>Map To Customer/Domain in the Data Source</strong>.<p>");
                    isAnyKeyIdentifierSelected = false;
                    return false; // will cause break; from $.each
                }
            });
            return isAnyKeyIdentifierSelected;
        }
        else {
            global.confirm("No source has been selected. Do you want to save customer?", global.DialogType_Confirm, function () {
                customerViewModel.submitCustomer(e)
            });
            return false;
        }
        return true;
    },
    identifierChanged: function (e) {
        if (e.data.isKeyIdentifierSelected == true) { //we selected it
            if (!e.data.parent().parent().isSelected) {
                // global.alert('Please select the source', global.DialogType_Alert);
                // e.data.set('isKeyIdentifierSelected', false);
                e.data.parent().parent().set('isSelected', true); //arushi
                customerViewModel.validateDataSource(e.data.parent().parent());
                //trigger("click");
                //$('input[value="' + e.data.parent().parent().sourceId + '"][type="checkbox"]').first().trigger('click');
            }       
            if (e.data.keyIdentifierValue == '-1') {
                $.each(e.data.parent(), function (index, value) {
                    if (value.keyIdentifierValue != '-1')
                        value.set('isDisabled', true);
                });
            }
            else {
                $.each(e.data.parent(), function (index, value) {
                    if (value.keyIdentifierValue == '-1') {
                        value.set('isDisabled', true);
                        return false;
                    }
                });
            }
        }
        else {
            var selectedKeyIdentifiers = $.grep(e.data.parent(), function (identifiers) {
                return identifiers.isKeyIdentifierSelected && identifiers.keyIdentifierId != '-1';
            });
            if (e.data.keyIdentifierValue == '-1') {
                $.each(e.data.parent(), function (index, value) {
                    if (value.keyIdentifierValue != '-1')
                        value.set('isDisabled', false);
                });
            }

                //if none of the KI is selected
            else if (selectedKeyIdentifiers.length == 0) {
                $.each(e.data.parent(), function (index, value) {
                    if (value.keyIdentifierValue == '-1') {
                        value.set('isDisabled', false);
                        return false;
                    }
                });
            }
        }
    },
    deleteFilter: function (e) {
        var filters = e.data.parent();
        var index = filters.indexOf(e.data);
        ////remove nested filter html so that viewmodel can observe the actual TR to be deleted.
        var target = e.sender ? e.sender.wrapper : $(e.currentTarget);
        var nestedRow = target.closest('tr.nestedRow');

        //hide all nested filters
        target.closest('tr').siblings('tr.nestedRow').remove();

        var siblingRow = target.closest('tr').siblings('tr');
        if (siblingRow.length > 0) {
            var siblingFilter = siblingRow.find('select')[0].kendoBindingTarget.source;
            if (siblingFilter.nestedFilters.length > 0) {
                siblingFilter.set('arrowUpVisible', false);
                siblingFilter.set('arrowDownVisible', true);
                customerViewModel.setArrows(siblingFilter.nestedFilters);
            }
        }

        //reset clause to null for preceding filter
        if ((filters.length - 1) == index) {
            var secondLastFilter = filters[filters.length - 2];
            if (secondLastFilter)
                secondLastFilter.set('clause', '');
        }

        //delete current requested filter

        filters.splice(index, 1);

        // kill nested table if no filter is left
        if (filters.length == 0) {
            var parentRow = nestedRow.prev('tr');
            if (parentRow.length > 0) {
                var parentFilter = nestedRow.prev('tr').find('select')[0].kendoBindingTarget.source;
                parentFilter.set('subClause', '');
                parentFilter.set('arrowUpVisible', false);
                parentFilter.set('arrowDownVisible', false);
                nestedRow.remove();
            }
        }

        //set all arrows
    },
    multiSelectChanged: function (e) {
        var result = e.data.selectedValue.map(function (val) {
            return val.value;
        }).join('|');
        e.data.set("value", result);
    },
    mapToChanged: function (e) {
        if (e.data.keyIdentifierValue == "-1" && e.data.isKeyIdentifierSelected) {
            $.each(e.data.parent(), function (index, identifier) {
                if (identifier.keyIdentifierValue != "-1") {
                    identifier.set('isDisabled', true);
                    identifier.set('isKeyIdentifierSelected', false);
                }
            });
        }
        if (e.data.keyIdentifierValue == "-1" && !e.data.isKeyIdentifierSelected) {
            $.each(e.data.parent(), function (index, identifier) {
                if (identifier.keyIdentifierValue != "-1") {
                    identifier.set('isDisabled', false);
                }
            });
        }
        if (e.data.keyIdentifierValue != "-1") {
            var allApplicable = $.grep(e.data.parent(), function (identifier) {
                return identifier.keyIdentifierValue == "-1";
            });
            var isAnyDomainSelected = $.grep(e.data.parent(), function (identifier) {
                return identifier.keyIdentifierValue != "-1" && (identifier.isKeyIdentifierSelected || identifier.isDisabled);
            });
            if (isAnyDomainSelected.length > 0) {
                allApplicable[0].set('isDisabled', true);
                allApplicable[0].set('isKeyIdentifierSelected', false);
            }
            else {
                allApplicable[0].set('isDisabled', false);
            }
        }
    },
    csvMultiSelectChanged: function (e) {
        if (e.data.selectedValue.length == 0) {
            e.data.csvValues.splice(0, e.data.csvValues.length);
            e.data.set('isCsvControlVisible', true);
            e.data.set('isMultiSelectCsvControlVisible', false);
        }
    },
    browseCsv: function (e) {
        var files = e.files;
        var row = e.data;
        var f = files[0]; {
            var reader = new FileReader();
            //var name = f.name;
            reader.onload = function (readerData) {
                var data = readerData.target.result.split('\n')
                if (data.length > 0) {
                    data.splice(0, 1);
                }
                var data = Enumerable.from(data).distinct(function (x) { return x; }).select(function (a) { return a; }).toArray();
                customerActions.processWB(data, row);
            };
            reader.readAsBinaryString(f.rawFile);
        }
    },
    showNestedFilters: function (e) {
        if (e.data.subClause.length > 0) {
            e.data.set('arrowUpVisible', true);
            e.data.set('arrowDownVisible', false);

            var target = e.sender ? e.sender.wrapper : $(e.currentTarget);
            target.closest('tr').siblings('tr.nestedRow').remove();
            var index = customerViewModel.schema.filters.indexOf(e.data);
            //var nestedRow = target.closest('tr.nestedRow');
            //var parentFilter = nestedRow.prev('tr').find('select')[0].kendoBindingTarget.source;
            //$.each(customerViewModel.schema.filters, function (i,value) {
            //    if (i != index) {
            var siblingRow = target.closest('tr').siblings('tr');
            if (siblingRow.length > 0) {
                var siblingFilter = siblingRow.find('select')[0].kendoBindingTarget.source;
                if (siblingFilter.nestedFilters.length > 0) {
                    siblingFilter.set('arrowUpVisible', false);
                    siblingFilter.set('arrowDownVisible', true);
                    customerViewModel.setArrows(siblingFilter.nestedFilters);
                }
            }
            if (e.data.arrowUpVisible) {
                var nestedFilters = $('#nestedFilters').clone();
                var childRow = $('#childRow').find('tr').clone();
                //customerViewModel.activeChildRow = childRow; //here??
                childRow.find('td').append(nestedFilters);
                if (e.data.nestedFilters.length == 0) {
                    e.data.nestedFilters.push({
                        id: customerViewModel.guid(), column: '', operator: '', value: '', selectedValue: [],
                        clause: '', subClause: '', isMultiSelect: false, isCsvControlVisible: false, isMultiSelectCsvControlVisible: false,
                        isTextControlVisible: false, masterValues: [], csvValues: [], operators: [], columns: e.data.columns,
                        subClauses: e.data.subClauses, clauses: e.data.clauses, deleteRowVisible: true, arrowUpVisible: false, arrowDownVisible: false,
                        nestedFilters: []
                    });
                }
                var nestedViewModel = kendo.observable({
                    columnChanged: customerViewModel.columnChanged,
                    slideNestedFilters: customerViewModel.slideNestedFilters,
                    killNestedFilter: customerViewModel.killNestedFilter,
                    operatorChanged: customerViewModel.operatorChanged,
                    multiSelectChanged: customerViewModel.multiSelectChanged,
                    csvChanged: customerViewModel.csvChanged,
                    csvMultiSelectChanged: customerViewModel.csvMultiSelectChanged,
                    clauseChanged: customerViewModel.clauseChanged,
                    showNestedFilters: customerViewModel.showNestedFilters,
                    deleteFilter: customerViewModel.deleteFilter,
                    nestedFilters: e.data.nestedFilters
                });
                kendo.bind(childRow, nestedViewModel);
                var target = e.sender ? e.sender.wrapper : $(e.currentTarget);
                target.closest('tr').after(childRow);
                nestedFilters.slideDown();

                //nestedFilters.kendoWindow({ close: customerViewModel.closeNestedFilter }).data('kendoWindow').center().open();
            }
        }
        else
            e.data.set('arrowUpVisible', false);
        //customerViewModel.slideNestedFilters(e, target);
        $('#txtCreatedQuery').val(customerViewModel.actions.CreateQuery(customerViewModel.schema.filters));
    },

    collapseExpandNestedFilters: function (e) {
        if (e.data.arrowUpVisible || e.data.arrowDownVisible) {
            e.data.set('arrowUpVisible', !e.data.arrowUpVisible);
            e.data.set('arrowDownVisible', !e.data.arrowDownVisible);
        }
        if (e.data.nestedFilters.length > 0) {
            var nestedFilters = e.data.nestedFilters;
            while (nestedFilters.length > 0) {
                if (nestedFilters[0].arrowUpVisible || nestedFilters[0].arrowDownVisible) {
                    nestedFilters[0].arrowUpVisible = false;
                    nestedFilters[0].arrowDownVisible = true;
                }
                nestedFilters = nestedFilters[0].nestedFilters;
            }
        }
    },

    killNestedFilter: function (e) {
        customerViewModel.collapseExpandNestedFilters(e);
        var target = e.sender ? e.sender.wrapper : $(e.currentTarget);
        var nestedRow = target.closest('tr').next('tr.nestedRow');
        nestedRow.remove();

    },
    actions: {
        CreateQuery: function (filters) {
            var createQuery = '';
            $.each(filters, function (index, filter) {
                if (filter.column != '' && filter.operator != '' && filter.value != '') {
                    var value = filter.value;

                    if (filter.operator == 'IN') {
                        value = "('" + value + "')";
                    }

                    if (filter.operator == 'LIKE') {
                        value = "'%" + value + "%'";
                    }

                    if (filter.nestedFilters.length > 0) {
                        createQuery += '( ' + filter.column + ' ' + filter.operator + ' ' + value + ' ' + filter.subClause + customerViewModel.actions.CreateQuery(filter.nestedFilters) + ')' + filter.clause;
                    }
                    else {
                        createQuery += ' ' + filter.column + ' ' + filter.operator + ' ' + value + ' ' + filter.clause;
                    }

                    //createQuery += ' ' + filter.column + ' ' + filter.operator + ' ' + value + ' ';

                    //if (filter.nestedFilters.length > 0) {
                    //    createQuery = createQuery + filter.subClause + ' ( ' + customerViewModel.actions.CreateQuery(filter.nestedFilters) + ' ) ';                       
                    //}
                    //createQuery += filter.clause;

                }
            });
            return createQuery;
        }
    },
    clauseChanged: function (e) {
        //if ($(e.sender.element).parents('tr.nestedRow').length == 0)
        if ((e.sender.element).closest('tr').siblings('tr.nestedRow').length > 0) {
            $(e.sender.element).closest('tr').siblings('tr.nestedRow').remove();
            var target = e.sender ? e.sender.wrapper : $(e.currentTarget);
            var siblingRow = target.closest('tr').siblings('tr');
            if (siblingRow.length > 0) {
                var siblingFilter = siblingRow.find('select')[0].kendoBindingTarget.source;
                if (siblingFilter.nestedFilters.length > 0) {
                    siblingFilter.set('arrowUpVisible', false);
                    siblingFilter.set('arrowDownVisible', true);
                    customerViewModel.setArrows(siblingFilter.nestedFilters);
                }
            }
        }

        customerViewModel.killNestedFilter(e);
        var filters = e.data.parent();
        var lastFilter = filters[(filters.length - 1)];
        if (lastFilter.clause.length > 0)
            filters.push({
                id: customerViewModel.guid(), column: '', operator: '', value: '', selectedValue: [],
                clause: '', subClause: '', isMultiSelect: false, isCsvControlVisible: false, isMultiSelectCsvControlVisible: false,
                isTextControlVisible: false, masterValues: [], csvValues: [], operators: [], columns: customerViewModel.schema.columns,
                deleteRowVisible: true, arrowUpVisible: false, nestedFilters: [], arrowDownVisible: false,
                clauses: customerViewModel.schema.clauses, subClauses: customerViewModel.schema.subClauses,
                deleteRowVisible: true
            });
        var query = customerViewModel.actions.CreateQuery(filters);
        $('#txtCreatedQuery').val(query);
    },
    operatorChanged: function (e) {
        var operators = customerViewModel.schema.operators;
        var selectedOperator = $.grep(operators, function (operator) {
            return operator.text == e.data.operator;
        });
        e.data.set('isMultiSelect', selectedOperator[0].isMultiSelect);
        e.data.set('isCsvControlVisible', selectedOperator[0].isCsvControlVisible);
        e.data.set('isTextControlVisible', selectedOperator[0].isTextControlVisible);
        e.data.set('isMultiSelectCsvControlVisible', selectedOperator[0].isMultiSelectCsvControlVisible);

    },
    columnChanged: function (e) {
        var columns = customerViewModel.schema.columns;
        var operators = customerViewModel.schema.operators;
        var selectedColumn = $.grep(columns, function (column) {
            return column.value == e.data.column;
        });
        if (selectedColumn[0]) {
            var ops = $.grep(operators, function (operator) {
                return (operator.type.toLowerCase() == selectedColumn[0].type.toLowerCase() || operator.type == "all") &&
                    ((operator.isMultiSelect == selectedColumn[0].isMultiSelect) || (operator.isMultiSelect == false));
            });
            e.data.operators.splice(0, e.data.operators.length);
            e.data.operators.push.apply(e.data.operators, ops);
            e.data.masterValues.splice(0, e.data.masterValues.length);
            e.data.masterValues.push.apply(e.data.masterValues, selectedColumn[0].masterValues);
        }
        e.data.set("value", '');
    },
    customerNameChanged: function (e) {
        e.data.set('doValidate', true);
        var customerName = e.data.customerName.trim();
        if (customerName.length > 0) {
            service.validateCustomerName(customerName);
        }
        else
            this.resetCustomerNameValidationFlags(e);
    },
    statusChanged: function (e) {
        var customerId = customerViewModel.customerId;
        if (customerId > 0)
            service.changeCustomerStatus(customerId, e.checked);
    },
    openFilter: function (e) {
        customerViewModel.set('envDetailAutoId', e.data.Id);
        e.data.set('isSubTypeSelected', true);
        var callback = function (json) {
            customerViewModel.set('schema', json);
            var nestedFilters = [];
            //customerViewModel.schema.push(nestedFilters);
            var selectedSubType = $.grep(customerViewModel.subTypes, function (subType) {
                return subType.Id == e.data.Id;
            })
            if (selectedSubType[0].filters == null)
                selectedSubType[0].filters = [];
            selectedSubType[0].nestedFilters = [];
            if (selectedSubType[0].filters.length > 0) {
                customerViewModel.schema.filters.push.apply(customerViewModel.schema.filters, selectedSubType[0].filters);
                //push nested filters here
            }
            //var filterWindow = $('#filters').data('kendoWindow');
            //if (!filterWindow) {
            //    var window = $('#filters').kendoWindow({
            //        width: '90%',
            //        height: '90%',
            //        title: 'Filters',
            //        modal: true
            //    }).data('kendoWindow').center().open();
            //    $('#filters').parent().find(".k-window-action").css("visibility", "hidden");
            //}
            //else {
            //    filterWindow.center().open();
            //}
            if (customerViewModel.schema.filters.length == 0) {
                customerViewModel.schema.filters.push({
                    id: customerViewModel.guid(), column: '', operator: '', value: '', selectedValue: [],
                    clause: '', subClause: '', isMultiSelect: false, isCsvControlVisible: false, isMultiSelectCsvControlVisible: false,
                    isTextControlVisible: false, masterValues: [], csvValues: [], operators: [],
                    columns: json.columns, nestedFilters: [], clauses: json.clauses,
                    subClauses: json.subClauses,
                    deleteRowVisible: true
                });
            }
        }
        service.getFilterSchema(callback);

    },
    closeNestedFilter: function (e) {
        var nestedFilters = e.sender.element.find('select')[0].kendoBindingTarget.source.parent();
        var isBlankColumn = $.grep(nestedFilters, function (data) {
            return data.column == '';
        })
        if (isBlankColumn.length > 0) {
            nestedFilters.splice(0, nestedFilters.length);
        }

    },
    setArrows: function (filters) {
        $.each(filters, function (index, value) {
            if (value.nestedFilters.length > 0) {
                value.set('arrowUpVisible', false);
                value.set('arrowDownVisible', true);
                customerViewModel.setArrows(value.nestedFilters);
            }
        });
    },
    closeFilter: function () {
        this.setArrows(customerViewModel.schema.filters);
    },
    saveFilter: function () {
        this.setArrows(customerViewModel.schema.filters);
        var subType = $.grep(customerViewModel.subTypes, function (e) {
            return e.Id == customerViewModel.envDetailAutoId;
        });
        subType[0].filters.splice(0, subType[0].filters.length);
        subType[0].filters.push.apply(subType[0].filters, customerViewModel.schema.filters);
        customerViewModel.schema.filters.splice(0, customerViewModel.schema.filters.length);
    },
    sourceChanged: function (e) {
        var selectedSource = e.data;
        if (selectedSource.isSelected == true) { //source is checked
            customerViewModel.validateDataSource(selectedSource);               
        }
        else {
            $.each(selectedSource.keyIdentifiers, function (index, value) {
                if (value.isKeyIdentifierSelected == true) {
                    value.set('isKeyIdentifierSelected', false);
                }
            });
        }
    },
    validateDataSource: function (selectedSource) {
        var selectedSources = $.grep(customerViewModel.sources, function (data) {
            return data.isSelected;
        });
        if (selectedSources.length > 1) {
            var callback = function (json) {
                if (json.isSourceValidated == true) {
                    if (selectedSource.keyIdentifiers.length == 0) {
                        selectedSource.keyIdentifiers.splice(0, selectedSource.keyIdentifiers.length);
                        service.getDomains(selectedSource.sourceId);
                    }  
                }
                else {
                    global.alert("This source is mapped elsewhere", global.DialogType_Error, function () {
                        selectedSource.set('isSelected', false);
                        var selectedIdentifiers = $.grep(selectedSource.keyIdentifiers, function (data) {
                            return data.isKeyIdentifierSelected;
                        });
                        $.each(selectedIdentifiers, function (index, data) {
                            data.set('isKeyIdentifierSelected', false);
                        })
                    });
                }
            }
            var selectedSourceIds = [];
            $.each(selectedSources, function (index, value) {
                selectedSourceIds.push(value.sourceId);
            });
            var methodName = "ValidateDataSource";
            var methodTye = "POST";
            var params = JSON.stringify({ allSelectedSourceIds: selectedSourceIds });
            service.call(methodName, methodTye, params, callback, true);
        }
        else {
            if (selectedSource.keyIdentifiers.length == 0) {
                selectedSource.keyIdentifiers.splice(0, selectedSource.keyIdentifiers.length);
                service.getDomains(selectedSource.sourceId);
            }
        }

    },
    
    source: {
        sourceId: 0,
        keyIdentifiers: []
    },
    sources: [
                {
                    sourceId: 1,
                    sourceName: 'Source 1',
                    isDisabled: true,
                    isSelected: false
                },
                {
                    sourceId: 2,
                    sourceName: 'Source 2',
                    isDisabled: true,
                    isSelected: false
                },
                {
                    sourceId: 3,
                    sourceName: 'Source 3',
                    isDisabled: true
                },
                 {
                     sourceId: 4,
                     sourceName: 'Source 4',
                     isDisabled: true,
                     isSelected: false
                 },
                  {
                      sourceId: 5,
                      sourceName: 'Source 5',
                      isDisabled: true,
                      isSelected: false
                  },
                   {
                       sourceId: 6,
                       sourceName: 'Source 6',
                       isDisabled: true,
                       isSelected: false
                   },
                    {
                        sourceId: 7,
                        sourceName: 'Source 7',
                        isDisabled: true,
                        isSelected: false
                    }
    ],
    keyIdentifiers: [
                        { keyIdentifierId: 1, keyIdentifierName: 'Source 1 key1', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 2, keyIdentifierName: 'Source 1 key2', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 3, keyIdentifierName: 'Source 1 key1', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 4, keyIdentifierName: 'Source 1 key2', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 5, keyIdentifierName: 'Source 1 key1', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 6, keyIdentifierName: 'Source 1 key2', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 7, keyIdentifierName: 'Source 1 key1', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 8, keyIdentifierName: 'Source 1 key2', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 9, keyIdentifierName: 'Source 1 key1', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false },
                        { keyIdentifierId: 10, keyIdentifierName: 'Source 1 key1', keyIdentifierValue: '', isKeyIdentifierSelected: false, isDisabled: false }
    ],
    subTypes: [
      { Id: 1, sourceId: 1, sourceName: 'Source 1', subTypeId: 1, subTypeName: 'source 1 subtype1', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 2, sourceId: 1, sourceName: 'Source 1', subTypeId: 2, subTypeName: 'source 1 subtype1', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 3, sourceId: 1, sourceName: 'Source 1', subTypeId: 3, subTypeName: 'source 1 subtype3', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 4, sourceId: 1, sourceName: 'Source 1', subTypeId: 4, subTypeName: 'source 1 subtype4', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 5, sourceId: 2, sourceName: 'Source 2', subTypeId: 5, subTypeName: 'source 2 subtype5', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 6, sourceId: 2, sourceName: 'Source 2', subTypeId: 6, subTypeName: 'source 2 subtype6', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 7, sourceId: 3, sourceName: 'Source 3', subTypeId: 3, subTypeName: 'source 3 subtype7', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 8, sourceId: 3, sourceName: 'Source 3', subTypeId: 3, subTypeName: 'source 3 subtype8', isSubTypeSelected: false, filters: [], isActive: false },
      { Id: 9, sourceId: 3, sourceName: 'Source 3', subTypeId: 3, subTypeName: 'source 3 subtype9', isSubTypeSelected: false, filters: [], isActive: false }
    ],
    schema: {
        columns: [{ text: 'Id', value: 1, type: 'int', masterValues: [], isMultiSelect: false }, { text: 'Company', value: 2, type: 'varchar', masterValues: [], isMultiSelect: false }, { text: 'category', value: 3, type: 'varchar', isMultiSelect: true, masterValues: [{ text: 'masterValue1', value: 1 }, { text: 'masterValue2', value: 2 }, { text: 'masterValue3', value: 3 }] }],
        operators: [{ text: 'equals to', value: '=', isMultiSelect: false, type: 'all', isCsvControlVisible: false }, { text: 'is any of', value: 'IN', isMultiSelect: true, type: 'all', isCsvControlVisible: false }, { text: 'contains', value: 'LIKE', isMultiSelect: false, type: 'varchar', isCsvControlVisible: false },
                    { text: 'greater than', value: '>', isMultiSelect: false, type: 'int', isCsvControlVisible: false }, { text: 'lesser than', value: '<', isMultiSelect: false, type: 'int', isCsvControlVisible: false }, { text: 'in list of', value: 'IN', isMultiSelect: true, type: 'all', isCsvControlVisible: true }],
        clauses: [{ text: 'AND', value: 'AND' }, { text: 'OR', value: 'OR' }],
        subClauses: [{ text: 'SUB AND', value: 'SUB AND' }, { text: 'SUB OR', value: 'SUB OR' }],
        filters: []
    }
});
var customerActions = {
    X: XLSX,
    addCustomer: function () {
        service.getCustomer(0);
    },
    editCustomer: function (customerId) {
        service.getCustomer(customerId);
    },
    deleteCustomer: function (customerId, retVal) {
        if (!retVal) {
            global.confirm("Are you sure you want to delete customer?", global.DialogType_Confirm, this.deleteCustomer, customerId);
        }
        if (retVal) {
            service.canCustomerDeleted(customerId, function () {
                service.changeCustomerStatus(customerId, false);
            });
        }
    },
    openBrowse: function (element) {
        $(element).closest('div').find('[type=file]').data('kendoUpload').trigger('upload')
    },
    processWB: function (data, filterRow) {
        var gridData = data;
        customerActions.renderGrid(gridData, filterRow);
    },
    fixData: function (data) {
        var o = "",
               l = 0,
               w = 10240;
        for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
        o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
        return o;
    },
    toJson: function (wb) {
        var result = {};
        wb.SheetNames.forEach(function (sheetName) {
            var roa = customerActions.X.utils.sheet_to_json(wb.Sheets[sheetName]);
            if (roa.length > 0) {
                result[sheetName] = roa;
            }
        });
        return result;
    },
    validateGridData: function (gridData) {
        if (gridData[0].hasOwnProperty("CINAME")) {
            //check SOP name is not duplicated
            var queryResult = Enumerable.from(gridData).select("{CINAME:$.CINAME.trim().toLowerCase()}");
            var distinctCiNames = queryResult.distinct("$.CINAME").select("$.CINAME").toArray();
            if (queryResult.toArray().length != distinctCiNames.length) {
                global.alert("CI NAME name cannot be duplicated.", global.DialogType_Error);
                return false;
            }
            //check friendly name, description, path, tag is not blank
            var isAnyFieldUndefined = $.grep(gridData, function (data) {
                return data.CINAME == undefined;
            });
            if (isAnyFieldUndefined.length > 0) {
                global.alert("Provide data in mandatory fields.", global.DialogType_Error);
                return false;
            }
            var requiredFields = $.grep(gridData, function (data) {
                return data.CINAME.trim().length == 0;
            });
            if (requiredFields.length > 0) {
                global.alert("Provide data in mandatory fields.", global.DialogType_Error);
                return false;
            }
        }
        else {
            global.alert("Excel template not supported.", global.DialogType_Error);
            return false;
        }
        return true;
    },
    renderGrid: function (gridData, filterRow) {
        if (gridData.length > 0) {
            var dataSource = [];
            $('.k-upload-files').hide();
            filterRow.set('isCsvControlVisible', false);
            filterRow.set('isMultiSelectCsvControlVisible', true);
            $.each(gridData, function (index, data) {
                dataSource.push({ text: data, value: data });
            });
            filterRow.csvValues.splice(0, filterRow.csvValues.length);
            filterRow.csvValues.push.apply(filterRow.csvValues, dataSource);
            filterRow.selectedValue.splice(0, filterRow.selectedValue.length);
            filterRow.selectedValue.push.apply(filterRow.selectedValue, dataSource);
        }
    },
    photoAsBase64: function()
    {
        return "data:image/jpeg;base64," + customerViewModel.customerLogoPath;
    },
    changeLogo: function (element) {
        var file = element.files[0];
        if (file) {
            if (file.size < 1048576) {
                var reader = new FileReader();
                reader.onload = function (readerEvt) {
                    var binaryString = readerEvt.target.result;
                    customerViewModel.set('customerLogoPath', btoa(binaryString));
                    $('#logoImg').css('background-image', 'url("data:image/gif;base64,' + customerViewModel.customerLogoPath + '"');
                    $('#logoImg').css('background-size', 'contain');
                    $('#logoImg').css('background-size', 'contain');
                    $('#logoImg').css('background-repeat', 'no-repeat');
                };
                reader.readAsBinaryString(file);
            }
            else {
                alert('File size too large');
            }
            
        }
    }
};
