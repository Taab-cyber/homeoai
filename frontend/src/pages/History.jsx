import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

const History = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const res = await api.get('/api/consultations');
      setConsultations(res.data);
    } catch (err) {
      console.error('Failed to fetch consultations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (consultation) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    const addWrappedText = (text, fontSize, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text || '', maxLineWidth);
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
          addFooter();
        }
        doc.text(line, margin, y);
        y += fontSize * 0.4 + 2;
      });
      y += 5;
    };

    const addFooter = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text("This report is for educational purposes only. Consult a qualified practitioner.", margin, 290);
    };

    addFooter();

    doc.setFontSize(22);
    doc.setTextColor(21, 128, 61);
    doc.text("HomeoAI — Analysis Report", margin, y);
    y += 15;
    
    doc.setTextColor(0);
    addWrappedText(`Date: ${new Date(consultation.created_at).toLocaleDateString()}`, 12);
    addWrappedText(`Patient: ${consultation.form_data?.age || ''} yrs, ${consultation.form_data?.gender || ''}`, 12);
    addWrappedText(`Chief Complaint: ${consultation.chief_complaint}`, 12);
    y += 5;
    
    doc.setTextColor(21, 128, 61);
    addWrappedText("Constitutional Profile", 16, true);
    doc.setTextColor(0);
    addWrappedText(consultation.constitutional_profile, 11);
    y += 5;

    doc.setTextColor(21, 128, 61);
    addWrappedText("Recommended Remedies", 16, true);
    doc.setTextColor(0);

    consultation.top_remedies.forEach((rem, idx) => {
      y += 5;
      addWrappedText(`${idx + 1}. ${rem.name} (Match: ${rem.match_strength})`, 14, true);
      addWrappedText(`Mental & Emotional:`, 11, true);
      addWrappedText(rem.mental_emotional_match, 11);
      addWrappedText(`Physical Support:`, 11, true);
      addWrappedText(rem.physical_support, 11);
      addWrappedText(`Distinguishing Traits:`, 11, true);
      addWrappedText(rem.distinguishing_traits, 11);
    });

    doc.save(`homeoai-report-${Date.now()}.pdf`);
  };

  const filtered = consultations.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchesComplaint = (c.chief_complaint || '').toLowerCase().includes(term);
    const topRemediesStr = Array.isArray(c.top_remedies) 
      ? c.top_remedies.map(r => r.name).join(' ').toLowerCase() 
      : '';
    return matchesComplaint || topRemediesStr.includes(term);
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>📜</span> Consultation History
          </h1>
          
          <input 
            type="text" 
            placeholder="Search complaints or remedies..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500 shadow-sm outline-none"
          />
        </div>

        {consultations.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center border-t-4 border-green-500 mt-8">
            <h2 className="text-xl font-medium text-gray-800 mb-4">No consultations yet.</h2>
            <Link 
              to="/consult" 
              className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start your first analysis →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No consultations match your search.
          </div>
        ) : (
          <div className="space-y-4">
            {currentItems.map(c => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition">
                <div className="flex-grow space-y-2">
                  <div className="text-sm text-gray-500">
                    {new Date(c.created_at).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {c.chief_complaint.length > 60 ? c.chief_complaint.substring(0, 60) + '...' : c.chief_complaint}
                  </div>
                  {c.top_remedies && c.top_remedies.length > 0 && (
                    <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                      Top Remedy: {c.top_remedies[0].name}
                    </div>
                  )}
                </div>
                <div>
                  <button 
                    onClick={() => setSelectedConsultation(c)}
                    className="w-full md:w-auto px-5 py-2 bg-white border-2 border-green-600 text-green-700 font-bold rounded-lg hover:bg-green-50 transition"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded font-medium disabled:opacity-50 hover:bg-gray-100 bg-white"
                >
                  Previous
                </button>
                <div className="text-sm font-medium text-gray-600 border px-4 py-2 rounded bg-white">
                  Page {currentPage} of {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded font-medium disabled:opacity-50 hover:bg-gray-100 bg-white"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Overlay for Consultation Details */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="bg-green-700 px-6 py-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold">Analysis Report</h2>
              <button 
                onClick={() => setSelectedConsultation(null)}
                className="text-white hover:text-green-200 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8 bg-gray-50 flex-grow">
              
              <div className="bg-white border-l-4 border-green-600 p-6 rounded shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Patient Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                  <div><span className="text-gray-500 block">Date</span><span className="font-medium">{new Date(selectedConsultation.created_at).toLocaleDateString()}</span></div>
                  <div><span className="text-gray-500 block">Age & Gender</span><span className="font-medium">{selectedConsultation.form_data?.age} years, {selectedConsultation.form_data?.gender}</span></div>
                  <div className="col-span-2"><span className="text-gray-500 block">Chief Complaint</span><span className="font-medium text-gray-800">{selectedConsultation.chief_complaint}</span></div>
                </div>
              </div>

              <div className="bg-white border-l-4 border-green-600 p-6 rounded shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Constitutional Profile</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {selectedConsultation.constitutional_profile}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recommended Remedies</h3>
                <div className="space-y-4">
                  {selectedConsultation.top_remedies && selectedConsultation.top_remedies.map((remedy, idx) => (
                    <div key={idx} className="bg-white border rounded shadow-sm overflow-hidden">
                      <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                        <h4 className="font-bold text-gray-800 text-lg">{remedy.name}</h4>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-green-200 text-green-800">{remedy.match_strength} Match</span>
                      </div>
                      <div className="p-4 space-y-4 text-sm">
                        <details className="group" open>
                          <summary className="font-bold cursor-pointer outline-none">Mental & Emotional Match</summary>
                          <p className="mt-1 text-gray-700">{remedy.mental_emotional_match}</p>
                        </details>
                        <details className="group" open>
                          <summary className="font-bold cursor-pointer outline-none border-t pt-2 block">Physical Symptom Support</summary>
                          <p className="mt-1 text-gray-700">{remedy.physical_support}</p>
                        </details>
                        <details className="group" open>
                          <summary className="font-bold cursor-pointer outline-none border-t pt-2 block">Distinguishing Traits</summary>
                          <p className="mt-1 text-gray-700">{remedy.distinguishing_traits}</p>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t flex justify-end gap-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] relative z-10">
              <button 
                onClick={() => setSelectedConsultation(null)}
                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
              >
                Close
              </button>
              <button 
                onClick={() => handleDownloadPDF(selectedConsultation)}
                className="px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-bold shadow-sm"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default History;
