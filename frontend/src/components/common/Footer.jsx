import React from 'react';
import { Sun, Mail, Phone, MapPin, Heart } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-solar-navy text-white pt-16 pb-8 border-t border-sky-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-700/60">
          
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-300" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Solar<span className="text-solar-sky">Desk</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Professional Solar Panel Installation and Maintenance Field Desk. Powering sustainable homes and businesses with clean solar energy.
            </p>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-solar-sky mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors">Residential Solar PV</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors">Commercial Rooftop Mounting</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors">Panel Cleaning & Maintenance</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors">Inverter Troubleshooting</button></li>
              <li><button onClick={() => onNavigate && onNavigate('services')} className="hover:text-white transition-colors">Efficiency Diagnostic Audits</button></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-solar-sky mb-4">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><button onClick={() => onNavigate && onNavigate('home')} className="hover:text-white transition-colors">Home Landing</button></li>
              <li><button onClick={() => onNavigate && onNavigate('how-it-works')} className="hover:text-white transition-colors">Our Workflow</button></li>
              <li><button onClick={() => onNavigate && onNavigate('sign-in')} className="hover:text-white transition-colors">Technician & Customer Login</button></li>
              <li><button onClick={() => onNavigate && onNavigate('sign-up')} className="hover:text-white transition-colors">Customer Registration</button></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-solar-sky mb-4">Contact Field Desk</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-solar-sky flex-shrink-0" />
                <span>Sunrise Tower, OMR IT Expressway, Chennai</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-solar-sky flex-shrink-0" />
                <span>+91 98401 23456 / 044-24567890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-solar-sky flex-shrink-0" />
                <span>support@solarfielddesk.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Solar Panel Installation and Maintenance Field Desk. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-1">
            <span>Clean Energy Workforce Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
