'use client';

import { BIMItem } from '@/types/bim';
import { Download, Copy } from 'lucide-react';

interface BIMScheduleProps {
  materials: BIMItem[];
  isLoading?: boolean;
}

export default function BIMSchedule({ materials, isLoading }: BIMScheduleProps) {
  const exportToCSV = () => {
    const headers = [
      'Code', 'Area', 'Location of Finish', 'Finish',
      'Supplier and Contact', 'Price per sqm (Low)', 'Price per sqm (Mid)', 'Price per sqm (High)'
    ];
    const csvContent = [
      headers.join(','),
      ...materials.map(item => [
        item.code,
        item.area,
        item.location,
        item.finish,
        item.supplierAndContact,
        item.pricePerSqm?.low || '',
        item.pricePerSqm?.mid || '',
        item.pricePerSqm?.high || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bim-materials.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const text = materials.map(item => 
      `${item.code} - ${item.area} - ${item.location} - ${item.finish} - ${item.supplierAndContact} - Low: £${item.pricePerSqm?.low || '-'} Mid: £${item.pricePerSqm?.mid || '-'} High: £${item.pricePerSqm?.high || '-'}`
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No materials generated yet. Upload an image and click &quot;Generate Materials&quot; to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">BIM Material Schedule</h3>
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 text-sm bg-[#34544D] text-white rounded-md hover:bg-[#2a433c] transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                Code
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Area
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                Location of Finish
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[300px]">
                Finish
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[350px]">
                Supplier and Contact
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                Price (Low)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                Price (Mid)
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                Price (High)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {materials.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-3 py-4 text-sm font-medium text-gray-900">
                  {item.code}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.area}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.location}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.finish}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.supplierAndContact}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.pricePerSqm?.low ? `£${item.pricePerSqm.low}` : '-'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.pricePerSqm?.mid ? `£${item.pricePerSqm.mid}` : '-'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-900">
                  {item.pricePerSqm?.high ? `£${item.pricePerSqm.high}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
