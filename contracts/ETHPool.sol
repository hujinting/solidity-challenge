// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract ETHPool {
    struct User {
        uint deposits;
        uint rewards;
    }
    mapping(address => User) public users;
    //mapping(address => uint) private userDeposits;
    //mapping(address => uint) private userRewards;
    address public owner;
    address[] public totalUsers;
    uint public totalDeposits;
    uint public totalRewards;
    
    event Deposit(address indexed user, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
}

    function deposit() external payable {
        require(msg.value > 0, "Please enter an amount greater than 0");
        if (users[msg.sender].deposits == 0){
            totalUsers.push(msg.sender);
        }    
        users[msg.sender].deposits += msg.value;
        totalDeposits += msg.value;
        
        emit Deposit (msg.sender, msg.value);
        
    }

    function withdraw() external {
        require(users[msg.sender].deposits > 0, "User has no deposits to withdraw");
        uint userDeposit = users[msg.sender].deposits;
        uint userReward = users[msg.sender].rewards;

        users[msg.sender].deposits = 0;
        users[msg.sender].rewards = 0;

        payable(msg.sender).transfer(userDeposit);
        payable(msg.sender).transfer(userReward);
        totalDeposits -= userDeposit;
        totalRewards -= userReward;

    }

    function addReward()  external payable onlyOwner {
        require(msg.value > 0, "Please enter an amount greater than 0");
        require(totalDeposits > 0, "No deposits");
        for(uint i=0;i<totalUsers.length;i++){
            address user = totalUsers[i];
            uint userDeposit = users[user].deposits;
            //uint userShare = (userDeposit * 100) / totalDeposits;
            //uint userReward = msg.value * userShare / 100;
            uint userReward = msg.value * userDeposit/totalDeposits;
            users[user].rewards += userReward;

        }
        totalRewards += msg.value;
    }

    function getUserDeposit() external view returns (uint){
        return users[msg.sender].deposits;
    }

    function getUserReward() external view returns (uint){
        return users[msg.sender].rewards;
    }

}
