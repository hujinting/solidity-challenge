// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract ETHPool {
    struct User {
        uint deposits;
        uint rewards;
    }
    mapping(address => User) public users; 
    address public owner;
    address[] public totalUsers;
    uint public totalDeposits;
    uint public totalRewards;
    
    event Deposit(address indexed user, uint amount);
    event AddReward(uint timestamp, uint amount);
    event Withdraw(address indexed user, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
}
    //存款
    function deposit() external payable {
        require(msg.value > 0, "Please enter an amount greater than 0");
        if (users[msg.sender].deposits == 0){
            totalUsers.push(msg.sender);
        }    
        users[msg.sender].deposits += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit (msg.sender, msg.value);
        
    }

    //取款
    function withdraw(uint _amount) external {
        require(_amount > 0, "Please enter an amount greater than 0");
        uint userDeposit = users[msg.sender].deposits;
        uint userReward = users[msg.sender].rewards;
        require(_amount <= (userDeposit+userReward), "Withdraw amount exceeds balance");
        if (_amount <= userDeposit){
            users[msg.sender].deposits -= _amount;
            payable(msg.sender).transfer(_amount);
            totalDeposits -= _amount;
        } else{
            uint diff = _amount - userDeposit;
            users[msg.sender].deposits = 0;
            users[msg.sender].rewards -= diff;
            payable(msg.sender).transfer(_amount);
            totalDeposits -= userDeposit;
            totalRewards -= diff;
        }
    }

    //派发奖励
    function addReward()  external payable onlyOwner {
        require(msg.value > 0, "Please enter an amount greater than 0");
        require(totalDeposits > 0, "No deposits");
        for(uint i=0;i<totalUsers.length;i++){
            address user = totalUsers[i];
            uint userDeposit = users[user].deposits;
            uint userReward = users[user].rewards;
            uint UserTotal = userDeposit + userReward;
            uint reward = msg.value * UserTotal / (totalDeposits+totalRewards);
            users[user].rewards += reward;

        }
        totalRewards += msg.value;
        emit AddReward(block.timestamp, msg.value);
    }

    //查询用户存款
    function getUserDeposit(address _user) external view returns (uint){
        return users[_user].deposits;
    }

    //查询用户奖励
    function getUserReward(address _user) external view returns (uint){
        return users[_user].rewards;
    }

}
