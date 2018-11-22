import * as moxios from "moxios";

import BunqJSClient from "../../../src/BunqJSClient";

import Prepare from "../../TestHelpers/Prepare";
import SetupApp from "../../TestHelpers/SetupApp";
import {
    defaultResponse
} from "../../TestHelpers/DefaultResponses";

let bunqApp: BunqJSClient;

describe("API", () => {
    beforeAll(async () => {
        moxios.install();

        // prepare certificates
        await Prepare();
        // create a bunqjsclient to be used in the tests
        bunqApp = await SetupApp("CustomerStatementExportContent");

        moxios.uninstall();
    });

    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());

    describe("CustomerStatementExportContent", () => {
        it("#LIST", async () => {
            const request = bunqApp.api.customerStatementExportContent.list(
                1,
                2,
                3
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });

        it("#LIST - with pagination options", async () => {
            const request = bunqApp.api.customerStatementExportContent.list(
                1,
                2,
                3,
                {
                    newer_id: 1,
                    older_id: 2
                }
            );
            await defaultResponse(moxios);
            const response = await request;

            expect(response).not.toBeNull();
        });
    });

});