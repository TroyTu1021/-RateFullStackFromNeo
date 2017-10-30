define(function() {

    /* UUID */
    const VIEW_ORDR_DETAIL = "9b1eb386-3b4e-4570-98e4-4044008cd415";

    const BTN_EXCHANGE_RATE = "EXCHANGE_RATE";

    // Grid
    const UUID_RDR1 = "b5695427-62ce-40fd-9801-e4b6bbf9d37e";
    const UUID_RDR1_ItemCode = "45d54b9e-0dba-4fda-8351-0b6140ffb3b4";
    
    // Header
    const UUID_CardCode = "52709261-0eec-4e71-a9fd-7fff3a142750";
    const UUID_CardName = "47235d8f-dfd6-4f25-9c5c-32225bf01f2e";
    const UUID_DocDueDate = "0ddd3f85-c8b8-41de-86be-05623195eb28";
    const UUID_ItemType = "e55b70b2-aa50-4fb4-95f7-3fc99c5af2a1";
    const ORDR_DocNum = "ec01c858-b7c4-40aa-bdfe-c7169c3d2133";
    const ORDR_PRICE_MODE = "1639bc5c-fc33-47d1-891d-7846f439c2bd";

    const SECTION_GENERAL = "fc4a6e5e-40e9-4eac-ae5c-cb78f49ce7cc";
    const SECTION_CONTENTS = "cbc0ee9f-d53e-43fd-a906-2f4e7d5f9506";
    const SECTION_ATTACHMENT = "29d8204c-b4b2-4852-ba33-46eda865205c";
    const UUID_BTN_DETAIL_PRINT = "d4cc9871-4b7f-404d-a8f2-9245b295e301";
    const UUID_BTN_DETAIL_FILL = "uuid_quick_fill";
    const VIEW_OITM_CFL = "20a55977-2f9f-4490-ab1d-b33d3d318d8b";
    const UUID_SELECT_BUTTON = "36726a98-4729-4981-9d3d-1b393505cae3";

    const GRID_RDR1 = UUID_RDR1;
    const UDF_RDR1_X = "UDF_U_X";
    const UDF_RDR1_Y = "UDF_U_Y";
    const UDF_RDR1_Z = "UDF_U_Z";
    const SUM_X = "uuid_of_sum";

    const UUID_BTN_CREATE = "bff01f98-5c5e-49b6-8ce4-7b90d875f904";    //05ade0b9-f9f5-44f6-8bb4-69bb3859fe0c
    const UUID_BTN_UPDATE = "55f1429b-4b79-4e70-9990-d89fe8302311";
    const UUID_BTN_CANCEL = "BUTTON_CANCEL";
    const UUID_BTN_GRIDADDLINE = "d818b058-19f6-4d48-b1d4-1479907bd1a5";

    let sGlobalDocNum = null;

    async function sumColumnX(oInst) {
        let iGridSize = await oInst.getGridSize(GRID_RDR1);
        let iSumOfX = 0;
        for (let i = 0; i < iGridSize; i++) {
            iSumOfX += Number.parseInt(await oInst.getGridItemValue(GRID_RDR1, UDF_RDR1_X, i) || 0);
        }
        return iSumOfX;
    }
    
    async function onColumnValueChange(oInst, sEventName, sViewUuid, sCtrlUuid, iRowIndex) {
        let y = await oInst.getGridItemValue(GRID_RDR1, UDF_RDR1_Y, iRowIndex);
        let z = await oInst.getGridItemValue(GRID_RDR1, UDF_RDR1_Z, iRowIndex);

        y = Number.parseInt(y) || 0;
        z = Number.parseInt(z) || 0;

        await oInst.setGridItemValue(GRID_RDR1, UDF_RDR1_X, iRowIndex, y + z);
        
        let iSumOfX = await sumColumnX(oInst);
        await oInst.setFormItemValue(SUM_X, iSumOfX);
    }

    async function submit(oInst, ...args) {
        if (!window.__inAutoCreationMode) {
            sGlobalDocNum = await oInst.getFormItemValue(ORDR_DocNum);

            let iSumOfX = await sumColumnX(oInst);
            if (iSumOfX > 100) {
                throw new Error("Validation Failed, Sum of X > 100");
            }
        } else {
            window.__inAutoCreationMode = false;
        }
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
    const onAfterButtonClickBtnCreate = `on${UUID_BTN_CREATE}AfterButtonClick`;
    const onAfterButtonClickBtnExchangeRate = `on${BTN_EXCHANGE_RATE}AfterButtonClick`;
    const onBeforeButtonClickBtnQuickFill = `on${UUID_BTN_DETAIL_FILL}BeforeButtonClick`;
    const onBeforeButtonClickBtnCreate = `on${UUID_BTN_CREATE}BeforeButtonClick`;
    const onBeforeButtonClickBtnUpdate = `on${UUID_BTN_UPDATE}BeforeButtonClick`;
    const onChangeTextboxUDFColumnY = `On${UDF_RDR1_Y}Change`;
    const onChangeTextboxUDFColumnZ = `On${UDF_RDR1_Z}Change`;

    return {
        [ onAfterButtonClickBtnCreate ]: async function(oInst, ...args) {
            await oInst.MessageBox("None", `Order #${sGlobalDocNum} was added`);
        },

        [ onAfterButtonClickBtnExchangeRate ]: async function(oInst, ...args) {
            await oInst.openApp("Exchange-Rate");
        },

        [ onBeforeButtonClickBtnQuickFill ]: async function(oInst, ...args) {
            await oInst.selectFormSection(SECTION_GENERAL);

            //add form header
            await oInst.setFormItemValue(UUID_CardCode, "C26000");
            await oInst.setFormItemValue(UUID_DocDueDate, "20170901");

            //add order line
            await wait();
            await oInst.selectFormSection(SECTION_CONTENTS);
            await oInst.clickGridButton(UUID_RDR1, UUID_BTN_GRIDADDLINE);

            await oInst.openGridChooseFromList(UUID_RDR1, 0, UUID_RDR1_ItemCode);
            await oInst.selectGridRow(VIEW_OITM_CFL, 1);
            await oInst.selectGridRow(VIEW_OITM_CFL, 2);
            await oInst.selectGridRow(VIEW_OITM_CFL, 3);
            await oInst.selectGridRow(VIEW_OITM_CFL, 4);

            await oInst.clickButton(UUID_SELECT_BUTTON);

            // await oInst.clickButton(UUID_BTN_CREATE);
            // console.log(await oInst.getCurrentMessageType());
            // console.log(await oInst.getCurrentMessageText());
        },
        
        [ onAfterButtonClickBtnCreate ]: async function(...args) {
            await submit(...args);
        },

        [ onBeforeButtonClickBtnUpdate ]: async function(...args) {
            await submit(...args);
        },

        [ onChangeTextboxUDFColumnY ]: async function(...args) {
            await onColumnValueChange(...args);
        },
        
        [ onChangeTextboxUDFColumnZ ]: async function(...args) {
            await onColumnValueChange(...args);
        },

        layouts: [
            {
                position: `after:${SECTION_ATTACHMENT}`,
                data: {
                    $tag: "section",
                    $children: [{
                        $tag: "group",
                        $children: [{
                            $tag: "button",
                            label: "Goto ExchangeRate",
                            uuid: "EXCHANGE_RATE"
                        }],
                        label: "Here is misc"
                    }],
                    label: "Misc",
                }
            },
            
            {
                position: `after:${ORDR_PRICE_MODE}`,
                data: {
                    $tag: "property",
                    name: "U_SUM",
                    label: "Sum of X(UDF)",
                    uuid: SUM_X,
                    editableAddMode: "false",
                    editableUpdateMode: "false"
                }
            },
            
            {
                position: UDF_RDR1_X,
                data: {
                    label: "X=Y+Z",
                    editableAddMode: "false",
                    editableUpdateMode: "false"
                }
            },
            
            {
                position: UDF_RDR1_Z,
                data: {
                    label: "Z"
                }
            },
            
            {
                position: `after:${UUID_BTN_DETAIL_PRINT}`,
                data: {
                    $tag: "button",
                    label: "Quick Fill Order (UIAPI)",
                    uuid: UUID_BTN_DETAIL_FILL,
                    visibleUpdateMode: "false",
                    visibleViewMode: "false"
                }
            }
        ]
    }
});