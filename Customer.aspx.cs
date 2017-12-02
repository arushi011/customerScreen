using MyDashboard.MYDBAdmin;
using MyDashboard.MYDBEntity;
using MyDashboard.MYDBUtility;
using MYDBEntity;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Admin_iAutomateAdmin_iAutomateScreens_Customer : BasePage
{
    static string strToolConnString = Convert.ToString(ConfigurationManager.AppSettings["ConnectionString"]);
    static string strToolConnType = Convert.ToString(ConfigurationManager.AppSettings["ConfigDatabaseType"]);

    protected void Page_Load(object sender, EventArgs e)
    {
        AutoMapper.AdvancedConfiguration config = new AutoMapper.AdvancedConfiguration();
    }

    [WebMethod]
    public static string GetAllCustomers()
    {
        clsMyDBCommonAttrEntity objMyDBCommonEntity = new clsMyDBCommonAttrEntity();
        clsSecurityFunction.GetUserSession(ref objMyDBCommonEntity);
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        var isAddCustomerVisible = objMyDBCommonEntity.LoggedInUserRoleId == "4" ? true : false;
        var json = JsonConvert.SerializeObject(new { isAddCustomerVisible = isAddCustomerVisible, allCustomers = objAdminBAL.GetAllCustomers(objMyDBCommonEntity) });
        return json;
    }

    [WebMethod]
    public static string GetCustomer(int customerId)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        var json = JsonConvert.SerializeObject(objAdminBAL.GetCustomer(customerId));
        return json;
    }

    [WebMethod]
    public static string GetServiceSubTypes(int customerId, int[] selectedSourceIds)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        var json = JsonConvert.SerializeObject(objAdminBAL.GetServiceSubTypesForSource(customerId, selectedSourceIds));
        return json;
    }

    [WebMethod]
    public static string GetFilterSchema(int envDetailAutoId)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        FilterSchema schema = objAdminBAL.GetFilterSchema(envDetailAutoId);
        FillOperatorsClausesInSchema(schema);
        var json = JsonConvert.SerializeObject(schema);
        return json;
    }

    [WebMethod]
    public static bool SaveCustomerSource(int customerId, string json)
    {
        clsMyDBCommonAttrEntity objMyDBCommonEntity = new clsMyDBCommonAttrEntity();
        clsSecurityFunction.GetUserSession(ref objMyDBCommonEntity);
        CustomerEntity customerEntity = JsonConvert.DeserializeObject<CustomerEntity>(json);
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        bool isSaved = objAdminBAL.SaveCustomerSource(customerId, customerEntity, objMyDBCommonEntity);
        return isSaved;
    }

    [WebMethod]
    public static string ValidateCustomerName(string customerName)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        var isValidated = objAdminBAL.ValidateCustomerName(customerName);
        var json = JsonConvert.SerializeObject(new { isValidated = isValidated });
        return json;
    }

    [WebMethod]
    public static string ValidateDataSource(int[] allSelectedSourceIds)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        var isSourceValidated = objAdminBAL.ValidateDataSource(allSelectedSourceIds);
        var json = JsonConvert.SerializeObject(new { isSourceValidated = isSourceValidated });
        return json;
    }

    [WebMethod]
    public static string GetDomains(int sourceId)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        var domains = objAdminBAL.GetDomains(sourceId);
        var json = JsonConvert.SerializeObject(new { domains = domains });
        return json;
    }

    [WebMethod]
    public static string ChangeCustomerStatus(int customerId, bool status)
    {
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        bool isStatusChanged = objAdminBAL.ChangeCustomerStatus(customerId, status);
        var json = JsonConvert.SerializeObject(new { isStatusChanged = isStatusChanged });
        return json;
    }

    [WebMethod]
    public static string CanCustomerDeleted(int customerId)
    {
        var message = string.Empty;
        var objAdminBAL = new clsAdminBAL(strToolConnString, strToolConnType);
        bool canCustomerDeleted = objAdminBAL.CanCustomerDeleted(customerId);
        if (!canCustomerDeleted)
        {
            message = "Customer cannot be deleted as its associated with user(s).";
        }
        var json = JsonConvert.SerializeObject(new { canCustomerDeleted = canCustomerDeleted, message = message });
        return json;
    }
    private static void FillOperatorsClausesInSchema(FilterSchema schema)
    {
        schema.Operators = new List<Operator>() 
        { 
            new Operator(){ Identifier=Guid.NewGuid(),Text="equals to", Value="=", Type="all", IsTextControlVisible=true},
            new Operator(){Identifier=Guid.NewGuid(), Text="is any of", Value="IN", Type="all", IsMultiSelect=true},
            new Operator(){Identifier=Guid.NewGuid(), Text="contains", Value="LIKE", Type="varchar", IsTextControlVisible=true},
            new Operator(){Identifier=Guid.NewGuid(), Text="greater than", Value=">", Type="int", IsTextControlVisible=true},
            new Operator(){Identifier=Guid.NewGuid(), Text="lesser than", Value="<", Type="int" , IsTextControlVisible=true},
            new Operator(){Identifier=Guid.NewGuid(), Text="in list of", Value="IN", Type="all", IsCsvControlVisible=true},
            new Operator(){Identifier=Guid.NewGuid(), Text="not in list of", Value="NOT IN", Type="all", IsCsvControlVisible=true}
        };

        schema.Clauses = new List<TextValuePair>() 
        {
            new TextValuePair(){Text="AND",Value="AND"},
            new TextValuePair(){Text="OR",Value="OR"}
        };
        schema.SubClauses = new List<TextValuePair>()
        {
            new TextValuePair(){Text="SUB AND",Value="AND"},
            new TextValuePair(){Text="SUB OR",Value="OR"}
        };
        schema.Filters = new List<Filter>();
    }
}