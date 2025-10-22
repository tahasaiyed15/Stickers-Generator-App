
import React from 'react';
import { CustomerContact } from '../types';
import Card from './common/Card';

interface CustomerInfoProps {
  contacts: CustomerContact[];
}

// Fix: Updated component styling to be consistent with the app's light theme.
const CustomerInfo: React.FC<CustomerInfoProps> = ({ contacts }) => {
  return (
    <div className="space-y-6">
       <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Customer Support Queue</h2>
      <Card className="max-w-4xl mx-auto">
        {contacts.length === 0 ? (
          <p className="text-center text-gray-500">No customers are currently waiting for support.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 text-sm text-gray-600">
                <tr>
                  <th className="p-3 font-semibold">Name</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Phone</th>
                  <th className="p-3 font-semibold">Last Query</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <td className="p-3 text-gray-800">{contact.name}</td>
                    <td className="p-3 text-gray-800">{contact.email}</td>
                    <td className="p-3 text-gray-800">{contact.phone || 'N/A'}</td>
                    <td className="p-3 text-sm text-gray-600 truncate max-w-sm">{contact.query}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CustomerInfo;
