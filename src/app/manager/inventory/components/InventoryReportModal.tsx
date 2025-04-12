'use client';

import React, { useState } from 'react';
import { FaTimes, FaPrint, FaDownload, FaFilter, FaChartBar, FaExclamationTriangle, FaCalendarAlt, FaTag, FaSortAmountDown } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface InventoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
}

export default function InventoryReportModal({ isOpen, onClose, categories }: InventoryReportModalProps) {
  const [reportType, setReportType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  if (!isOpen) return null;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReportData(null);
    
    try {
      const response = await fetch('/api/manager/inventory/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reportType,
          category: selectedCategory
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }
      
      const data = await response.json();
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportData) return;
    
    // Open a new window with the report content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print reports');
      return;
    }
    
    // Format date for report
    const formattedDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Generate HTML for the report
    const reportTitle = reportType === 'low-stock' 
      ? 'Low Stock Items Report'
      : reportType === 'expiring-soon'
      ? 'Expiring Soon Items Report'
      : reportType === 'category'
      ? `Inventory by Category: ${selectedCategory}`
      : reportType === 'value'
      ? 'Inventory by Value Report'
      : 'Complete Inventory Report';
      
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    // Generate the report HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .report-header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 1px solid #ddd;
            }
            .report-title {
              font-size: 22px;
              font-weight: bold;
              margin: 0;
            }
            .report-date {
              font-size: 14px;
              color: #666;
              margin: 5px 0;
            }
            .summary-section {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              margin-bottom: 20px;
              gap: 15px;
            }
            .summary-box {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
              flex: 1;
              min-width: 200px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .summary-label {
              font-size: 14px;
              color: #666;
              margin-bottom: 5px;
            }
            .summary-value {
              font-size: 22px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .critical {
              color: #d32f2f;
              font-weight: bold;
            }
            .low {
              color: #f57c00;
              font-weight: bold;
            }
            .good {
              color: #388e3c;
            }
            .expired {
              background-color: #ffebee;
            }
            .category-summary {
              margin-top: 20px;
              margin-bottom: 20px;
            }
            .category-header {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              padding-bottom: 5px;
              border-bottom: 1px solid #eee;
            }
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <h1 class="report-title">${reportTitle}</h1>
            <p class="report-date">Generated on ${formattedDate}</p>
          </div>
          
          <div class="summary-section">
            <div class="summary-box">
              <div class="summary-label">Total Items</div>
              <div class="summary-value">${reportData.summary.totalItems}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Total Value</div>
              <div class="summary-value">${formatCurrency(reportData.summary.totalValue)}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">Low Stock Items</div>
              <div class="summary-value ${reportData.summary.lowStockItems > 0 ? 'critical' : ''}">${reportData.summary.lowStockItems}</div>
            </div>
          </div>
          
          <div class="category-summary">
            <div class="category-header">Category Summary</div>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item Count</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(reportData.summary.categorySummary).map(([category, data]: [string, any]) => `
                  <tr>
                    <td>${category}</td>
                    <td>${data.count}</td>
                    <td>${formatCurrency(data.value)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="items-section">
            <h2>Inventory Items (${reportData.items.length})</h2>
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Cost Per Unit</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Supplier</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.items.map((item: any) => {
                  const expiryDate = new Date(item.expiryDate).toLocaleDateString();
                  const now = new Date();
                  const expiryDateObj = new Date(item.expiryDate);
                  const isExpired = expiryDateObj < now;
                  const isExpiringSoon = !isExpired && (expiryDateObj.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000);
                  
                  return `
                    <tr class="${isExpired ? 'expired' : ''}">
                      <td>${item.name}</td>
                      <td>${item.category}</td>
                      <td>${item.quantity} ${item.unit}</td>
                      <td>${item.unit}</td>
                      <td>${formatCurrency(item.costPerUnit)}</td>
                      <td>${formatCurrency(item.totalCost)}</td>
                      <td class="${
                        item.status === 'Critical Stock' ? 'critical' : 
                        item.status === 'Low Stock' ? 'low' : 'good'
                      }">${item.status}</td>
                      <td>${item.supplier}</td>
                      <td class="${isExpired ? 'critical' : isExpiringSoon ? 'low' : ''}">${expiryDate}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
            <p>End of Report</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-4 mb-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Generate Inventory Report</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    reportType === 'all' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onClick={() => setReportType('all')}
                >
                  <FaChartBar className={`mr-2 ${reportType === 'all' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Complete Inventory</div>
                    <div className="text-xs text-gray-500">All inventory items</div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    reportType === 'low-stock' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onClick={() => setReportType('low-stock')}
                >
                  <FaExclamationTriangle className={`mr-2 ${reportType === 'low-stock' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Low Stock Items</div>
                    <div className="text-xs text-gray-500">Items below minimum stock level</div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    reportType === 'expiring-soon' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onClick={() => setReportType('expiring-soon')}
                >
                  <FaCalendarAlt className={`mr-2 ${reportType === 'expiring-soon' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">Expiring Soon</div>
                    <div className="text-xs text-gray-500">Items expiring within 7 days</div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    reportType === 'category' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onClick={() => setReportType('category')}
                >
                  <FaTag className={`mr-2 ${reportType === 'category' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">By Category</div>
                    <div className="text-xs text-gray-500">Items filtered by category</div>
                  </div>
                </div>
                
                <div
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    reportType === 'value' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                  }`}
                  onClick={() => setReportType('value')}
                >
                  <FaSortAmountDown className={`mr-2 ${reportType === 'value' ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-medium">By Value</div>
                    <div className="text-xs text-gray-500">Items sorted by total value</div>
                  </div>
                </div>
              </div>
            </div>
            
            {reportType === 'category' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              
              <button 
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <FaChartBar className="mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
            
            {reportData && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Report Preview</h4>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={handlePrint}
                    >
                      <FaPrint className="mr-2" />
                      Print Report
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      onClick={() => console.log('Download CSV')}  // This would be implemented with a CSV export library
                    >
                      <FaDownload className="mr-2" />
                      Download CSV
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-80">
                  <div className="flex justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Items</div>
                      <div className="text-xl font-bold">{reportData.summary.totalItems}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Total Value</div>
                      <div className="text-xl font-bold">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(reportData.summary.totalValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Low Stock Items</div>
                      <div className={`text-xl font-bold ${reportData.summary.lowStockItems > 0 ? 'text-red-600' : ''}`}>
                        {reportData.summary.lowStockItems}
                      </div>
                    </div>
                  </div>
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.items.slice(0, 5).map((item: any) => (
                        <tr key={item._id}>
                          <td className="px-3 py-2 text-sm">{item.name}</td>
                          <td className="px-3 py-2 text-sm">{item.category}</td>
                          <td className="px-3 py-2 text-sm">{item.quantity} {item.unit}</td>
                          <td className="px-3 py-2 text-sm">
                            {new Intl.NumberFormat('en-IN', {
                              style: 'currency',
                              currency: 'INR',
                              maximumFractionDigits: 0
                            }).format(item.totalCost)}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'In Stock' 
                                ? 'bg-green-100 text-green-800' 
                                : item.status === 'Low Stock' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : item.status === 'Critical Stock'
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {reportData.items.length > 5 && (
                    <div className="text-center text-sm text-gray-500 mt-2">
                      Showing 5 of {reportData.items.length} items. Print the report to see all items.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 