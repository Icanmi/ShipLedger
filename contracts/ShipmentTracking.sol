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
}
