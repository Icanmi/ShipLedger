// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ShipmentTracking
 * @dev Smart contract for recording and verifying shipment events on blockchain
 * @notice Provides immutable tracking of cargo movements and status updates
 */
contract ShipmentTracking {
    
    // Struct for Shipment Event
    struct ShipmentEvent {
        string eventType;        // e.g., "Loaded", "Departed", "In Transit", "Arrived"
        string location;
        string description;
        uint256 timestamp;
        address recordedBy;
        bool verified;
    }
    
    // Struct for Customs Clearance
    struct CustomsClearance {
        string clearanceId;
        string shipmentId;
        address customsAuthority;
        string declarationType;
        string documentHash;
        uint256 requestedAt;
        uint256 approvedAt;
        bool approved;
        bool rejected;
        string notes;
    }
    
    // Struct for Port Operation
    struct PortOperation {
        string operationId;
        string shipmentId;
        address portAuthority;
        string operationType;      // "Arrival", "Berth Allocation", "Unloading", "Departure"
        string berthNumber;
        uint256 timestamp;
        string status;
        string notes;
    }
    
    // Struct for Shipment
    struct Shipment {
        string shipmentId;
        string blNumber;         // Reference to Bill of Lading
        string containerNumber;
        address shipper;
        address carrier;
        uint256 createdAt;
        ShipmentStatus status;
        bool exists;
    }
    
    // Enum for Shipment Status
    enum ShipmentStatus {
        Created,
        Loaded,
        InTransit,
        AtPort,
        CustomsClearance,
        OutForDelivery,
        Delivered
    }
    
    // Mapping from shipment ID to Shipment
    mapping(string => Shipment) private shipments;
    
    // Mapping from shipment ID to array of events
    mapping(string => ShipmentEvent[]) private shipmentEvents;
    
    // Mapping to track authorized recorders for each shipment
    mapping(string => mapping(address => bool)) private authorizedRecorders;
    
    // Mapping for customs clearances
    mapping(string => CustomsClearance) private customsClearances;
    mapping(string => string[]) private shipmentClearances;
    
    // Mapping for port operations
    mapping(string => PortOperation[]) private portOperations;
    
    // Array of all shipment IDs
    string[] private shipmentIds;
    
    // Events
    event ShipmentCreated(
        string indexed shipmentId,
        string blNumber,
        address indexed shipper,
        address indexed carrier,
        uint256 timestamp
    );
    
    event EventRecorded(
        string indexed shipmentId,
        string eventType,
        string location,
        address indexed recordedBy,
        uint256 timestamp
    );
    
    event StatusUpdated(
        string indexed shipmentId,
        ShipmentStatus newStatus,
        uint256 timestamp
    );
    
    event RecorderAuthorized(
        string indexed shipmentId,
        address indexed recorder,
        uint256 timestamp
    );
    
    event EventVerified(
        string indexed shipmentId,
        uint256 eventIndex,
        address indexed verifier,
        uint256 timestamp
    );
    
    event CustomsClearanceRequested(
        string indexed clearanceId,
        string indexed shipmentId,
        address indexed requester,
        uint256 timestamp
    );
    
    event CustomsClearanceApproved(
        string indexed clearanceId,
        address indexed customsAuthority,
        uint256 timestamp
    );
    
    event CustomsClearanceRejected(
        string indexed clearanceId,
        address indexed customsAuthority,
        string reason,
        uint256 timestamp
    );
    
    event PortOperationRecorded(
        string indexed operationId,
        string indexed shipmentId,
        string operationType,
        address indexed portAuthority,
        uint256 timestamp
    );
    
    event BerthAllocated(
        string indexed shipmentId,
        string berthNumber,
        address indexed portAuthority,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyShipper(string memory _shipmentId) {
        require(
            shipments[_shipmentId].shipper == msg.sender,
            "Only shipper can perform this action"
        );
        _;
    }
    
    modifier onlyAuthorizedRecorder(string memory _shipmentId) {
        require(
            authorizedRecorders[_shipmentId][msg.sender] ||
            shipments[_shipmentId].shipper == msg.sender ||
            shipments[_shipmentId].carrier == msg.sender,
            "Not authorized to record events"
        );
        _;
    }
    
    modifier shipmentExists(string memory _shipmentId) {
        require(shipments[_shipmentId].exists, "Shipment does not exist");
        _;
    }
    
    /**
     * @dev Create a new shipment
     * @param _shipmentId Unique shipment identifier
     * @param _blNumber Associated Bill of Lading number
     * @param _containerNumber Container number
     * @param _carrier Address of the carrier
     */
    function createShipment(
        string memory _shipmentId,
        string memory _blNumber,
        string memory _containerNumber,
        address _carrier
    ) public {
        require(!shipments[_shipmentId].exists, "Shipment already exists");
        require(_carrier != address(0), "Invalid carrier address");
        
        Shipment memory newShipment = Shipment({
            shipmentId: _shipmentId,
            blNumber: _blNumber,
            containerNumber: _containerNumber,
            shipper: msg.sender,
            carrier: _carrier,
            createdAt: block.timestamp,
            status: ShipmentStatus.Created,
            exists: true
        });
        
        shipments[_shipmentId] = newShipment;
        shipmentIds.push(_shipmentId);
        
        // Authorize shipper and carrier
        authorizedRecorders[_shipmentId][msg.sender] = true;
        authorizedRecorders[_shipmentId][_carrier] = true;
        
        emit ShipmentCreated(
            _shipmentId,
            _blNumber,
            msg.sender,
            _carrier,
            block.timestamp
        );
        
        emit RecorderAuthorized(_shipmentId, msg.sender, block.timestamp);
        emit RecorderAuthorized(_shipmentId, _carrier, block.timestamp);
    }
    
    /**
     * @dev Record a new shipment event
     * @param _shipmentId Shipment identifier
     * @param _eventType Type of event
     * @param _location Location of event
     * @param _description Event description
     */
    function recordEvent(
        string memory _shipmentId,
        string memory _eventType,
        string memory _location,
        string memory _description
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        ShipmentEvent memory newEvent = ShipmentEvent({
            eventType: _eventType,
            location: _location,
            description: _description,
            timestamp: block.timestamp,
            recordedBy: msg.sender,
            verified: false
        });
        
        shipmentEvents[_shipmentId].push(newEvent);
        
        emit EventRecorded(
            _shipmentId,
            _eventType,
            _location,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Update shipment status
     * @param _shipmentId Shipment identifier
     * @param _newStatus New shipment status
     */
    function updateStatus(
        string memory _shipmentId,
        ShipmentStatus _newStatus
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        require(
            uint(_newStatus) > uint(shipments[_shipmentId].status),
            "Cannot downgrade status"
        );
        
        shipments[_shipmentId].status = _newStatus;
        
        emit StatusUpdated(_shipmentId, _newStatus, block.timestamp);
    }
    
    /**
     * @dev Authorize a party to record events
     * @param _shipmentId Shipment identifier
     * @param _recorder Address to authorize
     */
    function authorizeRecorder(string memory _shipmentId, address _recorder)
        public
        onlyShipper(_shipmentId)
        shipmentExists(_shipmentId)
    {
        require(_recorder != address(0), "Invalid recorder address");
        
        authorizedRecorders[_shipmentId][_recorder] = true;
        
        emit RecorderAuthorized(_shipmentId, _recorder, block.timestamp);
    }
    
    /**
     * @dev Verify an event (e.g., by customs or port authority)
     * @param _shipmentId Shipment identifier
     * @param _eventIndex Index of the event to verify
     */
    function verifyEvent(string memory _shipmentId, uint256 _eventIndex)
        public
        onlyAuthorizedRecorder(_shipmentId)
        shipmentExists(_shipmentId)
    {
        require(_eventIndex < shipmentEvents[_shipmentId].length, "Invalid event index");
        
        shipmentEvents[_shipmentId][_eventIndex].verified = true;
        
        emit EventVerified(_shipmentId, _eventIndex, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get shipment details
     * @param _shipmentId Shipment identifier
     * @return Shipment struct
     */
    function getShipment(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (Shipment memory)
    {
        return shipments[_shipmentId];
    }
    
    /**
     * @dev Get all events for a shipment
     * @param _shipmentId Shipment identifier
     * @return Array of ShipmentEvent
     */
    function getShipmentEvents(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (ShipmentEvent[] memory)
    {
        return shipmentEvents[_shipmentId];
    }
    
    /**
     * @dev Get event count for a shipment
     * @param _shipmentId Shipment identifier
     * @return uint256 Number of events
     */
    function getEventCount(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (uint256)
    {
        return shipmentEvents[_shipmentId].length;
    }
    
    /**
     * @dev Check if address is authorized recorder
     * @param _shipmentId Shipment identifier
     * @param _recorder Address to check
     * @return bool True if authorized
     */
    function isAuthorizedRecorder(string memory _shipmentId, address _recorder)
        public
        view
        shipmentExists(_shipmentId)
        returns (bool)
    {
        return authorizedRecorders[_shipmentId][_recorder];
    }
    
    /**
     * @dev Get current shipment status
     * @param _shipmentId Shipment identifier
     * @return ShipmentStatus Current status
     */
    function getStatus(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (ShipmentStatus)
    {
        return shipments[_shipmentId].status;
    }
    
    /**
     * @dev Get total number of shipments
     * @return uint256 Total count
     */
    function getTotalShipments() public view returns (uint256) {
        return shipmentIds.length;
    }
    
    /**
     * @dev Get the latest event for a shipment
     * @param _shipmentId Shipment identifier
     * @return ShipmentEvent Latest event or empty struct if no events
     */
    function getLatestEvent(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (ShipmentEvent memory)
    {
        uint256 eventCount = shipmentEvents[_shipmentId].length;
        if (eventCount == 0) {
            return ShipmentEvent("", "", "", 0, address(0), false);
        }
        return shipmentEvents[_shipmentId][eventCount - 1];
    }
    
    /**
     * @dev Submit customs clearance request
     * @param _clearanceId Unique clearance identifier
     * @param _shipmentId Shipment identifier
     * @param _declarationType Type of customs declaration
     * @param _documentHash Hash of customs documents
     */
    function submitCustomsClearance(
        string memory _clearanceId,
        string memory _shipmentId,
        string memory _declarationType,
        string memory _documentHash
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        require(bytes(_clearanceId).length > 0, "Invalid clearance ID");
        require(
            customsClearances[_clearanceId].requestedAt == 0,
            "Clearance ID already exists"
        );
        
        CustomsClearance memory newClearance = CustomsClearance({
            clearanceId: _clearanceId,
            shipmentId: _shipmentId,
            customsAuthority: address(0),
            declarationType: _declarationType,
            documentHash: _documentHash,
            requestedAt: block.timestamp,
            approvedAt: 0,
            approved: false,
            rejected: false,
            notes: ""
        });
        
        customsClearances[_clearanceId] = newClearance;
        shipmentClearances[_shipmentId].push(_clearanceId);
        
        emit CustomsClearanceRequested(
            _clearanceId,
            _shipmentId,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Approve customs clearance
     * @param _clearanceId Clearance identifier
     * @param _notes Approval notes
     */
    function approveCustomsClearance(
        string memory _clearanceId,
        string memory _notes
    ) public {
        CustomsClearance storage clearance = customsClearances[_clearanceId];
        require(clearance.requestedAt > 0, "Clearance does not exist");
        require(!clearance.approved, "Already approved");
        require(!clearance.rejected, "Already rejected");
        require(
            authorizedRecorders[clearance.shipmentId][msg.sender],
            "Not authorized as customs authority"
        );
        
        clearance.customsAuthority = msg.sender;
        clearance.approved = true;
        clearance.approvedAt = block.timestamp;
        clearance.notes = _notes;
        
        emit CustomsClearanceApproved(_clearanceId, msg.sender, block.timestamp);
        
        recordEvent(
            clearance.shipmentId,
            "Customs Clearance Approved",
            "",
            _notes
        );
    }
    
    /**
     * @dev Reject customs clearance
     * @param _clearanceId Clearance identifier
     * @param _reason Rejection reason
     */
    function rejectCustomsClearance(
        string memory _clearanceId,
        string memory _reason
    ) public {
        CustomsClearance storage clearance = customsClearances[_clearanceId];
        require(clearance.requestedAt > 0, "Clearance does not exist");
        require(!clearance.approved, "Already approved");
        require(!clearance.rejected, "Already rejected");
        require(
            authorizedRecorders[clearance.shipmentId][msg.sender],
            "Not authorized as customs authority"
        );
        
        clearance.customsAuthority = msg.sender;
        clearance.rejected = true;
        clearance.notes = _reason;
        
        emit CustomsClearanceRejected(
            _clearanceId,
            msg.sender,
            _reason,
            block.timestamp
        );
    }
    
    /**
     * @dev Record port operation
     * @param _operationId Unique operation identifier
     * @param _shipmentId Shipment identifier
     * @param _operationType Type of port operation
     * @param _berthNumber Berth number (if applicable)
     * @param _status Operation status
     * @param _notes Additional notes
     */
    function recordPortOperation(
        string memory _operationId,
        string memory _shipmentId,
        string memory _operationType,
        string memory _berthNumber,
        string memory _status,
        string memory _notes
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        PortOperation memory newOperation = PortOperation({
            operationId: _operationId,
            shipmentId: _shipmentId,
            portAuthority: msg.sender,
            operationType: _operationType,
            berthNumber: _berthNumber,
            timestamp: block.timestamp,
            status: _status,
            notes: _notes
        });
        
        portOperations[_shipmentId].push(newOperation);
        
        emit PortOperationRecorded(
            _operationId,
            _shipmentId,
            _operationType,
            msg.sender,
            block.timestamp
        );
        
        recordEvent(_shipmentId, _operationType, "", _notes);
    }
    
    /**
     * @dev Allocate berth to shipment
     * @param _shipmentId Shipment identifier
     * @param _berthNumber Berth number
     */
    function allocateBerth(
        string memory _shipmentId,
        string memory _berthNumber
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        require(bytes(_berthNumber).length > 0, "Invalid berth number");
        
        emit BerthAllocated(_shipmentId, _berthNumber, msg.sender, block.timestamp);
        
        recordPortOperation(
            string(abi.encodePacked("BERTH-", _shipmentId, "-", _berthNumber)),
            _shipmentId,
            "Berth Allocation",
            _berthNumber,
            "Allocated",
            string(abi.encodePacked("Berth ", _berthNumber, " allocated"))
        );
    }
    
    /**
     * @dev Confirm vessel arrival at port
     * @param _shipmentId Shipment identifier
     * @param _berthNumber Assigned berth number
     */
    function confirmArrival(
        string memory _shipmentId,
        string memory _berthNumber
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        recordPortOperation(
            string(abi.encodePacked("ARRIVAL-", _shipmentId)),
            _shipmentId,
            "Vessel Arrival",
            _berthNumber,
            "Arrived",
            "Vessel arrived at port"
        );
    }
    
    /**
     * @dev Confirm cargo unloading completion
     * @param _shipmentId Shipment identifier
     */
    function confirmUnloading(
        string memory _shipmentId
    ) public onlyAuthorizedRecorder(_shipmentId) shipmentExists(_shipmentId) {
        recordPortOperation(
            string(abi.encodePacked("UNLOAD-", _shipmentId)),
            _shipmentId,
            "Cargo Unloading",
            "",
            "Completed",
            "Cargo unloading completed"
        );
    }
    
    /**
     * @dev Get customs clearance details
     * @param _clearanceId Clearance identifier
     * @return CustomsClearance struct
     */
    function getCustomsClearance(string memory _clearanceId)
        public
        view
        returns (CustomsClearance memory)
    {
        return customsClearances[_clearanceId];
    }
    
    /**
     * @dev Get all clearances for a shipment
     * @param _shipmentId Shipment identifier
     * @return Array of clearance IDs
     */
    function getShipmentClearances(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (string[] memory)
    {
        return shipmentClearances[_shipmentId];
    }
    
    /**
     * @dev Get all port operations for a shipment
     * @param _shipmentId Shipment identifier
     * @return Array of PortOperation
     */
    function getPortOperations(string memory _shipmentId)
        public
        view
        shipmentExists(_shipmentId)
        returns (PortOperation[] memory)
    {
        return portOperations[_shipmentId];
    }
}
