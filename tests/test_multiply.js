const multiply = require("../util/multiply");
const get_chai = require("../util/get_chai");

describe("testing multiply", () => {
    it("should give 7*6 is 42", async () => {
        const { expect } = await get_chai();
        expect(multiply(7, 6)).to.equal(42);
    });

    it('should give 8*8 is 64', async () => {
        const { expect } = await get_chai();
        expect(multiply(8, 8)).to.equal(64);
    })

    it('should give 5*4 is 20', async () => {
        const { expect } = await get_chai();
        expect(multiply(5, 4)).to.equal(20);
    })

});