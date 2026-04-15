// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EduChain {
    struct Certificate {
        string courseName;
        string grade;
        uint256 issueDate;
        address issuer;
        bool exists;
    }

    struct StudentProfile {
        Certificate[] certificates;
        mapping(address => bool) authorizedViewers;
    }

    address public owner;
    mapping(address => StudentProfile) private studentProfiles;
    
    event CertificateIssued(address indexed student, string courseName, string grade);
    event AccessGranted(address indexed student, address indexed viewer);
    event AccessRevoked(address indexed student, address indexed viewer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the educational authority can issue certificates");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // 1. Diplom yoki sertifikatni yaratish
    function issueCertificate(address _student, string memory _courseName, string memory _grade) public onlyOwner {
        studentProfiles[_student].certificates.push(Certificate({
            courseName: _courseName,
            grade: _grade,
            issueDate: block.timestamp,
            issuer: msg.sender,
            exists: true
        }));
        
        emit CertificateIssued(_student, _courseName, _grade);
    }

    // 2. Haqiqiyligini tekshirish (Public)
    function verifyCertificate(address _student, uint256 _index) public view returns (string memory, string memory, uint256, address) {
        Certificate memory cert = studentProfiles[_student].certificates[_index];
        require(cert.exists, "Certificate does not exist");
        return (cert.courseName, cert.grade, cert.issueDate, cert.issuer);
    }

    // 3. Talaba ma'lumotlarini markazsiz holda saqlash va ko'rish
    // Faqat talaba yoki ruxsat etilgan shaxs ko'ra oladi
    function getMyCertificates(address _student) public view returns (Certificate[] memory) {
        require(msg.sender == _student || studentProfiles[_student].authorizedViewers[msg.sender], "Not authorized to view profile");
        return studentProfiles[_student].certificates;
    }

    // 4. Ma'lumotlarni boshqalarga ochish (Grant Access)
    function grantAccess(address _viewer) public {
        studentProfiles[msg.sender].authorizedViewers[_viewer] = true;
        emit AccessGranted(msg.sender, _viewer);
    }

    function revokeAccess(address _viewer) public {
        studentProfiles[msg.sender].authorizedViewers[_viewer] = false;
        emit AccessRevoked(msg.sender, _viewer);
    }
    
    function checkAccess(address _student, address _viewer) public view returns (bool) {
        return studentProfiles[_student].authorizedViewers[_viewer];
    }
}
