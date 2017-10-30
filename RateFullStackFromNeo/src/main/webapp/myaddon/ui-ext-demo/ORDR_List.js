define(function() {

    const VIEW_ORDR_LIST = "e4917e50-4db8-4d3d-bc57-892fce676ffd";
    const BTN_CLOSE_LIST = "1b654259-ffeb-420b-883c-287cab3151f7";
    const BTN_CREATE_LIST = "bff01f98-5c5e-49b6-8ce4-7b90d875f904";
    const BTN_QUICK_CREATE_LIST = "uuid_quick_create";

    // Header
    const HEADER_CardCode = "52709261-0eec-4e71-a9fd-7fff3a142750";
    const HEADER_CardName = "47235d8f-dfd6-4f25-9c5c-32225bf01f2e";
    const HEADER_DocDueDate = "0ddd3f85-c8b8-41de-86be-05623195eb28";

    // Grid
    const UUID_RDR1 = "b5695427-62ce-40fd-9801-e4b6bbf9d37e";
    const UUID_RDR1_ItemCode = "45d54b9e-0dba-4fda-8351-0b6140ffb3b4";

    const SECTION_CONTENTS = "cbc0ee9f-d53e-43fd-a906-2f4e7d5f9506";
    const VIEW_OITM_CFL = "20a55977-2f9f-4490-ab1d-b33d3d318d8b";
    const UUID_SELECT_BUTTON = "36726a98-4729-4981-9d3d-1b393505cae3";

    const UUID_BTN_GRIDADDLINE = "d818b058-19f6-4d48-b1d4-1479907bd1a5";
    const UUID_BTN_CREATE = "bff01f98-5c5e-49b6-8ce4-7b90d875f904";
    const UUID_BTN_OK = "f03f0c9c-8b0f-42cb-811c-172032dff715";

    async function createQuickOrderInListView(oInst) {
        await oInst.clickGridButton(VIEW_ORDR_LIST, BTN_CREATE_LIST);
        await oInst.setFormItemValue(HEADER_CardCode, "C26000");

        //check the CardName (it will be automatically filled by onchange proc)
        //if (await oInst.getFormItemValue(HEADER_CardName) !== "River Inc") {
          //throw Error("Validation failed: wrong card name");
        //}
        
        if (await oInst.getFormItemValue(HEADER_CardName) !== null) {
            throw Error("Validation failed: wrong card name");
        }
        await oInst.setFormItemValue(HEADER_DocDueDate, "20170922");

        await wait();
        await oInst.selectFormSection(SECTION_CONTENTS);
        await oInst.clickGridButton(UUID_RDR1, UUID_BTN_GRIDADDLINE);

        await oInst.openGridChooseFromList(UUID_RDR1, 0, UUID_RDR1_ItemCode);
        // await oInst.selectGridRow(VIEW_OITM_CFL, 0);
        await oInst.selectGridRow(VIEW_OITM_CFL, 1);
        await oInst.selectGridRow(VIEW_OITM_CFL, 2);
        // await oInst.invertSelectGridRow(VIEW_OITM_CFL, 1);
        await oInst.clickButton(UUID_SELECT_BUTTON);

        await oInst.clickButton(UUID_BTN_CREATE);
        await oInst.clickButton(UUID_BTN_OK);
        await oInst.navigateToList("ORDR");
    }

    /**
     * @param ms milli second, default is 200ms
     * @return Promise instance
     */
    function wait(ms = 200) {
        return new Promise((resolve, reject) => {
            setTimeout((ok) => { resolve(ok) }, ms, "OK");
        });
    }

    // Event names
    const onBeforeButtonClickBtnQuickCreateList = `on${BTN_QUICK_CREATE_LIST}BeforeButtonClick`;

    return {
        [ onBeforeButtonClickBtnQuickCreateList ]: async function(oInst, ...args) {
            // hack temporarialy
            window.__inAutoCreationMode = true;
            await createQuickOrderInListView(oInst);
        },

        layouts: [
            {
                position: `after:${BTN_CLOSE_LIST}`,
                data: {
                    $tag: "button",
                    label: "Quick Create (UIAPI)",
                    uuid: BTN_QUICK_CREATE_LIST
                }
            }
        ]
    }
});