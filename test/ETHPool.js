const { ethers} = require("hardhat");
const { expect } = require("chai");

describe("ETHPool", function () {
  let ethPool;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    ethPool = await ethers.deployContract("ETHPool");
    await ethPool.waitForDeployment();
  });

  it("should allow users to deposit", async function () {
    const amount = ethers.parseEther("1");
    await ethPool.connect(user1).deposit({ value: amount });
    expect(await ethPool.users(user1.address)).to.deep.equal([amount,0]);
    expect(await ethPool.totalDeposits()).to.equal(amount);
    expect(await ethPool.totalRewards()).to.equal(0);
  });

  it("should allow only the owner to add rewards", async function () {
    const rewardsAmount = ethers.parseEther("1");
    await expect(ethPool.connect(user1).addReward({ value: rewardsAmount})).to.be.revertedWith(
      "Only owner can call this function");
  });

  it("should not to add rewards when no deposits", async function() {
    const rewardsAmount = ethers.parseEther("1");
    await expect(ethPool.addReward({value: rewardsAmount})).to.be.revertedWith("No deposits");
  });

  it("should allow users to withdraw", async function () {
    const depositAmount = ethers.parseEther("1");
    const rewardsAmount = ethers.parseEther("2");
    const withdrawAmount = ethers.parseEther("2");
    await ethPool.connect(user2).deposit({ value: depositAmount });
    await ethPool.addReward({ value: rewardsAmount});
    await ethPool.connect(user2).withdraw(withdrawAmount);
    expect(await ethPool.users(user2.address)).to.deep.equal([0,ethers.parseEther("1")]);
    expect(await ethPool.totalDeposits()).to.equal(0);
    expect(await ethPool.totalRewards()).to.equal(ethers.parseEther("1"));
  });

  it("should distribute rewards based on shares", async function () {
    const depositUser1 = ethers.parseEther("1");
    const depositUser2 = ethers.parseEther("2");
    const rewardsAmount = ethers.parseEther("4");
    await ethPool.connect(user1).deposit({ value: depositUser1 });
    await ethPool.connect(user2).deposit({ value: depositUser2 });
    await ethPool.addReward({ value: rewardsAmount });
    const user1Rewards = rewardsAmount*depositUser1/(depositUser1+depositUser2);
    const user2Rewards = rewardsAmount*depositUser2/(depositUser1+depositUser2);
    expect(await ethPool.users(user1.address)).to.deep.equal([depositUser1,user1Rewards]);
    expect(await ethPool.users(user2.address)).to.deep.equal([depositUser2,user2Rewards]);
    expect(await ethPool.totalRewards()).to.equal(rewardsAmount);
    expect(await ethPool.totalDeposits()).to.equal(depositUser1+depositUser2);
  });

  it("should not allow users to withdraw exceeds balance", async function () {
    const depositUser1 = ethers.parseEther("1");
    const withdrawAmount = ethers.parseEther("2");
    await ethPool.connect(user1).deposit({ value: depositUser1 });
    await expect(ethPool.connect(user1).withdraw(withdrawAmount)).to.be.revertedWith("Withdraw amount exceeds balance");
  });

  it("should return correct user deposit amount", async function () {
    const depositAmount = ethers.parseEther("1");
    await ethPool.connect(user1).deposit({ value: depositAmount });
    expect(await ethPool.getUserDeposit(user1)).to.equal(depositAmount);
  });

  it("should return correct user reward amount", async function () {
    const depositAmount = ethers.parseEther("1");
    const rewardsAmount = ethers.parseEther("0.1");
    await ethPool.connect(user1).deposit({ value: depositAmount });
    await ethPool.addReward({ value: rewardsAmount});
    expect(await ethPool.getUserReward(user1)).to.equal(rewardsAmount);
  });

});