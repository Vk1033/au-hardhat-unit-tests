const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

describe("Faucet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  async function deployContractAndSetVariables() {
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy({ value: ethers.parseEther("1.0") });

    const [owner, addr1] = await ethers.getSigners();
    return { faucet, owner, addr1 };
  }

  it("should deploy and set the owner correctly", async function () {
    const { faucet, owner } = await loadFixture(deployContractAndSetVariables);

    expect(await faucet.owner()).to.equal(owner.address);
  });

  it("should not allow withdrawal above .1 eth", async function () {
    const { faucet } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.withdraw(ethers.parseEther("0.11"))).to.be.revertedWithoutReason();
  });

  it("should not allow non-owners to call withdrawAll()", async function () {
    const { faucet, addr1 } = await loadFixture(deployContractAndSetVariables);
    await expect(faucet.connect(addr1).withdrawAll()).to.be.revertedWithoutReason(); // non-owner calling withdrawAll
  });

  it("should transfer all the ether to owner when called withdrawAll()", async function () {
    const { faucet, w } = await loadFixture(deployContractAndSetVariables);
    expect(await ethers.provider.getBalance(await faucet.getAddress())).to.equal(ethers.parseEther("1.0"));
    await faucet.withdrawAll();
    expect(await ethers.provider.getBalance(await faucet.getAddress())).to.equal(0);
  });
});
