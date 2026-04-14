import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import api from '../api/axios';

const Result = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  useEffect(() => {
    const storedResult = sessionStorage.getItem('homeoai_result');
    const storedFormData = sessionStorage.getItem('homeoai_formdata');

    if (!storedResult || !storedFormData) {
      navigate('/consult');
      return;
    }

    setResult(JSON.parse(storedResult));
    setFormData(JSON.parse(storedFormData));
  }, [navigate]);

  if (!result || !formData) return null;

  const handleSave = async () => {
    if (isSaved) return;
    setIsSaving(true);
    try {
      await api.post('/api/consultations/save', {
        form_data: formData,
        ai_response: result,
        top_remedies: result.remedies,
        constitutional_profile: result.constitutional_profile,
        chief_complaint: formData.chiefComplaint
      });
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save consultation', err);
      alert('Failed to save. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper to add text with wrapping
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
      y += 5; // space after block
    };

    const addFooter = () => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(150);
      doc.text("This report is for educational purposes only. Consult a qualified homeopathic practitioner.", margin, 290);
      doc.setTextColor(0);
    };

    addFooter();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text("HomeoAI — Homeopathic Analysis Report", margin, y);
    y += 15;
    
    doc.setTextColor(0);
    addWrappedText(`Date: ${new Date().toLocaleDateString()}`, 12);
    addWrappedText(`Patient: ${formData.age} years old ${formData.gender}`, 12);
    addWrappedText(`Chief Complaint: ${formData.chiefComplaint}`, 12);
    y += 5;
    
    // Profile
    doc.setTextColor(21, 128, 61);
    addWrappedText("Constitutional Profile", 16, true);
    doc.setTextColor(0);
    addWrappedText(result.constitutional_profile, 11);
    y += 5;

    // Remedies
    doc.setTextColor(21, 128, 61);
    addWrappedText("Recommended Remedies", 16, true);
    doc.setTextColor(0);

    result.remedies.forEach((remedy, idx) => {
      y += 5;
      addWrappedText(`${idx + 1}. ${remedy.name} (Match: ${remedy.match_strength})`, 14, true);
      addWrappedText(`Mental & Emotional Match:`, 11, true);
      addWrappedText(remedy.mental_emotional_match, 11);
      
      addWrappedText(`Physical Symptom Support:`, 11, true);
      addWrappedText(remedy.physical_support, 11);
      
      addWrappedText(`Distinguishing Traits:`, 11, true);
      addWrappedText(remedy.distinguishing_traits, 11);
    });

    doc.save(`homeoai-report-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center shadow-sm">
          <div className="text-4xl mb-2">🌿</div>
          <h1 className="text-2xl font-bold text-green-800">Homeopathic Analysis Complete</h1>
          <p className="text-green-700 mt-1">Based on classical repertory and materia medica principles</p>
        </div>

        {/* Profile */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-green-600 p-6">
          <h2 className="text-xl font-bold text-green-800 mb-4 border-b pb-2">Your Constitutional Profile</h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            {result.constitutional_profile}
          </p>
        </div>

        {/* Remedies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Remedies</h2>
          <div className="space-y-6">
            {result.remedies.map((remedy, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                  <h3 className="text-xl font-bold text-gray-900">{remedy.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    remedy.match_strength.toLowerCase() === 'high' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {remedy.match_strength} Match
                  </span>
                </div>
                
                <div className="p-6 space-y-4">
                  <details className="group" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-800">
                      <span>Mental & Emotional Match</span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" w="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">{remedy.mental_emotional_match}</p>
                  </details>
                  
                  <div className="border-t border-gray-100"></div>
                  
                  <details className="group" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-800">
                      <span>Physical Symptom Support</span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" w="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">{remedy.physical_support}</p>
                  </details>
                  
                  <div className="border-t border-gray-100"></div>

                  <details className="group" open>
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-gray-800">
                      <span>Distinguishing Traits</span>
                      <span className="transition group-open:rotate-180">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" w="24"><path d="M6 9l6 6 6-6"></path></svg>
                      </span>
                    </summary>
                    <p className="text-gray-600 mt-3 group-open:animate-fadeIn">{remedy.distinguishing_traits}</p>
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button 
            className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition"
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
          >
            <h3 className="font-bold text-gray-800">Your Symptom Summary</h3>
            <span className={`transform transition-transform ${isSummaryOpen ? 'rotate-180' : ''}`}>
               <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </button>
          
          {isSummaryOpen && (
            <div className="px-6 pb-6 pt-2 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div><span className="text-gray-500 text-sm block">Chief Complaint</span><span className="font-medium text-gray-800">{formData.chiefComplaint}</span></div>
                <div><span className="text-gray-500 text-sm block">Patient</span><span className="font-medium text-gray-800">{formData.age} yrs, {formData.gender}</span></div>
                
                {formData.fears?.length > 0 && (
                  <div className="col-span-1 md:col-span-2"><span className="text-gray-500 text-sm block">Fears</span><span className="font-medium text-gray-800">{formData.fears.join(', ')}</span></div>
                )}
                
                <div><span className="text-gray-500 text-sm block">Thermal Type</span><span className="font-medium text-gray-800">{formData.thermal}</span></div>
                
                {formData.cravings?.length > 0 && (
                  <div><span className="text-gray-500 text-sm block">Cravings</span><span className="font-medium text-gray-800">{formData.cravings.join(', ')}</span></div>
                )}
                
                {formData.sensations?.length > 0 && (
                  <div className="col-span-1 md:col-span-2"><span className="text-gray-500 text-sm block">Sensations</span><span className="font-medium text-gray-800">{formData.sensations.join(', ')}</span></div>
                )}
                
                {formData.betterFrom && (
                  <div className="col-span-1 md:col-span-2"><span className="text-gray-500 text-sm block">Better From</span><span className="font-medium text-gray-800">{formData.betterFrom}</span></div>
                )}
                
                {formData.worseFrom && (
                  <div className="col-span-1 md:col-span-2"><span className="text-gray-500 text-sm block">Worse From</span><span className="font-medium text-gray-800">{formData.worseFrom}</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button 
            onClick={handleSave} 
            disabled={isSaved || isSaving}
            className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center transition-all shadow-sm ${
              isSaved ? 'bg-green-100 text-green-700 cursor-not-allowed' : 'bg-green-700 text-white hover:bg-green-800 hover:shadow'
            }`}
          >
            {isSaved ? '✓ Saved!' : isSaving ? 'Saving...' : '💾 Save Consultation'}
          </button>
          
          <button 
            onClick={handleDownloadPDF} 
            className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 py-3 px-4 rounded-lg font-bold flex items-center justify-center shadow-sm transition-all"
          >
            📄 Download PDF Report
          </button>
          
          <button 
            onClick={() => {
              sessionStorage.removeItem('homeoai_result');
              sessionStorage.removeItem('homeoai_formdata');
              navigate('/consult');
            }} 
            className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 py-3 px-4 rounded-lg font-bold flex items-center justify-center shadow-sm transition-all"
          >
            🔄 New Consultation
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 text-center pt-8 px-4">
          ⚠️ This analysis is generated by AI for educational purposes only. It is not medical advice. Please consult a qualified homeopathic practitioner before taking any remedy.
        </p>

      </div>
    </div>
  );
};

export default Result;
