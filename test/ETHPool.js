const { ethers} = require("hardhat");
const { expect } = require("chai");
const { BigNumber } = require("ethers");
describe("ETHPool", function () {
  let ETHPool;
  let ethPool;
  let owner;
  let alice;
  let bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    ethPool = await ethers.deployContract("ETHPool");
    //ethPool = await ETHPool.deploy();
    await ethPool.waitForDeployment();
  });

  it("should allow users to deposit funds into the pool", async function () {
    const amount = ethers.parseEther("1");
    await ethPool.connect(alice).deposit({ value: amount });
    expect(await ethPool.users(alice.address)).to.deep.equal([amount,0]);
    expect(await ethPool.totalDeposits()).to.equal(amount);
  });

  it("should allow users to withdraw funds from the pool", async function () {
    const depositAmount = ethers.parseEther("1");
    const rewardsAmount = ethers.parseEther("2");
    //console.log(await ethers.provider.getBalance(bob.address))
    await ethPool.connect(bob).deposit({ value: depositAmount });
    await ethPool.addReward({ value: rewardsAmount});
    //deposit = await ethPool.connect(bob).getUserDeposit();
    //reward = await ethPool.connect(bob).getUserReward();
    //console.log(deposit,reward);
    await ethPool.connect(bob).withdraw();
    //expect(await ethers.provider.getBalance(bob.address)).to.equal(depositAmount+rewardsAmount);
    expect(await ethPool.users(bob.address)).to.deep.equal([0,0]);
    expect(await ethPool.totalDeposits()).to.equal(0);
  });

  it("should distribute rewards proportionally among participants", async function () {
    const depositAlice = ethers.parseEther("1");
    const depositBob = ethers.parseEther("2");
    const rewardsAmount = ethers.parseEther("3");
    await ethPool.connect(alice).deposit({ value: depositAlice });
    await ethPool.connect(bob).deposit({ value: depositBob });
    await ethPool.addReward({ value: rewardsAmount });
    const aliceRewards = rewardsAmount*depositAlice/(depositAlice+depositBob);
    const bobRewards = rewardsAmount*depositBob/(depositAlice+depositBob);
    expect(await ethPool.users(alice.address)).to.deep.equal([depositAlice,aliceRewards]);
    expect(await ethPool.users(bob.address)).to.deep.equal([depositBob,bobRewards]);
    expect(await ethPool.totalRewards()).to.equal(rewardsAmount);
    expect(await ethPool.totalDeposits()).to.equal(depositAlice+depositBob);
  });

  it("should allow only the owner to add rewards", async function () {
    const rewardsAmount = ethers.parseEther("1");
    await expect(ethPool.connect(alice).addReward({ value: rewardsAmount})).to.be.revertedWith(
      "Only owner can call this function"
    );
  });

  it("should not allow users to withdraw if they have no deposits", async function () {
    await expect(ethPool.connect(alice).withdraw()).to.be.revertedWith("User has no deposits to withdraw");
  });

  it("should return correct user deposit amount", async function () {
    const depositAmount = ethers.parseEther("1");
    await ethPool.connect(alice).deposit({ value: depositAmount });
    expect(await ethPool.connect(alice).getUserDeposit()).to.equal(depositAmount);
  });

  it("should return correct user reward amount", async function () {
    const depositAmount = ethers.parseEther("1");
    const rewardsAmount = ethers.parseEther("0.2");
    await ethPool.connect(alice).deposit({ value: depositAmount });
    await ethPool.addReward({ value: rewardsAmount});
    expect(await ethPool.connect(alice).getUserReward()).to.equal(rewardsAmount);
  });

});