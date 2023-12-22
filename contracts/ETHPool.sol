// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract ETHPool {
    
    address public owner;
    //mapping(address => uint) private userDeposits;
    //mapping(address => uint) private userRewards;
    uint public totalDeposits;
    uint public totalRewards;
    struct Deposit {
        uint amount;
        uint rewardShare;
    }
    mapping(address => Deposit) public userDeposits;
    
    //event Deposit(address indexed user, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
}

    function deposit() external payable {
        require(msg.value > 0, "Please enter an amount greater than 0");
        Deposit storage userDeposit = userDeposits[msg.sender];
        if (userDeposit.amount > 0){
            preReward = totalRewards*(userDeposit.rewardShare/100);
            userDeposit.amount += msg.value;
            totalDeposits += msg.value;
            userDeposit.rewardShare = msg.value/totalDeposits * 100;

        }else{
            userDeposit.amount = msg.value;
            totalDeposits += msg.value;
            userDeposit.rewardShare = 0;      
        }
        userDeposits[msg.sender] += msg.value;
        
        //emit Deposit (msg.sender, msg.value);
        
    }

    function withdraw() external {

    }

    function addReward()  external payable onlyOwner {
        require(msg.value > 0, "Please enter an amount greater than 0");
        totalRewards += msg.value;
    }
}
