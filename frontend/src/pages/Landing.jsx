import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Section 1 - Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white flex-grow flex items-center">
        <div className="max-w-4xl mx-auto text-center px-4 py-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Classical Homeopathy Meets Artificial Intelligence
          </h1>
          <p className="text-xl md:text-2xl font-light mb-10 opacity-90">
            Describe your symptoms. Get a personalized remedy analysis based on Kent's Repertory and Boericke's Materia Medica.
          </p>
          <Link 
            to="/auth"
            className="inline-block bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-4 rounded-full text-lg shadow-lg transform transition hover:scale-105"
          >
            Start Your Analysis
          </Link>
        </div>
      </section>

      {/* Section 2 - How It Works */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-8 rounded-2xl shadow-sm text-center border-t-4 border-green-500 hover:shadow-md transition">
              <div className="text-5xl mb-4 text-green-600">📋</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Describe Symptoms</h3>
              <p className="text-gray-600">
                Fill our detailed intake form covering mental, emotional, and physical symptoms to capture your exact state.
              </p>
            </div>
            
            <div className="bg-green-50 p-8 rounded-2xl shadow-sm text-center border-t-4 border-green-500 hover:shadow-md transition">
              <div className="text-5xl mb-4 text-green-600">🤖</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your symptom totality using classical homeopathic principles and proven repertory logic.
              </p>
            </div>

            <div className="bg-green-50 p-8 rounded-2xl shadow-sm text-center border-t-4 border-green-500 hover:shadow-md transition">
              <div className="text-5xl mb-4 text-green-600">🌿</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Get Your Remedy</h3>
              <p className="text-gray-600">
                Receive a personalized constitutional analysis with top remedy suggestions and detailed materica medica alignments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 - Disclaimer */}
      <section className="bg-green-100 py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-green-800 text-sm font-medium">
            <span className="text-lg mr-2">⚠️</span>
            HomeoAI is an educational tool only. It does not replace professional medical advice. Always consult a qualified homeopathic practitioner.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
