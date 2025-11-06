// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BillOfLading
 * @dev Smart contract for managing digital Bills of Lading on BlockDAG network
 * @notice This contract handles creation, verification, and transfer of eBLs
 */
contract BillOfLading {
    
    // Struct to represent a Bill of Lading
    struct BoL {
        string blNumber;
        address shipper;
        address consignee;
        address carrier;
        string vesselName;
        string voyageNumber;
        string portOfLoading;
        string portOfDischarge;
        string cargoDescription;
        uint256 createdAt;
        uint256 issuedAt;
        BLStatus status;
        address currentOwner;
        bool exists;
    }
    
    // Enum for Bill of Lading status
    enum BLStatus {
        Draft,
        Issued,
        InTransit,
        AtPort,
        CustomsClearance,
        Delivered,
        Surrendered
    }
    
    // Mapping from BL number to BoL struct
    mapping(string => BoL) private billsOfLading;
    
    // Mapping to track authorized parties for each BoL
    mapping(string => mapping(address => bool)) private authorizedParties;
    
    // Array to store all BL numbers
    string[] private blNumbers;
    
    // Events
    event BillOfLadingCreated(
        string indexed blNumber,
        address indexed shipper,
        address indexed consignee,
        uint256 timestamp
    );
    
    event BillOfLadingIssued(
        string indexed blNumber,
        address indexed issuer,
        uint256 timestamp
    );
    
    event StatusUpdated(
        string indexed blNumber,
        BLStatus newStatus,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        string indexed blNumber,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event PartyAuthorized(
        string indexed blNumber,
        address indexed party,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyShipper(string memory _blNumber) {
        require(
            billsOfLading[_blNumber].shipper == msg.sender,
            "Only shipper can perform this action"
        );
        _;
    }
    
    modifier onlyOwner(string memory _blNumber) {
        require(
            billsOfLading[_blNumber].currentOwner == msg.sender,
            "Only current owner can perform this action"
        );
        _;
    }
    
    modifier onlyAuthorized(string memory _blNumber) {
        require(
            authorizedParties[_blNumber][msg.sender] || 
            billsOfLading[_blNumber].currentOwner == msg.sender,
            "Not authorized to access this Bill of Lading"
        );
        _;
    }
    
    modifier bolExists(string memory _blNumber) {
        require(billsOfLading[_blNumber].exists, "Bill of Lading does not exist");
        _;
    }
    
    /**
     * @dev Create a new Bill of Lading
     * @param _blNumber Unique Bill of Lading number
     * @param _consignee Address of the consignee
     * @param _carrier Address of the carrier
     * @param _vesselName Name of the vessel
     * @param _voyageNumber Voyage number
     * @param _portOfLoading Port of loading
     * @param _portOfDischarge Port of discharge
     * @param _cargoDescription Description of cargo
     */
    function createBillOfLading(
        string memory _blNumber,
        address _consignee,
        address _carrier,
        string memory _vesselName,
        string memory _voyageNumber,
        string memory _portOfLoading,
        string memory _portOfDischarge,
        string memory _cargoDescription
    ) public {
        require(!billsOfLading[_blNumber].exists, "Bill of Lading already exists");
        require(_consignee != address(0), "Invalid consignee address");
        require(_carrier != address(0), "Invalid carrier address");
        
        BoL memory newBoL = BoL({
            blNumber: _blNumber,
            shipper: msg.sender,
            consignee: _consignee,
            carrier: _carrier,
            vesselName: _vesselName,
            voyageNumber: _voyageNumber,
            portOfLoading: _portOfLoading,
            portOfDischarge: _portOfDischarge,
            cargoDescription: _cargoDescription,
            createdAt: block.timestamp,
            issuedAt: 0,
            status: BLStatus.Draft,
            currentOwner: msg.sender,
            exists: true
        });
        
        billsOfLading[_blNumber] = newBoL;
        blNumbers.push(_blNumber);
        
        // Authorize shipper, consignee, and carrier
        authorizedParties[_blNumber][msg.sender] = true;
        authorizedParties[_blNumber][_consignee] = true;
        authorizedParties[_blNumber][_carrier] = true;
        
        emit BillOfLadingCreated(_blNumber, msg.sender, _consignee, block.timestamp);
        emit PartyAuthorized(_blNumber, _consignee, block.timestamp);
        emit PartyAuthorized(_blNumber, _carrier, block.timestamp);
    }
    
    /**
     * @dev Issue the Bill of Lading (move from Draft to Issued status)
     * @param _blNumber Bill of Lading number
     */
    function issueBillOfLading(string memory _blNumber) 
        public 
        onlyShipper(_blNumber) 
        bolExists(_blNumber) 
    {
        require(
            billsOfLading[_blNumber].status == BLStatus.Draft,
            "Bill of Lading must be in Draft status"
        );
        
        billsOfLading[_blNumber].status = BLStatus.Issued;
        billsOfLading[_blNumber].issuedAt = block.timestamp;
        
        emit BillOfLadingIssued(_blNumber, msg.sender, block.timestamp);
        emit StatusUpdated(_blNumber, BLStatus.Issued, block.timestamp);
    }
    
    /**
     * @dev Update the status of a Bill of Lading
     * @param _blNumber Bill of Lading number
     * @param _newStatus New status
     */
    function updateStatus(string memory _blNumber, BLStatus _newStatus)
        public
        onlyAuthorized(_blNumber)
        bolExists(_blNumber)
    {
        require(
            billsOfLading[_blNumber].status != BLStatus.Surrendered,
            "Cannot update surrendered Bill of Lading"
        );
        
        billsOfLading[_blNumber].status = _newStatus;
        
        emit StatusUpdated(_blNumber, _newStatus, block.timestamp);
    }
    
    /**
     * @dev Transfer ownership of the Bill of Lading
     * @param _blNumber Bill of Lading number
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(string memory _blNumber, address _newOwner)
        public
        onlyOwner(_blNumber)
        bolExists(_blNumber)
    {
        require(_newOwner != address(0), "Invalid new owner address");
        require(
            billsOfLading[_blNumber].status != BLStatus.Surrendered,
            "Cannot transfer surrendered Bill of Lading"
        );
        
        address previousOwner = billsOfLading[_blNumber].currentOwner;
        billsOfLading[_blNumber].currentOwner = _newOwner;
        authorizedParties[_blNumber][_newOwner] = true;
        
        emit OwnershipTransferred(_blNumber, previousOwner, _newOwner, block.timestamp);
        emit PartyAuthorized(_blNumber, _newOwner, block.timestamp);
    }
    
    /**
     * @dev Surrender the Bill of Lading (final state)
     * @param _blNumber Bill of Lading number
     */
    function surrenderBillOfLading(string memory _blNumber)
        public
        onlyOwner(_blNumber)
        bolExists(_blNumber)
    {
        require(
            billsOfLading[_blNumber].status == BLStatus.Delivered,
            "Bill of Lading must be delivered before surrender"
        );
        
        billsOfLading[_blNumber].status = BLStatus.Surrendered;
        
        emit StatusUpdated(_blNumber, BLStatus.Surrendered, block.timestamp);
    }
    
    /**
     * @dev Authorize a party to access the Bill of Lading
     * @param _blNumber Bill of Lading number
     * @param _party Address to authorize
     */
    function authorizeParty(string memory _blNumber, address _party)
        public
        onlyShipper(_blNumber)
        bolExists(_blNumber)
    {
        require(_party != address(0), "Invalid party address");
        
        authorizedParties[_blNumber][_party] = true;
        
        emit PartyAuthorized(_blNumber, _party, block.timestamp);
    }
    
    /**
     * @dev Get Bill of Lading details
     * @param _blNumber Bill of Lading number
     * @return BoL struct
     */
    function getBillOfLading(string memory _blNumber)
        public
        view
        onlyAuthorized(_blNumber)
        bolExists(_blNumber)
        returns (BoL memory)
    {
        return billsOfLading[_blNumber];
    }
    
    /**
     * @dev Check if an address is authorized for a Bill of Lading
     * @param _blNumber Bill of Lading number
     * @param _party Address to check
     * @return bool True if authorized
     */
    function isAuthorized(string memory _blNumber, address _party)
        public
        view
        bolExists(_blNumber)
        returns (bool)
    {
        return authorizedParties[_blNumber][_party];
    }
    
    /**
     * @dev Get the current owner of a Bill of Lading
     * @param _blNumber Bill of Lading number
     * @return address Current owner
     */
    function getOwner(string memory _blNumber)
        public
        view
        bolExists(_blNumber)
        returns (address)
    {
        return billsOfLading[_blNumber].currentOwner;
    }
    
    /**
     * @dev Get the status of a Bill of Lading
     * @param _blNumber Bill of Lading number
     * @return BLStatus Current status
     */
    function getStatus(string memory _blNumber)
        public
        view
        bolExists(_blNumber)
        returns (BLStatus)
    {
        return billsOfLading[_blNumber].status;
    }
    
    /**
     * @dev Get total number of Bills of Lading
     * @return uint256 Total count
     */
    function getTotalBillsOfLading() public view returns (uint256) {
        return blNumbers.length;
    }
    
    /**
     * @dev Verify the authenticity of a Bill of Lading
     * @param _blNumber Bill of Lading number
     * @return bool True if exists and issued
     */
    function verifyBillOfLading(string memory _blNumber)
        public
        view
        returns (bool)
    {
        return billsOfLading[_blNumber].exists && 
               billsOfLading[_blNumber].status != BLStatus.Draft;
    }
}
