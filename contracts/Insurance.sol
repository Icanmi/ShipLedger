// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Insurance {
    address private owner;

    struct InsurancePolicy {
        string policyId;
        string blId;
        address insurer;
        address insured;
        uint256 coverageAmount;
        uint256 premium;
        string coverageType;
        uint256 startDate;
        uint256 endDate;
        PolicyStatus status;
        uint256 createdAt;
    }

    struct InsuranceClaim {
        string claimId;
        string policyId;
        string blId;
        address claimant;
        uint256 claimAmount;
        string incidentType;
        string description;
        string[] supportingDocuments;
        ClaimStatus status;
        uint256 submittedAt;
        uint256 processedAt;
        address processedBy;
        string resolutionNotes;
    }

    enum PolicyStatus {
        Draft,
        Active,
        Expired,
        Cancelled,
        ClaimPaid
    }

    enum ClaimStatus {
        Submitted,
        UnderReview,
        Approved,
        Rejected,
        Paid
    }

    mapping(string => InsurancePolicy) private policies;
    mapping(string => InsuranceClaim) private claims;
    mapping(string => string[]) private policyToClaims;
    mapping(string => bool) private policyExists;
    mapping(string => bool) private claimExists;
    mapping(address => bool) private authorizedInsurers;
    mapping(string => address) private policyInsurer;

    constructor() {
        owner = msg.sender;
    }

    event PolicyCreated(
        string indexed policyId,
        string indexed blId,
        address indexed insurer,
        address insured,
        uint256 coverageAmount
    );

    event PolicyStatusUpdated(
        string indexed policyId,
        PolicyStatus newStatus,
        uint256 timestamp
    );

    event ClaimSubmitted(
        string indexed claimId,
        string indexed policyId,
        address indexed claimant,
        uint256 claimAmount
    );

    event ClaimStatusUpdated(
        string indexed claimId,
        ClaimStatus newStatus,
        address processedBy,
        uint256 timestamp
    );

    event ClaimPaid(
        string indexed claimId,
        string indexed policyId,
        address indexed beneficiary,
        uint256 amount
    );

    event InsurerAuthorized(address indexed insurer, uint256 timestamp);
    event InsurerRevoked(address indexed insurer, uint256 timestamp);

    modifier onlyInsurer() {
        require(
            authorizedInsurers[msg.sender],
            "Only authorized insurers can perform this action"
        );
        _;
    }

    modifier onlyPolicyInsurer(string memory policyId) {
        require(
            policyInsurer[policyId] == msg.sender,
            "Only the policy issuer can perform this action"
        );
        _;
    }

    modifier policyMustExist(string memory policyId) {
        require(policyExists[policyId], "Policy does not exist");
        _;
    }

    modifier claimMustExist(string memory claimId) {
        require(claimExists[claimId], "Claim does not exist");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    function authorizeInsurer(address insurer) external onlyOwner {
        require(insurer != address(0), "Invalid insurer address");
        authorizedInsurers[insurer] = true;
        emit InsurerAuthorized(insurer, block.timestamp);
    }

    function revokeInsurer(address insurer) external onlyOwner {
        authorizedInsurers[insurer] = false;
        emit InsurerRevoked(insurer, block.timestamp);
    }

    function isAuthorizedInsurer(address insurer) external view returns (bool) {
        return authorizedInsurers[insurer];
    }

    function createPolicy(
        string memory policyId,
        string memory blId,
        address insured,
        uint256 coverageAmount,
        uint256 premium,
        string memory coverageType,
        uint256 startDate,
        uint256 endDate
    ) external onlyInsurer {
        require(!policyExists[policyId], "Policy ID already exists");
        require(insured != address(0), "Invalid insured address");
        require(coverageAmount > 0, "Coverage amount must be greater than zero");
        require(endDate > startDate, "End date must be after start date");
        require(endDate > block.timestamp, "End date must be in the future");

        policies[policyId] = InsurancePolicy({
            policyId: policyId,
            blId: blId,
            insurer: msg.sender,
            insured: insured,
            coverageAmount: coverageAmount,
            premium: premium,
            coverageType: coverageType,
            startDate: startDate,
            endDate: endDate,
            status: PolicyStatus.Draft,
            createdAt: block.timestamp
        });

        policyExists[policyId] = true;
        policyInsurer[policyId] = msg.sender;

        emit PolicyCreated(
            policyId,
            blId,
            msg.sender,
            insured,
            coverageAmount
        );
    }

    function activatePolicy(string memory policyId)
        external
        onlyPolicyInsurer(policyId)
        policyMustExist(policyId)
    {
        InsurancePolicy storage policy = policies[policyId];
        require(
            policy.status == PolicyStatus.Draft,
            "Policy must be in Draft status"
        );
        require(
            block.timestamp >= policy.startDate,
            "Policy start date not reached"
        );

        policy.status = PolicyStatus.Active;
        emit PolicyStatusUpdated(policyId, PolicyStatus.Active, block.timestamp);
    }

    function submitClaim(
        string memory claimId,
        string memory policyId,
        uint256 claimAmount,
        string memory incidentType,
        string memory description,
        string[] memory supportingDocuments
    ) external policyMustExist(policyId) {
        require(!claimExists[claimId], "Claim ID already exists");
        InsurancePolicy storage policy = policies[policyId];
        require(
            msg.sender == policy.insured,
            "Only the insured party can submit a claim"
        );
        require(
            policy.status == PolicyStatus.Active,
            "Policy must be active to submit claims"
        );
        require(
            block.timestamp <= policy.endDate,
            "Policy has expired"
        );
        require(
            claimAmount > 0 && claimAmount <= policy.coverageAmount,
            "Invalid claim amount"
        );

        claims[claimId] = InsuranceClaim({
            claimId: claimId,
            policyId: policyId,
            blId: policy.blId,
            claimant: msg.sender,
            claimAmount: claimAmount,
            incidentType: incidentType,
            description: description,
            supportingDocuments: supportingDocuments,
            status: ClaimStatus.Submitted,
            submittedAt: block.timestamp,
            processedAt: 0,
            processedBy: address(0),
            resolutionNotes: ""
        });

        claimExists[claimId] = true;
        policyToClaims[policyId].push(claimId);

        emit ClaimSubmitted(claimId, policyId, msg.sender, claimAmount);
    }

    function reviewClaim(string memory claimId)
        external
        onlyInsurer
        claimMustExist(claimId)
    {
        InsuranceClaim storage claim = claims[claimId];
        require(
            claim.status == ClaimStatus.Submitted,
            "Claim must be in Submitted status"
        );

        claim.status = ClaimStatus.UnderReview;
        emit ClaimStatusUpdated(
            claimId,
            ClaimStatus.UnderReview,
            msg.sender,
            block.timestamp
        );
    }

    function approveClaim(
        string memory claimId,
        string memory resolutionNotes
    ) external onlyInsurer claimMustExist(claimId) {
        InsuranceClaim storage claim = claims[claimId];
        require(
            claim.status == ClaimStatus.UnderReview,
            "Claim must be under review"
        );

        InsurancePolicy storage policy = policies[claim.policyId];
        require(
            policyInsurer[claim.policyId] == msg.sender,
            "Only the policy issuer can approve claims"
        );

        claim.status = ClaimStatus.Approved;
        claim.processedAt = block.timestamp;
        claim.processedBy = msg.sender;
        claim.resolutionNotes = resolutionNotes;

        emit ClaimStatusUpdated(
            claimId,
            ClaimStatus.Approved,
            msg.sender,
            block.timestamp
        );
    }

    function rejectClaim(
        string memory claimId,
        string memory resolutionNotes
    ) external onlyInsurer claimMustExist(claimId) {
        InsuranceClaim storage claim = claims[claimId];
        require(
            claim.status == ClaimStatus.UnderReview,
            "Claim must be under review"
        );

        require(
            policyInsurer[claim.policyId] == msg.sender,
            "Only the policy issuer can reject claims"
        );

        claim.status = ClaimStatus.Rejected;
        claim.processedAt = block.timestamp;
        claim.processedBy = msg.sender;
        claim.resolutionNotes = resolutionNotes;

        emit ClaimStatusUpdated(
            claimId,
            ClaimStatus.Rejected,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Pays out an approved insurance claim
     * @dev Insurer must send exact claim amount as msg.value, which is transferred to claimant
     * @param claimId The unique identifier of the claim to be paid
     */
    function payClaim(string memory claimId)
        external
        payable
        onlyInsurer
        claimMustExist(claimId)
    {
        InsuranceClaim storage claim = claims[claimId];
        require(
            claim.status == ClaimStatus.Approved,
            "Claim must be approved before payment"
        );
        require(
            msg.value == claim.claimAmount,
            "Payment amount must match claim amount"
        );

        InsurancePolicy storage policy = policies[claim.policyId];
        require(
            policyInsurer[claim.policyId] == msg.sender,
            "Only the policy issuer can pay claims"
        );

        claim.status = ClaimStatus.Paid;
        policy.status = PolicyStatus.ClaimPaid;

        // Transfer funds from insurer (msg.sender) to claimant
        payable(claim.claimant).transfer(msg.value);

        emit ClaimPaid(claimId, claim.policyId, claim.claimant, msg.value);
        emit ClaimStatusUpdated(
            claimId,
            ClaimStatus.Paid,
            msg.sender,
            block.timestamp
        );
    }

    function cancelPolicy(string memory policyId)
        external
        onlyPolicyInsurer(policyId)
        policyMustExist(policyId)
    {
        InsurancePolicy storage policy = policies[policyId];
        require(
            policy.status == PolicyStatus.Draft ||
                policy.status == PolicyStatus.Active,
            "Policy cannot be cancelled in current status"
        );

        string[] memory policyClaims = policyToClaims[policyId];
        for (uint256 i = 0; i < policyClaims.length; i++) {
            InsuranceClaim storage claim = claims[policyClaims[i]];
            require(
                claim.status != ClaimStatus.Approved &&
                    claim.status != ClaimStatus.Paid,
                "Cannot cancel policy with approved or paid claims"
            );
        }

        policy.status = PolicyStatus.Cancelled;
        emit PolicyStatusUpdated(
            policyId,
            PolicyStatus.Cancelled,
            block.timestamp
        );
    }

    function markPolicyExpired(string memory policyId)
        external
        policyMustExist(policyId)
    {
        InsurancePolicy storage policy = policies[policyId];
        require(
            policy.status == PolicyStatus.Active,
            "Policy must be active"
        );
        require(
            block.timestamp > policy.endDate,
            "Policy has not expired yet"
        );

        policy.status = PolicyStatus.Expired;
        emit PolicyStatusUpdated(
            policyId,
            PolicyStatus.Expired,
            block.timestamp
        );
    }

    function getPolicy(string memory policyId)
        external
        view
        policyMustExist(policyId)
        returns (InsurancePolicy memory)
    {
        return policies[policyId];
    }

    function getClaim(string memory claimId)
        external
        view
        claimMustExist(claimId)
        returns (InsuranceClaim memory)
    {
        return claims[claimId];
    }

    function getPolicyClaims(string memory policyId)
        external
        view
        policyMustExist(policyId)
        returns (string[] memory)
    {
        return policyToClaims[policyId];
    }

    function verifyPolicy(string memory policyId)
        external
        view
        returns (bool)
    {
        if (!policyExists[policyId]) {
            return false;
        }
        InsurancePolicy memory policy = policies[policyId];
        return policy.status == PolicyStatus.Active;
    }
}
