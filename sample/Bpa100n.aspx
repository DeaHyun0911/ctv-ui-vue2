<%@ Page Language="C#" MasterPageFile="~/Program/cwwsPages/PageLayout.Master" AutoEventWireup="true" %>

<asp:Content ContentPlaceHolderID="PageTitle" runat="server">
    CWWS-프로그램등록
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
    <ctv-stack>
        <div id="queryFilter"></div>
        <div id='grid1' class="ctv-data-grid"></div>
    </ctv-stack>
</asp:Content>

<asp:Content ContentPlaceHolderID="PageScript" runat="server">
    <script src='Bpa100n.js?ver=<%= DateTime.Now.ToString("yyyyMMddHHmmss") %>'></script>
</asp:Content>