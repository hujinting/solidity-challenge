const { expect } = require("chai");

describe("ETHPool", function() {
  let ETHPool;
  let owner;
  let user1;
  let user2;

  beforeEach(async function() {
    [owner, user1, user2] = await ethers.getSigners();
    const ETHPool = await ethers.deployContract("ETHPool");
    //THPool = await ETHPoolFactory.deploy();
    await ETHPool.waitForDeployment();

    await ETHPool.connect(owner).deposit({ value: ethers.utils.parseEther("10") });
  });

  it("should deposit ETH", async function() {
    await ETHPool.connect(user1).deposit({ value: ethers.utils.parseEther("5") });

    const userDeposit = await ETHPool.getUserDeposit(user1.address);
    expect(userDeposit).to.equal(ethers.utils.parseEther("5"));

    const totalDeposits = await ETHPool.getTotalDeposits();
    expect(totalDeposits).to.equal(ethers.utils.parseEther("15"));
  });

  it("should add reward", async function() {
    await ETHPool.connect(owner).addReward({ value: ethers.utils.parseEther("5") });

    const userReward = await ETHPool.getUserReward(owner.address);
    expect(userReward).to.equal(ethers.utils.parseEther("5"));

    const totalDeposits = await ETHPool.getTotalDeposits();
    expect(totalDeposits).to.equal(ethers.utils.parseEther("15"));
  });

  it("should withdraw deposit and reward", async function() {
    await ETHPool.connect(user1).deposit({ value: ethers.utils.parseEther("5") });
    await ETHPool.connect(owner).addReward({ value: ethers.utils.parseEther("5") });

    const balanceBefore = await user1.getBalance();
    const receipt = await ETHPool.connect(user1).withdraw();
    const balanceAfter = await user1.getBalance();

    const expectedBalance = balanceBefore.add(ethers.utils.parseEther("10"));
    expect(balanceAfter).to.equal(expectedBalance);

    const userDeposit = await ETHPool.getUserDeposit(user1.address);
    expect(userDeposit).to.equal(0);

    const userReward = await ETHPool.getUserReward(owner.address);
    expect(userReward).to.equal(0);

    const totalDeposits = await ETHPool.getTotalDeposits();
    expect(totalDeposits).to.equal(ethers.utils.parseEther("10"));

    expect(receipt).to.emit(ETHPool, "Withdrawal").withArgs(user1.address, ethers.utils.parseEther("5"), ethers.utils.parseEther("5"));
  });
});