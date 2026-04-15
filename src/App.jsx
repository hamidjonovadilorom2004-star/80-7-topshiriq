import React, { useState } from 'react';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt 
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import EduChainABI from '../artifacts/contracts/EduChain.sol/EduChain.json';

const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';

function App() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('profile');
  const [studentAddr, setStudentAddr] = useState('');
  const [course, setCourse] = useState('');
  const [grade, setGrade] = useState('');
  const [viewerToGrant, setViewerToGrant] = useState('');

  const { data: certs } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: EduChainABI.abi,
    functionName: 'getMyCertificates',
    args: [studentAddr || address],
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash });

  const handleIssue = (e) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: EduChainABI.abi,
      functionName: 'issueCertificate',
      args: [studentAddr, course, grade],
    });
  };

  const handleGrant = (e) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: EduChainABI.abi,
      functionName: 'grantAccess',
      args: [viewerToGrant],
    });
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">EduVerify 🎓</div>
        <ConnectButton />
      </header>

      <main className="glass-panel">
        <h1>Decentralized Academic Ledger</h1>
        <p className="description">Secure certificates and diplomas verified by blockchain.</p>

        <div className="tab-buttons">
          <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Student Profile</button>
          <button onClick={() => setActiveTab('issue')} className={activeTab === 'issue' ? 'active' : ''}>Issue Certificate (Admin)</button>
          <button onClick={() => setActiveTab('access')} className={activeTab === 'access' ? 'active' : ''}>Access Management</button>
        </div>

        <div className="content-area">
          {activeTab === 'profile' && (
            <div className="profile-box">
              <h2>View Diplomas</h2>
              <input placeholder="Student Wallet Address" value={studentAddr} onChange={e => setStudentAddr(e.target.value)} />
              
              <div className="cert-grid">
                {certs && certs.length > 0 ? certs.map((c, i) => (
                  <div key={i} className="cert-card">
                    <h3>{c.courseName}</h3>
                    <p className="grade">Grade: {c.grade}</p>
                    <p className="meta">Issued at: {new Date(Number(c.issueDate)*1000).toLocaleDateString()}</p>
                    <p className="issuer">By: {c.issuer.slice(0,10)}...</p>
                  </div>
                )) : (
                  <p className="empty">No public certificates found for this address.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'issue' && (
            <div className="admin-box">
              <h2>Official Issuance</h2>
              <form onSubmit={handleIssue}>
                <input placeholder="Student Address" value={studentAddr} onChange={e => setStudentAddr(e.target.value)} />
                <input placeholder="Course Name (e.g. Computer Science)" value={course} onChange={e => setCourse(e.target.value)} />
                <input placeholder="Grade (e.g. A+)" value={grade} onChange={e => setGrade(e.target.value)} />
                <button type="submit" className="btn-primary">Sign & Issue on Blockchain</button>
              </form>
            </div>
          )}

          {activeTab === 'access' && (
            <div className="access-box">
              <h2>Student Controls</h2>
              <p>Authorize an employer or university to view your private academic results.</p>
              <form onSubmit={handleGrant}>
                <input placeholder="Viewer Address (University/Employer)" value={viewerToGrant} onChange={e => setViewerToGrant(e.target.value)} />
                <button type="submit" className="btn-secondary">Grant View Permission</button>
              </form>
            </div>
          )}
        </div>
      </main>

      {isMining && <div className="loading-overlay">Updating Credentials...</div>}
    </div>
  );
}

export default App;
