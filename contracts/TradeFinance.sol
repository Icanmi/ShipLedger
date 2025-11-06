// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TradeFinance
 * @dev Smart contract for automated trade finance and payment workflows
 * @notice Handles Letter of Credit, payment milestones, and automated settlements
 */
contract TradeFinance {
    
    // Struct for Letter of Credit
    struct LetterOfCredit {
        string lcNumber;
        address issuer;          // Bank issuing the LC
        address beneficiary;     // Seller/Exporter
        address applicant;       // Buyer/Importer
        uint256 amount;
        uint256 issuedDate;
        uint256 expiryDate;
        LCStatus status;
        bool exists;
    }
    
    // Struct for Payment Milestone
    struct PaymentMilestone {
        string name;
        uint256 percentage;      // Percentage of total amount (0-100)
        MilestoneStatus status;
        uint256 completedAt;
        string documentReference; // Reference to required document (e.g., BL number)
    }
    
    // Enum for LC status
    enum LCStatus {
        Draft,
        Issued,
        DocumentsPresented,
        UnderReview,
        Accepted,
        Paid,
        Expired,
        Cancelled
    }
    
    // Enum for Milestone status
    enum MilestoneStatus {
        Pending,
        InProgress,
        Completed,
        Failed
    }
    
    // Mapping from LC number to Letter of Credit
    mapping(string => LetterOfCredit) private lettersOfCredit;
    
    // Mapping from LC number to array of milestones
    mapping(string => PaymentMilestone[]) private lcMilestones;
    
    // Mapping from LC number to released amount
    mapping(string => uint256) private releasedAmounts;
    
    // Array of all LC numbers
    string[] private lcNumbers;
    
    // Events
    event LetterOfCreditIssued(
        string indexed lcNumber,
        address indexed issuer,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );
    
    event DocumentsPresented(
        string indexed lcNumber,
        address indexed presenter,
        uint256 timestamp
    );
    
    event LCStatusUpdated(
        string indexed lcNumber,
        LCStatus newStatus,
        uint256 timestamp
    );
    
    event MilestoneCompleted(
        string indexed lcNumber,
        uint256 milestoneIndex,
        uint256 amount,
        uint256 timestamp
    );
    
    event PaymentReleased(
        string indexed lcNumber,
        address indexed beneficiary,
        uint256 amount,
        uint256 timestamp
    );
    
    event LCExpired(
        string indexed lcNumber,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyIssuer(string memory _lcNumber) {
        require(
            lettersOfCredit[_lcNumber].issuer == msg.sender,
            "Only issuer can perform this action"
        );
        _;
    }
    
    modifier onlyBeneficiary(string memory _lcNumber) {
        require(
            lettersOfCredit[_lcNumber].beneficiary == msg.sender,
            "Only beneficiary can perform this action"
        );
        _;
    }
    
    modifier lcExists(string memory _lcNumber) {
        require(lettersOfCredit[_lcNumber].exists, "Letter of Credit does not exist");
        _;
    }
    
    modifier notExpired(string memory _lcNumber) {
        require(
            block.timestamp <= lettersOfCredit[_lcNumber].expiryDate,
            "Letter of Credit has expired"
        );
        _;
    }
    
    /**
     * @dev Issue a new Letter of Credit
     * @param _lcNumber Unique LC number
     * @param _beneficiary Address of the beneficiary (seller)
     * @param _applicant Address of the applicant (buyer)
     * @param _amount LC amount in wei
     * @param _expiryDate Expiry timestamp
     */
    function issueLetterOfCredit(
        string memory _lcNumber,
        address _beneficiary,
        address _applicant,
        uint256 _amount,
        uint256 _expiryDate
    ) public payable {
        require(!lettersOfCredit[_lcNumber].exists, "LC already exists");
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_applicant != address(0), "Invalid applicant");
        require(_amount > 0, "Amount must be greater than 0");
        require(_expiryDate > block.timestamp, "Expiry date must be in future");
        require(msg.value >= _amount, "Insufficient payment");
        
        LetterOfCredit memory newLC = LetterOfCredit({
            lcNumber: _lcNumber,
            issuer: msg.sender,
            beneficiary: _beneficiary,
            applicant: _applicant,
            amount: _amount,
            issuedDate: block.timestamp,
            expiryDate: _expiryDate,
            status: LCStatus.Issued,
            exists: true
        });
        
        lettersOfCredit[_lcNumber] = newLC;
        lcNumbers.push(_lcNumber);
        
        emit LetterOfCreditIssued(
            _lcNumber,
            msg.sender,
            _beneficiary,
            _amount,
            block.timestamp
        );
    }
    
    /**
     * @dev Add a payment milestone to an LC
     * @param _lcNumber LC number
     * @param _name Milestone name
     * @param _percentage Percentage of total amount
     * @param _documentReference Reference to required document
     */
    function addMilestone(
        string memory _lcNumber,
        string memory _name,
        uint256 _percentage,
        string memory _documentReference
    ) public onlyIssuer(_lcNumber) lcExists(_lcNumber) {
        require(_percentage > 0 && _percentage <= 100, "Invalid percentage");
        
        PaymentMilestone memory milestone = PaymentMilestone({
            name: _name,
            percentage: _percentage,
            status: MilestoneStatus.Pending,
            completedAt: 0,
            documentReference: _documentReference
        });
        
        lcMilestones[_lcNumber].push(milestone);
    }
    
    /**
     * @dev Present documents for LC payment
     * @param _lcNumber LC number
     */
    function presentDocuments(string memory _lcNumber)
        public
        onlyBeneficiary(_lcNumber)
        lcExists(_lcNumber)
        notExpired(_lcNumber)
    {
        require(
            lettersOfCredit[_lcNumber].status == LCStatus.Issued,
            "LC must be in Issued status"
        );
        
        lettersOfCredit[_lcNumber].status = LCStatus.DocumentsPresented;
        
        emit DocumentsPresented(_lcNumber, msg.sender, block.timestamp);
        emit LCStatusUpdated(_lcNumber, LCStatus.DocumentsPresented, block.timestamp);
    }
    
    /**
     * @dev Accept presented documents
     * @param _lcNumber LC number
     */
    function acceptDocuments(string memory _lcNumber)
        public
        onlyIssuer(_lcNumber)
        lcExists(_lcNumber)
        notExpired(_lcNumber)
    {
        require(
            lettersOfCredit[_lcNumber].status == LCStatus.DocumentsPresented ||
            lettersOfCredit[_lcNumber].status == LCStatus.UnderReview,
            "Documents must be presented first"
        );
        
        lettersOfCredit[_lcNumber].status = LCStatus.Accepted;
        
        emit LCStatusUpdated(_lcNumber, LCStatus.Accepted, block.timestamp);
    }
    
    /**
     * @dev Complete a milestone and trigger payment
     * @param _lcNumber LC number
     * @param _milestoneIndex Index of the milestone
     */
    function completeMilestone(
        string memory _lcNumber,
        uint256 _milestoneIndex
    ) public onlyIssuer(_lcNumber) lcExists(_lcNumber) notExpired(_lcNumber) {
        require(_milestoneIndex < lcMilestones[_lcNumber].length, "Invalid milestone");
        require(
            lcMilestones[_lcNumber][_milestoneIndex].status == MilestoneStatus.Pending ||
            lcMilestones[_lcNumber][_milestoneIndex].status == MilestoneStatus.InProgress,
            "Milestone already completed or failed"
        );
        
        PaymentMilestone storage milestone = lcMilestones[_lcNumber][_milestoneIndex];
        milestone.status = MilestoneStatus.Completed;
        milestone.completedAt = block.timestamp;
        
        uint256 paymentAmount = (lettersOfCredit[_lcNumber].amount * milestone.percentage) / 100;
        releasedAmounts[_lcNumber] += paymentAmount;
        
        emit MilestoneCompleted(_lcNumber, _milestoneIndex, paymentAmount, block.timestamp);
        
        // Trigger automatic payment
        _releasePayment(_lcNumber, paymentAmount);
    }
    
    /**
     * @dev Internal function to release payment to beneficiary
     * @param _lcNumber LC number
     * @param _amount Amount to release
     */
    function _releasePayment(string memory _lcNumber, uint256 _amount) internal {
        address beneficiary = lettersOfCredit[_lcNumber].beneficiary;
        
        (bool success, ) = payable(beneficiary).call{value: _amount}("");
        require(success, "Payment transfer failed");
        
        emit PaymentReleased(_lcNumber, beneficiary, _amount, block.timestamp);
        
        // Check if all milestones completed
        if (releasedAmounts[_lcNumber] >= lettersOfCredit[_lcNumber].amount) {
            lettersOfCredit[_lcNumber].status = LCStatus.Paid;
            emit LCStatusUpdated(_lcNumber, LCStatus.Paid, block.timestamp);
        }
    }
    
    /**
     * @dev Cancel an LC (only if no payments released)
     * @param _lcNumber LC number
     */
    function cancelLetterOfCredit(string memory _lcNumber)
        public
        onlyIssuer(_lcNumber)
        lcExists(_lcNumber)
    {
        require(releasedAmounts[_lcNumber] == 0, "Cannot cancel LC with released payments");
        require(
            lettersOfCredit[_lcNumber].status != LCStatus.Paid,
            "Cannot cancel paid LC"
        );
        
        lettersOfCredit[_lcNumber].status = LCStatus.Cancelled;
        
        // Refund the issuer
        uint256 refundAmount = lettersOfCredit[_lcNumber].amount;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit LCStatusUpdated(_lcNumber, LCStatus.Cancelled, block.timestamp);
    }
    
    /**
     * @dev Mark LC as expired (can be called by anyone after expiry)
     * @param _lcNumber LC number
     */
    function markAsExpired(string memory _lcNumber) public lcExists(_lcNumber) {
        require(
            block.timestamp > lettersOfCredit[_lcNumber].expiryDate,
            "LC has not expired yet"
        );
        require(
            lettersOfCredit[_lcNumber].status != LCStatus.Paid &&
            lettersOfCredit[_lcNumber].status != LCStatus.Cancelled,
            "LC already finalized"
        );
        
        lettersOfCredit[_lcNumber].status = LCStatus.Expired;
        
        // Refund remaining amount to issuer
        uint256 remainingAmount = lettersOfCredit[_lcNumber].amount - releasedAmounts[_lcNumber];
        if (remainingAmount > 0) {
            (bool success, ) = payable(lettersOfCredit[_lcNumber].issuer).call{value: remainingAmount}("");
            require(success, "Refund transfer failed");
        }
        
        emit LCExpired(_lcNumber, block.timestamp);
        emit LCStatusUpdated(_lcNumber, LCStatus.Expired, block.timestamp);
    }
    
    /**
     * @dev Get Letter of Credit details
     * @param _lcNumber LC number
     * @return LetterOfCredit struct
     */
    function getLetterOfCredit(string memory _lcNumber)
        public
        view
        lcExists(_lcNumber)
        returns (LetterOfCredit memory)
    {
        return lettersOfCredit[_lcNumber];
    }
    
    /**
     * @dev Get all milestones for an LC
     * @param _lcNumber LC number
     * @return Array of PaymentMilestone
     */
    function getMilestones(string memory _lcNumber)
        public
        view
        lcExists(_lcNumber)
        returns (PaymentMilestone[] memory)
    {
        return lcMilestones[_lcNumber];
    }
    
    /**
     * @dev Get released amount for an LC
     * @param _lcNumber LC number
     * @return uint256 Released amount
     */
    function getReleasedAmount(string memory _lcNumber)
        public
        view
        lcExists(_lcNumber)
        returns (uint256)
    {
        return releasedAmounts[_lcNumber];
    }
    
    /**
     * @dev Get total number of LCs
     * @return uint256 Total count
     */
    function getTotalLettersOfCredit() public view returns (uint256) {
        return lcNumbers.length;
    }
}
